import type { BlogPost } from "@/lib/blog";

export type Taxon = { slug: string; zh: string; en: string };

/** Topics — a post can belong to several via its tags. */
export const BLOG_TOPICS: Taxon[] = [
  { slug: "networking", zh: "网络技术", en: "Networking" },
  { slug: "privacy", zh: "隐私保护", en: "Privacy" },
  { slug: "security", zh: "安全", en: "Security" },
  { slug: "ai", zh: "AI", en: "AI" },
  { slug: "mesh", zh: "Mesh 组网", en: "Mesh" },
  { slug: "performance", zh: "性能优化", en: "Performance" },
];

/** Sections — exactly one per post, matched by tag slug. */
export const BLOG_SECTIONS: Taxon[] = [
  { slug: "guides", zh: "教程指南", en: "Guides" },
  { slug: "comparisons", zh: "对比评测", en: "Comparisons" },
  { slug: "industry", zh: "行业观察", en: "Industry" },
  { slug: "airlane", zh: "AirLane 动态", en: "AirLane" },
];

const SECTION_SLUGS = new Set(BLOG_SECTIONS.map((s) => s.slug));
const TAXONOMY_SLUGS = new Set([...BLOG_TOPICS, ...BLOG_SECTIONS].map((t) => t.slug));

export function taxonLabel(taxon: Taxon, lang: "zh" | "en") {
  return lang === "zh" ? taxon.zh : taxon.en;
}

export function postSection(post: BlogPost): string | null {
  return (post.tags ?? []).find((tag) => SECTION_SLUGS.has(tag)) ?? null;
}

export function postTopics(post: BlogPost): string[] {
  return BLOG_TOPICS.filter((t) => (post.tags ?? []).includes(t.slug)).map(
    (t) => t.slug,
  );
}

/** Tags shown as chips — section slugs are navigation, not display tags. */
export function displayTags(post: BlogPost): string[] {
  return (post.tags ?? []).filter((tag) => !SECTION_SLUGS.has(tag));
}

/** Top tags by frequency, excluding taxonomy slugs. */
export function popularTags(posts: BlogPost[], limit = 10): string[] {
  const counts = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.tags ?? []) {
      if (TAXONOMY_SLUGS.has(tag)) continue;
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([tag]) => tag);
}

/** Filter a post list by sidebar selection. */
export function filterPosts(
  posts: BlogPost[],
  filter: { topic?: string; section?: string; tag?: string },
): BlogPost[] {
  if (filter.tag) return posts.filter((p) => (p.tags ?? []).includes(filter.tag!));
  if (filter.topic)
    return posts.filter((p) => postTopics(p).includes(filter.topic!));
  if (filter.section)
    return posts.filter((p) => postSection(p) === filter.section);
  return posts;
}
