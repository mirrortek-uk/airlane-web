import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const GUEST_LIMITS = {
  snapshots: 2,
  devices: 2,
  favorites: 10,
} as const;

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function randomToken() {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
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

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

async function resolveGuest(token: string) {
  const db = await admin();
  const hash = await sha256(token);
  const { data } = await db
    .from("guest_sessions")
    .select("id, created_at, expires_at, upgraded_to")
    .eq("token_hash", hash)
    .maybeSingle();
  if (!data) return null;
  if (new Date(data.expires_at).getTime() < Date.now()) return null;
  await db
    .from("guest_sessions")
    .update({ last_seen_at: new Date().toISOString() })
    .eq("id", data.id);
  return data;
}

const tokenSchema = z.object({ token: z.string().min(10).max(200) });

/** Create a new anonymous (guest) cloud session. */
export const createGuestSession = createServerFn({ method: "POST" }).handler(async () => {
  const db = await admin();
  const token = randomToken();
  const { data, error } = await db
    .from("guest_sessions")
    .insert({ token_hash: await sha256(token) })
    .select("id, created_at, expires_at")
    .single();
  if (error) throw new Error(error.message);
  return { token, id: data.id, expiresAt: data.expires_at };
});

/** Read the state + quota usage of a guest session. */
export const getGuestSession = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => tokenSchema.parse(data))
  .handler(async ({ data }) => {
    const guest = await resolveGuest(data.token);
    if (!guest) return { valid: false as const };
    const db = await admin();
    const [snapshots, devices, favorites] = await Promise.all([
      db
        .from("cloud_snapshots")
        .select("id", { count: "exact", head: true })
        .eq("guest_session_id", guest.id),
      db
        .from("devices")
        .select("id, name, platform, status, last_seen_at")
        .eq("guest_session_id", guest.id)
        .order("created_at", { ascending: false }),
      db
        .from("node_favorites")
        .select("id", { count: "exact", head: true })
        .eq("guest_session_id", guest.id),
    ]);
    return {
      valid: true as const,
      id: guest.id,
      createdAt: guest.created_at,
      expiresAt: guest.expires_at,
      usage: {
        snapshots: snapshots.count ?? 0,
        devices: devices.data?.length ?? 0,
        favorites: favorites.count ?? 0,
      },
      limits: GUEST_LIMITS,
      devices: devices.data ?? [],
    };
  });

/** End a guest session: delete its limited cloud data, keep local config untouched. */
export const endGuestSession = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => tokenSchema.parse(data))
  .handler(async ({ data }) => {
    const guest = await resolveGuest(data.token);
    if (!guest) return { ok: true };
    const db = await admin();
    await db.from("cloud_snapshots").delete().eq("guest_session_id", guest.id);
    await db.from("node_favorites").delete().eq("guest_session_id", guest.id);
    await db.from("devices").delete().eq("guest_session_id", guest.id);
    await db.from("pairing_codes").delete().eq("guest_session_id", guest.id);
    await db.from("guest_sessions").delete().eq("id", guest.id);
    return { ok: true };
  });

/** Migrate all guest data to the signed-in account, then destroy the guest identity. */
export const upgradeGuestSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => tokenSchema.parse(data))
  .handler(async ({ data, context }) => {
    const guest = await resolveGuest(data.token);
    if (!guest) return { ok: false as const, reason: "expired" };
    const db = await admin();
    const patch = { owner_user_id: context.userId, guest_session_id: null };
    await db.from("cloud_snapshots").update(patch).eq("guest_session_id", guest.id);
    await db.from("node_favorites").update(patch).eq("guest_session_id", guest.id);
    await db.from("devices").update(patch).eq("guest_session_id", guest.id);
    await db
      .from("mesh_members")
      .update({ user_id: context.userId, guest_session_id: null })
      .eq("guest_session_id", guest.id);
    await db
      .from("guest_sessions")
      .update({ upgraded_to: context.userId })
      .eq("id", guest.id);
    await db.from("guest_sessions").delete().eq("id", guest.id);
    return { ok: true as const };
  });

/** Full account overview for a signed-in (owner or member) account. */
export const getAccountOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const sb = context.supabase;
    const { data: profile } = await sb
      .from("profiles")
      .select("id, email, display_name, plan, account_role, parent_account_id, created_at")
      .eq("id", context.userId)
      .maybeSingle();

    const [devices, snapshots, favorites, groups] = await Promise.all([
      sb
        .from("devices")
        .select("id, name, platform, status, client_version, last_seen_at")
        .eq("owner_user_id", context.userId)
        .order("created_at", { ascending: false }),
      sb.from("cloud_snapshots").select("id", { count: "exact", head: true }),
      sb.from("node_favorites").select("id", { count: "exact", head: true }),
      sb.from("mesh_groups").select("id, name, invite_code, created_at"),
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

/** Issue a short-lived pairing code for a guest (anonymous) session. */
export const createPairingCode = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => pairInput.parse(data))
  .handler(async ({ data }) => {
    const guest = await resolveGuest(data.guestToken);
    if (!guest) throw new Error("NO_IDENTITY");
    const db = await admin();
    const code = pairingCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    const { error } = await db.from("pairing_codes").insert({
      code,
      guest_session_id: guest.id,
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
    const code = pairingCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    const { error } = await db.from("pairing_codes").insert({
      code,
      owner_user_id: context.userId,
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
    const guest = await resolveGuest(data.token);
    if (!guest) return { ok: false };
    const db = await admin();
    await db.from("devices").delete().eq("id", data.id).eq("guest_session_id", guest.id);
    return { ok: true };
  });
