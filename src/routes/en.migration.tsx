import { createFileRoute } from "@tanstack/react-router";
import { MigrationPage } from "@/routes/migration";
import { canonical, breadcrumbSchema, jsonLd, organizationSchema } from "@/lib/seo";

export const Route = createFileRoute("/en/migration")({
  head: () => ({
    meta: [
      { title: "Migrate from Clash / Mihomo to AirLane" },
      {
        name: "description",
        content:
          "AirLane supports importing subscriptions and configs from Clash / Mihomo / sing-box, auto-generating migration reports with visual policy and rule editing.",
      },
      {
        property: "og:title",
        content: "Migrate from Clash / Mihomo to AirLane",
      },
      {
        property: "og:description",
        content:
          "Import your existing subscriptions and configs. AirLane handles the migration. Supports Clash, Mihomo, sing-box subscription links and local configs.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: canonical("/en/migration") },
      { property: "og:locale", content: "en_US" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Migrate from Clash / Mihomo to AirLane" },
    ],
    links: [
      { rel: "canonical", href: canonical("/en/migration") },
      { rel: "alternate", hrefLang: "zh-CN", href: canonical("/migration") },
      { rel: "alternate", hrefLang: "en", href: canonical("/en/migration") },
      { rel: "alternate", hrefLang: "x-default", href: canonical("/migration") },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: jsonLd([
          organizationSchema(),
          breadcrumbSchema([
            { name: "Home", url: canonical("/en/") },
            { name: "Migration", url: canonical("/en/migration") },
          ]),
        ]),
      },
    ],
  }),
  component: MigrationPage,
});
