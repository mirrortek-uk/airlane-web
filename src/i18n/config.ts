export const LOCALES = [
  "zh",
  "zh-TW",
  "en",
  "ru",
  "de",
  "fr",
  "it",
  "es",
] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "zh";

export const LOCALE_LABELS: Record<Locale, string> = {
  zh: "简体中文",
  "zh-TW": "繁體中文",
  en: "English",
  ru: "Русский",
  de: "Deutsch",
  fr: "Français",
  it: "Italiano",
  es: "Español",
};

export const LOCALE_SHORT: Record<Locale, string> = {
  zh: "简",
  "zh-TW": "繁",
  en: "EN",
  ru: "RU",
  de: "DE",
  fr: "FR",
  it: "IT",
  es: "ES",
};

export const LOCALE_HTML_LANG: Record<Locale, string> = {
  zh: "zh-CN",
  "zh-TW": "zh-TW",
  en: "en",
  ru: "ru",
  de: "de",
  fr: "fr",
  it: "it",
  es: "es",
};

export const STORAGE_KEY = "airlane.locale";

export function normalizeLocale(raw: string | null | undefined): Locale | null {
  if (!raw) return null;
  const value = raw.toLowerCase();
  if (value.startsWith("zh")) {
    return /(tw|hk|hant|mo)/.test(value) ? "zh-TW" : "zh";
  }
  const match = LOCALES.find((l) => l !== "zh-TW" && value.startsWith(l));
  return match ?? null;
}

export type Dictionary = Record<string, string>;
