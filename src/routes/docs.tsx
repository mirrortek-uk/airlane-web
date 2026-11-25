import { createFileRoute, Link, Outlet, useMatches } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search, PenLine, Download } from "lucide-react";

import { LanguageSwitcher } from "@/components/language-switcher";
import { useI18n } from "@/i18n";
import {
  docLang,
  docsQueries,
  fetchPages,
  fetchSections,
  pick,
  type DocPage,
  type DocSection,
} from "@/lib/docs";
import { useLocalePrefix } from "@/lib/locale-link";

export type DocsLoaderData = { sections: DocSection[]; pages: DocPage[] };

export async function loadDocsNav(): Promise<DocsLoaderData> {
  try {
    const [sections, pages] = await Promise.all([fetchSections(), fetchPages()]);
    return { sections, pages };
  } catch {
    return { sections: [], pages: [] };
  }
}

export const Route = createFileRoute("/docs")({
  loader: () => loadDocsNav(),
  component: DocsLayout,
});

export function DocsLayout() {
  const { locale, t } = useI18n();
  const lang = docLang(locale);
  const [query, setQuery] = useState("");
  const lp = useLocalePrefix();
  const matches = useMatches();
  const loaderNav = matches.find((m) => {
    const d = m.loaderData as DocsLoaderData | undefined;
    return d && Array.isArray(d.sections) && Array.isArray(d.pages);
  })?.loaderData as DocsLoaderData | undefined;

  const sections = useQuery(docsQueries.sections());
  const pages = useQuery(docsQueries.pages());
  const admin = useQuery(docsQueries.admin());
  const sectionList = sections.data ?? loaderNav?.sections ?? [];
  const pageList = pages.data ?? loaderNav?.pages ?? [];

  const tree = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = pageList.filter((p) => {
      if (!q) return true;
      return (
        pick(p, "title", lang).toLowerCase().includes(q) ||
        pick(p, "summary", lang).toLowerCase().includes(q) ||
        pick(p, "body", lang).toLowerCase().includes(q)
      );
    });
    return sectionList.map((section) => ({
      section,
      pages: list.filter((p) => p.section_id === section.id),
    }));
  }, [sectionList, pageList, lang, query]);

  return (
    <div className="docs-shell min-h-screen bg-cream text-foreground">
      <header className="sticky top-0 z-50 border-b border-ink/10 bg-cream/85 backdrop-blur-xl">
        <div className="max-w-[1440px] mx-auto px-5 h-16 flex items-center gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <Link to={lp || "/"} aria-label={t("brand.name")}>
              <img src="/brand/lockup-on-light.svg" alt="AirLane" className="h-8 w-auto" />
            </Link>
            <span className="hidden sm:inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold text-brand bg-brand/10">
              {lang === "zh" ? "帮助中心" : "Docs"}
            </span>
          </div>

          <label className="doc-search hidden md:flex">
            <Search className="size-4 shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                lang === "zh" ? "搜索文档、功能、报错信息…" : "Search docs, features, errors…"
              }
            />
            <kbd>/</kbd>
          </label>

          <div className="ml-auto flex items-center gap-2.5">
            {admin.data ? (
              <Link
                to="/docs/admin"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-[10px] border border-ink/15 bg-card px-3 py-2 text-sm font-medium hover:bg-white transition"
              >
                <PenLine className="size-3.5" />
                {lang === "zh" ? "编辑文档" : "Edit docs"}
              </Link>
            ) : null}
            <LanguageSwitcher />
            <Link
              to={`${lp}/download`}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-[10px] px-4 py-2 text-sm font-semibold text-white bg-gradient-to-br from-brand to-sunset shadow-[0_6px_16px_-6px_rgba(208,72,45,.6)] hover:opacity-95 transition"
            >
              <Download className="size-4" />
              {lang === "zh" ? "下载" : "Download"}
            </Link>
          </div>
        </div>
      </header>

      <div className="docs-shell-inner max-w-[1440px] mx-auto px-5 grid lg:grid-cols-[272px_minmax(0,1fr)] gap-8 py-8">
        <aside className="doc-side">
          <label className="doc-search flex md:hidden mb-4">
            <Search className="size-4 shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={lang === "zh" ? "搜索文档…" : "Search docs…"}
            />
          </label>

          <nav>
            {tree.map(({ section, pages: items }) =>
              items.length === 0 && query ? null : (
                <div className="grp" key={section.id}>
                  <h6>{pick(section, "title", lang)}</h6>
                  {items.map((page) => (
                    <Link
                      key={page.id}
                      to={`${lp}/docs/$slug`}
                      params={{ slug: page.slug }}
                      activeProps={{ className: "on" }}
                      activeOptions={{ exact: true }}
                    >
                      {pick(page, "title", lang)}
                      {page.published ? null : (
                        <span className="tag">{lang === "zh" ? "草稿" : "draft"}</span>
                      )}
                    </Link>
                  ))}
                </div>
              ),
            )}
            {sections.isLoading && sectionList.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
            ) : null}

            <div className="help">
              <b>{lang === "zh" ? "找不到答案？" : "Can't find an answer?"}</b>
              {lang === "zh" ? (
                <>
                  在{" "}
                  <a
                    href="https://github.com/mirrortek-uk/airlane-web/issues"
                    target="_blank"
                    rel="noreferrer"
                  >
                    GitHub 提 Issue
                  </a>
                  ，工程师会回复你。
                </>
              ) : (
                <>
                  Open an{" "}
                  <a
                    href="https://github.com/mirrortek-uk/airlane-web/issues"
                    target="_blank"
                    rel="noreferrer"
                  >
                    issue on GitHub
                  </a>{" "}
                  and an engineer will reply.
                </>
              )}
            </div>
          </nav>
        </aside>

        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
