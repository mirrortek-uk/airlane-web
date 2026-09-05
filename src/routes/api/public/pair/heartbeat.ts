import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const bodySchema = z.object({
  device_id: z.string().uuid(),
  status: z.enum(["online", "idle", "offline"]).optional(),
  client_version: z.string().max(40).optional(),
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

/** Public endpoint the AirLane client calls periodically to report it is alive. */
export const Route = createFileRoute("/api/public/pair/heartbeat")({
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
        const { data, error } = await supabaseAdmin
          .from("devices")
          .update({
            status: parsed.status ?? "online",
            ...(parsed.client_version ? { client_version: parsed.client_version } : {}),
            last_seen_at: new Date().toISOString(),
          })
          .eq("id", parsed.device_id)
          .select("id")
          .maybeSingle();

        if (error) return json({ error: "heartbeat_failed" }, 500);
        if (!data) return json({ error: "device_not_found" }, 404);
        return json({ ok: true });
      },
    },
  },
});
