import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Download, Github, Monitor, Smartphone } from "lucide-react";

import { useT } from "@/i18n";
import { LanguageSwitcher } from "@/components/language-switcher";
import { canonical, softwareApplicationSchema, breadcrumbSchema, jsonLd, organizationSchema } from "@/lib/seo";

export const Route = createFileRoute("/download")({
  head: () => ({
    meta: [
      { title: "下载 AirLane — 跨平台网络编排客户端" },
      {
        name: "description",
        content:
          "下载 AirLane 客户端，支持 Windows、macOS、Linux、Android 与 iOS。基于 sing-box 的现代网络编排平台。",
      },
      {
        property: "og:title",
        content: "下载 AirLane — 跨平台网络编排客户端",
      },
      {
        property: "og:description",
        content:
          "支持 Windows、macOS、Linux、Android 与 iOS。基于 sing-box 的现代网络编排平台。",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: canonical("/download") },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "下载 AirLane — 跨平台网络编排客户端" },
    ],
    links: [
      { rel: "canonical", href: canonical("/download") },
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
            { name: "首页", url: canonical("/") },
            { name: "下载", url: canonical("/download") },
          ]),
        ]),
      },
    ],
  }),
  component: DownloadPage,
});

export function DownloadPage() {
  const t = useT();

  const platforms = [
    {
      name: "Windows",
      arch: t("pages.download.platform.windows.arch"),
      icon: Monitor,
      status: t("pages.download.status.preview"),
    },
    {
      name: "macOS",
      arch: t("pages.download.platform.macos.arch"),
      icon: Monitor,
      status: t("pages.download.status.preview"),
    },
    {
      name: "Linux",
      arch: t("pages.download.platform.linux.arch"),
      icon: Monitor,
      status: t("pages.download.status.preview"),
    },
    {
      name: "Android",
      arch: t("pages.download.platform.android.arch"),
      icon: Smartphone,
      status: t("pages.download.status.developing"),
    },
    {
      name: "iOS",
      arch: t("pages.download.platform.ios.arch"),
      icon: Smartphone,
      status: t("pages.download.status.developing"),
    },
  ];

  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <header className="max-w-6xl mx-auto px-6 pt-7 flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft className="size-4" />
          {t("pages.download.back")}
        </Link>
        <LanguageSwitcher />
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/5 px-3 py-1.5 font-mono text-xs text-brand mb-4">
            <Download className="size-3.5" />
            {t("pages.download.badge")}
          </div>
          <h1 className="font-display text-4xl md:text-5xl tracking-tight text-foreground">
            {t("pages.download.title")}
          </h1>
          <p className="mt-4 text-muted-foreground">
            {t("pages.download.subtitle")}
          </p>
        </div>

        <div className="space-y-4">
          {platforms.map((p) => (
            <div
              key={p.name}
              className="rounded-2xl border border-border bg-card/60 p-5 shadow-card flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="size-11 rounded-2xl bg-brand/15 grid place-items-center text-brand">
                  <p.icon className="size-5" />
                </div>
                <div>
                  <h3 className="font-display text-lg text-foreground">{p.name}</h3>
                  <p className="text-sm text-muted-foreground">{p.arch}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="block text-xs font-mono text-muted-foreground mb-1.5">
                  {p.status}
                </span>
                <button className="rounded-full bg-gradient-brand text-cream text-sm font-semibold px-5 py-2 hover:brightness-105 transition inline-flex items-center gap-2">
                  <Download className="size-4" />
                  {t("pages.download.action.download")}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-border bg-muted/30 p-6">
          <h3 className="font-display text-lg text-foreground mb-2">{t("pages.download.notes.title")}</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>{t("pages.download.notes.item1")}</li>
            <li>{t("pages.download.notes.item2")}</li>
            <li>{t("pages.download.notes.item3")}</li>
          </ul>
        </div>

        <div className="mt-8 text-center">
          <a
            href="https://github.com/airlane"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition"
          >
            <Github className="size-4" />
            {t("pages.download.github")}
          </a>
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
