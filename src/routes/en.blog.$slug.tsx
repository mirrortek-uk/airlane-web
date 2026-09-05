import { createFileRoute } from "@tanstack/react-router";
import { BlogPostView } from "@/routes/blog.$slug";
import { canonical } from "@/lib/seo";

export const Route = createFileRoute("/en/blog/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug} | AirLane Blog` },
      { name: "description", content: "AirLane blog article" },
      { property: "og:type", content: "article" },
      { property: "og:url", content: canonical(`/en/blog/${params.slug}`) },
      { property: "og:locale", content: "en_US" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "canonical", href: canonical(`/en/blog/${params.slug}`) },
      { rel: "alternate", hrefLang: "zh-CN", href: canonical(`/blog/${params.slug}`) },
      { rel: "alternate", hrefLang: "en", href: canonical(`/en/blog/${params.slug}`) },
      { rel: "alternate", hrefLang: "x-default", href: canonical(`/blog/${params.slug}`) },
    ],
  }),
  component: BlogPostView,
});
