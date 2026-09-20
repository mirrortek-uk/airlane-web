import { createFileRoute, Link, useMatches, useSearch } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, X } from "lucide-react";

import { useI18n } from "@/i18n";
import { blogQueries, fetchPosts } from "@/lib/blog";
import {
  BLOG_SECTIONS,
  BLOG_TOPICS,
  displayTags,
  filterPosts,
  taxonLabel,
} from "@/lib/blog-taxonomy";
import { docLang, pick } from "@/lib/docs";
import { canonical, breadcrumbSchema, jsonLd, organizationSchema } from "@/lib/seo";
import { useLocalePrefix } from "@/lib/locale-link";

export const Route = createFileRoute("/blog/")({
  loader: async () => {
    try {
      const posts = await fetchPosts();
      return { initialPosts: posts };
    } catch {
      return { initialPosts: [] };
    }
  },
  head: () => ({
    meta: [
      { title: "AirLane 博客 — 产品更新与网络编排实践" },
      {
        name: "description",
        content:
          "AirLane 官方博客：产品发布说明、协议与出口实践、策略编排与 Mesh 组网的使用心得。",
      },
      { property: "og:title", content: "AirLane 博客 — 产品更新与网络编排实践" },
      {
        property: "og:description",
        content: "产品发布说明、协议实践、策略编排与 Mesh 组网心得。",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: canonical("/blog") },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "AirLane 博客 — 产品更新与网络编排实践" },
    ],
    links: [
      { rel: "canonical", href: canonical("/blog") },
      { rel: "alternate", hrefLang: "zh-CN", href: canonical("/blog") },
      { rel: "alternate", hrefLang: "en", href: canonical("/en/blog") },
      { rel: "alternate", hrefLang: "x-default", href: canonical("/blog") },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: jsonLd([
          organizationSchema(),
          breadcrumbSchema([
            { name: "首页", url: canonical("/") },
            { name: "博客", url: canonical("/blog") },
          ]),
        ]),
      },
    ],
  }),
  component: BlogIndex,
});

export function BlogIndex() {
  const { locale, t } = useI18n();
  const lang = docLang(locale);
  const matches = useMatches();
  const routeData = matches.length > 0 ? (matches[matches.length - 1].loaderData as { initialPosts?: Awaited<ReturnType<typeof fetchPosts>> } | undefined) : undefined;
  const posts = useQuery({
    ...blogQueries.posts(),
    initialData: routeData?.initialPosts,
  });
  const lp = useLocalePrefix();
  const search = useSearch({ strict: false }) as {
    topic?: string;
    section?: string;
    tag?: string;
  };
  const filtered = filterPosts(posts.data ?? [], search);
  const activeTaxon =
    [...BLOG_TOPICS, ...BLOG_SECTIONS].find(
      (x) => x.slug === search.topic || x.slug === search.section,
    ) ?? null;
  const activeLabel = search.tag ?? (activeTaxon ? taxonLabel(activeTaxon, lang) : null);

  return (
    <div>
      <h1 className="font-display text-4xl tracking-tight">
        {lang === "zh" ? "博客" : "Blog"}
      </h1>
      <p className="mt-3 text-muted-foreground max-w-2xl leading-relaxed">
        {lang === "zh"
          ? "产品更新、协议实践，以及我们对网络编排的思考。"
          : "Product updates, protocol notes, and how we think about network orchestration."}
      </p>

      {activeLabel && (
        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-4 py-1.5 text-sm text-brand">
          <span>
            {lang === "zh" ? "正在浏览" : "Browsing"}：{activeLabel}
          </span>
          <Link
            to={`${lp}/blog`}
            aria-label={lang === "zh" ? "清除筛选" : "Clear filter"}
            className="rounded-full p-0.5 hover:bg-brand/20"
          >
            <X className="size-3.5" />
          </Link>
        </div>
      )}

      {posts.isLoading ? (
        <p className="mt-10 text-muted-foreground">{t("common.loading")}</p>
      ) : null}

      <div className="mt-10 space-y-5">
        {filtered.map((post) => (
          <Link
            key={post.id}
            to={`${lp}/blog/$slug`}
            params={{ slug: post.slug }}
            className="group block rounded-2xl border border-ink/10 bg-white/60 p-6 hover:bg-white hover:-translate-y-0.5 transition"
          >
            <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-muted-foreground">
              <span>{new Date(post.published_at).toLocaleDateString()}</span>
              {displayTags(post).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-brand/10 text-brand px-2.5 py-0.5 not-italic"
                >
                  {tag}
                </span>
              ))}
              {post.published ? null : (
                <span className="text-sunset">{lang === "zh" ? "草稿" : "draft"}</span>
              )}
            </div>
            <h2 className="mt-3 font-display text-2xl tracking-tight">
              {pick(post, "title", lang)}
            </h2>
            <p className="mt-2 text-muted-foreground leading-relaxed">
              {pick(post, "summary", lang)}
            </p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand">
              {lang === "zh" ? "阅读全文" : "Read more"}
              <ArrowRight className="size-3.5 transition group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
        {posts.data && filtered.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            {activeLabel
              ? lang === "zh"
                ? "这个分类下还没有文章。"
                : "No posts in this category yet."
              : lang === "zh"
                ? "还没有文章。"
                : "No posts yet."}
          </p>
        ) : null}
      </div>
    </div>
  );
}
