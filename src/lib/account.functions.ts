import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  ANONYMOUS_LIMITS,
  attachAnonymousToUser,
  describeAnonymousIdentity,
  issueAnonymousIdentity,
  resolveAnonymousByToken,
  resolveIdentityByUserId,
} from "@/lib/identity.functions";

/**
 * Account-level server functions.
 *
 * Identity model: every business row belongs to an `identities` row via
 * `identity_id`. Anonymous identities authenticate with an access token
 * (identity_credentials, sha256); registered identities authenticate with a
 * Supabase JWT (requireSupabaseAuth -> auth.users.id -> identities.auth_user_id).
 * See IDENTITY_IMPLEMENTATION.md.
 *
 * The guest_* export names are kept as compatibility wrappers so existing
 * callers (account.tsx, devices.tsx) keep working during the transition.
 */

// Back-compat alias — superseded by ANONYMOUS_LIMITS.
export const GUEST_LIMITS = ANONYMOUS_LIMITS;

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

function pairingCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  const raw = Array.from(bytes)
    .map((b) => alphabet[b % alphabet.length])
    .join("");
  return `${raw.slice(0, 4)}-${raw.slice(4, 8)}`;
}

const tokenSchema = z.object({ token: z.string().min(10).max(200) });

/** Create a new anonymous identity. Returns token + one-time recovery code. */
export const createGuestSession = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ captchaToken: z.string().max(2048).optional() }).parse(data ?? {}),
  )
  .handler(async ({ data }) => {
    return issueAnonymousIdentity(data.captchaToken);
  });

/** Read the state + quota usage of an anonymous identity. */
export const getGuestSession = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => tokenSchema.parse(data))
  .handler(async ({ data }) => {
    return describeAnonymousIdentity(data.token);
  });

/** End an anonymous identity: revoke it and cascade-delete its cloud data. */
export const endGuestSession = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => tokenSchema.parse(data))
  .handler(async ({ data }) => {
    const identity = await resolveAnonymousByToken(data.token);
    if (!identity) return { ok: true };
    const db = await admin();
    await db.from("identities").delete().eq("id", identity.id);
    return { ok: true };
  });

/**
 * Attach an anonymous identity to the signed-in account. The identity row is
 * promoted in place — all devices, memberships and resources stay attached.
 */
export const upgradeGuestSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => tokenSchema.parse(data))
  .handler(async ({ data, context }) => {
    return attachAnonymousToUser(data.token, context.userId);
  });

/** Full account overview for a signed-in (owner or member) account. */
export const getAccountOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const sb = context.supabase;
    const identity = await resolveIdentityByUserId(context.userId);
    const { data: profile } = await sb
      .from("profiles")
      .select("id, email, display_name, plan, account_role, parent_account_id, created_at")
      .eq("id", context.userId)
      .maybeSingle();

    const deviceSelect = "id, name, platform, status, client_version, last_seen_at";
    const [devices, snapshots, favorites, groups] = await Promise.all([
      identity
        ? sb
            .from("devices")
            .select(deviceSelect)
            .eq("identity_id", identity.id)
            .order("created_at", { ascending: false })
        : sb
            .from("devices")
            .select(deviceSelect)
            .eq("owner_user_id", context.userId)
            .order("created_at", { ascending: false }),
      sb.from("cloud_snapshots").select("id", { count: "exact", head: true }),
      sb.from("node_favorites").select("id", { count: "exact", head: true }),
      identity
        ? sb
            .from("mesh_groups")
            .select("id, name, invite_code, created_at")
            .eq("owner_identity_id", identity.id)
        : sb.from("mesh_groups").select("id, name, invite_code, created_at"),
    ]);

    let parentEmail: string | null = null;
    if (profile?.parent_account_id) {
      const db = await admin();
      const { data: parent } = await db
        .from("profiles")
        .select("email")
        .eq("id", profile.parent_account_id)
        .maybeSingle();
      parentEmail = parent?.email ?? null;
    }

    return {
      profile: profile ?? null,
      identityId: identity?.id ?? null,
      parentEmail,
      devices: devices.data ?? [],
      counts: {
        snapshots: snapshots.count ?? 0,
        favorites: favorites.count ?? 0,
        groups: groups.data?.length ?? 0,
      },
      groups: groups.data ?? [],
    };
  });

const pairInput = z.object({ guestToken: z.string().min(10).max(200) });

/** Issue a short-lived pairing code for an anonymous identity. */
export const createPairingCode = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => pairInput.parse(data))
  .handler(async ({ data }) => {
    const identity = await resolveAnonymousByToken(data.guestToken);
    if (!identity) throw new Error("NO_IDENTITY");
    const db = await admin();
    const code = pairingCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    const { error } = await db.from("pairing_codes").insert({
      code,
      identity_id: identity.id,
      expires_at: expiresAt,
    });
    if (error) throw new Error(error.message);
    return { code, expiresAt };
  });

/** Same as createPairingCode but for signed-in accounts (bearer token attached). */
export const createAccountPairingCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const db = await admin();
    const identity = await resolveIdentityByUserId(context.userId);
    const code = pairingCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    const { error } = await db.from("pairing_codes").insert({
      code,
      owner_user_id: context.userId,
      identity_id: identity?.id ?? null,
      expires_at: expiresAt,
    });
    if (error) throw new Error(error.message);
    return { code, expiresAt };
  });

export const removeDevice = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("devices").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const removeGuestDevice = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ token: z.string().min(10), id: z.string().uuid() }).parse(data),
  )
  .handler(async ({ data }) => {
    const identity = await resolveAnonymousByToken(data.token);
    if (!identity) return { ok: false };
    const db = await admin();
    await db
      .from("devices")
      .delete()
      .eq("id", data.id)
      .eq("identity_id", identity.id);
    return { ok: true };
  });
