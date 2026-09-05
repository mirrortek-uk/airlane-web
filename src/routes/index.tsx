import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { useQuery } from "@tanstack/react-query";

import { useI18n, useT } from "@/i18n";
import { blogQueries } from "@/lib/blog";
import { docLang, pick } from "@/lib/docs";
import { canonical, breadcrumbSchema, jsonLd, organizationSchema, websiteSchema } from "@/lib/seo";
import { LanguageSwitcher } from "@/components/language-switcher";
import {
  CountUp,
  FlightLines,
  Marquee,
  Reveal,
  TiltCard,
} from "@/components/motion";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Download,
  FileText,
  Newspaper,
  Globe,
  Network,
  Radio,
  Shield,
  Sparkles,
  Workflow,
  Zap,
} from "lucide-react";

import appHome from "@/assets/app-home.jpg";
import appNetwork from "@/assets/app-network.jpg";
import appRules from "@/assets/app-rules.jpg";
import appInsights from "@/assets/app-insights.jpg";
import appAutomation from "@/assets/app-automation.jpg";
import appTools from "@/assets/app-tools.jpg";

const APP_SHOTS = [
  appHome,
  appNetwork,
  appRules,
  appInsights,
  appAutomation,
  appTools,
];

function AppScreenshotCarousel({ alt }: { alt: string }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(
      () => setIndex((i) => (i + 1) % APP_SHOTS.length),
      4000,
    );
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="relative">
      <div className="relative aspect-[1282/861] w-full overflow-hidden rounded-3xl shadow-sun ring-1 ring-border/60">
        {APP_SHOTS.map((src, i) => (
          <img
            key={src}
            src={src}
            alt={`${alt} ${i + 1}`}
            width={1282}
            height={861}
            loading={i === 0 ? "eager" : "lazy"}
            className={`absolute inset-0 size-full object-cover transition-all duration-1000 ease-out ${
              i === index
                ? "opacity-100 scale-100"
                : "opacity-0 scale-[1.03] pointer-events-none"
            }`}
          />
        ))}
      </div>
      <div className="mt-4 flex items-center justify-center gap-2">
        {APP_SHOTS.map((src, i) => (
          <button
            key={src}
            type="button"
            aria-label={`${alt} ${i + 1}`}
            onClick={() => setIndex(i)}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              i === index
                ? "w-8 bg-gradient-brand"
                : "w-2.5 bg-border hover:bg-brand/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AirLane — 让每一条流量，找到最优航线" },
      {
        name: "description",
        content:
          "AirLane 现代网络编排平台：可视化策略编排、网络决策追踪、Mesh 私有组网、共享网络资源池、从 Clash/Mihomo 一键迁移。",
      },
      {
        property: "og:title",
        content: "AirLane — 让每一条流量，找到最优航线",
      },
      {
        property: "og:description",
        content:
          "从复杂配置文件，到可视化网络编排。管理出口、策略、规则、Mesh 网络与共享资源。",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: canonical("/") },
      { property: "og:site_name", content: "AirLane" },
      { property: "og:locale", content: "zh_CN" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "AirLane — 让每一条流量，找到最优航线" },
      {
        name: "twitter:description",
        content:
          "从复杂配置文件，到可视化网络编排。管理出口、策略、规则、Mesh 网络与共享资源。",
      },
    ],
    links: [
      { rel: "canonical", href: canonical("/") },
      { rel: "alternate", hrefLang: "zh-CN", href: canonical("/") },
      { rel: "alternate", hrefLang: "en", href: canonical("/en/") },
      { rel: "alternate", hrefLang: "x-default", href: canonical("/") },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: jsonLd([
          organizationSchema(),
          websiteSchema(),
          breadcrumbSchema([
            { name: "首页", url: canonical("/") },
          ]),
        ]),
      },
    ],
  }),
  component: Index,
});

export function Index() {
  return (
    <div className="min-h-screen bg-background font-sans antialiased selection:bg-brand/30 selection:text-ink">
      <Header />
      <main className="pt-16">
        <Hero />
        <StatsStrip />
        <Reveal>
          <ProtocolMatrix />
        </Reveal>
        <Reveal>
          <ModelComparison />
        </Reveal>

        <Reveal>
          <WhyAirLane />
        </Reveal>
        <Reveal>
          <CoreFeatures />
        </Reveal>
        <Reveal>
          <DecisionTrace />
        </Reveal>
        <Reveal>
          <HealthAndHealing />
        </Reveal>
        <Reveal>
          <MeshNetwork />
        </Reveal>
        <Reveal>
          <ResourcePool />
        </Reveal>
        <Reveal>
          <NetworkProfiles />
        </Reveal>
        <Reveal>
          <Diagnostics />
        </Reveal>
        <Reveal>
          <Migration />
        </Reveal>
        <Reveal>
          <ComparisonTable />
        </Reveal>
        <Reveal>
          <BlogTeaser />
        </Reveal>
        <Reveal>
          <Roadmap />
        </Reveal>
      </main>
      <Footer />
    </div>
  );
}

function BlogTeaser() {
  const { locale } = useI18n();
  const lang = docLang(locale);
  const posts = useQuery(blogQueries.posts());
  const latest = (posts.data ?? []).slice(0, 3);

  if (latest.length === 0) return null;

  return (
    <section className="py-20" id="blog">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Blog
            </span>
            <h2 className="mt-2 font-display text-3xl md:text-4xl tracking-tight text-foreground">
              {lang === "zh" ? "最新文章" : "Latest posts"}
            </h2>
          </div>
          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline"
          >
            {lang === "zh" ? "查看全部" : "View all"}
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        <div className="mt-8 grid md:grid-cols-3 gap-5">
          {latest.map((post) => (
            <Link
              key={post.id}
              to="/blog/$slug"
              params={{ slug: post.slug }}
              className="group rounded-2xl border border-ink/10 bg-card p-6 shadow-card hover:-translate-y-1 transition duration-500"
            >
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-muted-foreground">
                <span>{new Date(post.published_at).toLocaleDateString()}</span>
                {(post.tags ?? []).slice(0, 2).map((tag) => (
                  <span key={tag} className="rounded-full bg-brand/10 text-brand px-2 py-0.5">
                    {tag}
                  </span>
                ))}
              </div>
              <h3 className="mt-3 font-display text-xl tracking-tight text-foreground">
                {pick(post, "title", lang)}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-3">
                {pick(post, "summary", lang)}
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand">
                {lang === "zh" ? "阅读全文" : "Read more"}
                <ArrowRight className="size-3.5 transition group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function Header() {
  const t = useT();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        className={`pointer-events-none absolute inset-0 transition-opacity duration-500 ${
          scrolled ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-cream/70 backdrop-blur-xl border-b border-ink/10 shadow-[0_12px_40px_-18px_oklch(0.55_0.12_70/0.4)]" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-brand/60 to-transparent" />
      </div>
      <div className="relative max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5" aria-label={t("brand.name")}>
          <img
            src="/brand/lockup-on-light.svg"
            alt="AirLane"
            className="h-8 w-auto transition-transform duration-500 hover:scale-[1.03]"
          />
        </Link>

        <nav className="hidden md:flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
          <a href="#features" className="nav-glow">
            {t("nav.features")}
          </a>
          <Link to="/migration" className="nav-glow">
            {t("home.header.nav.migration")}
          </Link>
          <Link to="/docs" className="nav-glow">
            {t("nav.docs")}
          </Link>
          <Link to="/blog" className="nav-glow">
            {t("nav.blog")}
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link
            to="/account"
            className="hidden sm:inline-flex items-center text-sm font-medium text-muted-foreground nav-glow"
          >
            {t("nav.account")}
          </Link>
          <LanguageSwitcher />
          <Link
            to="/download"
            className="rounded-full bg-ink text-cream text-sm font-semibold px-5 py-2.5 shadow-card hover:bg-ink/90 transition shine"
          >
            {t("nav.download")}
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  const t = useT();
  return (
    <section className="glow-hero relative overflow-hidden">
      <div className="aurora-layer" aria-hidden="true" />
      <FlightLines className="pointer-events-none absolute inset-0 h-full w-full opacity-70" />
      <div className="relative max-w-6xl mx-auto px-6 py-16 md:py-24 grid lg:grid-cols-[1.05fr_0.95fr] gap-12 items-center">
        <div>
          <Reveal delay={0}>
            <div className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white/60 px-3 py-1.5 text-xs font-mono text-muted-foreground">
              <span className="size-1.5 rounded-full bg-sunset animate-pulse-soft" />
              {t("home.hero.badge")}
            </div>
          </Reveal>
          <Reveal delay={120}>
            <h1 className="mt-6 font-display text-5xl md:text-6xl leading-[1.03] tracking-tight text-foreground">
              {t("home.hero.title1")}
              <br />
              {t("home.hero.title2")}
              <span className="text-gradient animate-gradient italic">
                {t("home.hero.titleGradient")}
              </span>
            </h1>
          </Reveal>
          <Reveal delay={240}>
            <p className="mt-6 text-lg text-muted-foreground max-w-lg leading-relaxed">
              {t("home.hero.subtitle")}
            </p>
          </Reveal>
          <Reveal delay={360}>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/download"
                className="shine rounded-full bg-gradient-brand text-cream font-semibold px-7 py-3.5 shadow-sun transition duration-500 hover:brightness-105 hover:-translate-y-0.5 inline-flex items-center gap-2"
              >
                <Download className="size-4" />
                {t("nav.download")}
              </Link>
              <Link
                to="/docs"
                className="rounded-full border border-ink/15 bg-white/50 px-7 py-3.5 font-semibold transition duration-500 hover:bg-white/80 hover:-translate-y-0.5 inline-flex items-center gap-2"
              >
                <FileText className="size-4" />
                {t("nav.docs")}
              </Link>
            </div>
          </Reveal>
          <Reveal delay={480}>
            <div className="mt-8 flex items-center gap-6 text-xs font-mono text-muted-foreground">
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
          </Reveal>
        </div>

        <Reveal delay={200} className="relative">
          <TiltCard>
            <div
              className="absolute -inset-6 rounded-[2.5rem] bg-gradient-brand opacity-25 blur-3xl animate-pulse-soft"
              aria-hidden="true"
            />
            <AppScreenshotCarousel alt={t("home.hero.imageAlt")} />
          </TiltCard>
        </Reveal>

      </div>
    </section>

  );
}

function StatsStrip() {
  const t = useT();
  const stats = [
    { value: 38, suffix: "+", label: t("home.stats.protocols"), decimals: 0 },
    { value: 50, suffix: "+", label: t("home.stats.features"), decimals: 0 },
    { value: 35, suffix: " MB", label: t("home.stats.memory"), decimals: 0 },
    { value: 0.8, suffix: " ms", label: t("home.stats.latency"), decimals: 1 },
  ];

  return (
    <section className="border-y border-border bg-card/40">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-10">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 110}>
              <div className="text-center md:text-left">
                <div className="font-display text-3xl md:text-4xl tracking-tight text-gradient animate-gradient">
                  <CountUp
                    to={s.value}
                    decimals={s.decimals}
                    suffix={s.suffix}
                  />
                </div>
                <p className="mt-1 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                  {s.label}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
        <Marquee
          items={[
            "VLESS / Reality",
            "Hysteria2",
            "TUIC",
            "Trojan",
            "Shadowsocks",
            "WireGuard",
            "VMess",
            "SSH",
            "Mesh / DERP",
            "sing-box 内核",
          ]}
        />
      </div>
    </section>
  );
}

const PROTOCOL_GROUPS = [
  {
    key: "proxy",
    items: [
      "VLESS",
      "VMess",
      "Trojan",
      "Shadowsocks",
      "ShadowsocksR",
      "Hysteria",
      "Hysteria2",
      "TUIC v5",
      "AnyTLS",
      "Snell v4",
      "WireGuard",
      "SSH",
      "SOCKS5",
      "HTTP / HTTPS",
      "Direct / Reject",
    ],
  },
  {
    key: "transport",
    items: [
      "REALITY",
      "TLS / uTLS",
      "XTLS Vision",
      "WebSocket",
      "gRPC",
      "HTTP/2",
      "HTTPUpgrade",
      "QUIC",
      "mKCP",
      "Multiplex (smux/yamux)",
      "V2Ray Plugin",
      "obfs / shadow-tls",
    ],
  },
  {
    key: "network",
    items: [
      "TUN",
      "System Proxy",
      "Mesh / WireGuard",
      "DERP Relay",
      "DoH / DoT / DoQ",
      "DNSSEC",
      "FakeIP",
      "IPv4 / IPv6 双栈",
      "Clash / Mihomo",
      "sing-box",
      "Base64 / URI",
    ],
  },
] as const;

function ProtocolMatrix() {
  const t = useT();
  return (
    <section className="max-w-6xl mx-auto px-6 py-16" id="protocols">
      <div className="text-center max-w-2xl mx-auto">
        <p className="font-mono text-xs uppercase tracking-widest text-brand">
          {t("home.protocols.eyebrow")}
        </p>
        <h2 className="mt-3 font-display text-3xl md:text-4xl tracking-tight text-foreground">
          {t("home.protocols.title")}
        </h2>
        <p className="mt-3 text-muted-foreground">{t("home.protocols.desc")}</p>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {PROTOCOL_GROUPS.map((group, gi) => (
          <Reveal key={group.key} delay={gi * 120}>
            <div className="h-full rounded-2xl border border-border bg-card/60 p-6 shadow-card hover-lift">
              <div className="flex items-baseline justify-between">
                <h3 className="font-display text-lg text-foreground">
                  {t(`home.protocols.group.${group.key}.title`)}
                </h3>
                <span className="font-mono text-xs text-muted-foreground">
                  {group.items.length}
                </span>
              </div>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {t(`home.protocols.group.${group.key}.desc`)}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-brand/25 bg-brand/5 px-2.5 py-1 font-mono text-[11px] text-foreground/80 transition hover:border-brand/60 hover:bg-brand/10 hover:text-foreground"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        {t("home.protocols.note")}
      </p>
    </section>
  );
}


function ModelComparison() {
  const t = useT();
  return (
    <section className="max-w-6xl mx-auto px-6 py-16" id="model">
      <p className="text-center font-display text-2xl md:text-3xl tracking-tight max-w-3xl mx-auto leading-snug text-foreground">
        {t("home.model.headline")}
      </p>
      <div className="mt-10 grid md:grid-cols-[1fr_auto_1fr] gap-6 items-center">
        <div className="rounded-2xl border border-border bg-card/50 p-6 shadow-card hover-lift">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-4">
            {t("home.model.traditional.label")}
          </p>
          <div className="space-y-2.5 font-mono text-sm text-muted-foreground">
            <div>{t("home.model.traditional.step1")}</div>
            <div className="text-center text-border">↓</div>
            <div>{t("home.model.traditional.step2")}</div>
            <div className="text-center text-border">↓</div>
            <div>{t("home.model.traditional.step3")}</div>
            <div className="text-center text-border">↓</div>
            <div>{t("home.model.traditional.step4")}</div>
          </div>
        </div>
        <div className="hidden md:flex justify-center">
          <ArrowRight className="size-8 text-sunset" />
        </div>
        <div className="rounded-2xl border border-brand/30 bg-gradient-to-br from-brand/10 to-sunset/10 p-6 shadow-card hover-lift">
          <p className="font-mono text-xs uppercase tracking-widest text-brand mb-4">
            {t("home.model.airlane.label")}
          </p>
          <div className="space-y-2.5 font-mono text-sm font-medium text-foreground">
            <div>{t("home.model.airlane.step1")}</div>
            <div className="text-center text-brand/50">↓</div>
            <div>{t("home.model.airlane.step2")}</div>
            <div className="text-center text-brand/50">↓</div>
            <div>{t("home.model.airlane.step3")}</div>
            <div className="text-center text-brand/50">↓</div>
            <div className="text-sunset">{t("home.model.airlane.step4")}</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function WhyAirLane() {
  const t = useT();
  const items = [
    {
      icon: Workflow,
      title: t("home.why.item1.title"),
      desc: t("home.why.item1.desc"),
    },
    {
      icon: Network,
      title: t("home.why.item2.title"),
      desc: t("home.why.item2.desc"),
    },
    {
      icon: Zap,
      title: t("home.why.item3.title"),
      desc: t("home.why.item3.desc"),
    },
    {
      icon: Shield,
      title: t("home.why.item4.title"),
      desc: t("home.why.item4.desc"),
    },
  ];

  return (
    <section className="max-w-6xl mx-auto px-6 py-16" id="why">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <p className="font-mono text-xs uppercase tracking-widest text-sunset mb-2">
          {t("home.why.eyebrow")}
        </p>
        <h2 className="font-display text-3xl md:text-4xl tracking-tight text-foreground">
          {t("home.why.title")}
        </h2>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        {items.map((item, i) => (
          <Reveal key={item.title} delay={i * 120}>
          <div
            className="h-full rounded-3xl border border-border bg-card/60 p-7 shadow-card hover:shadow-sun transition-shadow hover-lift"
          >
            <div className="size-11 rounded-2xl bg-brand/15 grid place-items-center text-brand">
              <item.icon className="size-5" />
            </div>
            <h3 className="mt-5 font-display text-xl tracking-tight text-foreground">
              {item.title}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              {item.desc}
            </p>
          </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function CoreFeatures() {
  const t = useT();
  return (
    <section className="max-w-6xl mx-auto px-6 pb-20" id="features">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-sunset mb-2">
            {t("home.features.eyebrow")}
          </p>
          <h2 className="font-display text-3xl md:text-4xl tracking-tight text-foreground">
            {t("home.features.title")}
          </h2>
        </div>
        <p className="hidden md:block text-sm text-muted-foreground max-w-xs">
          {t("home.features.subtitle")}
        </p>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        <Reveal delay={0}><div className="h-full rounded-3xl border border-border bg-card/60 p-7 shadow-card hover-lift">
          <div className="size-11 rounded-2xl bg-brand/15 grid place-items-center text-brand font-mono">
            <Workflow className="size-5" />
          </div>
          <h3 className="mt-5 font-display text-xl tracking-tight text-foreground">
            {t("home.features.card1.title")}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            {t("home.features.card1.desc")}
          </p>
          <div className="mt-5 rounded-2xl bg-ink text-cream p-4 font-mono text-xs leading-relaxed">
            <div className="text-cream/90">{t("home.features.card1.mock.default")}</div>
            <div className="pl-4 text-sky">├─ {t("home.features.card1.mock.asia")}</div>
            <div className="pl-8 text-cream/50">├─ 东京 Edge-03</div>
            <div className="pl-8 text-cream/50">└─ 新加坡 Edge-01</div>
            <div className="pl-4 text-sunset">└─ {t("home.features.card1.mock.streaming")}</div>
          </div>
        </div></Reveal>

        <Reveal delay={140}><div className="h-full rounded-3xl border border-border bg-card/60 p-7 shadow-card hover-lift">
          <div className="size-11 rounded-2xl bg-sunset/15 grid place-items-center text-sunset font-mono">
            <Network className="size-5" />
          </div>
          <h3 className="mt-5 font-display text-xl tracking-tight text-foreground">
            {t("home.features.card2.title")}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            {t("home.features.card2.desc")}
          </p>
          <div className="mt-5 rounded-2xl bg-ink text-cream p-4 font-mono text-xs leading-relaxed">
            <div className="text-cream/90">openai.com</div>
            <div className="pl-4 text-sky">{t("home.features.card2.mock.dns")}</div>
            <div className="pl-4 text-cream/60">{t("home.features.card2.mock.rule")}</div>
            <div className="pl-4 text-cream/60">{t("home.features.card2.mock.policy")}</div>
            <div className="pl-4 text-sunset">{t("home.features.card2.mock.exit")}</div>
            <div className="pl-4 text-brand">Reality/TCP ── 148ms</div>
          </div>
        </div></Reveal>

        <Reveal delay={280}><div className="h-full rounded-3xl border border-border bg-card/60 p-7 shadow-card hover-lift">
          <div className="size-11 rounded-2xl bg-sky/20 grid place-items-center text-sky font-mono">
            <Globe className="size-5" />
          </div>
          <h3 className="mt-5 font-display text-xl tracking-tight text-foreground">
            {t("home.features.card3.title")}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            {t("home.features.card3.desc")}
          </p>
          <div className="mt-5 rounded-2xl bg-ink text-cream p-4 font-mono text-xs leading-relaxed">
            <div className="text-cream/90">{t("home.features.card3.mock.provider")}</div>
            <div className="pl-4 text-sky">├─ Tokyo Edge</div>
            <div className="pl-4 text-sky">├─ HK Edge-BGP</div>
            <div className="pl-4 text-sky">└─ US Edge</div>
            <div className="pl-4 text-sunset">{t("home.features.card3.mock.group")}</div>
          </div>
        </div></Reveal>
      </div>
    </section>
  );
}

function DecisionTrace() {
  const t = useT();
  const steps = [
    { label: t("home.trace.step.dns"), value: "12 ms", active: true },
    { label: t("home.trace.step.rule"), value: t("home.trace.step.rule.value"), active: true },
    { label: t("home.trace.step.policy"), value: t("home.trace.step.policy.value"), active: true },
    { label: t("home.trace.step.subpolicy"), value: t("home.trace.step.subpolicy.value"), active: false },
    { label: t("home.trace.step.exit"), value: t("home.trace.step.exit.value"), active: false },
    { label: t("home.trace.step.protocol"), value: t("home.trace.step.protocol.value"), active: false },
  ];

  return (
    <section className="bg-muted/30 py-20" id="decision-trace">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="font-mono text-xs uppercase tracking-widest text-sunset mb-2">
            {t("home.trace.eyebrow")}
          </p>
          <h2 className="font-display text-3xl md:text-4xl tracking-tight text-foreground">
            {t("home.trace.title")}
          </h2>
          <p className="mt-4 text-muted-foreground">
            {t("home.trace.subtitle")}
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-card/60 p-8 shadow-card overflow-x-auto hover-lift">
          <div className="flex items-center min-w-[720px] gap-2">
            {steps.map((step, i) => (
              <div key={step.label} className="flex items-center">
                <div
                  className={`rounded-xl px-4 py-3 font-mono text-sm border ${
                    step.active
                      ? "bg-brand/10 border-brand/40 text-foreground"
                      : "bg-muted/50 border-border text-muted-foreground"
                  }`}
                >
                  <div className="text-[10px] uppercase tracking-wider opacity-70">
                    {step.label}
                  </div>
                  <div className="font-medium">{step.value}</div>
                </div>
                {i < steps.length - 1 && (
                  <ChevronRight className="size-4 text-border mx-1" />
                )}
              </div>
            ))}
          </div>
          <div className="mt-6 pt-6 border-t border-border flex items-center justify-between font-mono text-sm text-muted-foreground">
            <span>
              {t("home.trace.firstByte")} <span className="text-brand">148 ms</span>
            </span>
            <span>
              {t("home.trace.fullPath")} <span className="text-brand">{t("home.trace.highlighted")}</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function HealthAndHealing() {
  const t = useT();
  const metrics = [
    { label: t("home.health.metric.latency"), value: "42", unit: "ms", trend: t("home.health.metric.latency.trend"), color: "text-brand" },
    { label: t("home.health.metric.jitter"), value: "1.8", unit: "ms", trend: t("home.health.metric.jitter.trend"), color: "text-sky" },
    { label: t("home.health.metric.loss"), value: "0.1", unit: "%", trend: t("home.health.metric.loss.trend"), color: "text-sunset" },
    { label: t("home.health.metric.uptime"), value: "99.97", unit: "%", trend: t("home.health.metric.uptime.trend"), color: "text-brand" },
  ];

  return (
    <section className="max-w-6xl mx-auto px-6 py-20" id="health">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-sunset mb-2">
            {t("home.health.eyebrow")}
          </p>
          <h2 className="font-display text-3xl md:text-4xl tracking-tight text-foreground">
            {t("home.health.title")}
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            {t("home.health.desc")}
          </p>
          <ul className="mt-6 space-y-3">
            {[
              t("home.health.item1"),
              t("home.health.item2"),
              t("home.health.item3"),
            ].map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-foreground">
                <Check className="size-4 text-brand" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-3xl border border-border bg-card/60 p-6 shadow-card hover-lift">
          <div className="flex items-center justify-between mb-5">
            <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              {t("home.health.telemetry")}
            </span>
            <span className="font-mono text-xs text-brand flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-emerald-600 animate-pulse" />
              {t("home.health.autoRecoveryReady")}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {metrics.map((m) => (
              <div key={m.label} className="rounded-2xl border border-border bg-background p-4 hover-lift">
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  {m.label}
                </p>
                <p className="mt-2 font-mono text-2xl text-foreground">
                  {m.value}
                  <span className="text-sm text-muted-foreground">{m.unit}</span>
                </p>
                <p className={`mt-1 font-mono text-[10px] ${m.color}`}>{m.trend}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 flex items-end gap-1 h-16">
            {[40, 55, 38, 80, 50, 42, 60, 45, 52, 40, 58, 48].map((h, i) => (
              <div
                key={i}
                className="flex-1 bg-brand/40 rounded-sm"
                style={{ height: `${h}%`, opacity: 0.6 + (i % 3) * 0.15 }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function MeshNetwork() {
  const t = useT();
  return (
    <section className="bg-muted/30 py-20" id="mesh">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1 rounded-3xl border border-border bg-card/60 p-8 shadow-card">
            <div className="relative h-64">
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 grid place-items-center size-16 rounded-full border border-brand/50 bg-brand/10">
                <span className="font-mono text-xs text-brand font-semibold">GATE</span>
              </div>
              {[
                { label: "MacBook", pos: "left-[15%] top-[20%]", color: "bg-sky-500" },
                { label: "Home PC", pos: "right-[12%] top-[25%]", color: "bg-sunset" },
                { label: "VPS", pos: "left-[20%] bottom-[15%]", color: "bg-brand" },
                { label: "NAS", pos: "right-[18%] bottom-[18%]", color: "bg-sky-500" },
              ].map((node) => (
                <div
                  key={node.label}
                  className={`absolute ${node.pos} flex flex-col items-center gap-2`}
                >
                  <div
                    className={`size-3 rounded-full ${node.color} animate-pulse`}
                    style={{ boxShadow: `0 0 12px currentColor` }}
                  />
                  <span className="font-mono text-xs text-muted-foreground">{node.label}</span>
                </div>
              ))}
              <svg className="absolute inset-0 size-full" style={{ overflow: "visible" }}>
                <line x1="50%" y1="50%" x2="20%" y2="25%" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1" />
                <line x1="50%" y1="50%" x2="80%" y2="30%" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1" />
                <line x1="50%" y1="50%" x2="25%" y2="78%" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1" />
                <line x1="50%" y1="50%" x2="75%" y2="75%" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1" />
              </svg>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <p className="font-mono text-xs uppercase tracking-widest text-sunset mb-2">
              {t("home.mesh.eyebrow")}
            </p>
            <h2 className="font-display text-3xl md:text-4xl tracking-tight text-foreground">
              {t("home.mesh.title")}
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              {t("home.mesh.desc")}
            </p>
            <ul className="mt-6 space-y-3">
              {[
                t("home.mesh.item1"),
                t("home.mesh.item2"),
                t("home.mesh.item3"),
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-foreground">
                  <Check className="size-4 text-brand" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function ResourcePool() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20" id="pool">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <p className="font-mono text-xs uppercase tracking-widest text-sunset mb-2">
          05 · 共享网络资源池
        </p>
        <h2 className="font-display text-3xl md:text-4xl tracking-tight text-foreground">
          共享的不只是 VPS，而是网络能力
        </h2>
        <p className="mt-4 text-muted-foreground">
          Provider → Network Resource → Edge / Exit → Group → Member，构建可共享、可计费的网络资源模型。
        </p>
      </div>
      <div className="rounded-3xl border border-border bg-card/60 p-8 shadow-card hover-lift">
        <div className="grid md:grid-cols-5 gap-4 text-center">
          {[
            { label: "Provider", desc: "VPS / 宽带 / NAS / 云服务器" },
            { label: "Resource", desc: "网络资源抽象" },
            { label: "Edge", desc: "东京 / 香港 / 洛杉矶" },
            { label: "Group", desc: "共享组与策略" },
            { label: "Member", desc: "用户 A · B · C" },
          ].map((item, i) => (
            <div key={item.label} className="relative">
              <div className="rounded-2xl border border-border bg-background p-5 h-full hover-lift">
                <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-2">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <h3 className="font-display text-lg text-foreground">{item.label}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{item.desc}</p>
              </div>
              {i < 4 && (
                <ArrowRight className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 size-4 text-border" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function NetworkProfiles() {
  const profiles = [
    { name: "工作", desc: "公司网络优先 · Teams 稳定", active: true },
    { name: "娱乐", desc: "Streaming 自动 · Netflix 美国", active: false },
    { name: "旅行", desc: "自动最低延迟 · 公共 WiFi 隐私", active: false },
  ];

  return (
    <section className="bg-muted/30 py-20" id="profiles">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-sunset mb-2">
              06 · 网络场景 Profile
            </p>
            <h2 className="font-display text-3xl md:text-4xl tracking-tight text-foreground">
              一键切换整个网络策略
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              工作、娱乐、旅行……每个场景对应一套完整的策略、规则、DNS 与出口配置。未来更可根据连接的
              WiFi 自动切换。
            </p>
          </div>
          <div className="space-y-3">
            {profiles.map((p) => (
              <div
                key={p.name}
                className={`rounded-2xl border p-5 flex items-center justify-between transition ${
                  p.active
                    ? "border-brand/40 bg-brand/5"
                    : "border-border bg-card/60 hover:bg-card"
                }`}
              >
                <div>
                  <h3
                    className={`font-display text-lg ${
                      p.active ? "text-brand" : "text-foreground"
                    }`}
                  >
                    {p.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">{p.desc}</p>
                </div>
                {p.active && (
                  <span className="font-mono text-xs text-brand">已激活</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Diagnostics() {
  const items = [
    { label: "实时连接列表", desc: "每一条会话的协议、出口、流量一目了然" },
    { label: "DNS / WebRTC / IPv6 泄漏检测", desc: "内置隐私检测，无需第三方站点" },
    { label: "链路追踪", desc: "拆解 DNS → 规则 → 策略 → 出口的完整耗时" },
    { label: "解锁检测", desc: "批量检测节点对主流服务的可用性" },
  ];

  return (
    <section className="max-w-6xl mx-auto px-6 py-20" id="diagnostics">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <p className="font-mono text-xs uppercase tracking-widest text-sunset mb-2">
          07 · 全套诊断
        </p>
        <h2 className="font-display text-3xl md:text-4xl tracking-tight text-foreground">
          当网络出现问题，你不需要猜
        </h2>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-3xl border border-border bg-card/60 p-6 shadow-card flex gap-4 hover-lift"
          >
            <div className="size-10 rounded-xl bg-brand/15 grid place-items-center text-brand shrink-0">
              <Radio className="size-5" />
            </div>
            <div>
              <h3 className="font-display text-lg text-foreground">{item.label}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Migration() {
  return (
    <section className="bg-muted/30 py-20" id="migration">
      <div className="max-w-6xl mx-auto px-6">
        <div className="rounded-3xl bg-gradient-to-r from-ink to-neutral-900 text-cream px-8 py-10 shadow-sun flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="font-display text-3xl tracking-tight">不需要从零开始</h2>
            <p className="mt-2 text-cream/60 max-w-md text-sm leading-relaxed">
              导入你的 Clash / Mihomo 订阅，AirLane 生成迁移报告，自动转换策略与规则，微调即可启用。
            </p>
          </div>
          <Link
            to="/migration"
            className="shrink-0 rounded-full bg-gradient-brand text-cream font-semibold px-7 py-3.5 transition hover:brightness-105 inline-flex items-center gap-2"
          >
            查看迁移指南
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function ComparisonTable() {
  const rows = [
    { capability: "配置方式", traditional: "配置文件为核心", airlane: "可视化对象模型" },
    { capability: "策略组", traditional: "Proxy Group", airlane: "可嵌套策略树" },
    { capability: "决策路径", traditional: "日志查看", airlane: "可视化决策追踪" },
    { capability: "规则调试", traditional: "手工分析", airlane: "决策模拟与路径追踪" },
    { capability: "Mesh 组网", traditional: "独立工具部署", airlane: "产品级集成" },
    { capability: "VPS 资源管理", traditional: "第三方工具", airlane: "Web Control Plane" },
    { capability: "网络健康", traditional: "第三方工具", airlane: "内置评分 + 自愈" },
    { capability: "配置迁移", traditional: "YAML 拷贝", airlane: "Clash/Mihomo 导入与转换" },
  ];

  return (
    <section className="max-w-6xl mx-auto px-6 py-20" id="compare">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <p className="font-mono text-xs uppercase tracking-widest text-sunset mb-2">
          能力对照
        </p>
        <h2 className="font-display text-3xl md:text-4xl tracking-tight text-foreground">
          强大的代理能力，只是开始
        </h2>
        <p className="mt-4 text-muted-foreground">
          传统 Clash / Mihomo 生态成熟强大；AirLane 在其之上补齐策略编排、网络观测与共享资源管理。
        </p>
      </div>
      <div className="rounded-3xl border border-border bg-card/60 shadow-card overflow-hidden hover-lift">
        <div className="grid grid-cols-3 border-b border-border bg-muted/50">
          <div className="px-5 py-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">
            能力
          </div>
          <div className="px-5 py-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">
            传统 Clash / Mihomo 生态
          </div>
          <div className="px-5 py-3 font-mono text-xs uppercase tracking-widest text-brand">
            AirLane
          </div>
        </div>
        {rows.map((row) => (
          <div key={row.capability} className="grid grid-cols-3 border-b border-border last:border-b-0">
            <div className="px-5 py-3.5 text-sm text-muted-foreground">{row.capability}</div>
            <div className="px-5 py-3.5 text-sm text-foreground">{row.traditional}</div>
            <div className="px-5 py-3.5 text-sm font-medium text-brand">{row.airlane}</div>
          </div>
        ))}
      </div>
      <p className="mt-4 font-mono text-xs text-muted-foreground">
        * 传统生态性能强大、生态成熟；AirLane 在其上补齐可视化编排、一体化 Mesh 与共享资源能力。
      </p>
    </section>
  );
}

function Roadmap() {
  return (
    <section className="bg-muted/30 py-20" id="roadmap">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/5 px-4 py-2 font-mono text-xs text-brand mb-6">
          <Sparkles className="size-3.5" />
          持续迭代中
        </div>
        <h2 className="font-display text-3xl md:text-4xl tracking-tight text-foreground">
          项目正在高速迭代
        </h2>
        <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
          部分高级功能持续完善中。欢迎在博客跟进进展，参与共建 AirLane 的航线图。
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/blog"
            className="rounded-full border border-border bg-card px-6 py-2.5 font-semibold text-foreground hover:bg-muted transition inline-flex items-center gap-2"
          >
            <Newspaper className="size-4" />
            阅读博客
          </Link>
          <Link
            to="/download"
            className="rounded-full bg-gradient-brand text-cream px-6 py-2.5 font-semibold hover:brightness-105 transition inline-flex items-center gap-2"
          >
            <Download className="size-4" />
            下载客户端
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
          <div>
            <img src="/brand/lockup-on-light.svg" alt="AirLane" className="h-8 w-auto" />

            <p className="mt-3 text-sm text-muted-foreground max-w-sm">
              现代网络编排平台。从流量代理，到网络编排。
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div>
              <h4 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-3">
                产品
              </h4>
              <ul className="space-y-2 text-sm text-foreground">
                <li>
                  <Link to="/download" className="hover:text-brand transition">
                    下载
                  </Link>
                </li>
                <li>
                  <Link to="/docs" className="hover:text-brand transition">
                    文档
                  </Link>
                </li>
                <li>
                  <Link to="/migration" className="hover:text-brand transition">
                    从 Clash 迁移
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-3">
                社区
              </h4>
              <ul className="space-y-2 text-sm text-foreground">
                <li>
                  <Link to="/blog" className="hover:text-brand transition">
                    博客
                  </Link>
                </li>
                <li>
                  <a
                    href="https://x.com/airlane"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-brand transition"
                  >
                    X (Twitter)
                  </a>
                </li>
                <li>
                  <a
                    href="https://airlane.cloud"
                    className="hover:text-brand transition"
                  >
                    airlane.cloud
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-3">
                状态
              </h4>
              <ul className="space-y-2 text-sm text-foreground">
                <li className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-brand animate-pulse" />
                  开发迭代中
                </li>
                <li>
                  <a href="#roadmap" className="hover:text-brand transition">
                    Roadmap
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <span>© 2025 AirLane · airlane.cloud</span>
          <span className="font-mono text-xs">让每一条流量，找到最优航线</span>
        </div>
      </div>
    </footer>
  );
}
