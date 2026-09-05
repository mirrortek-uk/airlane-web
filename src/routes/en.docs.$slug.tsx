import { createFileRoute } from "@tanstack/react-router";
import { DocPageView } from "@/routes/docs.$slug";
import { canonical } from "@/lib/seo";

export const Route = createFileRoute("/en/docs/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug} | AirLane Docs` },
      { name: "description", content: "AirLane documentation" },
      { property: "og:type", content: "article" },
      { property: "og:url", content: canonical(`/en/docs/${params.slug}`) },
      { property: "og:locale", content: "en_US" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "canonical", href: canonical(`/en/docs/${params.slug}`) },
      { rel: "alternate", hrefLang: "zh-CN", href: canonical(`/docs/${params.slug}`) },
      { rel: "alternate", hrefLang: "en", href: canonical(`/en/docs/${params.slug}`) },
      { rel: "alternate", hrefLang: "x-default", href: canonical(`/docs/${params.slug}`) },
    ],
  }),
  component: DocPageView,
});
