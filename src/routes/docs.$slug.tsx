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
