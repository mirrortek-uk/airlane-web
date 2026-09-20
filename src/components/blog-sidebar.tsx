import type { ReactNode } from "react";
import { Link, useSearch } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

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

export function BlogSidebar({ posts }: { posts: BlogPost[] }) {
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

  const tags = popularTags(posts, 8);

  const groupTitle = (children: ReactNode, index?: string) => (
    <div className="flex items-center justify-between border-b-2 border-foreground pb-2">
      <h2 className="text-sm font-semibold uppercase">{children}</h2>
      {index ? <span className="font-mono text-[10px] text-brand">{index}</span> : null}
    </div>
  );

  return (
    <aside>
      <div className="space-y-7">
        {BLOG_SECTIONS.map((section, i) => {
          const sectionPosts = filterPosts(posts, { section: section.slug });
          return (
            <section key={section.slug}>
              {groupTitle(taxonLabel(section, lang), String(i + 1).padStart(2, "0"))}
              {sectionPosts.length === 0 ? (
                <Link
                  to={href({ section: section.slug })}
                  className="block border-b border-border py-2.5 text-[13px] italic text-muted-foreground/60 transition-colors hover:text-brand"
                >
                  {lang === "zh" ? "暂无文章" : "Coming soon"}
                </Link>
              ) : (
                sectionPosts.slice(0, 4).map((post) => (
                  <Link
                    key={post.id}
                    to={`${lp}/blog/$slug`}
                    params={{ slug: post.slug }}
                    className="group flex items-start gap-2 border-b border-border py-2.5 text-[13px] leading-5 text-muted-foreground transition-colors hover:text-brand"
                  >
                    <ArrowRight className="mt-1 size-3 shrink-0 transition-transform group-hover:translate-x-0.5" />
                    <span>{pick(post, "title", lang)}</span>
                  </Link>
                ))
              )}
            </section>
          );
        })}
      </div>

      <h2 className="mt-8 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
        {lang === "zh" ? "话题" : "Topics"}
      </h2>
      <div className="mt-4 border-t border-border">
        {BLOG_TOPICS.map((topic, index) => (
          <Link
            key={topic.slug}
            to={href({ topic: topic.slug })}
            className={`flex items-center justify-between border-b border-border py-3 text-sm transition-colors hover:text-brand ${
              search.topic === topic.slug ? "font-semibold text-brand" : ""
            }`}
          >
            <span>{taxonLabel(topic, lang)}</span>
            <span className="font-mono text-[10px] text-muted-foreground">
              {String(index + 1).padStart(2, "0")}
            </span>
          </Link>
        ))}
      </div>

      {tags.length > 0 && (
        <div className="mt-8">
          <h2 className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            {lang === "zh" ? "热门标签" : "Popular Tags"}
          </h2>
          <div className="mt-3 flex flex-wrap gap-x-3 gap-y-2 font-mono text-[11px] text-muted-foreground">
            {tags.map((tag) => (
              <Link
                key={tag}
                to={href({ tag })}
                className={`transition-colors hover:text-brand ${
                  search.tag === tag ? "font-semibold text-brand" : ""
                }`}
              >
                #{tag}
              </Link>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
