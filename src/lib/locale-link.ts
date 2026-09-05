import { useI18n } from "@/i18n";

/**
 * Returns a locale prefix for use in Link `to` props.
 * - zh: returns "" (no prefix, default locale)
 * - en: returns "/en"
 * - other locales: returns "" (client-side only, no URL routing)
 *
 * Usage:
 *   const lp = useLocalePrefix();
 *   <Link to={`${lp}/blog`}>Blog</Link>
 */
export function useLocalePrefix(): string {
  const { locale } = useI18n();
  return locale === "en" ? "/en" : "";
}

/**
 * Build a locale-aware path.
 * Non-hook version for use outside components.
 */
export function localePath(locale: string, path: string): string {
  const prefix = locale === "en" ? "/en" : "";
  if (path === "/") return prefix || "/";
  return `${prefix}${path}`;
}
