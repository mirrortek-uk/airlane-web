// Cloud backup decryption for the web viewer. Mirrors the client-side
// recipe in AirLane/docs/CLIENT_API.md §11.2: key = SHA-256(
// "airlane-cloud-backup-v1:" + user_id ), ciphertext = base64(
// 12-byte nonce || AES-256-GCM ciphertext ). Decryption happens only in
// the browser — the key and plaintext never touch the server.

export async function decryptBackup(userId: string, b64: string): Promise<unknown> {
  const keyBytes = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(`airlane-cloud-backup-v1:${userId}`),
  );
  const key = await crypto.subtle.importKey("raw", keyBytes, "AES-GCM", false, [
    "decrypt",
  ]);
  const blob = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  const plain = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: blob.slice(0, 12) },
    key,
    blob.slice(12),
  );
  const bundle = JSON.parse(new TextDecoder().decode(plain));
  if (bundle?.kind !== "airlane-config-backup" || bundle?.v !== 1) {
    throw new Error("bad_bundle");
  }
  return bundle;
}

// Keys whose values are masked by default in the viewer — node credentials
// (passwords, UUIDs, PSKs) stay hidden until explicitly revealed.
const SENSITIVE_KEY =
  /^(password|uuid|psk|shared_?key|private_?key|secret|token|security|tls|method|passphrase|username)$/i;

const MASK = "••••••••";

export function maskSecrets(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(maskSecrets);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [
        k,
        SENSITIVE_KEY.test(k) && typeof v === "string" && v !== "" ? MASK : maskSecrets(v),
      ]),
    );
  }
  return value;
}
