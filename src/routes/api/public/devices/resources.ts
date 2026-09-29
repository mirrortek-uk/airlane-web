import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { expandOrderResources, listIdentityOrders } from "@/lib/poolvip-resources";

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
 * Resource pull for a paired device: returns every active PoolVIP order bound
 * to the device's identity, with vpn_link parsed into structured credentials
 * so the client can import proxy nodes without manual copy-paste.
 *
 * Auth: device_id is the bearer credential (UUID, same trust level as
 * heartbeat). A stronger device_token is planned — see CLIENT_API.md §7.
 */
export const Route = createFileRoute("/api/public/devices/resources")({
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
          .select("id, identity_id, owner_user_id")
          .eq("id", parsed.device_id)
          .maybeSingle();

        if (!device) return json({ error: "device_not_found" }, 404);

        let identityId = device.identity_id as string | null;
        if (!identityId && device.owner_user_id) {
          const { data: identity } = await supabaseAdmin
            .from("identities")
            .select("id")
            .eq("auth_user_id", device.owner_user_id)
            .maybeSingle();
          identityId = identity?.id ?? null;
        }

        await supabaseAdmin
          .from("devices")
          .update({ last_seen_at: new Date().toISOString() })
          .eq("id", device.id);

        if (!identityId) return json({ ok: true, resources: [] });

        try {
          const orders = await listIdentityOrders(identityId, ["active"]);
          return json({ ok: true, resources: expandOrderResources(orders) });
        } catch {
          return json({ error: "resources_failed" }, 500);
        }
      },
    },
  },
});
