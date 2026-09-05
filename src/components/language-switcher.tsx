import { useEffect, useRef, useState } from "react";
import { Check, Languages } from "lucide-react";

import { LOCALES, LOCALE_LABELS, LOCALE_SHORT, useI18n } from "@/i18n";

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();
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
              onClick={() => {
                setLocale(item);
                setOpen(false);
              }}
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
