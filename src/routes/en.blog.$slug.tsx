import { createFileRoute } from "@tanstack/react-router";
import { BlogPostView, POST_META, type BlogSlugLoaderData } from "@/routes/blog.$slug";
import { fetchPostBySlug } from "@/lib/blog";
import { canonical, blogPostSchema, breadcrumbSchema, jsonLd, organizationSchema } from "@/lib/seo";

export const Route = createFileRoute("/en/blog/$slug")({
  loader: async ({ params }): Promise<BlogSlugLoaderData> => {
    try {
      return { post: await fetchPostBySlug(params.slug) };
    } catch {
      return { post: null };
    }
  },
  head: ({ params, loaderData }) => {
    const post = (loaderData as BlogSlugLoaderData | undefined)?.post;
    const meta = POST_META[params.slug];
    const title = post?.title_en || meta?.title_en || params.slug;
    const desc = post?.summary_en || meta?.summary_en || "AirLane blog article";
    const postUrl = canonical(`/en/blog/${params.slug}`);
    return {
      meta: [
        { title: `${title} | AirLane Blog` },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { property: "og:url", content: postUrl },
        { property: "og:site_name", content: "AirLane" },
        { property: "og:locale", content: "en_US" },
        ...(post
          ? [
              { property: "article:published_time", content: post.published_at },
              ...(post.cover_url
                ? [{ property: "og:image", content: canonical(post.cover_url) }]
                : []),
            ]
          : []),
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: desc },
      ],
      links: [
        { rel: "canonical", href: postUrl },
        { rel: "alternate", hrefLang: "zh-CN", href: canonical(`/blog/${params.slug}`) },
        { rel: "alternate", hrefLang: "en", href: canonical(`/en/blog/${params.slug}`) },
        { rel: "alternate", hrefLang: "x-default", href: canonical(`/blog/${params.slug}`) },
      ],
      scripts: post
        ? [
            {
              type: "application/ld+json",
              children: jsonLd([
                organizationSchema("en"),
                blogPostSchema({
                  slug: params.slug,
                  title: post.title_en,
                  description: post.summary_en,
                  datePublished: post.published_at,
                  tags: post.tags,
                  locale: "en",
                }),
                breadcrumbSchema([
                  { name: "Home", url: canonical("/en/") },
                  { name: "Blog", url: canonical("/en/blog") },
                  { name: post.title_en, url: postUrl },
                ]),
              ]),
            },
          ]
        : [],
    };
  },
  component: BlogPostView,
});
