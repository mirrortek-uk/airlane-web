import { createFileRoute } from "@tanstack/react-router";

const SITE = "https://www.airlane.cloud";

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export const Route = createFileRoute("/sitemap-docs.xml")({
  server: {
    handlers: {
      GET: async () => {
        let urls = "";
        try {
          const { fetchPages } = await import("@/lib/docs");
          const pages = await fetchPages();
          urls = pages
            .filter((p) => p.published)
            .map((p) => {
              const lastmod = (p.updated_at || "").slice(0, 10);
              return `  <url>
    <loc>${SITE}/docs/${esc(p.slug)}</loc>
    <xhtml:link rel="alternate" hreflang="zh-CN" href="${SITE}/docs/${esc(p.slug)}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${SITE}/en/docs/${esc(p.slug)}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE}/docs/${esc(p.slug)}"/>
    ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${SITE}/en/docs/${esc(p.slug)}</loc>
    <xhtml:link rel="alternate" hreflang="zh-CN" href="${SITE}/docs/${esc(p.slug)}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${SITE}/en/docs/${esc(p.slug)}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE}/docs/${esc(p.slug)}"/>
    ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
            })
            .join("\n");
        } catch {
          urls = "";
        }

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>`;

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
