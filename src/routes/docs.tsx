import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search, PenLine } from "lucide-react";

import { LanguageSwitcher } from "@/components/language-switcher";
import { useI18n } from "@/i18n";
import { docLang, docsQueries, pick } from "@/lib/docs";

export const Route = createFileRoute("/docs")({
  component: DocsLayout,
});

export function DocsLayout() {
  const { locale, t } = useI18n();
  const lang = docLang(locale);
  const [query, setQuery] = useState("");

  const sections = useQuery(docsQueries.sections());
  const pages = useQuery(docsQueries.pages());
  const admin = useQuery(docsQueries.admin());

  const tree = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = (pages.data ?? []).filter((p) => {
      if (!q) return true;
      return (
        pick(p, "title", lang).toLowerCase().includes(q) ||
        pick(p, "summary", lang).toLowerCase().includes(q) ||
        pick(p, "body", lang).toLowerCase().includes(q)
      );
    });
    return (sections.data ?? []).map((section) => ({
      section,
      pages: list.filter((p) => p.section_id === section.id),
    }));
  }, [sections.data, pages.data, lang, query]);

  return (
    <div className="min-h-screen bg-cream text-foreground">
      <header className="sticky top-0 z-50 border-b border-ink/10 bg-cream/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to="/" aria-label={t("brand.name")}>
              <img src="/brand/lockup-on-light.svg" alt="AirLane" className="h-8 w-auto" />
            </Link>
            <span className="hidden sm:inline text-sm font-mono text-muted-foreground">
              {lang === "zh" ? "帮助中心" : "Docs"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {admin.data ? (
              <Link
                to="/docs/admin"
                className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 bg-white/70 px-4 py-2 text-sm font-medium hover:bg-white transition"
              >
                <PenLine className="size-3.5" />
                {lang === "zh" ? "编辑文档" : "Edit docs"}
              </Link>
            ) : null}
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-[260px_1fr] gap-10 py-10">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <label className="relative block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={lang === "zh" ? "搜索文档…" : "Search docs…"}
              className="w-full rounded-xl border border-ink/12 bg-white/70 pl-9 pr-3 py-2.5 text-sm outline-none focus:border-brand/60"
            />
          </label>

          <nav className="mt-6 space-y-6">
            {tree.map(({ section, pages: items }) =>
              items.length === 0 && query ? null : (
                <div key={section.id}>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {pick(section, "title", lang)}
                  </p>
                  <ul className="mt-2 space-y-0.5 border-l border-ink/10">
                    {items.map((page) => (
                      <li key={page.id}>
                        <Link
                          to="/docs/$slug"
                          params={{ slug: page.slug }}
                          className="block -ml-px border-l-2 border-transparent pl-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:border-brand/50 transition"
                          activeProps={{
                            className:
                              "block -ml-px border-l-2 border-brand pl-3 py-1.5 text-sm font-medium text-foreground",
                          }}
                        >
                          {pick(page, "title", lang)}
                          {page.published ? null : (
                            <span className="ml-2 text-[10px] font-mono text-sunset">
                              {lang === "zh" ? "草稿" : "draft"}
                            </span>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ),
            )}
            {sections.isLoading ? (
              <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
            ) : null}
          </nav>
        </aside>

        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
