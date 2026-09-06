import { createFileRoute } from "@tanstack/react-router";
import { BlogIndex } from "@/routes/blog.index";
import { fetchPosts } from "@/lib/blog";
import { canonical, breadcrumbSchema, jsonLd, organizationSchema } from "@/lib/seo";

export const Route = createFileRoute("/en/blog/")({
  loader: async () => {
    try {
      const posts = await fetchPosts();
      return { initialPosts: posts };
    } catch {
      return { initialPosts: [] };
    }
  },
  head: () => ({
    meta: [
      { title: "AirLane Blog — Product Updates & Network Orchestration" },
      {
        name: "description",
        content:
          "AirLane official blog: product release notes, protocol and exit practices, policy orchestration and Mesh networking insights.",
      },
      { property: "og:title", content: "AirLane Blog — Product Updates & Network Orchestration" },
      {
        property: "og:description",
        content: "Product releases, protocol practices, policy orchestration and Mesh networking insights.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: canonical("/en/blog") },
      { property: "og:locale", content: "en_US" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "AirLane Blog — Product Updates & Network Orchestration" },
    ],
    links: [
      { rel: "canonical", href: canonical("/en/blog") },
      { rel: "alternate", hrefLang: "zh-CN", href: canonical("/blog") },
      { rel: "alternate", hrefLang: "en", href: canonical("/en/blog") },
      { rel: "alternate", hrefLang: "x-default", href: canonical("/blog") },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: jsonLd([
          organizationSchema(),
          breadcrumbSchema([
            { name: "Home", url: canonical("/en/") },
            { name: "Blog", url: canonical("/en/blog") },
          ]),
        ]),
      },
    ],
  }),
  component: BlogIndex,
});
