import { createFileRoute, Link } from "@tanstack/react-router";
import { useI18n, useT } from "@/i18n";
import { docLang } from "@/lib/docs";
import { useLocalePrefix } from "@/lib/locale-link";
import { canonical, breadcrumbSchema, jsonLd, organizationSchema, softwareApplicationSchema, faqSchema } from "@/lib/seo";
import { ArrowRight, Download, FileText, Zap, Shield, Network, Workflow, Radio } from "lucide-react";

export const Route = createFileRoute("/clash-alternative")({
  head: () => ({
    meta: [
      { title: "AirLane — 现代化的 Clash 替代方案 | 可视化代理客户端" },
      {
        name: "description",
        content:
          "AirLane 是基于 sing-box 内核的可视化代理客户端，Clash / Mihomo 的现代替代方案。兼容 Clash 订阅导入，用策略树替代 Proxy Group，决策追踪替代日志查看，内置 Mesh 组网。支持 VLESS、Hysteria2、TUIC 等 38+ 协议。",
      },
      {
        property: "og:title",
        content: "AirLane — 现代化的 Clash 替代方案",
      },
      {
        property: "og:description",
        content:
          "基于 sing-box 的可视化代理客户端。兼容 Clash / Mihomo 订阅，策略树替代 Proxy Group，内置 Mesh 与决策追踪。告别 YAML，可视化编排网络流量。",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: canonical("/clash-alternative") },
      { property: "og:site_name", content: "AirLane" },
      { property: "og:locale", content: "zh_CN" },
      { property: "og:image", content: canonical("/brand/og-image.svg") },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "AirLane — 现代化的 Clash 替代方案" },
      { name: "twitter:image", content: canonical("/brand/og-image.svg") },
    ],
    links: [
      { rel: "canonical", href: canonical("/clash-alternative") },
      { rel: "alternate", hrefLang: "zh-CN", href: canonical("/clash-alternative") },
      { rel: "alternate", hrefLang: "en", href: canonical("/en/clash-alternative") },
      { rel: "alternate", hrefLang: "x-default", href: canonical("/clash-alternative") },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: jsonLd([
          organizationSchema("zh-CN"),
          softwareApplicationSchema(),
          faqSchema("zh-CN"),
          breadcrumbSchema([
            { name: "首页", url: canonical("/") },
            { name: "Clash 替代", url: canonical("/clash-alternative") },
          ]),
        ]),
      },
    ],
  }),
  component: ClashAlternativePage,
});

export function ClashAlternativePage() {
  const t = useT();
  const { locale } = useI18n();
  const lang = docLang(locale);
  const lp = useLocalePrefix();

  const features = [
        { icon: Workflow, title: "可视化策略树替代 Proxy Group", desc: "AirLane 将 Clash 的 Proxy Group 抽象为可嵌套的可视化策略树，拖拽即可编排，无需手写 YAML。" },
        { icon: Radio, title: "决策追踪替代日志查看", desc: "输入一个域名，看完整决策链：DNS → 规则 → 策略 → 出口，每一步都有耗时，没有黑盒。" },
        { icon: Shield, title: "内置健康与自愈", desc: "节点抖动、丢包或不可用时自动切换并记录自愈原因，无需第三方监控工具。" },
        { icon: Network, title: "产品级 Mesh 组网", desc: "无需独立部署 Headscale，AirLane 内置 Mesh 能力，跨设备私有网络、P2P 优先、DERP 中继。" },
        { icon: Zap, title: "sing-box 内核，38+ 协议", desc: "原生支持 VLESS、VMess、Trojan、Hysteria2、TUIC v5、Reality、WireGuard 等，比 Clash 内核协议覆盖更广。" },
        { icon: FileText, title: "一键导入 Clash 订阅", desc: "支持 Clash / Mihomo 订阅链接和本地配置导入，自动生成迁移报告，Proxy Group → 策略树，Rule Provider → 规则集。" },
  ];

  const comparison = [
        { capability: "内核", clash: "Clash / Mihomo 内核", airlane: "sing-box 内核" },
        { capability: "协议支持", clash: "基础协议 + Meta 扩展", airlane: "38+ 协议原生支持" },
        { capability: "配置方式", clash: "YAML 配置文件", airlane: "可视化对象模型" },
        { capability: "策略组", clash: "Proxy Group", airlane: "可嵌套策略树" },
        { capability: "决策调试", clash: "日志查看", airlane: "可视化决策追踪" },
        { capability: "网络健康", clash: "第三方工具", airlane: "内置评分 + 自愈" },
        { capability: "Mesh 组网", clash: "独立工具部署", airlane: "产品级集成" },
        { capability: "资源管理", clash: "第三方工具", airlane: "Web Control Plane" },
        { capability: "订阅兼容", clash: "原生格式", airlane: "兼容 Clash / Mihomo / sing-box" },
  ];

  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <header className="fixed top-0 inset-x-0 z-50">
        <div className="absolute inset-0 bg-cream/70 backdrop-blur-xl border-b border-ink/10" />
        <div className="relative max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to={lp || "/"} className="flex items-center gap-2.5">
            <img src="/brand/lockup-on-light.svg" alt="AirLane" className="h-8 w-auto" />
          </Link>
          <div className="flex items-center gap-3">
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
              Clash 替代方案
            </div>
            <h1 className="font-display text-4xl md:text-6xl leading-[1.05] tracking-tight text-foreground">
              AirLane — 现代化的 <span className="text-gradient animate-gradient italic">Clash 替代</span> 方案
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              基于 sing-box 内核的可视化代理客户端。兼容 Clash / Mihomo 订阅，用策略树替代 Proxy Group，用决策追踪替代日志查看，用内置 Mesh 替代独立工具。告别 YAML，可视化编排你的网络流量。
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
                to={`${lp}/migration`}
                className="rounded-full border border-ink/15 bg-white/50 px-7 py-3.5 font-semibold transition duration-500 hover:bg-white/80 hover:-translate-y-0.5 inline-flex items-center gap-2"
              >
                <FileText className="size-4" />
                查看迁移指南
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
              为什么从 Clash 切换到 AirLane？
            </h2>
            <p className="mt-4 text-muted-foreground">
              Clash / Mihomo 生态成熟强大，AirLane 在其之上补齐可视化编排、网络观测与共享资源管理。
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <div
                key={i}
                className="rounded-2xl border border-ink/10 bg-card p-6 shadow-card hover:-translate-y-1 transition duration-500"
              >
                <div className="size-11 rounded-2xl bg-brand/15 grid place-items-center text-brand mb-4">
                  <f.icon className="size-5" />
                </div>
                <h3 className="font-display text-lg tracking-tight text-foreground">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-muted/30 py-20">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl tracking-tight text-foreground">
                AirLane vs Clash 全面对比
              </h2>
            </div>
            <div className="rounded-3xl border border-border bg-card/60 shadow-card overflow-hidden">
              <div className="grid grid-cols-3 border-b border-border bg-muted/50">
                <div className="px-5 py-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  能力
                </div>
                <div className="px-5 py-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  Clash / Mihomo
                </div>
                <div className="px-5 py-3 font-mono text-xs uppercase tracking-widest text-brand">
                  AirLane
                </div>
              </div>
              {comparison.map((row) => (
                <div key={row.capability} className="grid grid-cols-3 border-b border-border last:border-b-0">
                  <div className="px-5 py-3.5 text-sm text-muted-foreground">{row.capability}</div>
                  <div className="px-5 py-3.5 text-sm text-foreground">{row.clash}</div>
                  <div className="px-5 py-3.5 text-sm font-medium text-brand">{row.airlane}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 py-20">
          <div className="rounded-3xl bg-gradient-to-r from-ink to-neutral-900 text-cream px-8 py-10 shadow-sun flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="font-display text-3xl tracking-tight">
                从 Clash 迁移，只需几步
              </h2>
              <p className="mt-2 text-cream/60 max-w-md text-sm leading-relaxed">
                导入你的 Clash / Mihomo 订阅，AirLane 生成迁移报告，自动转换策略与规则，微调即可启用。
              </p>
            </div>
            <Link
              to={`${lp}/migration`}
              className="shrink-0 rounded-full bg-gradient-brand text-cream font-semibold px-7 py-3.5 transition hover:brightness-105 inline-flex items-center gap-2"
            >
              查看迁移指南
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
