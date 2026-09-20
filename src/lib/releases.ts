// Release metadata source for the download page and the client update check.
// Facts live in the public mirrortek-uk/AirLane-releases repo; this module
// caches the GitHub API response (anonymous limit is 60 req/hour/IP) and
// rewrites asset URLs to our own mirror path so downloads work where
// GitHub is unreachable.

const UPSTREAM =
  "https://api.github.com/repos/mirrortek-uk/AirLane-releases/releases/latest";
export const RELEASES_REPO = "https://github.com/mirrortek-uk/AirLane-releases";
export const MIRROR_BASE = "https://www.airlane.cloud";
export const MIRROR_PATH = "/api/releases/download/";

const CACHE_TTL_MS = 10 * 60 * 1000;

export type ReleaseAsset = {
  name: string;
  size: number;
  /** Mirror URL on airlane.cloud — what clients and the page should use. */
  browser_download_url: string;
  /** Original GitHub URL, kept as a fallback link. */
  github_url: string;
};

export type ReleaseInfo = {
  tag_name: string;
  name: string;
  published_at: string;
  html_url: string;
  body: string;
  assets: ReleaseAsset[];
};

// Last-resort data so the download page never breaks if GitHub is down
// and the cache is cold. Values from docs/web-release-handoff.md §1.
const FALLBACK: ReleaseInfo = {
  tag_name: "v1.0.3",
  name: "Airlane v1.0.3 Beta",
  published_at: "2026-09-01T00:00:00Z",
  html_url: `${RELEASES_REPO}/releases/tag/v1.0.3`,
  body: "",
  assets: [
    {
      name: "Airlane_1.0.3_x64-setup.exe",
      size: 26 * 1024 * 1024,
      browser_download_url: `${MIRROR_BASE}${MIRROR_PATH}Airlane_1.0.3_x64-setup.exe`,
      github_url: `${RELEASES_REPO}/releases/download/v1.0.3/Airlane_1.0.3_x64-setup.exe`,
    },
    {
      name: "Airlane_1.0.3_x64_en-US.msi",
      size: 36 * 1024 * 1024,
      browser_download_url: `${MIRROR_BASE}${MIRROR_PATH}Airlane_1.0.3_x64_en-US.msi`,
      github_url: `${RELEASES_REPO}/releases/download/v1.0.3/Airlane_1.0.3_x64_en-US.msi`,
    },
  ],
};

let cache: { data: ReleaseInfo; at: number } | null = null;
let inflight: Promise<ReleaseInfo> | null = null;

async function fetchUpstream(): Promise<ReleaseInfo> {
  const res = await fetch(UPSTREAM, {
    headers: {
      accept: "application/vnd.github+json",
      "user-agent": "airlane-web",
    },
  });
  if (!res.ok) throw new Error(`github ${res.status}`);
  const raw = (await res.json()) as {
    tag_name: string;
    name: string;
    published_at: string;
    html_url: string;
    body?: string;
    assets?: { name: string; size: number; browser_download_url: string }[];
  };
  return {
    tag_name: raw.tag_name,
    name: raw.name,
    published_at: raw.published_at,
    html_url: raw.html_url,
    body: raw.body ?? "",
    assets: (raw.assets ?? []).map((a) => ({
      name: a.name,
      size: a.size,
      browser_download_url: `${MIRROR_BASE}${MIRROR_PATH}${a.name}`,
      github_url: a.browser_download_url,
    })),
  };
}

export async function getLatestRelease(): Promise<ReleaseInfo> {
  if (cache && Date.now() - cache.at < CACHE_TTL_MS) return cache.data;
  if (!inflight) {
    inflight = fetchUpstream()
      .then((data) => {
        cache = { data, at: Date.now() };
        return data;
      })
      .catch(() => cache?.data ?? FALLBACK)
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

/** Resolve a mirror path segment back to an upstream GitHub asset URL.
 *  Only names published in the latest release are accepted — the proxy is
 *  not open-ended. */
export async function resolveAssetUrl(
  filename: string,
): Promise<{ url: string; size: number } | null> {
  const release = await getLatestRelease();
  const asset = release.assets.find((a) => a.name === filename);
  return asset ? { url: asset.github_url, size: asset.size } : null;
}
