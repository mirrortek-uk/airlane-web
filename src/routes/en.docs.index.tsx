import { createFileRoute } from "@tanstack/react-router";
import { DocsIndex } from "@/routes/docs.index";
import { canonical, breadcrumbSchema, jsonLd, organizationSchema } from "@/lib/seo";

export const Route = createFileRoute("/en/docs/")({
  head: () => ({
    meta: [
      { title: "AirLane Help Center — Documentation & Guides" },
      {
        name: "description",
        content:
          "AirLane online help center: installation, protocols and exits, policy orchestration, Mesh networking, and complete account and device documentation.",
      },
      { property: "og:title", content: "AirLane Help Center — Documentation & Guides" },
      {
        property: "og:description",
        content: "Installation, protocols, policy orchestration, Mesh networking and account documentation.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: canonical("/en/docs") },
      { property: "og:locale", content: "en_US" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "AirLane Help Center — Documentation & Guides" },
    ],
    links: [
      { rel: "canonical", href: canonical("/en/docs") },
      { rel: "alternate", hrefLang: "zh-CN", href: canonical("/docs") },
      { rel: "alternate", hrefLang: "en", href: canonical("/en/docs") },
      { rel: "alternate", hrefLang: "x-default", href: canonical("/docs") },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: jsonLd([
          organizationSchema(),
          breadcrumbSchema([
            { name: "Home", url: canonical("/en/") },
            { name: "Docs", url: canonical("/en/docs") },
          ]),
        ]),
      },
    ],
  }),
  component: DocsIndex,
});
