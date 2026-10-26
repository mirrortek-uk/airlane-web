import { createFileRoute } from "@tanstack/react-router";
import pagesXml from "../../public/sitemap-pages.xml?raw";

const SITE = "https://www.airlane.cloud";

function maxLastmod(dates: string[]): string {
  const valid = dates.filter(Boolean).sort();
  return valid[valid.length - 1] || "";
}

async function blogLastmod(): Promise<string> {
  try {
    const { fetchPosts } = await import("@/lib/blog");
    const posts = await fetchPosts();
    return maxLastmod(posts.filter((p) => p.published).map((p) => (p.published_at || "").slice(0, 10)));
  } catch {
    return "";
  }
}

async function docsLastmod(): Promise<string> {
  try {
    const { fetchPages } = await import("@/lib/docs");
    const pages = await fetchPages();
    return maxLastmod(pages.filter((p) => p.published).map((p) => (p.updated_at || "").slice(0, 10)));
  } catch {
    return "";
  }
}

function pagesLastmod(): string {
  const matches = [...pagesXml.matchAll(/<lastmod>(\d{4}-\d{2}-\d{2})<\/lastmod>/g)].map((m) => m[1]);
  return maxLastmod(matches);
}

export const Route = createFileRoute("/sitemap-index.xml")({
  server: {
    handlers: {
      GET: async () => {
        const [blog, docs, pages] = await Promise.all([blogLastmod(), docsLastmod(), Promise.resolve(pagesLastmod())]);
        const entry = (loc: string, lastmod: string) => `  <sitemap>
    <loc>${loc}</loc>
    ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}
  </sitemap>`;

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entry(`${SITE}/sitemap-pages.xml`, pages)}
${entry(`${SITE}/sitemap-blog.xml`, blog)}
${entry(`${SITE}/sitemap-docs.xml`, docs)}
</sitemapindex>`;

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
