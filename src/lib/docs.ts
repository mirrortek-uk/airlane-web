import { supabase } from "@/integrations/supabase/client";
import type { Locale } from "@/i18n/config";

export type DocSection = {
  id: string;
  slug: string;
  title_zh: string;
  title_en: string;
  position: number;
};

export type DocPage = {
  id: string;
  section_id: string | null;
  slug: string;
  title_zh: string;
  title_en: string;
  summary_zh: string;
  summary_en: string;
  body_zh: string;
  body_en: string;
  position: number;
  published: boolean;
  updated_at: string;
};

/** Docs are authored in Chinese + English only. */
export type DocLang = "zh" | "en";

export function docLang(locale: Locale): DocLang {
  return locale.startsWith("zh") ? "zh" : "en";
}

export function pick<T extends Record<string, unknown>>(
  row: T,
  field: string,
  lang: DocLang,
): string {
  const primary = row[`${field}_${lang}`] as string | undefined;
  const fallback = row[`${field}_${lang === "zh" ? "en" : "zh"}`] as string | undefined;
  return (primary && primary.trim()) || fallback || "";
}

export async function fetchSections(): Promise<DocSection[]> {
  const { data, error } = await supabase
    .from("doc_sections")
    .select("id, slug, title_zh, title_en, position")
    .order("position", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function fetchPages(): Promise<DocPage[]> {
  const { data, error } = await supabase
    .from("doc_pages")
    .select(
      "id, section_id, slug, title_zh, title_en, summary_zh, summary_en, body_zh, body_en, position, published, updated_at",
    )
    .order("position", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function fetchPage(slug: string): Promise<DocPage | null> {
  const { data, error } = await supabase
    .from("doc_pages")
    .select(
      "id, section_id, slug, title_zh, title_en, summary_zh, summary_en, body_zh, body_en, position, published, updated_at",
    )
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function isAdmin(): Promise<boolean> {
  const { data: userData } = await supabase.auth.getUser();
  const uid = userData.user?.id;
  if (!uid) return false;
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", uid)
    .eq("role", "admin")
    .maybeSingle();
  return Boolean(data);
}

export const docsQueries = {
  sections: () => ({ queryKey: ["doc_sections"], queryFn: fetchSections }),
  pages: () => ({ queryKey: ["doc_pages"], queryFn: fetchPages }),
  admin: () => ({ queryKey: ["docs_is_admin"], queryFn: isAdmin }),
};
