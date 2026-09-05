import { createFileRoute } from "@tanstack/react-router";
import { DownloadPage } from "@/routes/download";
import { canonical, softwareApplicationSchema, breadcrumbSchema, jsonLd, organizationSchema } from "@/lib/seo";

export const Route = createFileRoute("/en/download")({
  head: () => ({
    meta: [
      { title: "Download AirLane — Cross-Platform Network Orchestration Client" },
      {
        name: "description",
        content:
          "Download AirLane client for Windows, macOS, Linux, Android and iOS. A modern network orchestration platform built on sing-box.",
      },
      {
        property: "og:title",
        content: "Download AirLane — Cross-Platform Network Orchestration Client",
      },
      {
        property: "og:description",
        content:
          "Available for Windows, macOS, Linux, Android and iOS. A modern network orchestration platform built on sing-box.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: canonical("/en/download") },
      { property: "og:locale", content: "en_US" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Download AirLane — Cross-Platform Network Orchestration Client" },
    ],
    links: [
      { rel: "canonical", href: canonical("/en/download") },
      { rel: "alternate", hrefLang: "zh-CN", href: canonical("/download") },
      { rel: "alternate", hrefLang: "en", href: canonical("/en/download") },
      { rel: "alternate", hrefLang: "x-default", href: canonical("/download") },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: jsonLd([
          organizationSchema(),
          softwareApplicationSchema(),
          breadcrumbSchema([
            { name: "Home", url: canonical("/en/") },
            { name: "Download", url: canonical("/en/download") },
          ]),
        ]),
      },
    ],
  }),
  component: DownloadPage,
});
