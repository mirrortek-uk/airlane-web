import { createFileRoute } from "@tanstack/react-router";

import { canonical, breadcrumbSchema, jsonLd, organizationSchema } from "@/lib/seo";
import { MigrateHub } from "./migrate";

export const Route = createFileRoute("/en/migrate")({
  head: () => ({
    meta: [
      { title: "Migrate to AirLane · Switch from Clash, NekoBox, V2RayN & more" },
      {
        name: "description",
        content:
          "Migrate to AirLane: switch from Clash, Mihomo, NekoBox, V2RayN, Hiddify or Qv2ray, or import nodes by protocol — VLESS Reality, Hysteria2, TUIC, Trojan, Shadowsocks, VMess and WireGuard. One-click subscription import, 38+ protocols in one GUI.",
      },
      { property: "og:title", content: "Migrate to AirLane" },
      {
        property: "og:description",
        content: "Migrate by client or by protocol — one-click subscription import, 38+ protocols in one GUI.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: canonical("/en/migrate") },
      { property: "og:locale", content: "en_US" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "canonical", href: canonical("/en/migrate") },
      { rel: "alternate", hrefLang: "zh-CN", href: canonical("/migrate") },
      { rel: "alternate", hrefLang: "en", href: canonical("/en/migrate") },
      { rel: "alternate", hrefLang: "x-default", href: canonical("/migrate") },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: jsonLd([
          organizationSchema(),
          breadcrumbSchema([
            { name: "Home", url: canonical("/en/") },
            { name: "Migrate to AirLane", url: canonical("/en/migrate") },
          ]),
        ]),
      },
    ],
  }),
  component: () => <MigrateHub locale="en" />,
});
