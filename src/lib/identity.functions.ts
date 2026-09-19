import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Unified identity layer — see IDENTITY_IMPLEMENTATION.md.
 *
 * identities           : single identity root (anonymous | registered)
 * identity_credentials : sha256-hashed access tokens + recovery codes
 *
 * Anonymous auth path: client stores the access token in localStorage
 * (key airlane.guest.token) and passes it to server functions; the server
 * resolves token -> identity via identity_credentials using service role.
 * Registered auth path: Supabase JWT -> auth.users.id -> identities.auth_user_id.
 *
 * Plain exported functions below are server-side helpers reused by
 * account.functions.ts; only createServerFn exports become RPC endpoints.
 */

export const ANONYMOUS_LIMITS = {
  devices: 2,
  sharedVps: 2,
  residentialIp: 2,
  meshGroups: 2,
} as const;

const ACCESS_TOKEN_TTL_MS = 90 * 24 * 60 * 60 * 1000;

/**
 * Cloudflare Turnstile verification for anonymous-identity creation.
 * When TURNSTILE_SECRET_KEY is unset the check is skipped (dev mode);
 * VITE_TURNSTILE_SITE_KEY controls whether the widget renders client-side.
 */
async function verifyTurnstile(captchaToken?: string) {
  const secret = process.env["TURNSTILE_SECRET_KEY"];
  if (!secret) return;
  if (!captchaToken) throw new Error("captcha_required");
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ secret, response: captchaToken }),
  });
  const json = (await res.json()) as { success?: boolean };
  if (!json.success) throw new Error("captcha_failed");
}

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

/** Human-readable recovery code: XXXX-XXXX-XXXX-XXXX, unambiguous alphabet. */
function generateRecoveryCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  const raw = Array.from(bytes)
    .map((b) => alphabet[b % alphabet.length])
    .join("");
  return [0, 4, 8, 12].map((i) => raw.slice(i, i + 4)).join("-");
}

/** Normalize user input for hashing: uppercase alphanumerics only. */
function normalizeRecoveryCode(input: string) {
  return input
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

export type IdentityRow = {
  id: string;
  kind: "anonymous" | "registered";
  status: string;
  auth_user_id: string | null;
  created_at: string;
  last_seen_at: string;
};

const IDENTITY_SELECT = "id, kind, status, auth_user_id, created_at, last_seen_at";

/**
 * Resolve an anonymous access token -> identity row.
 * Rolling-renews the token's expires_at and the identity's last_seen_at.
 * Returns null for unknown / expired / revoked credentials.
 */
export async function resolveAnonymousByToken(token: string): Promise<IdentityRow | null> {
  const db = await admin();
  const hash = await sha256(token);
  const { data: cred } = await db
    .from("identity_credentials")
    .select("id, identity_id, expires_at, revoked_at")
    .eq("token_hash", hash)
    .eq("kind", "access_token")
    .maybeSingle();
  if (!cred || cred.revoked_at) return null;
  if (cred.expires_at && new Date(cred.expires_at).getTime() < Date.now()) return null;

  const { data: identity } = await db
    .from("identities")
    .select(IDENTITY_SELECT)
    .eq("id", cred.identity_id)
    .maybeSingle();
  if (!identity || identity.status !== "active" || identity.kind !== "anonymous") return null;

  const now = new Date().toISOString();
  await Promise.all([
    db
      .from("identity_credentials")
      .update({
        last_used_at: now,
        expires_at: new Date(Date.now() + ACCESS_TOKEN_TTL_MS).toISOString(),
      })
      .eq("id", cred.id),
    db.from("identities").update({ last_seen_at: now }).eq("id", identity.id),
  ]);
  return identity as IdentityRow;
}

/**
 * Resolve the identity for a signed-in auth user.
 * Lazily creates a registered identity if the signup trigger did not.
 */
export async function resolveIdentityByUserId(userId: string): Promise<IdentityRow | null> {
  const db = await admin();
  const { data } = await db
    .from("identities")
    .select(IDENTITY_SELECT)
    .eq("auth_user_id", userId)
    .maybeSingle();
  if (data) return data as IdentityRow;
  const { data: created } = await db
    .from("identities")
    .insert({ kind: "registered", auth_user_id: userId })
    .select(IDENTITY_SELECT)
    .single();
  if (created) return created as IdentityRow;
  // Lost the unique-index race — reselect.
  const { data: again } = await db
    .from("identities")
    .select(IDENTITY_SELECT)
    .eq("auth_user_id", userId)
    .maybeSingle();
  return (again as IdentityRow | null) ?? null;
}

/** Insert a new anonymous identity + access token + recovery code. */
export async function issueAnonymousIdentity(captchaToken?: string) {
  await verifyTurnstile(captchaToken);
  const db = await admin();
  const { data: identity, error } = await db
    .from("identities")
    .insert({ kind: "anonymous" })
    .select("id, created_at")
    .single();
  if (error || !identity) throw new Error(error?.message ?? "identity_create_failed");

  const token = randomToken();
  const recovery = generateRecoveryCode();
  const expiresAt = new Date(Date.now() + ACCESS_TOKEN_TTL_MS).toISOString();
  const { error: credError } = await db.from("identity_credentials").insert([
    {
      identity_id: identity.id,
      kind: "access_token",
      token_hash: await sha256(token),
      expires_at: expiresAt,
    },
    {
      identity_id: identity.id,
      kind: "recovery_code",
      token_hash: await sha256(normalizeRecoveryCode(recovery)),
      expires_at: null,
    },
  ]);
  if (credError) {
    await db.from("identities").delete().eq("id", identity.id);
    throw new Error(credError.message);
  }
  return { token, recoveryCode: recovery, id: identity.id, expiresAt };
}

/**
 * Attach an anonymous identity to a registered auth user (uid).
 * Promotes the anonymous identity in place; merges a pre-existing registered
 * identity's rows onto it if the signup trigger already created one.
 */
export async function attachAnonymousToUser(token: string, uid: string) {
  const identity = await resolveAnonymousByToken(token);
  if (!identity) return { ok: false as const, reason: "expired" as const };
  const db = await admin();
  const now = new Date().toISOString();

  const existing = await resolveIdentityByUserId(uid);
  if (existing && existing.id !== identity.id) {
    const memberTables = [
      "devices",
      "cloud_snapshots",
      "node_favorites",
      "pairing_codes",
      "mesh_members",
    ] as const;
    for (const table of memberTables) {
      await db.from(table).update({ identity_id: identity.id }).eq("identity_id", existing.id);
    }
    await db
      .from("mesh_groups")
      .update({ owner_identity_id: identity.id })
      .eq("owner_identity_id", existing.id);
    await db.from("identities").delete().eq("id", existing.id);
  }

  const { error } = await db
    .from("identities")
    .update({ kind: "registered", auth_user_id: uid, upgraded_at: now })
    .eq("id", identity.id);
  if (error) throw new Error(error.message);

  // JWT is the credential from now on; revoke access tokens.
  // The recovery_code stays valid as an extra account-recovery path.
  await db
    .from("identity_credentials")
    .update({ revoked_at: now })
    .eq("identity_id", identity.id)
    .eq("kind", "access_token")
    .is("revoked_at", null);

  // Dual-write transition: repoint legacy columns so old RLS policies and
  // any pre-migration reads keep working (IDENTITY_IMPLEMENTATION.md §5).
  const ownerPatch = { owner_user_id: uid, guest_session_id: null };
  await db.from("cloud_snapshots").update(ownerPatch).eq("identity_id", identity.id);
  await db.from("node_favorites").update(ownerPatch).eq("identity_id", identity.id);
  await db.from("devices").update(ownerPatch).eq("identity_id", identity.id);
  await db.from("pairing_codes").update(ownerPatch).eq("identity_id", identity.id);
  await db
    .from("mesh_members")
    .update({ user_id: uid, guest_session_id: null })
    .eq("identity_id", identity.id);

  return { ok: true as const };
}

const tokenSchema = z.object({ token: z.string().min(10).max(200) });

/** Create a brand-new anonymous identity with an access token + recovery code. */
export const createAnonymousIdentity = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ captchaToken: z.string().max(2048).optional() }).parse(data ?? {}),
  )
  .handler(async ({ data }) => {
    return issueAnonymousIdentity(data.captchaToken);
  });

/**
 * Describe an anonymous identity: usage + quota + device list.
 * Shared by getAnonymousIdentity and the legacy getGuestSession wrapper.
 */
export async function describeAnonymousIdentity(token: string) {
  const identity = await resolveAnonymousByToken(token);
  if (!identity) return { valid: false as const };
  const db = await admin();
  const devices = await db
    .from("devices")
    .select("id, name, platform, status, last_seen_at")
    .eq("identity_id", identity.id)
    .order("created_at", { ascending: false });
  return {
    valid: true as const,
    id: identity.id,
    createdAt: identity.created_at,
    usage: {
      devices: devices.data?.length ?? 0,
      // PoolVIP resource tables land later; quotas are displayed as 0/n.
      sharedVps: 0,
      residentialIp: 0,
    },
    limits: ANONYMOUS_LIMITS,
    devices: devices.data ?? [],
  };
}

/** Read the state + quota usage of an anonymous identity. */
export const getAnonymousIdentity = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => tokenSchema.parse(data))
  .handler(async ({ data }) => {
    return describeAnonymousIdentity(data.token);
  });

/**
 * End an anonymous identity: delete the identity row; FK cascades remove its
 * credentials and all identity-linked business rows.
 */
export const endAnonymousIdentity = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => tokenSchema.parse(data))
  .handler(async ({ data }) => {
    const identity = await resolveAnonymousByToken(data.token);
    if (!identity) return { ok: true };
    const db = await admin();
    await db.from("identities").delete().eq("id", identity.id);
    return { ok: true };
  });

/**
 * Recover an anonymous identity with a recovery code.
 * Revokes all existing access tokens and issues a fresh one.
 */
export const recoverAnonymousIdentity = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ recoveryCode: z.string().min(8).max(64) }).parse(data),
  )
  .handler(async ({ data }) => {
    const db = await admin();
    const hash = await sha256(normalizeRecoveryCode(data.recoveryCode));
    const { data: cred } = await db
      .from("identity_credentials")
      .select("id, identity_id, revoked_at")
      .eq("token_hash", hash)
      .eq("kind", "recovery_code")
      .maybeSingle();
    if (!cred || cred.revoked_at) return { ok: false as const, reason: "invalid" as const };

    const { data: identity } = await db
      .from("identities")
      .select("id, status")
      .eq("id", cred.identity_id)
      .maybeSingle();
    if (!identity || identity.status !== "active") {
      return { ok: false as const, reason: "invalid" as const };
    }

    const now = new Date().toISOString();
    await db
      .from("identity_credentials")
      .update({ revoked_at: now })
      .eq("identity_id", cred.identity_id)
      .eq("kind", "access_token")
      .is("revoked_at", null);

    const token = randomToken();
    const { error } = await db.from("identity_credentials").insert({
      identity_id: cred.identity_id,
      kind: "access_token",
      token_hash: await sha256(token),
      expires_at: new Date(Date.now() + ACCESS_TOKEN_TTL_MS).toISOString(),
    });
    if (error) throw new Error(error.message);
    await db.from("identities").update({ last_seen_at: now }).eq("id", cred.identity_id);
    return { ok: true as const, token };
  });

/**
 * Rotate the recovery code while holding a valid access token.
 * Covers the "didn't save it at creation" case. The old code is revoked.
 */
export const rotateRecoveryCode = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => tokenSchema.parse(data))
  .handler(async ({ data }) => {
    const identity = await resolveAnonymousByToken(data.token);
    if (!identity) return { ok: false as const, reason: "invalid" as const };
    const db = await admin();
    const now = new Date().toISOString();
    await db
      .from("identity_credentials")
      .update({ revoked_at: now })
      .eq("identity_id", identity.id)
      .eq("kind", "recovery_code")
      .is("revoked_at", null);
    const recovery = generateRecoveryCode();
    const { error } = await db.from("identity_credentials").insert({
      identity_id: identity.id,
      kind: "recovery_code",
      token_hash: await sha256(normalizeRecoveryCode(recovery)),
      expires_at: null,
    });
    if (error) throw new Error(error.message);
    return { ok: true as const, recoveryCode: recovery };
  });

/**
 * Attach an anonymous identity to the signed-in account.
 * The anonymous identity row is promoted in place — never a second identity.
 */
export const upgradeAnonymousIdentity = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => tokenSchema.parse(data))
  .handler(async ({ data, context }) => {
    return attachAnonymousToUser(data.token, context.userId);
  });
