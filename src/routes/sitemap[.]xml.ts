import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const { buildSitemapIndexXml } = await import("@/lib/sitemap-index");
        const xml = await buildSitemapIndexXml();
        return new Response(xml, {
          headers: {
            "content-type": "application/xml; charset=utf-8",
            "cache-control": "public, max-age=300, s-maxage=3600",
          },
        });
      },
    },
  },
});
