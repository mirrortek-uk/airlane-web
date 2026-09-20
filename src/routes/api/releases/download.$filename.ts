import { createFileRoute } from "@tanstack/react-router";
import { resolveAssetUrl } from "@/lib/releases";

/**
 * Download mirror: streams the GitHub Release asset through our domain so
 * users on networks where github.com is unreachable can still download.
 * Only filenames published in the latest release are proxied.
 */
export const Route = createFileRoute("/api/releases/download/$filename")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const asset = await resolveAssetUrl(params.filename);
        if (!asset) {
          return new Response(JSON.stringify({ error: "asset_not_found" }), {
            status: 404,
            headers: { "content-type": "application/json" },
          });
        }

        const upstream = await fetch(asset.url, {
          headers: { "user-agent": "airlane-web" },
          redirect: "follow",
        });
        if (!upstream.ok || !upstream.body) {
          return new Response(JSON.stringify({ error: "upstream_failed" }), {
            status: 502,
            headers: { "content-type": "application/json" },
          });
        }

        const headers = new Headers();
        headers.set(
          "content-type",
          upstream.headers.get("content-type") ?? "application/octet-stream",
        );
        headers.set(
          "content-length",
          upstream.headers.get("content-length") ?? String(asset.size),
        );
        headers.set(
          "content-disposition",
          `attachment; filename="${params.filename}"`,
        );
        headers.set("cache-control", "public, max-age=3600");

        return new Response(upstream.body, { status: 200, headers });
      },
    },
  },
});
