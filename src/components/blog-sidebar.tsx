import type { ReactNode } from "react";
import { Link, useSearch } from "@tanstack/react-router";

import { useI18n } from "@/i18n";
import type { BlogPost } from "@/lib/blog";
import {
  BLOG_SECTIONS,
  BLOG_TOPICS,
  filterPosts,
  popularTags,
  taxonLabel,
} from "@/lib/blog-taxonomy";
import { docLang, pick } from "@/lib/docs";
import { useLocalePrefix } from "@/lib/locale-link";

type BlogSearch = { topic?: string; section?: string; tag?: string };

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      to={href}
      className={`block rounded-lg px-2.5 py-1.5 text-sm transition ${
        active
          ? "bg-brand/10 font-semibold text-brand"
          : "text-muted-foreground hover:bg-ink/5 hover:text-foreground"
      }`}
    >
      {children}
    </Link>
  );
}

function GroupTitle({ children }: { children: ReactNode }) {
  return (
    <p className="px-2.5 pt-5 pb-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/70">
      {children}
    </p>
  );
}

function SidebarNav({ posts, onNavigate }: { posts: BlogPost[]; onNavigate?: () => void }) {
  const { locale } = useI18n();
  const lang = docLang(locale);
  const lp = useLocalePrefix();
  const search = useSearch({ strict: false }) as BlogSearch;
  const blogBase = `${lp}/blog`;
  const href = (q: BlogSearch) => {
    const params = new URLSearchParams(q as Record<string, string>);
    const qs = params.toString();
    return qs ? `${blogBase}?${qs}` : blogBase;
  };

  const featured = posts.filter((p) => p.published).slice(0, 3);
  const tags = popularTags(posts);
  const nothingActive = !search.topic && !search.section && !search.tag;
  const sectionHasPosts = (slug: string) =>
    posts.some((p) => filterPosts([p], { section: slug }).length > 0);

  return (
    <nav onClick={onNavigate}>
      <NavLink href={blogBase} active={nothingActive}>
        {lang === "zh" ? "精选" : "Featured"}
      </NavLink>
      <ul className="mt-2 flex flex-col gap-0.5 border-l border-ink/10 pl-2.5">
        {featured.map((post) => (
          <li key={post.id}>
            <Link
              to={`${lp}/blog/$slug`}
              params={{ slug: post.slug }}
              className="block truncate text-xs leading-relaxed text-muted-foreground hover:text-brand transition"
            >
              {pick(post, "title", lang)}
            </Link>
          </li>
        ))}
      </ul>

      <GroupTitle>{lang === "zh" ? "话题" : "Topics"}</GroupTitle>
      {BLOG_TOPICS.map((topic) => {
        const count = filterPosts(posts, { topic: topic.slug }).length;
        return (
          <NavLink
            key={topic.slug}
            href={href({ topic: topic.slug })}
            active={search.topic === topic.slug}
          >
            {taxonLabel(topic, lang)}
            {count > 0 && (
              <span className="ml-1.5 text-[11px] text-muted-foreground/60">{count}</span>
            )}
          </NavLink>
        );
      })}

      {BLOG_SECTIONS.map((section) => (
        <div key={section.slug}>
          <GroupTitle>
            <Link
              to={href({ section: section.slug })}
              className={`transition hover:text-foreground ${
                search.section === section.slug ? "text-brand" : ""
              }`}
            >
              {taxonLabel(section, lang)}
            </Link>
            {sectionHasPosts(section.slug) ? null : (
              <span className="ml-1.5 normal-case tracking-normal text-muted-foreground/50">
                {lang === "zh" ? "· 待发布" : "· soon"}
              </span>
            )}
          </GroupTitle>
        </div>
      ))}

      {tags.length > 0 && (
        <>
          <GroupTitle>{lang === "zh" ? "热门标签" : "Popular Tags"}</GroupTitle>
          <div className="flex flex-wrap gap-1.5 px-2.5">
            {tags.map((tag) => (
              <Link
                key={tag}
                to={href({ tag })}
                className={`rounded-full border px-2.5 py-0.5 text-xs transition ${
                  search.tag === tag
                    ? "border-brand bg-brand/10 text-brand"
                    : "border-ink/15 text-muted-foreground hover:border-ink/30 hover:text-foreground"
                }`}
              >
                {tag}
              </Link>
            ))}
          </div>
        </>
      )}
    </nav>
  );
}

export function BlogSidebar({ posts }: { posts: BlogPost[] }) {
  const { locale } = useI18n();
  const lang = docLang(locale);
  return (
    <>
      <aside className="hidden lg:block lg:sticky lg:top-24 lg:self-start">
        <SidebarNav posts={posts} />
      </aside>
      <details className="lg:hidden rounded-2xl border border-ink/10 bg-white/60 p-4">
        <summary className="cursor-pointer text-sm font-semibold text-foreground">
          {lang === "zh" ? "博客导航" : "Browse the blog"}
        </summary>
        <div className="mt-3">
          <SidebarNav posts={posts} />
        </div>
      </details>
    </>
  );
}
