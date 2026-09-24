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

type Credential = {
  protocol: string | null;
  host: string | null;
  port: number | null;
  username: string | null;
  password: string | null;
};

type ParsedLink =
  | { kind: "pending"; ready: false; credential: null; protocols: string[] }
  | { kind: "proxy" | "link"; ready: true; credential: Credential | null; protocols: string[] };

/**
 * Best-effort parse of a delivered vpn_link into structured fields.
 *
 * Known upstream formats:
 *  - "host:port:user:pass"        → bare proxy (LinkStatic residential IPs; the
 *                                  upstream supports both HTTP and SOCKS5, so
 *                                  protocol stays null and `protocols` lists both)
 *  - "scheme://[user:pass@]host…" → full URI (trojan/ss/vless/socks5/http/…)
 *  - "pending://…"                → placeholder written before real delivery;
 *                                  surfaced as ready=false so the client can show
 *                                  "provisioning" instead of a broken node
 */
function parseLink(raw: string | null): ParsedLink {
  if (!raw || raw.startsWith("pending://")) {
    return { kind: "pending", ready: false, credential: null, protocols: [] };
  }
  const parts = raw.split(":");
  if (parts.length === 4 && /^\d{2,5}$/.test(parts[1]!)) {
    return {
      kind: "proxy",
      ready: true,
      credential: {
        protocol: null,
        host: parts[0]!,
        port: Number(parts[1]),
        username: parts[2]!,
        password: parts[3]!,
      },
      protocols: ["http", "socks5"],
    };
  }
  const scheme = /^([a-z][a-z0-9+.-]*):\/\//i.exec(raw)?.[1]?.toLowerCase() ?? null;
  if (scheme) {
    try {
      const url = new URL(raw);
      return {
        kind: "link",
        ready: true,
        credential: {
          protocol: scheme,
          host: url.hostname || null,
          port: url.port ? Number(url.port) : null,
          username: url.username ? decodeURIComponent(url.username) : null,
          password: url.password ? decodeURIComponent(url.password) : null,
        },
        protocols: [scheme],
      };
    } catch {
      return { kind: "link", ready: true, credential: null, protocols: [scheme] };
    }
  }
  return { kind: "link", ready: true, credential: null, protocols: [] };
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

        const { data: orders, error } = await supabaseAdmin
          .from("poolvip_orders")
          .select(
            "id, type, status, vpn_link, traffic_plan_gb, used_gb, current_period_end, snapshot, created_at",
          )
          .eq("identity_id", identityId)
          .eq("status", "active")
          .order("created_at", { ascending: false });

        if (error) return json({ error: "resources_failed" }, 500);

        const now = Date.now();
        const resources = (orders ?? []).map((order) => {
          const link = parseLink(order.vpn_link);
          const snapshot = (order.snapshot ?? null) as {
            title?: { zh?: string; en?: string };
            provider?: { zh?: string; en?: string };
            period?: string;
          } | null;
          const expiresAt = order.current_period_end;
          return {
            order_id: order.id,
            type: order.type,
            title: snapshot?.title ?? null,
            provider: snapshot?.provider ?? null,
            kind: link.kind,
            ready: link.ready,
            expired: expiresAt ? new Date(expiresAt).getTime() < now : false,
            credential: link.credential,
            protocols: link.protocols,
            vpn_link: order.vpn_link,
            expires_at: expiresAt,
            traffic: { plan_gb: order.traffic_plan_gb, used_gb: order.used_gb },
          };
        });

        return json({ ok: true, resources });
      },
    },
  },
});
