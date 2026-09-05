import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  DEFAULT_LOCALE,
  LOCALE_HTML_LANG,
  STORAGE_KEY,
  normalizeLocale,
  type Dictionary,
  type Locale,
} from "./config";

import zh from "./locales/zh";
import zhTW from "./locales/zh-TW";
import en from "./locales/en";
import ru from "./locales/ru";
import de from "./locales/de";
import fr from "./locales/fr";
import it from "./locales/it";
import es from "./locales/es";

const DICTS: Record<Locale, Dictionary> = {
  zh,
  "zh-TW": zhTW,
  en,
  ru,
  de,
  fr,
  it,
  es,
};

type I18nValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nValue | null>(null);

function interpolate(text: string, vars?: Record<string, string | number>) {
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match,
  );
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    const stored = normalizeLocale(window.localStorage.getItem(STORAGE_KEY));
    const detected = stored ?? normalizeLocale(navigator.language);
    if (detected && detected !== locale) setLocaleState(detected);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.documentElement.lang = LOCALE_HTML_LANG[locale];
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      const value = DICTS[locale]?.[key] ?? DICTS[DEFAULT_LOCALE][key] ?? key;
      return interpolate(value, vars);
    },
    [locale],
  );

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    return {
      locale: DEFAULT_LOCALE,
      setLocale: () => {},
      t: (key: string, vars?: Record<string, string | number>) =>
        interpolate(DICTS[DEFAULT_LOCALE][key] ?? key, vars),
    };
  }
  return ctx;
}

export function useT() {
  return useI18n().t;
}

export * from "./config";
