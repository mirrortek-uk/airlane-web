import { createFileRoute } from "@tanstack/react-router";
import { Index } from "@/routes/index";
import { canonical, breadcrumbSchema, jsonLd, organizationSchema, websiteSchema } from "@/lib/seo";

export const Route = createFileRoute("/en/")({
  head: () => ({
    meta: [
      { title: "AirLane | Visual Traffic Scheduling Client" },
      {
        name: "description",
        content:
          "Import subscription links, app-based traffic splitting, multi-exit policy management, cross-device Mesh networking, and routing rule configuration. Say goodbye to complex YAML — visually orchestrate your network traffic.",
      },
      {
        property: "og:title",
        content: "AirLane | Visual Traffic Scheduling Client",
      },
      {
        property: "og:description",
        content:
          "Import subscription links, app-based traffic splitting, multi-exit policy management, cross-device Mesh networking, and routing rule configuration. Say goodbye to complex YAML — visually orchestrate your network traffic.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: canonical("/en/") },
      { property: "og:site_name", content: "AirLane" },
      { property: "og:locale", content: "en_US" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "AirLane | Visual Traffic Scheduling Client" },
      {
        name: "twitter:description",
        content:
          "Import subscription links, app-based traffic splitting, multi-exit policy management, cross-device Mesh networking, and routing rule configuration. Say goodbye to complex YAML — visually orchestrate your network traffic.",
      },
    ],
    links: [
      { rel: "canonical", href: canonical("/en/") },
      { rel: "alternate", hrefLang: "zh-CN", href: canonical("/") },
      { rel: "alternate", hrefLang: "en", href: canonical("/en/") },
      { rel: "alternate", hrefLang: "x-default", href: canonical("/") },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: jsonLd([
          { ...organizationSchema(), "@id": `${canonical("/en/")}/#organization` },
          { ...websiteSchema(), "@id": `${canonical("/en/")}/#website`, inLanguage: "en" },
          breadcrumbSchema([
            { name: "Home", url: canonical("/en/") },
          ]),
        ]),
      },
    ],
  }),
  component: Index,
});
