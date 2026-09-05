import { createFileRoute } from "@tanstack/react-router";
import { Index } from "@/routes/index";
import { canonical, breadcrumbSchema, jsonLd, organizationSchema, websiteSchema } from "@/lib/seo";

export const Route = createFileRoute("/en/")({
  head: () => ({
    meta: [
      { title: "AirLane — Find the Optimal Route for Every Packet" },
      {
        name: "description",
        content:
          "AirLane is a modern network orchestration platform: visual policy orchestration, decision tracing, Mesh private networking, shared resource pools, and one-click Clash/Mihomo migration.",
      },
      {
        property: "og:title",
        content: "AirLane — Find the Optimal Route for Every Packet",
      },
      {
        property: "og:description",
        content:
          "From complex config files to visual network orchestration. Manage exits, policies, rules, Mesh networks and shared resources.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: canonical("/en/") },
      { property: "og:site_name", content: "AirLane" },
      { property: "og:locale", content: "en_US" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "AirLane — Find the Optimal Route for Every Packet" },
      {
        name: "twitter:description",
        content:
          "From complex config files to visual network orchestration. Manage exits, policies, rules, Mesh networks and shared resources.",
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
