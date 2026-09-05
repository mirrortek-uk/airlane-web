export const GUEST_TOKEN_KEY = "airlane.guest.token";

export function readGuestToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(GUEST_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function writeGuestToken(token: string) {
  try {
    window.localStorage.setItem(GUEST_TOKEN_KEY, token);
  } catch {
    /* ignore */
  }
}

export function clearGuestToken() {
  try {
    window.localStorage.removeItem(GUEST_TOKEN_KEY);
  } catch {
    /* ignore */
  }
}
