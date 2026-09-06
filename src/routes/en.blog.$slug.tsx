import { createFileRoute } from "@tanstack/react-router";
import { BlogPostView, POST_META } from "@/routes/blog.$slug";
import { canonical } from "@/lib/seo";

export const Route = createFileRoute("/en/blog/$slug")({
  head: ({ params }) => {
    const meta = POST_META[params.slug];
    const title = meta ? meta.title_en : `${params.slug} | AirLane Blog`;
    const desc = meta ? meta.summary_en : "AirLane blog article";
    return {
      meta: [
        { title: `${title} | AirLane Blog` },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { property: "og:url", content: canonical(`/en/blog/${params.slug}`) },
        { property: "og:site_name", content: "AirLane" },
        { property: "og:locale", content: "en_US" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: desc },
      ],
      links: [
        { rel: "canonical", href: canonical(`/en/blog/${params.slug}`) },
        { rel: "alternate", hrefLang: "zh-CN", href: canonical(`/blog/${params.slug}`) },
        { rel: "alternate", hrefLang: "en", href: canonical(`/en/blog/${params.slug}`) },
        { rel: "alternate", hrefLang: "x-default", href: canonical(`/blog/${params.slug}`) },
      ],
    };
  },
  component: BlogPostView,
});
