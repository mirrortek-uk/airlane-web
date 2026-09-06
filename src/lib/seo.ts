/**
 * SEO utilities: Schema.org JSON-LD, canonical URLs, and meta tag helpers.
 * Follows the 2026 Google Search Central guidelines and the SEO Skills AI standard.
 */

const SITE_URL = "https://www.airlane.cloud";
const SITE_NAME = "AirLane";
const SITE_LOGO = "https://www.airlane.cloud/brand/lockup-on-light.svg";

/** Build a canonical URL for a path. */
export function canonical(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Organization schema entity, reused across all pages. */
export function organizationSchema(locale: "zh-CN" | "en" = "zh-CN") {
  const isZh = locale === "zh-CN";
  return {
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    alternateName: "AirLane by MirrorTek",
    url: SITE_URL,
    logo: SITE_LOGO,
    description: isZh
      ? "AirLane 是由 MirrorTek 出品、基于 sing-box 内核的可视化代理客户端。支持订阅链接导入、应用分流、多出口策略管理、多终端 Mesh 组网与路由规则配置。"
      : "AirLane is a visual proxy client by MirrorTek, built on the sing-box core. Supports subscription import, app-based traffic splitting, multi-exit policy management, cross-device Mesh networking, and routing rule configuration.",
    sameAs: [
      "https://github.com/mirrortek-uk/airlane-web",
      "https://x.com/airlanecloud",
      "https://t.me/airlanecloud",
      "https://www.youtube.com/@airlanecloud",
    ],
  };
}

/** WebSite schema entity. */
export function websiteSchema(locale: "zh-CN" | "en" = "zh-CN") {
  return {
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    publisher: { "@id": `${SITE_URL}/#organization` },
    inLanguage: locale,
  };
}

/** FAQPage schema for GEO citability. */
export function faqSchema(locale: "zh-CN" | "en" = "zh-CN") {
  const isZh = locale === "zh-CN";
  const faqs = isZh
    ? [
        {
          q: "AirLane 是什么？",
          a: "AirLane 是由 MirrorTek 出品、基于 sing-box 内核的可视化代理客户端。它用图形界面替代复杂的 YAML 配置，支持订阅链接导入、应用分流、多出口策略管理、多终端 Mesh 组网与路由规则配置。",
        },
        {
          q: "AirLane 和 Clash / Clash Verge 有什么区别？",
          a: "AirLane 基于 sing-box 内核而非 Clash 内核，原生支持 38+ 协议（包括 VLESS、VMess、Trojan、Hysteria2、TUIC、Shadowsocks 等）。它提供可视化策略树、决策追踪、出口资源池和 Mesh 组网，无需手写 YAML 即可编排流量。",
        },
        {
          q: "AirLane 支持哪些协议？",
          a: "原生支持 38+ 协议，包括 VLESS、VMess、Trojan、Hysteria2、TUIC v5、Shadowsocks、ShadowTLS、Reality、WireGuard、Trojan-Go、Naive、HTTP、SOCKS 等，并兼容 Clash 订阅链接格式。",
        },
        {
          q: "AirLane 支持哪些平台？",
          a: "支持 Windows、macOS、Linux、Android 和 iOS。跨设备可通过 Mesh 组网功能实现共享出口和资源池。",
        },
        {
          q: "AirLane 是免费的吗？",
          a: "AirLane 客户端免费使用。具体订阅和服务价格取决于你接入的节点提供商。",
        },
      ]
    : [
        {
          q: "What is AirLane?",
          a: "AirLane is a visual proxy client by MirrorTek, built on the sing-box core. It replaces complex YAML configuration with a graphical interface, supporting subscription import, app-based traffic splitting, multi-exit policy management, cross-device Mesh networking, and routing rule configuration.",
        },
        {
          q: "How does AirLane differ from Clash / Clash Verge?",
          a: "AirLane uses the sing-box core rather than the Clash core, natively supporting 38+ protocols (including VLESS, VMess, Trojan, Hysteria2, TUIC, Shadowsocks). It provides a visual policy tree, decision tracing, exit resource pools, and Mesh networking without writing YAML.",
        },
        {
          q: "What protocols does AirLane support?",
          a: "It natively supports 38+ protocols including VLESS, VMess, Trojan, Hysteria2, TUIC v5, Shadowsocks, ShadowTLS, Reality, WireGuard, Trojan-Go, Naive, HTTP, and SOCKS, with Clash subscription format compatibility.",
        },
        {
          q: "What platforms does AirLane support?",
          a: "Windows, macOS, Linux, Android, and iOS. Cross-device Mesh networking enables shared exits and resource pools.",
        },
        {
          q: "Is AirLane free?",
          a: "The AirLane client is free to use. Subscription and service pricing depends on the node provider you connect to.",
        },
      ];
  return {
    "@type": "FAQPage",
    "@id": `${SITE_URL}/#faq`,
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

/** BreadcrumbList schema. */
export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@type": "BreadcrumbList",
    "@id": `${SITE_URL}/#breadcrumbs`,
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/** TechArticle schema for blog posts. */
export function blogPostSchema(opts: {
  slug: string;
  title: string;
  description: string;
  datePublished: string;
  dateModified?: string;
  tags?: string[];
}) {
  const url = canonical(`/blog/${opts.slug}`);
  return {
    "@type": "TechArticle",
    "@id": `${url}/#article`,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    headline: opts.title,
    description: opts.description,
    inLanguage: "zh-CN",
    author: { "@id": `${SITE_URL}/#organization` },
    publisher: { "@id": `${SITE_URL}/#organization` },
    datePublished: opts.datePublished,
    dateModified: opts.dateModified ?? opts.datePublished,
    keywords: (opts.tags ?? []).join(", "),
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };
}

/** SoftwareApplication schema for the download page. */
export function softwareApplicationSchema() {
  return {
    "@type": "SoftwareApplication",
    "@id": `${SITE_URL}/#software`,
    name: SITE_NAME,
    applicationCategory: "NetworkingApplication",
    operatingSystem: "Windows, macOS, Linux, Android, iOS",
    url: canonical("/download"),
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}

/** Build a JSON-LD script tag string for embedding in head. */
export function jsonLd(graph: object[]): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@graph": graph,
  });
}
