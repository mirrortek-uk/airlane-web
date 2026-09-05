import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChevronLeft } from "lucide-react";

import { useI18n } from "@/i18n";
import { blogQueries } from "@/lib/blog";
import { docLang, pick } from "@/lib/docs";

export const Route = createFileRoute("/blog/$slug")({
  component: BlogPostView,
});

function BlogPostView() {
  const { slug } = Route.useParams();
  const { locale, t } = useI18n();
  const lang = docLang(locale);
  const posts = useQuery(blogQueries.posts());
  const post = (posts.data ?? []).find((p) => p.slug === slug);

  if (posts.isLoading) return <p className="text-muted-foreground">{t("common.loading")}</p>;

  if (!post) {
    return (
      <div>
        <h1 className="font-display text-3xl">
          {lang === "zh" ? "找不到这篇文章" : "Post not found"}
        </h1>
        <Link to="/blog" className="mt-4 inline-block text-brand hover:underline">
          {lang === "zh" ? "返回博客" : "Back to blog"}
        </Link>
      </div>
    );
  }

  return (
    <article className="max-w-3xl">
      <Link
        to="/blog"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition"
      >
        <ChevronLeft className="size-3.5" />
        {lang === "zh" ? "返回博客" : "Back to blog"}
      </Link>

      <div className="mt-6 flex flex-wrap items-center gap-3 text-xs font-mono text-muted-foreground">
        <span>{new Date(post.published_at).toLocaleDateString()}</span>
        {(post.tags ?? []).map((tag) => (
          <span key={tag} className="rounded-full bg-brand/10 text-brand px-2.5 py-0.5">
            {tag}
          </span>
        ))}
      </div>

      <h1 className="mt-3 font-display text-4xl tracking-tight leading-tight">
        {pick(post, "title", lang)}
      </h1>
      <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
        {pick(post, "summary", lang)}
      </p>

      {post.cover_url ? (
        <img
          src={post.cover_url}
          alt={pick(post, "title", lang)}
          className="mt-8 w-full rounded-2xl border border-ink/10"
          loading="lazy"
        />
      ) : null}

      <div className="markdown-body mt-8">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{pick(post, "body", lang)}</ReactMarkdown>
      </div>
    </article>
  );
}
