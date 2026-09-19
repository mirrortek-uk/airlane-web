import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const bodySchema = z.object({
  code: z.string().min(4).max(16),
  name: z.string().min(1).max(80).optional(),
  platform: z.string().min(1).max(40).optional(),
  client_version: z.string().max(40).optional(),
  device_public_key: z.string().max(128).optional(),
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

/**
 * Public endpoint used by the AirLane desktop/mobile client to redeem a pairing
 * code shown in the web console and register itself as a device.
 * The pairing code may belong to a registered account or an anonymous identity.
 */
export const Route = createFileRoute("/api/public/pair/claim")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let parsed;
        try {
          parsed = bodySchema.parse(await request.json());
        } catch {
          return json({ error: "invalid_request" }, 400);
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const code = parsed.code.trim().toUpperCase();

        const { data: pairing } = await supabaseAdmin
          .from("pairing_codes")
          .select("id, owner_user_id, guest_session_id, identity_id, expires_at, claimed_at")
          .eq("code", code)
          .maybeSingle();

        if (!pairing) return json({ error: "code_not_found" }, 404);
        if (pairing.claimed_at) return json({ error: "code_already_used" }, 409);
        if (new Date(pairing.expires_at).getTime() < Date.now()) {
          return json({ error: "code_expired" }, 410);
        }

        // Device quotas: registered accounts are limited by plan
        // (free 2 / pro 10); anonymous identities are capped at 2.
        const { ACCOUNT_LIMITS } = await import("@/lib/identity.functions");
        let plan: "free" | "pro" | null = null;
        if (pairing.owner_user_id) {
          const { data: prof } = await supabaseAdmin
            .from("profiles")
            .select("plan")
            .eq("id", pairing.owner_user_id)
            .maybeSingle();
          plan = prof?.plan === "pro" ? "pro" : "free";
          const limit = ACCOUNT_LIMITS[plan].devices;
          const { count } = await supabaseAdmin
            .from("devices")
            .select("id", { count: "exact", head: true })
            .eq("owner_user_id", pairing.owner_user_id);
          if ((count ?? 0) >= limit) return json({ error: "device_limit_reached" }, 403);
        } else if (pairing.identity_id || pairing.guest_session_id) {
          const deviceCount = async (column: "identity_id" | "guest_session_id", value: string) => {
            const { count } = await supabaseAdmin
              .from("devices")
              .select("id", { count: "exact", head: true })
              .eq(column, value);
            return count ?? 0;
          };
          const count = pairing.identity_id
            ? await deviceCount("identity_id", pairing.identity_id)
            : pairing.guest_session_id
              ? await deviceCount("guest_session_id", pairing.guest_session_id)
              : 0;
          if (count >= 2) return json({ error: "guest_device_limit" }, 403);
        }

        const { data: device, error } = await supabaseAdmin
          .from("devices")
          .insert({
            owner_user_id: pairing.owner_user_id,
            guest_session_id: pairing.guest_session_id,
            identity_id: pairing.identity_id,
            device_public_key: parsed.device_public_key ?? null,
            name: parsed.name ?? "AirLane Client",
            platform: parsed.platform ?? "unknown",
            client_version: parsed.client_version ?? null,
            status: "online",
          })
          .select("id, name, platform")
          .single();

        if (error || !device) return json({ error: "pairing_failed" }, 500);

        await supabaseAdmin
          .from("pairing_codes")
          .update({ claimed_at: new Date().toISOString(), device_id: device.id })
          .eq("id", pairing.id);

        return json({
          device_id: device.id,
          name: device.name,
          platform: device.platform,
          identity: pairing.owner_user_id ? "account" : "guest",
          plan,
        });
      },
    },
  },
});
