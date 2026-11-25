import { createFileRoute, Link, notFound, useMatches, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { useI18n } from "@/i18n";
import { docLang, docsQueries, fetchPage, pick, type DocPage } from "@/lib/docs";
import { canonical, breadcrumbSchema, jsonLd, organizationSchema } from "@/lib/seo";
import { useLocalePrefix } from "@/lib/locale-link";

export type DocSlugLoaderData = { page: DocPage | null };

async function loadDocPage(slug: string): Promise<DocSlugLoaderData> {
  const page = await fetchPage(slug);
  if (!page) throw notFound();
  return { page };
}

/** Search-intent <title> overrides per doc slug — docs rank for questions, not product nouns. */
const SEO_TITLES: Record<string, { zh: string; en: string }> = {
  welcome: { zh: "欢迎使用 AirLane：新一代代理客户端导览", en: "Welcome to AirLane: A Modern Proxy Client Tour" },
  install: { zh: "下载与安装 AirLane：Windows / macOS / Android / iOS", en: "Download & Install AirLane on Windows, macOS, Android, iOS" },
  "import-subscription": { zh: "从 Clash 迁移到 AirLane：订阅一键导入，自动转换策略组", en: "Migrate from Clash to AirLane: One-Click Subscription Import" },
  "quick-start": { zh: "AirLane 快速上手：5 分钟完成安装、导入订阅、验证连通", en: "AirLane Quick Start: Install, Import a Subscription, Verify" },
  "ui-overview": { zh: "AirLane 客户端界面导览：仪表盘、模块导航与托盘", en: "AirLane Main Window Overview: Dashboard, Modules, Tray" },
  nodes: { zh: "AirLane 节点与订阅管理：自动去重、地区分组、Clash 迁移", en: "AirLane Nodes & Subscriptions: Dedup, Region Groups, Clash Migration" },
  "policy-tree": { zh: "按应用和域名分流：AirLane 策略树配置教程", en: "Route Apps and Domains: AirLane Policy Tree Tutorial" },
  rules: { zh: "代理分流规则配置：GEOSITE / GEOIP 规则集与匹配模拟", en: "Proxy Routing Rules: GEOSITE/GEOIP Rulesets & Match Simulation" },
  "decision-trace": { zh: "决策追踪：回放每条连接为什么走这条代理线路", en: "Decision Tracing: Why Every Connection Took Its Lane" },
  health: { zh: "节点健康监测与自动切换：AirLane 健康与自愈", en: "Node Health & Automatic Failover in AirLane" },
  connections: { zh: "代理连接与日志：实时连接、流量排行、内核日志", en: "Connections & Logs: Live Table, Traffic Ranking, Core Logs" },
  settings: { zh: "AirLane 设置详解：TUN、DNS、内核与分流方案", en: "AirLane Settings Explained: TUN, DNS, Core, Profiles" },
  "scenario-ai": { zh: "让 ChatGPT 等 AI 服务走指定线路：AirLane 分流教程", en: "Route ChatGPT & AI Services via Specific Lanes in AirLane" },
  "scenario-streaming": { zh: "流媒体解锁与游戏分流：Netflix 走专线、游戏走低延迟", en: "Streaming Unblock & Game Split-Routing in AirLane" },
  "scenario-tun": { zh: "TUN 模式 vs 系统代理：区别、怎么选、常见问题", en: "TUN Mode vs System Proxy: Differences, When to Use Each" },
  "scenario-dns": { zh: "FakeIP 是什么？代理客户端的 DNS 设置与泄漏检测", en: "What Is Fake-IP? Proxy Client DNS Settings & Leak Tests" },
  "mesh-intro": { zh: "Mesh 组网是什么：把多台设备组成私有网络", en: "What Is Mesh? Turn Your Devices into a Private Network" },
  poolvip: { zh: "AirLane 共享资源池 PoolVIP：没有订阅也能用的出口", en: "AirLane PoolVIP: Shared Exit Pool Without a Subscription" },
  "poolvip-import": { zh: "导入 PoolVIP 线路：平台资源池接入教程", en: "Import PoolVIP Lines into Exit Groups" },
  "account-center": { zh: "AirLane 账号中心：匿名身份、配对码、套餐配额", en: "AirLane Account Center: Anonymous IDs, Pairing Codes, Quotas" },
  "trouble-connect": { zh: "代理连不上 / 没网？按诊断结果逐项排查", en: "Proxy Won't Connect / No Internet? A Diagnostics Checklist" },
  "trouble-site": { zh: "代理已连接但某个网站打不开？排查方法与解决步骤", en: "Connected but a Site Won't Open? Debug Steps for Proxies" },
  "trouble-slow": { zh: "代理速度慢怎么办？测速、出口池与协议选择", en: "Proxy Too Slow? Speed Tests, Exit Pools & Protocol Choice" },
  "trouble-platform": { zh: "AirLane 平台常见问题：Windows、macOS、Android、iOS", en: "AirLane Platform FAQ: Windows, macOS, Android, iOS" },
  "ref-protocols": { zh: "AirLane 支持的代理协议：VLESS、Hysteria2、TUIC、Trojan、WireGuard", en: "AirLane Supported Protocols: VLESS, Hysteria2, TUIC, Trojan, WireGuard" },
  "ref-syntax": { zh: "AirLane 分流规则语法：domain、geosite、geoip、process_name", en: "AirLane Rule Syntax: domain, geosite, geoip, process_name" },
  changelog: { zh: "AirLane 更新日志：各版本新功能与修复", en: "AirLane Changelog: Features & Fixes per Release" },
};

export function docSeoTitle(slug: string, fallback: string, lang: "zh" | "en"): string {
  return SEO_TITLES[slug]?.[lang] ?? fallback;
}

export function techArticleSchema(page: DocPage, lang: "zh" | "en", url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: pick(page, "title", lang),
    description: pick(page, "summary", lang) || undefined,
    inLanguage: lang === "zh" ? "zh-CN" : "en",
    url,
    dateModified: page.updated_at || undefined,
    author: { "@type": "Organization", name: "AirLane", url: canonical("/") },
    publisher: { "@type": "Organization", name: "AirLane", url: canonical("/") },
  };
}

/** Builds FAQPage JSON-LD from <details><summary>Q</summary>answer</details> blocks in the body. */
export function faqSchemaFrom(markdown: string) {
  const strip = (s: string) =>
    s
      .replace(/<[^>]+>/g, " ")
      .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
      .replace(/[*_`#]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  const re = /<details[^>]*>\s*<summary[^>]*>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/g;
  const faqs: { q: string; a: string }[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(markdown))) {
    const q = strip(m[1]);
    const a = strip(m[2]);
    if (q && a) faqs.push({ q, a });
  }
  if (!faqs.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export const Route = createFileRoute("/docs/$slug")({
  loader: ({ params }) => loadDocPage(params.slug),
  head: ({ params, loaderData }) => {
    const page = (loaderData as DocSlugLoaderData | undefined)?.page;
    const title = page ? docSeoTitle(params.slug, page.title_zh, "zh") : params.slug;
    const desc = page?.summary_zh || "AirLane 帮助中心文档";
    const pageUrl = canonical(`/docs/${params.slug}`);
    return {
      meta: [
        { title: `${title} | AirLane 文档` },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { property: "og:url", content: pageUrl },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [
        { rel: "canonical", href: pageUrl },
        { rel: "alternate", hrefLang: "zh-CN", href: canonical(`/docs/${params.slug}`) },
        { rel: "alternate", hrefLang: "en", href: canonical(`/en/docs/${params.slug}`) },
        { rel: "alternate", hrefLang: "x-default", href: canonical(`/docs/${params.slug}`) },
      ],
      scripts: page
        ? [
            {
              type: "application/ld+json",
              children: jsonLd([
                organizationSchema("zh-CN"),
                breadcrumbSchema([
                  { name: "首页", url: canonical("/") },
                  { name: "文档", url: canonical("/docs") },
                  { name: page.title_zh, url: pageUrl },
                ]),
                techArticleSchema(page, "zh", pageUrl),
                ...(faqSchemaFrom(page.body_zh) ? [faqSchemaFrom(page.body_zh)!] : []),
              ]),
            },
          ]
        : [],
    };
  },
  component: DocPageView,
});

type TocItem = { id: string; text: string; depth: number };

function slugifyHeading(text: string, used: Map<string, number>): string {
  const base = text
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-");
  const n = used.get(base) ?? 0;
  used.set(base, n + 1);
  return n === 0 ? base : `${base}-${n}`;
}

function extractToc(markdown: string): TocItem[] {
  const used = new Map<string, number>();
  const items: TocItem[] = [];
  let inFence = false;
  for (const line of markdown.split("\n")) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const m = /^(#{2,3})\s+(.+)$/.exec(line);
    if (!m) continue;
    const text = m[2].replace(/[*_`#]/g, "").trim();
    items.push({ id: slugifyHeading(text, used), text, depth: m[1].length });
  }
  return items;
}

function readingMinutes(markdown: string, lang: "zh" | "en"): number {
  if (lang === "zh") {
    return Math.max(1, Math.round(markdown.replace(/\s/g, "").length / 450));
  }
  return Math.max(1, Math.round(markdown.split(/\s+/).length / 200));
}

function headingText(children: unknown): string {
  if (children == null) return "";
  if (typeof children === "string" || typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map(headingText).join("");
  const el = children as { props?: { children?: unknown } };
  return headingText(el.props?.children);
}

export function DocPageView() {
  const { slug } = useParams({ strict: false }) as { slug: string };
  const { locale, t } = useI18n();
  const lang = docLang(locale);
  const lp = useLocalePrefix();
  const matches = useMatches();
  const loaderPage =
    (matches[matches.length - 1]?.loaderData as DocSlugLoaderData | undefined)?.page ?? null;

  const pages = useQuery(docsQueries.pages());
  const sections = useQuery(docsQueries.sections());

  const [zoomSrc, setZoomSrc] = useState<string | null>(null);
  const [activeHeading, setActiveHeading] = useState<string>("");
  const [feedback, setFeedback] = useState<"" | "up" | "down">("");

  const ordered = useMemo(() => {
    const secOrder = new Map((sections.data ?? []).map((s, i) => [s.id, i]));
    return [...(pages.data ?? [])].sort((a, b) => {
      const sa = secOrder.get(a.section_id ?? "") ?? 999;
      const sb = secOrder.get(b.section_id ?? "") ?? 999;
      return sa - sb || a.position - b.position;
    });
  }, [pages.data, sections.data]);

  const index = ordered.findIndex((p) => p.slug === slug);
  const page = loaderPage ?? (index >= 0 ? ordered[index] : null);
  const prev = index > 0 ? ordered[index - 1] : null;
  const next = index >= 0 && index < ordered.length - 1 ? ordered[index + 1] : null;

  const section = useMemo(
    () => (sections.data ?? []).find((s) => s.id === page?.section_id) ?? null,
    [sections.data, page?.section_id],
  );

  const body = page ? pick(page, "body", lang) : "";
  const toc = useMemo(() => extractToc(body), [body]);
  const tocIds = useMemo(() => toc.map((i) => i.id), [toc]);

  useEffect(() => {
    if (tocIds.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActiveHeading(e.target.id);
        }
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: 0 },
    );
    for (const id of tocIds) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [tocIds]);

  const headingIds = useMemo(() => new Map(toc.map((i) => [i.text, i.id])), [toc]);

  const mdComponents = useMemo(
    () => ({
      h2: ({ children }: { children?: ReactNode }) => {
        const text = headingText(children);
        const id = headingIds.get(text) ?? slugifyHeading(text, new Map());
        return (
          <h2 id={id}>
            {children}
            <a className="an" href={`#${id}`} aria-label="anchor">
              #
            </a>
          </h2>
        );
      },
      h3: ({ children }: { children?: ReactNode }) => {
        const text = headingText(children);
        const id = headingIds.get(text) ?? slugifyHeading(text, new Map());
        return <h3 id={id}>{children}</h3>;
      },
      p: ({ node, children }: { node?: unknown; children?: ReactNode }) => {
        const n = node as
          | { children?: Array<{ tagName?: string; properties?: { src?: string; alt?: string } }> }
          | undefined;
        const only = n?.children?.length === 1 ? n.children[0] : null;
        if (only?.tagName === "img" && only.properties?.src) {
          const alt = only.properties.alt ?? "";
          return (
            <figure className="shot">
              <div className="frame" data-zoom={only.properties.src}>
                <div className="chrome">
                  <i />
                  <i />
                  <i />
                  <span className="t">AirLane</span>
                </div>
                <img src={only.properties.src} alt={alt} loading="lazy" />
              </div>
              <figcaption className="cap">
                <span>
                  <b>{lang === "zh" ? "图" : "Fig."}</b> · {alt}
                </span>
                <span>⤢ {lang === "zh" ? "点击放大" : "Click to zoom"}</span>
              </figcaption>
            </figure>
          );
        }
        return <p>{children}</p>;
      },
    }),
    [headingIds, lang],
  );

  useEffect(() => {
    if (!zoomSrc) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoomSrc(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoomSrc]);

  if (pages.isLoading && !loaderPage) {
    return <p className="text-muted-foreground">{t("common.loading")}</p>;
  }

  if (!page) {
    return (
      <div className="doc">
        <h1>{lang === "zh" ? "找不到这篇文档" : "Document not found"}</h1>
        <Link to={`${lp}/docs`} className="mt-4 inline-block text-brand hover:underline">
          {lang === "zh" ? "返回帮助中心" : "Back to docs"}
        </Link>
      </div>
    );
  }

  const updated = new Date(page.updated_at).toLocaleDateString(
    lang === "zh" ? "zh-CN" : "en-US",
    { year: "numeric", month: "2-digit", day: "2-digit" },
  );

  return (
    <div className="grid xl:grid-cols-[minmax(0,1fr)_210px] gap-10">
      <article
        className="doc min-w-0"
        onClick={(e) => {
          const el = (e.target as HTMLElement).closest(".frame");
          const img = el?.querySelector("img");
          if (img) setZoomSrc(img.src);
        }}
        onMouseOver={(e) => {
          const el = (e.target as HTMLElement).closest<HTMLElement>(".hs[data-i], .legend li[data-i]");
          const i = el?.dataset.i;
          if (i === undefined) return;
          e.currentTarget
            .querySelectorAll(".hs, .legend li")
            .forEach((x) => x.classList.toggle("hi", (x as HTMLElement).dataset.i === i));
        }}
        onMouseOut={(e) => {
          const el = (e.target as HTMLElement).closest<HTMLElement>(".hs[data-i], .legend li[data-i]");
          if (!el) return;
          e.currentTarget.querySelectorAll(".hs.hi, .legend li.hi").forEach((x) => x.classList.remove("hi"));
        }}
      >
        <nav className="crumb" aria-label="breadcrumb">
          <Link to={`${lp}/docs`}>{lang === "zh" ? "文档" : "Docs"}</Link>
          {section ? (
            <>
              {" / "}
              <span>{pick(section, "title", lang)}</span>
            </>
          ) : null}
          {" / "}
          <span>{pick(page, "title", lang)}</span>
        </nav>

        <h1>{pick(page, "title", lang)}</h1>

        <div className="meta">
          <span className="pill v">{lang === "zh" ? "适用 v1.0+" : "v1.0+"}</span>
          <span className="pill">
            ⏱ {lang === "zh" ? `阅读 ${readingMinutes(body, lang)} 分钟` : `${readingMinutes(body, lang)} min read`}
          </span>
          <span className="pill">
            {lang === "zh" ? "更新于 " : "Updated "}
            <time dateTime={page.updated_at}>{updated}</time>
          </span>
        </div>

        {pick(page, "summary", lang) ? (
          <p className="lead">{pick(page, "summary", lang)}</p>
        ) : null}

        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={mdComponents}
        >
          {body}
        </ReactMarkdown>

        <div className="doc-fb">
          <span className="q">{lang === "zh" ? "这篇文档有帮助吗？" : "Was this doc helpful?"}</span>
          <div className="b">
            <button
              className={feedback === "up" ? "on" : ""}
              onClick={(e) => {
                e.stopPropagation();
                setFeedback("up");
              }}
            >
              👍 {lang === "zh" ? "有帮助" : "Yes"}
            </button>
            <button
              className={feedback === "down" ? "on" : ""}
              onClick={(e) => {
                e.stopPropagation();
                setFeedback("down");
              }}
            >
              👎 {lang === "zh" ? "没解决" : "No"}
            </button>
          </div>
          <small>
            {lang === "zh" ? "没解决？" : "Still stuck? "}
            <a
              href="https://github.com/mirrortek-uk/airlane-web/issues"
              target="_blank"
              rel="noreferrer"
            >
              {lang === "zh" ? "在 GitHub 提问" : "Ask on GitHub"}
            </a>
          </small>
        </div>

        <div className="doc-pn">
          {prev ? (
            <Link to={`${lp}/docs/$slug`} params={{ slug: prev.slug }}>
              <small>
                <ChevronLeft className="size-3.5" />
                {lang === "zh" ? "上一篇" : "Previous"}
              </small>
              <b>{pick(prev, "title", lang)}</b>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link className="n" to={`${lp}/docs/$slug`} params={{ slug: next.slug }}>
              <small>
                {lang === "zh" ? "下一篇" : "Next"}
                <ChevronRight className="size-3.5" />
              </small>
              <b>{pick(next, "title", lang)}</b>
            </Link>
          ) : null}
        </div>
      </article>

      {toc.length > 0 ? (
        <nav className="doc-toc" aria-label="table of contents">
          <h6>{lang === "zh" ? "本页目录" : "On this page"}</h6>
          {toc.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`${item.depth === 3 ? "d3" : ""} ${activeHeading === item.id ? "on" : ""}`}
            >
              {item.text}
            </a>
          ))}
          <div className="ex">
            <a
              href="https://github.com/mirrortek-uk/airlane-web/issues"
              target="_blank"
              rel="noreferrer"
            >
              ⚑ {lang === "zh" ? "反馈问题" : "Report issue"}
            </a>
          </div>
        </nav>
      ) : null}

      {zoomSrc ? (
        <div className="doc-lb" onClick={() => setZoomSrc(null)} role="dialog" aria-modal="true">
          <img src={zoomSrc} alt="" />
        </div>
      ) : null}
    </div>
  );
}
