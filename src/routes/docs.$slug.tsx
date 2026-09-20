import { createFileRoute, Link, useMatches, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { useI18n } from "@/i18n";
import { docLang, docsQueries, fetchPage, pick, type DocPage } from "@/lib/docs";
import { canonical, breadcrumbSchema, jsonLd, organizationSchema } from "@/lib/seo";
import { useLocalePrefix } from "@/lib/locale-link";

export type DocSlugLoaderData = { page: DocPage | null };

async function loadDocPage(slug: string): Promise<DocSlugLoaderData> {
  try {
    return { page: await fetchPage(slug) };
  } catch {
    return { page: null };
  }
}

export const Route = createFileRoute("/docs/$slug")({
  loader: ({ params }) => loadDocPage(params.slug),
  head: ({ params, loaderData }) => {
    const page = (loaderData as DocSlugLoaderData | undefined)?.page;
    const title = page?.title_zh || params.slug;
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
              ]),
            },
          ]
        : [],
    };
  },
  component: DocPageView,
});

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

  if (pages.isLoading && !loaderPage) {
    return <p className="text-muted-foreground">{t("common.loading")}</p>;
  }

  if (!page) {
    return (
      <div>
        <h1 className="font-display text-3xl">
          {lang === "zh" ? "找不到这篇文档" : "Document not found"}
        </h1>
        <Link to={`${lp}/docs`} className="mt-4 inline-block text-brand hover:underline">
          {lang === "zh" ? "返回帮助中心" : "Back to docs"}
        </Link>
      </div>
    );
  }

  return (
    <article>
      <p className="text-xs font-mono text-muted-foreground">
        <time dateTime={page.updated_at}>
          {new Date(page.updated_at).toLocaleDateString()}
        </time>
      </p>
      <h1 className="mt-3 font-display text-3xl tracking-tight">
        {pick(page, "title", lang)}
      </h1>
      <div className="markdown-body mt-3">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{pick(page, "body", lang)}</ReactMarkdown>
      </div>

      <div className="mt-14 grid sm:grid-cols-2 gap-4 border-t border-ink/10 pt-6">
        {prev ? (
          <Link
            to={`${lp}/docs/$slug`}
            params={{ slug: prev.slug }}
            className="rounded-xl border border-ink/10 bg-white/60 p-4 hover:bg-white transition"
          >
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <ChevronLeft className="size-3.5" />
              {lang === "zh" ? "上一篇" : "Previous"}
            </span>
            <p className="mt-1 font-medium">{pick(prev, "title", lang)}</p>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            to={`${lp}/docs/$slug`}
            params={{ slug: next.slug }}
            className="rounded-xl border border-ink/10 bg-white/60 p-4 text-right hover:bg-white transition"
          >
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              {lang === "zh" ? "下一篇" : "Next"}
              <ChevronRight className="size-3.5" />
            </span>
            <p className="mt-1 font-medium">{pick(next, "title", lang)}</p>
          </Link>
        ) : null}
      </div>
    </article>
  );
}
