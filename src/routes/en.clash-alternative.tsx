import { createFileRoute, Link } from "@tanstack/react-router";
import { useT } from "@/i18n";
import { useLocalePrefix } from "@/lib/locale-link";
import { canonical, breadcrumbSchema, jsonLd, organizationSchema, softwareApplicationSchema, faqSchema } from "@/lib/seo";
import { ArrowRight, Download, FileText, Zap, Shield, Network, Workflow, Radio } from "lucide-react";

export const Route = createFileRoute("/en/clash-alternative")({
  head: () => ({
    meta: [
      { title: "AirLane — A Modern Clash Alternative | Visual Proxy Client" },
      {
        name: "description",
        content:
          "AirLane is a visual proxy client built on the sing-box core — a modern Clash / Mihomo alternative. Compatible with Clash subscriptions, replacing Proxy Group with policy trees, log inspection with decision tracing, and standalone tools with built-in Mesh. Supports VLESS, Hysteria2, TUIC and 38+ protocols.",
      },
      {
        property: "og:title",
        content: "AirLane — A Modern Clash Alternative",
      },
      {
        property: "og:description",
        content:
          "A visual proxy client built on sing-box. Compatible with Clash / Mihomo subscriptions, policy trees replace Proxy Group, built-in Mesh and decision tracing. Say goodbye to YAML — visually orchestrate your network traffic.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: canonical("/en/clash-alternative") },
      { property: "og:site_name", content: "AirLane" },
      { property: "og:locale", content: "en_US" },
      { property: "og:image", content: canonical("/brand/og-image.svg") },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "AirLane — A Modern Clash Alternative" },
      { name: "twitter:image", content: canonical("/brand/og-image.svg") },
    ],
    links: [
      { rel: "canonical", href: canonical("/en/clash-alternative") },
      { rel: "alternate", hrefLang: "zh-CN", href: canonical("/clash-alternative") },
      { rel: "alternate", hrefLang: "en", href: canonical("/en/clash-alternative") },
      { rel: "alternate", hrefLang: "x-default", href: canonical("/clash-alternative") },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: jsonLd([
          organizationSchema("en"),
          softwareApplicationSchema(),
          faqSchema("en"),
          breadcrumbSchema([
            { name: "Home", url: canonical("/en/") },
            { name: "Clash Alternative", url: canonical("/en/clash-alternative") },
          ]),
        ]),
      },
    ],
  }),
  component: EnClashAlternativePage,
});

function EnClashAlternativePage() {
  const t = useT();
  const lp = useLocalePrefix();

  const features = [
    { icon: Workflow, title: "Visual policy tree replaces Proxy Group", desc: "AirLane abstracts Clash's Proxy Group into a nestable visual policy tree — drag and drop to orchestrate, no YAML required." },
    { icon: Radio, title: "Decision tracing replaces log inspection", desc: "Enter a domain and see the full decision chain: DNS → rule → policy → exit, every step timed, no black box." },
    { icon: Shield, title: "Built-in health & self-healing", desc: "Automatic failover with self-healing records when nodes jitter, drop packets, or go down — no third-party monitoring tools needed." },
    { icon: Network, title: "Product-level Mesh networking", desc: "No need to deploy Headscale separately — AirLane has built-in Mesh, cross-device private networks, P2P-first, DERP relay." },
    { icon: Zap, title: "sing-box core, 38+ protocols", desc: "Native support for VLESS, VMess, Trojan, Hysteria2, TUIC v5, Reality, WireGuard and more — broader protocol coverage than the Clash core." },
    { icon: FileText, title: "One-click Clash subscription import", desc: "Supports Clash / Mihomo subscription links and local configs, auto-generates migration report: Proxy Group → policy tree, Rule Provider → rule set." },
  ];

  const comparison = [
    { capability: "Core", clash: "Clash / Mihomo core", airlane: "sing-box core" },
    { capability: "Protocol support", clash: "Base protocols + Meta extensions", airlane: "38+ protocols native" },
    { capability: "Configuration", clash: "YAML config files", airlane: "Visual object model" },
    { capability: "Policy groups", clash: "Proxy Group", airlane: "Nestable policy tree" },
    { capability: "Decision debugging", clash: "Log inspection", airlane: "Visual decision trace" },
    { capability: "Network health", clash: "Third-party tools", airlane: "Built-in scoring + self-healing" },
    { capability: "Mesh networking", clash: "Separate tool deployment", airlane: "Product-level integration" },
    { capability: "Resource management", clash: "Third-party tools", airlane: "Web Control Plane" },
    { capability: "Subscription compat", clash: "Native format", airlane: "Clash / Mihomo / sing-box compatible" },
  ];

  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <header className="fixed top-0 inset-x-0 z-50">
        <div className="absolute inset-0 bg-cream/70 backdrop-blur-xl border-b border-ink/10" />
        <div className="relative max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to={lp || "/en/"} className="flex items-center gap-2.5">
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
              Clash Alternative
            </div>
            <h1 className="font-display text-4xl md:text-6xl leading-[1.05] tracking-tight text-foreground">
              AirLane — A Modern <span className="text-gradient animate-gradient italic">Clash Alternative</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              A visual proxy client built on the sing-box core. Compatible with Clash / Mihomo subscriptions, replacing Proxy Group with policy trees, log inspection with decision tracing, and standalone tools with built-in Mesh. Say goodbye to YAML — visually orchestrate your network traffic.
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
                Migration Guide
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
              Why Switch from Clash to AirLane?
            </h2>
            <p className="mt-4 text-muted-foreground">
              The Clash / Mihomo ecosystem is mature and powerful; AirLane builds on it with visual orchestration, network observability, and shared resource management.
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
                AirLane vs Clash — Full Comparison
              </h2>
            </div>
            <div className="rounded-3xl border border-border bg-card/60 shadow-card overflow-hidden">
              <div className="grid grid-cols-3 border-b border-border bg-muted/50">
                <div className="px-5 py-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  Capability
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
                Migrate from Clash in a Few Steps
              </h2>
              <p className="mt-2 text-cream/60 max-w-md text-sm leading-relaxed">
                Import your Clash / Mihomo subscription. AirLane generates a migration report, auto-converts policies and rules — fine-tune and you're ready to go.
              </p>
            </div>
            <Link
              to={`${lp}/migration`}
              className="shrink-0 rounded-full bg-gradient-brand text-cream font-semibold px-7 py-3.5 transition hover:brightness-105 inline-flex items-center gap-2"
            >
              Migration Guide
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
