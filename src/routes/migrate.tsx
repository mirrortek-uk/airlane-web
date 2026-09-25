import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { canonical, breadcrumbSchema, jsonLd, organizationSchema } from "@/lib/seo";
import { useLocalePrefix } from "@/lib/locale-link";
import { LandingFooter } from "@/components/landing-extras";
import { LandingLangSwitch } from "@/components/alt-landing";

const CARDS = [
  { slug: "clash-alternative", zh: "Clash 替代", en: "Clash Alternative", zhDesc: "从 Clash 全系迁移，订阅与规则无缝导入。", enDesc: "Move off the Clash family — subscriptions and rules import cleanly." },
  { slug: "mihomo-alternative", zh: "Mihomo 替代", en: "Mihomo Alternative", zhDesc: "Clash.Meta 内核的现代化接替者。", enDesc: "A modern successor to the Clash.Meta core." },
  { slug: "v2rayn-alternative", zh: "V2RayN 替代", en: "V2RayN Alternative", zhDesc: "Windows 经典客户端的跨平台升级。", enDesc: "The cross-platform upgrade for the classic Windows client." },
  { slug: "nekobox-alternative", zh: "NekoBox 替代", en: "NekoBox Alternative", zhDesc: "NekoRay/NekoBox 用户的桌面级体验。", enDesc: "A desktop-grade experience for NekoRay/NekoBox users." },
  { slug: "hiddify-alternative", zh: "Hiddify 替代", en: "Hiddify Alternative", zhDesc: "同样全平台，更深的可视化与策略控制。", enDesc: "Same all-platform reach, deeper visualization and policy control." },
  { slug: "qv2ray-alternative", zh: "Qv2ray 替代", en: "Qv2ray Alternative", zhDesc: "Qv2ray 已停更——这是它的现代接班者。", enDesc: "Qv2ray is unmaintained — this is its modern successor." },
  { slug: "migration", zh: "从 Clash 迁移指南", en: "Migrate from Clash Guide", zhDesc: "一键导入 Clash/Mihomo 配置与订阅的完整教程。", enDesc: "Full guide to importing Clash/Mihomo configs and subscriptions." },
];

const PROTOCOL_CARDS = [
  { slug: "sing-box-gui", zh: "Sing-box GUI", en: "Sing-box GUI" },
  { slug: "vless-reality-client", zh: "VLESS Reality 客户端", en: "VLESS Reality Client" },
  { slug: "hysteria2-client", zh: "Hysteria2 客户端", en: "Hysteria2 Client" },
  { slug: "tuic-client", zh: "TUIC 客户端", en: "TUIC Client" },
  { slug: "trojan-client", zh: "Trojan 客户端", en: "Trojan Client" },
  { slug: "shadowsocks-client", zh: "Shadowsocks 客户端", en: "Shadowsocks Client" },
  { slug: "vmess-client", zh: "VMess 客户端", en: "VMess Client" },
  { slug: "wireguard-client", zh: "WireGuard 客户端", en: "WireGuard Client" },
];

export function MigrateHub({ locale }: { locale: "zh" | "en" }) {
  const lp = useLocalePrefix();
  const isZh = locale === "zh";
  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <header className="fixed top-0 inset-x-0 z-50">
        <div className="absolute inset-0 bg-cream/70 backdrop-blur-xl border-b border-ink/10" />
        <div className="relative max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to={lp || "/"} className="flex items-center gap-2.5">
            <img src="/brand/lockup-on-light.svg" alt="AirLane" className="h-8 w-auto" />
          </Link>
          <div className="flex items-center gap-3">
            <LandingLangSwitch slug="migrate" />
            <Link
              to={`${lp}/download`}
              className="rounded-full bg-ink text-cream text-sm font-semibold px-5 py-2.5 shadow-card hover:bg-ink/90 transition"
            >
              {isZh ? "下载" : "Download"}
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-16">
        <section className="relative overflow-hidden glow-hero">
          <div className="relative max-w-4xl mx-auto px-6 py-20 md:py-24 text-center">
            <h1 className="font-display text-4xl md:text-6xl leading-[1.05] tracking-tight text-foreground">
              {isZh ? "迁移到 " : "Migrate to "}
              <span className="text-gradient animate-gradient italic">AirLane</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {isZh
                ? "无论你现在用什么客户端——Clash、NekoBox、V2RayN 还是手写配置——AirLane 都能导入你的订阅与节点，并提供按客户端或按协议的迁移路径。"
                : "Whatever client you use today — Clash, NekoBox, V2RayN or hand-written configs — AirLane imports your subscriptions and nodes, with a migration path per client and per protocol."}
            </p>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="font-display text-2xl md:text-3xl tracking-tight text-foreground mb-8 text-center">
            {isZh ? "按你现在用的客户端迁移" : "Migrate by your current client"}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {CARDS.map((c) => (
              <Link
                key={c.slug}
                to={`${lp}/${c.slug}`}
                className="group rounded-2xl border border-ink/10 bg-card p-6 shadow-card hover:-translate-y-1 transition duration-500"
              >
                <h3 className="font-display text-lg tracking-tight text-foreground group-hover:text-brand transition">
                  {isZh ? c.zh : c.en}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {isZh ? c.zhDesc : c.enDesc}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-brand">
                  {isZh ? "查看对比" : "Compare"}
                  <ArrowRight className="size-3" />
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 pb-20">
          <h2 className="font-display text-2xl md:text-3xl tracking-tight text-foreground mb-8 text-center">
            {isZh ? "按你用的协议迁移" : "Migrate by protocol"}
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {PROTOCOL_CARDS.map((c) => (
              <Link
                key={c.slug}
                to={`${lp}/${c.slug}`}
                className="rounded-full border border-ink/15 bg-white/50 px-5 py-2.5 text-sm font-medium text-foreground transition hover:bg-white/80 hover:-translate-y-0.5"
              >
                {isZh ? c.zh : c.en}
              </Link>
            ))}
          </div>
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}

export const Route = createFileRoute("/migrate")({
  head: () => ({
    meta: [
      { title: "迁移到 AirLane · 从 Clash/NekoBox/V2RayN/手写配置切换" },
      {
        name: "description",
        content:
          "迁移到 AirLane：从 Clash、Mihomo、NekoBox、V2RayN、Hiddify、Qv2ray 等客户端切换，或按协议导入 VLESS Reality、Hysteria2、TUIC、Trojan、Shadowsocks、VMess、WireGuard 节点。订阅一键导入，38+ 协议统一 GUI。",
      },
      { property: "og:title", content: "迁移到 AirLane" },
      {
        property: "og:description",
        content: "按客户端或按协议迁移到 AirLane——订阅一键导入，38+ 协议统一 GUI。",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: canonical("/migrate") },
      { property: "og:locale", content: "zh_CN" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "canonical", href: canonical("/migrate") },
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
            { name: "首页", url: canonical("/") },
            { name: "迁移到 AirLane", url: canonical("/migrate") },
          ]),
        ]),
      },
    ],
  }),
  component: () => <MigrateHub locale="zh" />,
});
