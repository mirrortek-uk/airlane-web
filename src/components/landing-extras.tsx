import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { useI18n, useT } from "@/i18n";
import { docLang } from "@/lib/docs";
import { useLocalePrefix } from "@/lib/locale-link";

/**
 * Visible FAQ block for landing pages. Renders the same six questions that
 * faqSchema() emits as JSON-LD, keeping schema and visible content in sync.
 * Uses <details>/<summary> so answers are always present in the DOM.
 */
export function LandingFaq() {
  const t = useT();
  const faqs = [1, 2, 3, 4, 5, 6].map((n) => ({
    q: t(`home.faq.q${n}`),
    a: t(`home.faq.a${n}`),
  }));

  return (
    <section className="max-w-3xl mx-auto px-6 py-20">
      <div className="text-center mb-10">
        <p className="font-mono text-xs uppercase tracking-widest text-sunset mb-2">
          {t("home.faq.eyebrow")}
        </p>
        <h2 className="font-display text-3xl md:text-4xl tracking-tight text-foreground">
          {t("home.faq.title")}
        </h2>
      </div>
      <div className="space-y-3">
        {faqs.map((f, i) => (
          <details
            key={i}
            className="group rounded-2xl border border-border bg-card/60 overflow-hidden"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 [&::-webkit-details-marker]:hidden">
              <span className="font-medium text-foreground text-sm md:text-base">
                {f.q}
              </span>
              <ArrowRight className="size-4 shrink-0 rotate-90 text-muted-foreground transition-transform duration-300 group-open:-rotate-90" />
            </summary>
            <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">
              {f.a}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}

/**
 * Footer nav for standalone landing pages so crawlers and users always have
 * onward links instead of hitting a dead end.
 */
export function LandingFooter() {
  const { locale } = useI18n();
  const lang = docLang(locale);
  const lp = useLocalePrefix();

  const links = [
    { label: lang === "zh" ? "首页" : "Home", to: lp || "/" },
    { label: lang === "zh" ? "迁移指南" : "Migration", to: `${lp}/migration` },
    { label: lang === "zh" ? "博客" : "Blog", to: `${lp}/blog` },
    { label: lang === "zh" ? "帮助中心" : "Docs", to: `${lp}/docs` },
    { label: lang === "zh" ? "下载" : "Download", to: `${lp}/download` },
  ];

  // Internal links between landing pages — crawlers and users both get
  // onward paths instead of orphan pages.
  const altLinks = [
    { slug: "clash-alternative", zh: "Clash 替代", en: "Clash Alternative" },
    { slug: "mihomo-alternative", zh: "Mihomo 替代", en: "Mihomo Alternative" },
    { slug: "sing-box-gui", zh: "Sing-box GUI", en: "Sing-box GUI" },
    { slug: "v2rayn-alternative", zh: "V2RayN 替代", en: "V2RayN Alternative" },
    { slug: "nekobox-alternative", zh: "NekoBox 替代", en: "NekoBox Alternative" },
    { slug: "hiddify-alternative", zh: "Hiddify 替代", en: "Hiddify Alternative" },
    { slug: "hysteria2-client", zh: "Hysteria2 客户端", en: "Hysteria2 Client" },
    { slug: "vless-reality-client", zh: "VLESS Reality 客户端", en: "VLESS Reality Client" },
    { slug: "qv2ray-alternative", zh: "Qv2ray 替代", en: "Qv2ray Alternative" },
  ];

  return (
    <footer className="border-t border-border py-10">
      <div className="max-w-6xl mx-auto px-6 space-y-6">
        <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          {altLinks.map((l) => (
            <Link
              key={l.slug}
              to={`${lp}/${l.slug}`}
              className="text-xs text-muted-foreground hover:text-brand transition"
            >
              {lang === "zh" ? l.zh : l.en}
            </Link>
          ))}
        </nav>
        <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">© 2025 AirLane</p>
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="text-sm text-muted-foreground hover:text-foreground transition"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
