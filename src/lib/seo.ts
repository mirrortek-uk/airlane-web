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
export function organizationSchema() {
  return {
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: SITE_LOGO,
    description:
      "AirLane is a modern network orchestration platform built on sing-box. Policy trees, decision tracing, exit pools, Mesh networking, and shared resource pools.",
    sameAs: [
      "https://github.com/mirrortek-uk/airlane-web",
    ],
  };
}

/** WebSite schema entity. */
export function websiteSchema() {
  return {
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    publisher: { "@id": `${SITE_URL}/#organization` },
    inLanguage: "zh-CN",
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
