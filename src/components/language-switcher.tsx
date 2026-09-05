import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Check, Languages } from "lucide-react";

import { LOCALES, LOCALE_LABELS, LOCALE_SHORT, useI18n } from "@/i18n";

/**
 * Build the target URL when switching locale.
 * - zh: strip the /en, /ru, /de, etc. prefix
 * - other locales: add or replace the prefix
 */
function buildLocaleUrl(targetLocale: string, currentPath: string): string {
  // Strip existing locale prefix (e.g. /en/, /ru/, /zh-TW/)
  let path = currentPath;
  for (const l of LOCALES) {
    if (l === "zh") continue;
    const prefix = `/${l}/`;
    if (path.startsWith(prefix)) {
      path = path.slice(prefix.length - 1); // keep leading slash
      break;
    }
    if (path === `/${l}`) {
      path = "/";
      break;
    }
  }

  // zh is the default — no prefix
  if (targetLocale === "zh") return path;

  // Add the target locale prefix
  return `/${targetLocale}${path === "/" ? "" : path}`;
}

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  function switchLocale(target: (typeof LOCALES)[number]) {
    setLocale(target);
    setOpen(false);
    // Only navigate if the URL path needs to change
    // zh <-> en navigation; other locales stay client-side
    if (target === "zh" || target === "en") {
      const currentPath = window.location.pathname;
      const newUrl = buildLocaleUrl(target, currentPath);
      if (newUrl !== currentPath) {
        navigate({ to: newUrl });
      }
    }
  }

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t("nav.language")}
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 bg-white/50 px-3 py-2 text-xs font-mono font-medium text-muted-foreground transition hover:bg-white/80 hover:text-foreground"
      >
        <Languages className="size-3.5" />
        {LOCALE_SHORT[locale]}
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-2xl border border-border bg-card p-1.5 shadow-sun">
          {LOCALES.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => switchLocale(item)}
              className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm text-foreground transition hover:bg-brand/10"
            >
              {LOCALE_LABELS[item]}
              {item === locale && <Check className="size-3.5 text-brand" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
