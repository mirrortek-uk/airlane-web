import { createFileRoute, Link, useMatches, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChevronLeft } from "lucide-react";

import { useI18n } from "@/i18n";
import { blogQueries, fetchPostBySlug, type BlogPost } from "@/lib/blog";
import { displayTags } from "@/lib/blog-taxonomy";
import { docLang, pick } from "@/lib/docs";
import { canonical, blogPostSchema, breadcrumbSchema, jsonLd, organizationSchema } from "@/lib/seo";
import { useLocalePrefix } from "@/lib/locale-link";

// Static metadata for known blog posts (fallback when the loader has no data)
export const POST_META: Record<string, { title_zh: string; title_en: string; summary_zh: string; summary_en: string }> = {
  "hello-airlane": {
    title_zh: "AirLane 1.0：从流量代理到网络编排",
    title_en: "AirLane 1.0: From Traffic Proxy to Network Orchestration",
    summary_zh: "为什么我们要从零重建一个客户端：策略树、决策追踪、Mesh 组网与共享资源池。AirLane 1.0 从流量代理走向网络编排。",
    summary_en: "Why we rebuilt a client from scratch: policy trees, decision traces, exit pools, mesh networking, and a shared resource pool. AirLane 1.0 moves from traffic proxying to network orchestration.",
  },
  "singbox-vs-clash-mihomo": {
    title_zh: "Sing-Box vs Clash Mihomo：别再只比速度，现代网络编排的真正内核选型逻辑",
    title_en: "Sing-Box vs Clash Mihomo: Stop Comparing Speed — The Real Core Selection Logic for Modern Network Orchestration",
    summary_zh: "在网络代理与流量调度工具的圈子里，到底选 sing-box 还是 Mihomo？本文结合 AirLane 产品研发实践，完整拆解两大内核的核心差异，讲清为什么顶级网络编排产品都坚定选择 sing-box 作为底层数据面。",
    summary_en: "sing-box or Mihomo? This article dissects the core differences between the two engines based on AirLane's R&D experience, explaining why top-tier network orchestration products firmly choose sing-box as the underlying data plane.",
  },
  "airlane-vs-clash-smarter-proxy-client": {
    title_zh: "AirLane vs Clash：面向现代网络路由的下一代智能代理客户端",
    title_en: "AirLane vs Clash: A Smarter Rule-Based Proxy Client for Modern Network Routing",
    summary_zh: "如果你正在寻找一款支持 rule-based routing、split tunneling、subscription URL、multi-protocol proxy、TUN mode 和 application-based routing 的代理客户端，却厌倦了手动维护规则和节点——这篇文章讲清楚现有工具解决了什么，以及下一代工具应该长什么样。",
    summary_en: "If you are looking for a proxy client that supports rule-based routing, split tunneling, subscription URLs, multi-protocol proxy, TUN mode, and application-based routing — but are tired of manually maintaining rules and nodes — this article explains what existing tools solved and what the next generation should look like.",
  },
  "what-is-quic": {
    title_zh: "什么是 QUIC？为什么 AirLane 选择基于 QUIC 的代理协议",
    title_en: "What is QUIC? Why AirLane Chooses QUIC-Based Proxy Protocols",
    summary_zh: "QUIC 是什么？为什么 AirLane 选择基于 QUIC 的代理协议？本文全面讲解 QUIC 的工作原理、核心优势（1-RTT 握手、无队头阻塞、连接迁移、内置加密），以及 Hysteria2 和 TUIC v5 在 AirLane 中的实际应用。",
    summary_en: "What is QUIC? Why does AirLane choose QUIC-based proxy protocols? This article covers QUIC's working principles, core advantages (1-RTT handshake, no head-of-line blocking, connection migration, built-in encryption), and practical use of Hysteria2 and TUIC v5 in AirLane.",
  },
  "dns-anycast-explained": {
    title_zh: "DNS 解析中的 Anycast 技术：原理与优势",
    title_en: "Anycast in DNS Resolution: Principles and Advantages",
    summary_zh: "Anycast 技术将一个 IP 地址分配给多个地理位置不同的服务器，通过 BGP 路由协议自动选择最近节点响应 DNS 查询。本文讲解 Anycast 的原理、四大优势（低延迟、负载均衡、抗 DDoS、高可用），以及它与 AirLane 出口池设计的相通理念。",
    summary_en: "Anycast assigns one IP address to multiple servers in different locations, using BGP routing to automatically select the nearest node for DNS queries. This article explains Anycast principles, four key advantages, and its shared philosophy with AirLane's Exit Pool design.",
  },
};

export type BlogSlugLoaderData = { post: BlogPost | null };

async function loadPost(slug: string): Promise<BlogSlugLoaderData> {
  try {
    return { post: await fetchPostBySlug(slug) };
  } catch {
    return { post: null };
  }
}

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => loadPost(params.slug),
  head: ({ params, loaderData }) => {
    const post = (loaderData as BlogSlugLoaderData | undefined)?.post;
    const meta = POST_META[params.slug];
    const title = post?.title_zh || meta?.title_zh || params.slug;
    const desc = post?.summary_zh || meta?.summary_zh || "AirLane 博客文章";
    const postUrl = canonical(`/blog/${params.slug}`);
    return {
      meta: [
        { title: `${title} | AirLane 博客` },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { property: "og:url", content: postUrl },
        { property: "og:site_name", content: "AirLane" },
        { property: "og:locale", content: "zh_CN" },
        ...(post
          ? [
              { property: "article:published_time", content: post.published_at },
              ...(post.cover_url
                ? [{ property: "og:image", content: canonical(post.cover_url) }]
                : []),
            ]
          : []),
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: desc },
      ],
      links: [
        { rel: "canonical", href: postUrl },
        { rel: "alternate", hrefLang: "zh-CN", href: canonical(`/blog/${params.slug}`) },
        { rel: "alternate", hrefLang: "en", href: canonical(`/en/blog/${params.slug}`) },
        { rel: "alternate", hrefLang: "x-default", href: canonical(`/blog/${params.slug}`) },
      ],
      scripts: post
        ? [
            {
              type: "application/ld+json",
              children: jsonLd([
                organizationSchema("zh-CN"),
                blogPostSchema({
                  slug: params.slug,
                  title: post.title_zh,
                  description: post.summary_zh,
                  datePublished: post.published_at,
                  tags: post.tags,
                  locale: "zh-CN",
                }),
                breadcrumbSchema([
                  { name: "首页", url: canonical("/") },
                  { name: "博客", url: canonical("/blog") },
                  { name: post.title_zh, url: postUrl },
                ]),
              ]),
            },
          ]
        : [],
    };
  },
  component: BlogPostView,
});

export function BlogPostView() {
  const { slug } = useParams({ strict: false }) as { slug: string };
  const { locale, t } = useI18n();
  const lang = docLang(locale);
  const matches = useMatches();
  const loaderPost =
    (matches[matches.length - 1]?.loaderData as BlogSlugLoaderData | undefined)?.post ?? null;
  const posts = useQuery(blogQueries.posts());
  const post = loaderPost ?? (posts.data ?? []).find((p) => p.slug === slug) ?? null;
  const lp = useLocalePrefix();

  if (posts.isLoading && !loaderPost) {
    return <p className="text-muted-foreground">{t("common.loading")}</p>;
  }

  if (!post) {
    return (
      <div>
        <h1 className="font-display text-3xl">
          {lang === "zh" ? "找不到这篇文章" : "Post not found"}
        </h1>
        <Link to={`${lp}/blog`} className="mt-4 inline-block text-brand hover:underline">
          {lang === "zh" ? "返回博客" : "Back to blog"}
        </Link>
      </div>
    );
  }

  return (
    <article className="max-w-3xl">
      <Link
        to={`${lp}/blog`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition"
      >
        <ChevronLeft className="size-3.5" />
        {lang === "zh" ? "返回博客" : "Back to blog"}
      </Link>

      <div className="mt-6 flex flex-wrap items-center gap-3 text-xs font-mono text-muted-foreground">
        <time dateTime={post.published_at}>
          {new Date(post.published_at).toLocaleDateString()}
        </time>
        {displayTags(post).map((tag) => (
          <span key={tag} className="rounded-full bg-brand/10 text-brand px-2.5 py-0.5">
            {tag}
          </span>
        ))}
      </div>

      <h1 className="mt-3 font-display text-4xl tracking-tight leading-tight">
        {pick(post, "title", lang)}
      </h1>
      <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
        {pick(post, "summary", lang)}
      </p>

      {post.cover_url ? (
        <img
          src={post.cover_url}
          alt={pick(post, "title", lang)}
          className="mt-8 w-full rounded-2xl border border-ink/10"
          loading="lazy"
        />
      ) : null}

      <div className="markdown-body mt-8">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{pick(post, "body", lang)}</ReactMarkdown>
      </div>
    </article>
  );
}
