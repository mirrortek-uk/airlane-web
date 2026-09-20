import { createFileRoute } from "@tanstack/react-router";
import { DocPageView, type DocSlugLoaderData } from "@/routes/docs.$slug";
import { fetchPage } from "@/lib/docs";
import { canonical, breadcrumbSchema, jsonLd, organizationSchema } from "@/lib/seo";

export const Route = createFileRoute("/en/docs/$slug")({
  loader: async ({ params }): Promise<DocSlugLoaderData> => {
    try {
      return { page: await fetchPage(params.slug) };
    } catch {
      return { page: null };
    }
  },
  head: ({ params, loaderData }) => {
    const page = (loaderData as DocSlugLoaderData | undefined)?.page;
    const title = page?.title_en || params.slug;
    const desc = page?.summary_en || "AirLane documentation";
    const pageUrl = canonical(`/en/docs/${params.slug}`);
    return {
      meta: [
        { title: `${title} | AirLane Docs` },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { property: "og:url", content: pageUrl },
        { property: "og:locale", content: "en_US" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [
        { rel: "canonical", href: pageUrl },
        { rel: "alternate", hrefLang: "zh-CN", href: canonical(`/docs/${params.slug}`) },
        { rel: "alternate", hrefLang: "en", href: canonical(`/en/docs/${params.slug}`) },
        { rel: "alternate", hrefLang: "x-default", href: canonical(`/docs/${params.slug}`) },
      ],
      scripts: page
        ? [
            {
              type: "application/ld+json",
              children: jsonLd([
                organizationSchema("en"),
                breadcrumbSchema([
                  { name: "Home", url: canonical("/en/") },
                  { name: "Docs", url: canonical("/en/docs") },
                  { name: page.title_en, url: pageUrl },
                ]),
              ]),
            },
          ]
        : [],
    };
  },
  component: DocPageView,
});
