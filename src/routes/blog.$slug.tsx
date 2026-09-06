import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChevronLeft } from "lucide-react";

import { useI18n } from "@/i18n";
import { blogQueries } from "@/lib/blog";
import { docLang, pick } from "@/lib/docs";
import { canonical, blogPostSchema, breadcrumbSchema, jsonLd, organizationSchema } from "@/lib/seo";
import { useLocalePrefix } from "@/lib/locale-link";

// Static metadata for known blog posts (used by SSR head before client data loads)
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
};

export const Route = createFileRoute("/blog/$slug")({
  head: ({ params }) => {
    const meta = POST_META[params.slug];
    const title = meta ? meta.title_zh : `${params.slug} | AirLane 博客`;
    const desc = meta ? meta.summary_zh : "AirLane 博客文章";
    return {
      meta: [
        { title: `${title} | AirLane 博客` },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { property: "og:url", content: canonical(`/blog/${params.slug}`) },
        { property: "og:site_name", content: "AirLane" },
        { property: "og:locale", content: "zh_CN" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: desc },
      ],
      links: [
        { rel: "canonical", href: canonical(`/blog/${params.slug}`) },
        { rel: "alternate", hrefLang: "zh-CN", href: canonical(`/blog/${params.slug}`) },
        { rel: "alternate", hrefLang: "en", href: canonical(`/en/blog/${params.slug}`) },
        { rel: "alternate", hrefLang: "x-default", href: canonical(`/blog/${params.slug}`) },
      ],
    };
  },
  component: BlogPostView,
});

export function BlogPostView() {
  const { slug } = useParams({ strict: false }) as { slug: string };
  const { locale, t } = useI18n();
  const lang = docLang(locale);
  const posts = useQuery(blogQueries.posts());
  const post = (posts.data ?? []).find((p) => p.slug === slug);
  const lp = useLocalePrefix();

  if (posts.isLoading) return <p className="text-muted-foreground">{t("common.loading")}</p>;

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

  const postUrl = canonical(`/blog/${slug}`);

  return (
    <article className="max-w-3xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd([
            organizationSchema(),
            blogPostSchema({
              slug,
              title: pick(post, "title", lang),
              description: pick(post, "summary", lang),
              datePublished: post.published_at,
              tags: post.tags,
            }),
            breadcrumbSchema([
              { name: "首页", url: canonical("/") },
              { name: "博客", url: canonical("/blog") },
              { name: pick(post, "title", lang), url: postUrl },
            ]),
          ]),
        }}
      />
      <Link
        to={`${lp}/blog`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition"
      >
        <ChevronLeft className="size-3.5" />
        {lang === "zh" ? "返回博客" : "Back to blog"}
      </Link>

      <div className="mt-6 flex flex-wrap items-center gap-3 text-xs font-mono text-muted-foreground">
        <span>{new Date(post.published_at).toLocaleDateString()}</span>
        {(post.tags ?? []).map((tag) => (
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
