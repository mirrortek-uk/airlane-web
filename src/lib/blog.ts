import { supabase } from "@/integrations/supabase/client";

export type BlogPost = {
  id: string;
  slug: string;
  title_zh: string;
  title_en: string;
  summary_zh: string;
  summary_en: string;
  body_zh: string;
  body_en: string;
  cover_url: string;
  tags: string[];
  published: boolean;
  published_at: string;
};

const COLUMNS =
  "id, slug, title_zh, title_en, summary_zh, summary_en, body_zh, body_en, cover_url, tags, published, published_at";

export async function fetchPosts(): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select(COLUMNS)
    .order("published_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as BlogPost[];
}

export async function fetchPostBySlug(slug: string): Promise<BlogPost | null> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select(COLUMNS)
    .eq("slug", slug)
    .single();
  if (error) return null;
  return data as BlogPost;
}

export const blogQueries = {
  posts: () => ({ queryKey: ["blog_posts"], queryFn: fetchPosts }),
  post: (slug: string) => ({
    queryKey: ["blog_posts", slug],
    queryFn: () => fetchPostBySlug(slug),
  }),
};
