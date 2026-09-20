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

function readCookie(name: string): string | null {
  const prefix = `${encodeURIComponent(name)}=`;
  for (const part of document.cookie.split("; ")) {
    if (part.startsWith(prefix)) {
      return decodeURIComponent(part.slice(prefix.length));
    }
  }
  return null;
}

function writeCookie(name: string, value: string, maxAge: number) {
  document.cookie =
    `${encodeURIComponent(name)}=${encodeURIComponent(value)}` +
    `; Domain=${PARENT_DOMAIN}; Path=/; Max-Age=${maxAge}; Secure; SameSite=Lax`;
}

/**
 * Supabase storage adapter backed by a parent-domain cookie.
 * Session JSON stays well under the 4KB cookie limit (JWT ~1-2KB + refresh
 * token ~40B + metadata).
 */
export const airlaneCookieStorage = {
  getItem: (key: string) => readCookie(key),
  setItem: (key: string, value: string) => writeCookie(key, value, COOKIE_MAX_AGE),
  removeItem: (key: string) => writeCookie(key, "", 0),
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
      writeCookie(storageKey, legacy, COOKIE_MAX_AGE);
      window.localStorage.removeItem(storageKey);
    }
  } catch {
    /* storage unavailable — ignore */
  }
}
