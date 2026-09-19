import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const bodySchema = z.object({
  device_id: z.string().uuid(),
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

/**
 * Low-frequency device status pull. Unlike /api/public/pair/heartbeat —
 * which is only sent while Mesh is enabled — this endpoint is meant to be
 * called on app launch, so devices with Mesh off still learn about plan
 * changes (e.g. free -> pro) without re-pairing.
 */
export const Route = createFileRoute("/api/public/devices/status")({
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

        const { data: device } = await supabaseAdmin
          .from("devices")
          .select("id, owner_user_id")
          .eq("id", parsed.device_id)
          .maybeSingle();

        if (!device) return json({ error: "device_not_found" }, 404);
        if (!device.owner_user_id) return json({ ok: true, identity: "guest", plan: null });

        const { data: prof } = await supabaseAdmin
          .from("profiles")
          .select("plan")
          .eq("id", device.owner_user_id)
          .maybeSingle();

        return json({
          ok: true,
          identity: "account",
          plan: prof?.plan === "pro" ? "pro" : "free",
        });
      },
    },
  },
});
