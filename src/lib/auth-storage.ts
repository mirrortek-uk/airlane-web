/**
 * Shared auth session storage across *.airlane.cloud subdomains.
 *
 * localStorage is origin-scoped, so sessions on www.airlane.cloud are invisible
 * to poolvip.airlane.cloud / mesh.airlane.cloud. Storing the Supabase session
 * in a cookie scoped to the parent domain makes one login work everywhere.
 */

const PARENT_DOMAIN = ".airlane.cloud";
// Refresh tokens live ~1 year in Supabase; keep the cookie for the same span.
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function isAirlaneHost(hostname: string): boolean {
  return hostname === "airlane.cloud" || hostname.endsWith(".airlane.cloud");
}

function readCookieRaw(name: string): string | null {
  const prefix = `${encodeURIComponent(name)}=`;
  for (const part of document.cookie.split("; ")) {
    if (part.startsWith(prefix)) {
      return part.slice(prefix.length);
    }
  }
  return null;
}

function readCookie(name: string): string | null {
  const raw = readCookieRaw(name);
  if (raw == null) return null;
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

function writeCookie(name: string, value: string, maxAge: number) {
  document.cookie =
    `${encodeURIComponent(name)}=${encodeURIComponent(value)}` +
    `; Domain=${PARENT_DOMAIN}; Path=/; Max-Age=${maxAge}; Secure; SameSite=Lax`;
}

/** writeCookie for values that are already percent-encoded. */
function writeCookieRaw(name: string, encodedValue: string, maxAge: number) {
  document.cookie =
    `${encodeURIComponent(name)}=${encodedValue}` +
    `; Domain=${PARENT_DOMAIN}; Path=/; Max-Age=${maxAge}; Secure; SameSite=Lax`;
}

/**
 * Supabase storage adapter backed by parent-domain cookies.
 *
 * OAuth sessions (Google especially) carry provider_token + provider_refresh
 * + full user metadata and can reach 5-8KB — past the ~4KB per-cookie limit,
 * which browsers drop silently. Values are therefore chunked across
 * `${key}.0`, `${key}.1`, … with the count stored in `${key}` itself.
 */
const CHUNK_SIZE = 3600;

function chunkCount(key: string): number {
  const marker = readCookie(key);
  const m = marker ? /^chunks:(\d+)$/.exec(marker) : null;
  return m ? Number(m[1]) : 0;
}

function clearChunks(key: string) {
  const n = chunkCount(key);
  for (let i = 0; i < n; i++) writeCookie(`${key}.${i}`, "", 0);
}

export const airlaneCookieStorage = {
  getItem: (key: string) => {
    const marker = readCookie(key);
    if (!marker) return null;
    const m = /^chunks:(\d+)$/.exec(marker);
    if (!m) return marker; // legacy single-cookie session
    // Reassemble raw encoded chunks, then decode once — a %XX sequence may
    // straddle a chunk boundary.
    let encoded = "";
    for (let i = 0; i < Number(m[1]); i++) {
      const part = readCookieRaw(`${key}.${i}`);
      if (part == null) return null;
      encoded += part;
    }
    try {
      return decodeURIComponent(encoded);
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string) => {
    clearChunks(key);
    // Encode first, then chunk — keeps chunk boundaries on ASCII so no
    // percent sequence (or UTF-16 surrogate pair) can be split.
    const encoded = encodeURIComponent(value);
    const n = Math.max(1, Math.ceil(encoded.length / CHUNK_SIZE));
    for (let i = 0; i < n; i++) {
      writeCookieRaw(`${key}.${i}`, encoded.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE), COOKIE_MAX_AGE);
    }
    writeCookie(key, `chunks:${n}`, COOKIE_MAX_AGE);
  },
  removeItem: (key: string) => {
    clearChunks(key);
    writeCookie(key, "", 0);
  },
};

/**
 * One-time migration: if a session exists in localStorage but not in the shared
 * cookie yet, copy it over so already-logged-in users stay logged in.
 */
export function migrateLocalSessionToCookie(storageKey: string) {
  try {
    if (readCookie(storageKey)) return;
    const legacy = window.localStorage.getItem(storageKey);
    if (legacy) {
      airlaneCookieStorage.setItem(storageKey, legacy);
      window.localStorage.removeItem(storageKey);
    }
  } catch {
    /* storage unavailable — ignore */
  }
}
