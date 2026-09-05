import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PenLine } from "lucide-react";

import { LanguageSwitcher } from "@/components/language-switcher";
import { useI18n } from "@/i18n";
import { docLang, docsQueries } from "@/lib/docs";

export const Route = createFileRoute("/blog")({
  component: BlogLayout,
});

function BlogLayout() {
  const { locale, t } = useI18n();
  const lang = docLang(locale);
  const admin = useQuery(docsQueries.admin());

  return (
    <div className="min-h-screen bg-cream text-foreground">
      <header className="sticky top-0 z-50 border-b border-ink/10 bg-cream/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to="/" aria-label={t("brand.name")}>
              <img src="/brand/lockup-on-light.svg" alt="AirLane" className="h-8 w-auto" />
            </Link>
            <Link to="/blog" className="hidden sm:inline text-sm font-mono text-muted-foreground">
              {lang === "zh" ? "博客" : "Blog"}
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/docs"
              className="hidden sm:inline text-sm font-medium text-muted-foreground hover:text-foreground transition"
            >
              {lang === "zh" ? "帮助中心" : "Docs"}
            </Link>
            {admin.data ? (
              <Link
                to="/blog/admin"
                className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 bg-white/70 px-4 py-2 text-sm font-medium hover:bg-white transition"
              >
                <PenLine className="size-3.5" />
                {lang === "zh" ? "写文章" : "Write"}
              </Link>
            ) : null}
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <Outlet />
      </div>
    </div>
  );
}
