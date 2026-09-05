import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const bodySchema = z.object({
  code: z.string().min(4).max(16),
  name: z.string().min(1).max(80).optional(),
  platform: z.string().min(1).max(40).optional(),
  client_version: z.string().max(40).optional(),
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
          .select("id, owner_user_id, guest_session_id, expires_at, claimed_at")
          .eq("code", code)
          .maybeSingle();

        if (!pairing) return json({ error: "code_not_found" }, 404);
        if (pairing.claimed_at) return json({ error: "code_already_used" }, 409);
        if (new Date(pairing.expires_at).getTime() < Date.now()) {
          return json({ error: "code_expired" }, 410);
        }

        // Anonymous (guest) identities may only bind 2 devices.
        if (pairing.guest_session_id) {
          const { count } = await supabaseAdmin
            .from("devices")
            .select("id", { count: "exact", head: true })
            .eq("guest_session_id", pairing.guest_session_id);
          if ((count ?? 0) >= 2) return json({ error: "guest_device_limit" }, 403);
        }

        const { data: device, error } = await supabaseAdmin
          .from("devices")
          .insert({
            owner_user_id: pairing.owner_user_id,
            guest_session_id: pairing.guest_session_id,
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
        });
      },
    },
  },
});
