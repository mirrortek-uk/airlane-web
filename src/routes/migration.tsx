import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Check, FileInput, Settings, Zap } from "lucide-react";

import { useT } from "@/i18n";
import { LanguageSwitcher } from "@/components/language-switcher";
import { canonical, breadcrumbSchema, jsonLd, organizationSchema } from "@/lib/seo";

export const Route = createFileRoute("/migration")({
  head: () => ({
    meta: [
      { title: "从 Clash / Mihomo 迁移到 AirLane" },
      {
        name: "description",
        content:
          "AirLane 支持从 Clash / Mihomo / sing-box 导入订阅与配置，自动生成迁移报告，策略与规则可视化编辑。",
      },
      {
        property: "og:title",
        content: "从 Clash / Mihomo 迁移到 AirLane",
      },
      {
        property: "og:description",
        content:
          "导入已有订阅与配置，AirLane 帮你完成迁移。支持 Clash、Mihomo、sing-box 订阅链接与本地配置。",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: canonical("/migration") },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "从 Clash / Mihomo 迁移到 AirLane" },
    ],
    links: [
      { rel: "canonical", href: canonical("/migration") },
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
            { name: "首页", url: canonical("/") },
            { name: "迁移", url: canonical("/migration") },
          ]),
        ]),
      },
    ],
  }),
  component: MigrationPage,
});

export function MigrationPage() {
  const t = useT();

  const steps = [
    {
      icon: FileInput,
      title: t("pages.migration.step1.title"),
      desc: t("pages.migration.step1.desc"),
    },
    {
      icon: Zap,
      title: t("pages.migration.step2.title"),
      desc: t("pages.migration.step2.desc"),
    },
    {
      icon: Settings,
      title: t("pages.migration.step3.title"),
      desc: t("pages.migration.step3.desc"),
    },
  ];

  const supported = [
    t("pages.migration.supported.item1"),
    t("pages.migration.supported.item2"),
    t("pages.migration.supported.item3"),
    t("pages.migration.supported.item4"),
    t("pages.migration.supported.item5"),
    t("pages.migration.supported.item6"),
  ];

  const partial = [
    t("pages.migration.partial.item1"),
    t("pages.migration.partial.item2"),
    t("pages.migration.partial.item3"),
  ];

  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <header className="max-w-6xl mx-auto px-6 pt-7 flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft className="size-4" />
          {t("pages.migration.back")}
        </Link>
        <LanguageSwitcher />
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/5 px-3 py-1.5 font-mono text-xs text-brand mb-4">
            <FileInput className="size-3.5" />
            {t("pages.migration.badge")}
          </div>
          <h1 className="font-display text-4xl md:text-5xl tracking-tight text-foreground">
            {t("pages.migration.title")}
          </h1>
          <p className="mt-4 text-muted-foreground">
            {t("pages.migration.subtitle")}
          </p>
        </div>

        <div className="space-y-6 mb-16">
          {steps.map((step, i) => (
            <div
              key={step.title}
              className="rounded-2xl border border-border bg-card/60 p-6 shadow-card flex gap-5"
            >
              <div className="size-10 rounded-xl bg-brand/15 grid place-items-center text-brand shrink-0">
                <step.icon className="size-5" />
              </div>
              <div>
                <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-1">
                  {t("pages.migration.step")} {String(i + 1).padStart(2, "0")}
                </div>
                <h3 className="font-display text-xl text-foreground">{step.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="rounded-2xl border border-border bg-card/60 p-6">
            <h3 className="font-display text-lg text-foreground mb-4 flex items-center gap-2">
              <Check className="size-5 text-emerald-600" />
              {t("pages.migration.supported.title")}
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {supported.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-border bg-card/60 p-6">
            <h3 className="font-display text-lg text-foreground mb-4 flex items-center gap-2">
              <Settings className="size-5 text-sunset" />
              {t("pages.migration.partial.title")}
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {partial.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-2xl bg-gradient-to-r from-ink to-neutral-900 text-cream p-8 text-center">
          <h3 className="font-display text-2xl tracking-tight">{t("pages.migration.cta.title")}</h3>
          <p className="mt-2 text-cream/60 text-sm">
            {t("pages.migration.cta.desc")}
          </p>
          <Link
            to="/download"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-brand text-cream font-semibold px-7 py-3 hover:brightness-105 transition"
          >
            {t("pages.migration.cta.button")}
            <Zap className="size-4" />
          </Link>
        </div>
      </main>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        <Link to="/" className="hover:text-foreground transition">
          © 2025 AirLane
        </Link>
      </footer>
    </div>
  );
}
