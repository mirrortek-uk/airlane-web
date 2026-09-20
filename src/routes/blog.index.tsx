import { createFileRoute, Link, useMatches, useSearch } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, ArrowUpRight, X } from "lucide-react";

import { BlogSidebar } from "@/components/blog-sidebar";
import { useI18n } from "@/i18n";
import { blogQueries, fetchPosts } from "@/lib/blog";
import {
  BLOG_SECTIONS,
  BLOG_TOPICS,
  displayTags,
  filterPosts,
  postSection,
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

function RouteDiagram() {
  return (
    <div
      className="relative min-h-64 overflow-hidden border border-border bg-muted/40"
      aria-label="Abstract network route diagram"
    >
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:32px_32px] opacity-60" />
      <svg viewBox="0 0 360 256" className="absolute inset-0 h-full w-full" fill="none" aria-hidden="true">
        <path
          className="route-line"
          d="M32 190 C92 190 80 65 164 65 S260 180 330 72"
          stroke="var(--brand)"
          strokeWidth="2"
        />
        <path
          d="M32 190 L165 184 L330 72"
          stroke="var(--muted-foreground)"
          strokeOpacity=".45"
        />
        <circle cx="32" cy="190" r="5" fill="var(--foreground)" />
        <circle cx="164" cy="65" r="6" fill="var(--brand)" />
        <circle cx="165" cy="184" r="5" fill="var(--accent)" />
        <circle cx="330" cy="72" r="5" fill="var(--foreground)" />
      </svg>
      <div className="absolute bottom-4 left-4 right-4 flex justify-between border-t border-border pt-3 font-mono text-[10px] uppercase text-muted-foreground">
        <span>Origin</span>
        <span className="text-brand">BGP route selection</span>
        <span>Edge</span>
      </div>
    </div>
  );
}

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

  const allPosts = posts.data ?? [];
  const featured = allPosts.find((p) => p.published) ?? null;
  const filtered = filterPosts(allPosts, search);
  const activeTaxon =
    [...BLOG_TOPICS, ...BLOG_SECTIONS].find(
      (x) => x.slug === search.topic || x.slug === search.section,
    ) ?? null;
  const activeLabel = search.tag ?? (activeTaxon ? taxonLabel(activeTaxon, lang) : null);
  const sectionLabel = (post: (typeof allPosts)[number]) => {
    const slug = postSection(post);
    const taxon = BLOG_SECTIONS.find((s) => s.slug === slug);
    return taxon ? taxonLabel(taxon, lang) : "—";
  };

  return (
    <div>
      {/* Hero */}
      <section className="grid gap-8 border-b border-border pb-10 md:grid-cols-[1.25fr_.75fr] md:pb-14 lg:gap-16">
        <div>
          <div className="mb-6 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            <span className="text-brand">AirLane Engineering</span>
            <span>/</span>
            <span>{lang === "zh" ? "第 01 期" : "Issue 01"}</span>
          </div>
          <h1 className="max-w-4xl text-4xl font-semibold leading-[1.08] sm:text-5xl lg:text-6xl">
            {lang === "zh"
              ? "现代网络边缘的工程手记。"
              : "Notes from the edge of modern networking."}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
            {lang === "zh"
              ? "产品更新、协议笔记，以及我们对网络编排的实践与思考——从 Anycast、QUIC 到策略引擎与 Mesh。"
              : "Product updates, protocol notes, and practical thinking about network orchestration—from Anycast and QUIC to policy engines and mesh."}
          </p>
        </div>
        <div className="flex items-end">
          <div className="w-full border-l-2 border-brand pl-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              {lang === "zh" ? "编辑视角" : "Editorial focus"}
            </p>
            <p className="mt-3 max-w-sm text-sm leading-6">
              {lang === "zh"
                ? "我们记录基础设施背后的权衡、故障模式与设计决策——而不只是结果。"
                : "We document the trade-offs, failure modes, and design decisions behind infrastructure—not just the outcomes."}
            </p>
          </div>
        </div>
      </section>

      {/* Featured analysis */}
      {featured ? (
        <section className="grid gap-8 border-b border-border py-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:py-10">
          <Link
            to={`${lp}/blog/$slug`}
            params={{ slug: featured.slug }}
            className="group block"
          >
            <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.14em] text-brand">
              <span className="h-px w-8 bg-brand" />
              {lang === "zh" ? "本期精选" : "Featured analysis"}
            </div>
            <h2 className="mt-5 max-w-4xl text-3xl font-semibold leading-tight transition-colors group-hover:text-brand sm:text-4xl">
              {pick(featured, "title", lang)}
            </h2>
            <p className="mt-4 max-w-3xl text-[15px] leading-7 text-muted-foreground">
              {pick(featured, "summary", lang)}
            </p>
            <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-brand">
              {lang === "zh" ? "阅读全文" : "Read the analysis"}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
          <RouteDiagram />
        </section>
      ) : null}

      {/* Sidebar + article list */}
      <section className="grid gap-10 py-10 lg:grid-cols-[220px_minmax(0,1fr)] lg:py-14">
        <BlogSidebar posts={allPosts} />

        <div className="min-w-0">
          {activeLabel && (
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-4 py-1.5 text-sm text-brand">
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

          <div className="flex items-end justify-between border-b-2 border-foreground pb-3">
            <h2 className="text-2xl font-semibold">
              {lang === "zh" ? "最新文章" : "Latest notes"}
            </h2>
            <span className="font-mono text-[11px] text-muted-foreground">
              {lang === "zh"
                ? `${String(filtered.length).padStart(2, "0")} 篇文章`
                : `${String(filtered.length).padStart(2, "0")} entries`}
            </span>
          </div>

          {posts.isLoading ? (
            <p className="mt-10 text-muted-foreground">{t("common.loading")}</p>
          ) : null}

          <div>
            {filtered.map((post) => (
              <article
                key={post.id}
                className="group grid gap-4 border-b border-border py-6 sm:grid-cols-[90px_minmax(0,1fr)_24px] sm:gap-6"
              >
                <div className="font-mono text-[10px] text-muted-foreground">
                  <p>{new Date(post.published_at).toLocaleDateString()}</p>
                  <p className="mt-2 uppercase text-brand">{sectionLabel(post)}</p>
                  {post.published ? null : (
                    <p className="mt-1 text-sunset">{lang === "zh" ? "草稿" : "draft"}</p>
                  )}
                </div>
                <div>
                  <Link to={`${lp}/blog/$slug`} params={{ slug: post.slug }}>
                    <h3 className="text-xl font-semibold leading-snug transition-colors group-hover:text-brand">
                      {pick(post, "title", lang)}
                    </h3>
                  </Link>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                    {pick(post, "summary", lang)}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2 font-mono text-[10px] text-muted-foreground">
                    {displayTags(post).map((tag) => (
                      <span key={tag} className="bg-muted/60 px-2 py-1">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <Link
                  to={`${lp}/blog/$slug`}
                  params={{ slug: post.slug }}
                  className="hidden sm:block"
                  aria-label={pick(post, "title", lang)}
                >
                  <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand" />
                </Link>
              </article>
            ))}
            {posts.data && filtered.length === 0 ? (
              <p className="py-6 text-sm text-muted-foreground">
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
      </section>
    </div>
  );
}
