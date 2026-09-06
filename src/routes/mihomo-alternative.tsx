import { createFileRoute, Link } from "@tanstack/react-router";
import { useT } from "@/i18n";
import { useLocalePrefix } from "@/lib/locale-link";
import { canonical, breadcrumbSchema, jsonLd, organizationSchema, softwareApplicationSchema, faqSchema } from "@/lib/seo";
import { ArrowRight, Download, FileText, Zap, Shield, Network, Workflow, Radio } from "lucide-react";

export const Route = createFileRoute("/mihomo-alternative")({
  head: () => ({
    meta: [
      { title: "AirLane — 现代化的 Mihomo 替代方案 | 可视化代理客户端" },
      {
        name: "description",
        content:
          "AirLane 是基于 sing-box 内核的可视化代理客户端，Mihomo (Clash Meta) 的现代替代方案。兼容 Mihomo 订阅导入，用策略树替代 Proxy Group，决策追踪替代日志查看，内置 Mesh 组网。支持 VLESS、Hysteria2、TUIC 等 38+ 协议。",
      },
      {
        property: "og:title",
        content: "AirLane — 现代化的 Mihomo 替代方案",
      },
      {
        property: "og:description",
        content:
          "基于 sing-box 的可视化代理客户端。兼容 Mihomo 订阅，策略树替代 Proxy Group，内置 Mesh 与决策追踪。告别 YAML，可视化编排网络流量。",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: canonical("/mihomo-alternative") },
      { property: "og:site_name", content: "AirLane" },
      { property: "og:locale", content: "zh_CN" },
      { property: "og:image", content: canonical("/brand/og-image.svg") },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "AirLane — 现代化的 Mihomo 替代方案" },
      { name: "twitter:image", content: canonical("/brand/og-image.svg") },
    ],
    links: [
      { rel: "canonical", href: canonical("/mihomo-alternative") },
      { rel: "alternate", hrefLang: "zh-CN", href: canonical("/mihomo-alternative") },
      { rel: "alternate", hrefLang: "en", href: canonical("/en/mihomo-alternative") },
      { rel: "alternate", hrefLang: "x-default", href: canonical("/mihomo-alternative") },
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
            { name: "Mihomo 替代", url: canonical("/mihomo-alternative") },
          ]),
        ]),
      },
    ],
  }),
  component: MihomoAlternativePage,
});

export function MihomoAlternativePage() {
  const t = useT();
  const lp = useLocalePrefix();

  const features = [
    { icon: Workflow, title: "从 Proxy Group 到可视化策略树", desc: "Mihomo 的 Proxy Group 模型强大但依赖 YAML。AirLane 将策略抽象为可视化对象，拖拽编排，嵌套组合，无需手写配置。" },
    { icon: Radio, title: "决策追踪替代日志分析", desc: "Mihomo 排查问题靠看日志。AirLane 提供可视化决策追踪：输入域名看完整链路 DNS → 规则 → 策略 → 出口，每步耗时可见。" },
    { icon: Shield, title: "内置健康模型与自愈", desc: "Mihomo 需要第三方工具做健康监控。AirLane 内置多维度健康评分（延迟、抖动、丢包、可用率），故障自动切换并记录原因。" },
    { icon: Network, title: "集成 Mesh 替代外部组网工具", desc: "Mihomo 本身不提供 Mesh。AirLane 内置 Tailscale/Headscale 兼容的 Mesh 能力，跨设备私有网络、P2P 优先、DERP 中继。" },
    { icon: Zap, title: "sing-box 内核 vs Mihomo 内核", desc: "AirLane 基于 sing-box 内核，原生支持 38+ 协议。Mihomo 基于 Clash 内核扩展，协议覆盖有差异。两者各有优势，AirLane 兼容 Mihomo 订阅格式。" },
    { icon: FileText, title: "兼容 Mihomo 订阅导入", desc: "支持 Mihomo / Clash Meta 订阅链接和本地配置导入，自动生成迁移报告，Proxy Group → 策略树，Rule Provider → 规则集。" },
  ];

  const comparison = [
    { capability: "内核", mihomo: "Mihomo (Clash Meta) 内核", airlane: "sing-box 内核" },
    { capability: "协议支持", mihomo: "Clash 基础 + Meta 扩展", airlane: "38+ 协议原生支持" },
    { capability: "配置方式", mihomo: "YAML 配置文件", airlane: "可视化对象模型" },
    { capability: "策略组", mihomo: "Proxy Group", airlane: "可嵌套策略树" },
    { capability: "决策调试", mihomo: "日志分析", airlane: "可视化决策追踪" },
    { capability: "网络健康", mihomo: "第三方工具", airlane: "内置评分 + 自愈" },
    { capability: "Mesh 组网", mihomo: "不内置", airlane: "产品级集成" },
    { capability: "资源管理", mihomo: "第三方工具", airlane: "Web Control Plane" },
    { capability: "订阅兼容", mihomo: "原生格式", airlane: "兼容 Mihomo / Clash / sing-box" },
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
              Mihomo 替代方案
            </div>
            <h1 className="font-display text-4xl md:text-6xl leading-[1.05] tracking-tight text-foreground">
              AirLane — 现代化的 <span className="text-gradient animate-gradient italic">Mihomo 替代</span> 方案
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              从 Proxy Group 到网络策略，从日志分析到决策追踪。AirLane 基于 sing-box 内核，兼容 Mihomo 订阅导入，用可视化编排替代 YAML 配置，用内置 Mesh 替代外部组网工具。
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
              为什么从 Mihomo 切换到 AirLane？
            </h2>
            <p className="mt-4 text-muted-foreground">
              Mihomo (Clash Meta) 在 Clash 基础上扩展了协议支持；AirLane 基于 sing-box 内核，从设计上提供可视化编排、网络观测与共享资源管理。
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
                AirLane vs Mihomo 全面对比
              </h2>
            </div>
            <div className="rounded-3xl border border-border bg-card/60 shadow-card overflow-hidden">
              <div className="grid grid-cols-3 border-b border-border bg-muted/50">
                <div className="px-5 py-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  能力
                </div>
                <div className="px-5 py-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  Mihomo (Clash Meta)
                </div>
                <div className="px-5 py-3 font-mono text-xs uppercase tracking-widest text-brand">
                  AirLane
                </div>
              </div>
              {comparison.map((row) => (
                <div key={row.capability} className="grid grid-cols-3 border-b border-border last:border-b-0">
                  <div className="px-5 py-3.5 text-sm text-muted-foreground">{row.capability}</div>
                  <div className="px-5 py-3.5 text-sm text-foreground">{row.mihomo}</div>
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
                从 Mihomo 迁移，只需几步
              </h2>
              <p className="mt-2 text-cream/60 max-w-md text-sm leading-relaxed">
                导入你的 Mihomo 订阅，AirLane 生成迁移报告，自动转换策略与规则，微调即可启用。
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
