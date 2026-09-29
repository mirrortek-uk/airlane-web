/**
 * PoolVIP order → delivered-resource shaping, shared by:
 *  - POST /api/public/devices/resources (device-scoped client pull)
 *  - getAccountResources / getGuestResources (account center display)
 */

export type Credential = {
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
export function parseLink(raw: string | null): ParsedLink {
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

type OrderRow = {
  id: string;
  type: string;
  status: string;
  vpn_link: string | null;
  traffic_plan_gb: number;
  used_gb: number;
  current_period_end: string | null;
  snapshot: unknown;
  product_id: string | null;
  created_at: string;
};

export type OrderResource = {
  order_id: string;
  type: string;
  title: { zh?: string; en?: string } | null;
  provider: { zh?: string; en?: string } | null;
  kind: string;
  ready: boolean;
  expired: boolean;
  credential: Credential | null;
  protocols: string[];
  vpn_link: string | null;
  expires_at: string | null;
  traffic: { plan_gb: number; used_gb: number };
};

/** Expand orders into one resource per vpn_link line (see CLIENT_API.md §3.6). */
export function expandOrderResources(orders: OrderRow[]): OrderResource[] {
  const now = Date.now();
  return orders.flatMap((order): OrderResource[] => {
    const snapshot = (order.snapshot ?? null) as {
      title?: { zh?: string; en?: string };
      provider?: { zh?: string; en?: string };
      period?: string;
    } | null;
    const expiresAt = order.current_period_end;
    const expired = expiresAt ? new Date(expiresAt).getTime() < now : false;
    const lines = (order.vpn_link ?? "")
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    const base = {
      order_id: order.id,
      type: order.type,
      title: snapshot?.title ?? null,
      provider: snapshot?.provider ?? null,
      expired,
      expires_at: expiresAt,
      traffic: { plan_gb: order.traffic_plan_gb, used_gb: order.used_gb },
    };
    if (lines.length === 0) {
      return [
        {
          ...base,
          kind: "pending" as const,
          ready: false,
          credential: null,
          protocols: [] as string[],
          vpn_link: null,
        },
      ];
    }
    return lines.map((line) => {
      const link = parseLink(line);
      return {
        ...base,
        kind: link.kind,
        ready: link.ready,
        credential: link.credential,
        protocols: link.protocols,
        vpn_link: line,
      };
    });
  });
}

const ORDER_SELECT =
  "id, type, status, vpn_link, traffic_plan_gb, used_gb, current_period_end, snapshot, product_id, created_at";

/** Raw PoolVIP orders under an identity. */
export async function listIdentityOrders(
  identityId: string,
  statuses: string[] = ["active"],
): Promise<OrderRow[]> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: orders, error } = await supabaseAdmin
    .from("poolvip_orders")
    .select(ORDER_SELECT)
    .eq("identity_id", identityId)
    .in("status", statuses)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (orders ?? []) as OrderRow[];
}

export type IdentityResource = OrderResource & {
  /** poolvip_products.kind: "vps" | "proxy"; null when the product is gone. */
  product_kind: string | null;
};

/**
 * Identity-scoped resource list for the account center. Like the device API
 * but also surfaces "provisioning" orders and attaches the product kind so
 * the UI can split 共享 VPS vs 住宅 IP. Credentials are stripped — the web
 * page only needs metadata.
 */
export async function listIdentityResources(identityId: string): Promise<IdentityResource[]> {
  const orders = await listIdentityOrders(identityId, ["active", "provisioning"]);
  const productIds = [...new Set(orders.map((o) => o.product_id).filter((x): x is string => !!x))];
  const kinds = await fetchProductKindMap(productIds);
  const kindByOrder = new Map(orders.map((o) => [o.id, o.product_id ? (kinds.get(o.product_id) ?? null) : null]));
  return expandOrderResources(orders).map((r) => ({
    ...r,
    product_kind: kindByOrder.get(r.order_id) ?? null,
    credential: null,
    vpn_link: null,
  }));
}

/** Resource kind for the account-center split: product kind wins, else infer. */
export async function fetchProductKindMap(productIds: string[]): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  if (productIds.length === 0) return map;
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("poolvip_products")
    .select("id, kind")
    .in("id", productIds);
  for (const p of data ?? []) map.set(p.id as string, p.kind as string);
  return map;
}
