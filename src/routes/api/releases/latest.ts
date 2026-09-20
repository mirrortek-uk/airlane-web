import { createFileRoute } from "@tanstack/react-router";
import { getLatestRelease } from "@/lib/releases";

/**
 * Client update-check endpoint — a drop-in replacement for
 * api.github.com/repos/mirrortek-uk/AirLane-releases/releases/latest.
 * Same response shape; only browser_download_url is rewritten to our
 * mirror so the download works where GitHub is unreachable. The client
 * switches source by changing the RELEASES_API constant in update.rs.
 */
export const Route = createFileRoute("/api/releases/latest")({
  server: {
    handlers: {
      GET: async () => {
        const release = await getLatestRelease();
        return new Response(JSON.stringify(release), {
          status: 200,
          headers: {
            "content-type": "application/json",
            // Vercel edge caches for 5 min, serves stale up to 1h if the
            // function errors — keeps us far under GitHub's 60/h limit.
            "cache-control": "public, s-maxage=300, stale-while-revalidate=3600",
          },
        });
      },
    },
  },
});
