import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, Download } from "lucide-react";

import { useI18n, useT } from "@/i18n";
import { useLocalePrefix } from "@/lib/locale-link";
import { LandingFaq, LandingFooter } from "@/components/landing-extras";

/**
 * Shared landing-page layout for SEO "alternative / client" pages
 * (clash-alternative, nekobox-alternative, hysteria2-client, ...).
 * Each route supplies a localized config — same skeleton, unique copy.
 */
export type AltLandingConfig = {
  /** Pill badge above the h1, e.g. "NekoBox 替代方案". */
  badge: string;
  /** h1 text before the gradient-emphasized span. */
  titlePre: string;
  /** Gradient italic span inside the h1. */
  titleEm: string;
  /** Hero sub-headline. */
  sub: string;
  features: { icon: LucideIcon; title: string; desc: string }[];
  /** "Why switch" section heading + optional lead-in. */
  featuresTitle: string;
  featuresSub?: string;
  /** Optional "How to configure" steps — catches how-to long-tail queries. */
  stepsTitle?: string;
  steps?: { title: string; desc: string }[];
  /** Comparison table. `rival` is the third-party column header. */
  compareTitle: string;
  rivalName: string;
  comparison: { capability: string; rival: string; airlane: string }[];
  /** Bottom CTA band. */
  ctaTitle: string;
  ctaDesc: string;
  ctaLabel: string;
  ctaTo: string;
};

/**
 * zh ↔ en switcher for landing pages. `slug` is the zh path, e.g.
 * "sing-box-gui"; the en variant lives at /en/<slug> (same as hreflang).
 */
export function LandingLangSwitch({ slug }: { slug: string }) {
  const { locale } = useI18n();
  const isZh = locale.startsWith("zh");
  return (
    <Link
      to={isZh ? `/en/${slug}` : `/${slug}`}
      className="rounded-full border border-ink/15 bg-white/50 px-3.5 py-1.5 text-xs font-semibold text-muted-foreground transition hover:bg-white/80 hover:text-foreground"
    >
      {isZh ? "EN" : "中文"}
    </Link>
  );
}

export function AltLandingPage({ cfg, slug }: { cfg: AltLandingConfig; slug: string }) {
  const t = useT();
  const { locale } = useI18n();
  const lp = useLocalePrefix();
  const isZh = locale.startsWith("zh");

  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <header className="fixed top-0 inset-x-0 z-50">
        <div className="absolute inset-0 bg-cream/70 backdrop-blur-xl border-b border-ink/10" />
        <div className="relative max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to={lp || (isZh ? "/" : "/en/")} className="flex items-center gap-2.5">
            <img src="/brand/lockup-on-light.svg" alt="AirLane" className="h-8 w-auto" />
          </Link>
          <div className="flex items-center gap-3">
            <LandingLangSwitch slug={slug} />
            <Link
              to={`${lp}/download`}
              className="rounded-full bg-ink text-cream text-sm font-semibold px-5 py-2.5 shadow-card hover:bg-ink/90 transition"
            >
              {t("nav.download")}
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-16">
        <section className="relative overflow-hidden glow-hero">
          <div className="relative max-w-4xl mx-auto px-6 py-20 md:py-28 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white/60 px-3 py-1.5 text-xs font-mono text-muted-foreground mb-6">
              <span className="size-1.5 rounded-full bg-sunset animate-pulse-soft" />
              {cfg.badge}
            </div>
            <h1 className="font-display text-4xl md:text-6xl leading-[1.05] tracking-tight text-foreground">
              {cfg.titlePre}{" "}
              <span className="text-gradient animate-gradient italic">{cfg.titleEm}</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {cfg.sub}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                to={`${lp}/download`}
                className="shine rounded-full bg-gradient-brand text-cream font-semibold px-7 py-3.5 shadow-sun transition duration-500 hover:brightness-105 hover:-translate-y-0.5 inline-flex items-center gap-2"
              >
                <Download className="size-4" />
                {t("nav.download")}
              </Link>
              <Link
                to={cfg.ctaTo}
                className="rounded-full border border-ink/15 bg-white/50 px-7 py-3.5 font-semibold transition duration-500 hover:bg-white/80 hover:-translate-y-0.5 inline-flex items-center gap-2"
              >
                {cfg.ctaLabel}
              </Link>
            </div>
            <div className="mt-8 flex items-center justify-center gap-6 text-xs font-mono text-muted-foreground">
              <span>Windows</span>
              <span className="text-ink/20">·</span>
              <span>macOS</span>
              <span className="text-ink/20">·</span>
              <span>Linux</span>
              <span className="text-ink/20">·</span>
              <span>Android</span>
              <span className="text-ink/20">·</span>
              <span>iOS</span>
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-display text-3xl md:text-4xl tracking-tight text-foreground">
              {cfg.featuresTitle}
            </h2>
            {cfg.featuresSub && (
              <p className="mt-4 text-muted-foreground">{cfg.featuresSub}</p>
            )}
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {cfg.features.map((f, i) => (
              <div
                key={i}
                className="rounded-2xl border border-ink/10 bg-card p-6 shadow-card hover:-translate-y-1 transition duration-500"
              >
                <div className="size-11 rounded-2xl bg-brand/15 grid place-items-center text-brand mb-4">
                  <f.icon className="size-5" />
                </div>
                <h3 className="font-display text-lg tracking-tight text-foreground">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {cfg.steps && cfg.steps.length > 0 && (
          <section className="bg-muted/30 py-20">
            <div className="max-w-3xl mx-auto px-6">
              <h2 className="font-display text-3xl md:text-4xl tracking-tight text-foreground text-center mb-12">
                {cfg.stepsTitle}
              </h2>
              <ol className="space-y-4">
                {cfg.steps.map((s, i) => (
                  <li
                    key={i}
                    className="flex gap-5 rounded-2xl border border-border bg-card/60 p-5 shadow-card"
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand/15 font-mono text-sm font-bold text-brand">
                      {i + 1}
                    </span>
                    <div>
                      <h3 className="font-display text-lg tracking-tight text-foreground">
                        {s.title}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        {s.desc}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        )}

        <section className={cfg.steps?.length ? "py-20" : "bg-muted/30 py-20"}>
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl tracking-tight text-foreground">
                {cfg.compareTitle}
              </h2>
            </div>
            <div className="rounded-3xl border border-border bg-card/60 shadow-card overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-5 py-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                      {isZh ? "能力" : "Capability"}
                    </th>
                    <th className="px-5 py-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                      {cfg.rivalName}
                    </th>
                    <th className="px-5 py-3 font-mono text-xs uppercase tracking-widest text-brand">
                      AirLane
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {cfg.comparison.map((row) => (
                    <tr key={row.capability} className="border-b border-border last:border-b-0">
                      <td className="px-5 py-3.5 text-sm text-muted-foreground">
                        {row.capability}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-foreground">{row.rival}</td>
                      <td className="px-5 py-3.5 text-sm font-medium text-brand">{row.airlane}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <LandingFaq />

        <section className="max-w-6xl mx-auto px-6 py-20">
          <div className="rounded-3xl bg-gradient-to-r from-ink to-neutral-900 text-cream px-8 py-10 shadow-sun flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="font-display text-3xl tracking-tight">{cfg.ctaTitle}</h2>
              <p className="mt-2 text-cream/60 max-w-md text-sm leading-relaxed">{cfg.ctaDesc}</p>
            </div>
            <Link
              to={cfg.ctaTo}
              className="shrink-0 rounded-full bg-gradient-brand text-cream font-semibold px-7 py-3.5 transition hover:brightness-105 inline-flex items-center gap-2"
            >
              {cfg.ctaLabel}
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}

/** Convenience for route files: head() factory with canonical + hreflang + JSON-LD. */
export function altLandingHead(opts: {
  path: string;
  title: string;
  description: string;
  ogTitle: string;
  ogDesc: string;
  locale: "zh-CN" | "en";
  breadcrumbName: string;
  seo: typeof import("@/lib/seo");
}) {
  const { path, locale, seo } = opts;
  const isEn = locale === "en";
  const enPath = `/en${path}`;
  return () => ({
    meta: [
      { title: opts.title },
      { name: "description", content: opts.description },
      { property: "og:title", content: opts.ogTitle },
      { property: "og:description", content: opts.ogDesc },
      { property: "og:type", content: "website" },
      { property: "og:url", content: seo.canonical(isEn ? enPath : path) },
      { property: "og:site_name", content: "AirLane" },
      { property: "og:locale", content: isEn ? "en_US" : "zh_CN" },
      { property: "og:image", content: seo.canonical("/brand/og-image.png") },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: opts.ogTitle },
      { name: "twitter:image", content: seo.canonical("/brand/og-image.png") },
    ],
    links: [
      { rel: "canonical", href: seo.canonical(isEn ? enPath : path) },
      { rel: "alternate", hrefLang: "zh-CN", href: seo.canonical(path) },
      { rel: "alternate", hrefLang: "en", href: seo.canonical(enPath) },
      { rel: "alternate", hrefLang: "x-default", href: seo.canonical(path) },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: seo.jsonLd([
          seo.organizationSchema(locale),
          seo.softwareApplicationSchema(),
          seo.faqSchema(locale),
          seo.breadcrumbSchema([
            { name: isEn ? "Home" : "首页", url: seo.canonical(isEn ? "/en/" : "/") },
            { name: opts.breadcrumbName, url: seo.canonical(isEn ? enPath : path) },
          ]),
        ]),
      },
    ],
  });
}
