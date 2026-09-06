import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import { Plus, Save, Trash2 } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { blogQueries, type BlogPost } from "@/lib/blog";
import { docsQueries } from "@/lib/docs";
import { ImageUploadButton } from "@/components/image-upload-button";

export const Route = createFileRoute("/blog/admin")({
  head: () => ({
    meta: [
      { title: "文章编辑 — AirLane 博客" },
      { name: "description", content: "AirLane 博客的内容编辑后台。" },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "文章编辑 — AirLane 博客" },
      { property: "og:description", content: "AirLane 博客的内容编辑后台。" },
    ],
  }),
  component: BlogAdmin,
});

const emptyDraft = (): Partial<BlogPost> => ({
  slug: "",
  title_zh: "",
  title_en: "",
  summary_zh: "",
  summary_en: "",
  body_zh: "",
  body_en: "",
  cover_url: "",
  tags: [],
  published: true,
  published_at: new Date().toISOString(),
});

const inputCls =
  "w-full rounded-xl border border-ink/12 bg-white px-3 py-2.5 outline-none focus:border-brand/60";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block mt-4 first:mt-0">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function BlogAdmin() {
  const qc = useQueryClient();
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const admin = useQuery(docsQueries.admin());
  const posts = useQuery(blogQueries.posts());
  const [draft, setDraft] = useState<Partial<BlogPost> | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(Boolean(data.session)));
  }, []);

  if (signedIn === false) {
    return (
      <div className="max-w-md">
        <h1 className="font-display text-2xl">请先登录</h1>
        <p className="mt-2 text-sm text-muted-foreground">写文章需要一个已登录的管理员账号。</p>
        <Link
          to="/auth"
          className="mt-5 inline-flex rounded-full bg-ink text-cream px-5 py-2.5 text-sm font-semibold"
        >
          去登录
        </Link>
      </div>
    );
  }

  if (signedIn === null || admin.isLoading) {
    return <p className="text-muted-foreground">加载中…</p>;
  }

  if (!admin.data) {
    return (
      <div className="max-w-lg">
        <h1 className="font-display text-2xl">你还不是内容管理员</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          请先在帮助中心的编辑页认领管理员，或让现有管理员为你开通权限。
        </p>
        <Link to="/docs/admin" className="mt-4 inline-block text-brand hover:underline">
          前往帮助中心编辑页
        </Link>
      </div>
    );
  }

  const save = async () => {
    if (!draft) return;
    if (!draft.slug || !draft.title_zh) {
      toast.error("地址标识和中文标题必填");
      return;
    }
    setSaving(true);
    const payload = {
      slug: draft.slug,
      title_zh: draft.title_zh ?? "",
      title_en: draft.title_en || draft.title_zh || "",
      summary_zh: draft.summary_zh ?? "",
      summary_en: draft.summary_en ?? "",
      body_zh: draft.body_zh ?? "",
      body_en: draft.body_en ?? "",
      cover_url: draft.cover_url ?? "",
      tags: draft.tags ?? [],
      published: draft.published ?? true,
      published_at: draft.published_at ?? new Date().toISOString(),
    };
    const res = draft.id
      ? await supabase.from("blog_posts").update(payload).eq("id", draft.id)
      : await supabase.from("blog_posts").insert(payload);
    setSaving(false);
    if (res.error) {
      toast.error(res.error.message);
      return;
    }
    toast.success("已保存");
    setDraft(null);
    qc.invalidateQueries({ queryKey: ["blog_posts"] });
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("blog_posts").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("已删除");
    setDraft(null);
    qc.invalidateQueries({ queryKey: ["blog_posts"] });
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl">文章编辑</h1>
        <button
          onClick={() => setDraft(emptyDraft())}
          className="inline-flex items-center gap-1.5 rounded-full bg-ink text-cream px-4 py-2 text-sm font-semibold"
        >
          <Plus className="size-4" />
          新建文章
        </button>
      </div>

      <div className="mt-8 grid lg:grid-cols-[260px_1fr] gap-8">
        <ul className="space-y-1">
          {(posts.data ?? []).map((p) => (
            <li key={p.id}>
              <button
                onClick={() => setDraft(p)}
                className={`w-full text-left rounded-lg px-3 py-2 text-sm transition ${
                  draft?.id === p.id ? "bg-ink text-cream" : "hover:bg-white/70 text-muted-foreground"
                }`}
              >
                {p.title_zh}
                {p.published ? "" : " · 草稿"}
              </button>
            </li>
          ))}
        </ul>

        {draft ? (
          <div className="rounded-2xl border border-ink/10 bg-white/70 p-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="地址标识 (slug)">
                <input
                  className={inputCls}
                  value={draft.slug ?? ""}
                  onChange={(e) => setDraft({ ...draft, slug: e.target.value })}
                />
              </Field>
              <Field label="标签（英文逗号分隔）">
                <input
                  className={inputCls}
                  value={(draft.tags ?? []).join(",")}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      tags: e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                />
              </Field>
              <Field label="中文标题">
                <input
                  className={inputCls}
                  value={draft.title_zh ?? ""}
                  onChange={(e) => setDraft({ ...draft, title_zh: e.target.value })}
                />
              </Field>
              <Field label="英文标题">
                <input
                  className={inputCls}
                  value={draft.title_en ?? ""}
                  onChange={(e) => setDraft({ ...draft, title_en: e.target.value })}
                />
              </Field>
              <Field label="封面图地址（可选）">
                <input
                  className={inputCls}
                  value={draft.cover_url ?? ""}
                  onChange={(e) => setDraft({ ...draft, cover_url: e.target.value })}
                />
              </Field>
              <Field label="发布状态">
                <label className="flex items-center gap-2 text-sm py-2">
                  <input
                    type="checkbox"
                    checked={draft.published ?? true}
                    onChange={(e) => setDraft({ ...draft, published: e.target.checked })}
                  />
                  已发布（取消勾选则为草稿）
                </label>
              </Field>
            </div>

            <Field label="中文摘要">
              <textarea
                rows={2}
                className={inputCls}
                value={draft.summary_zh ?? ""}
                onChange={(e) => setDraft({ ...draft, summary_zh: e.target.value })}
              />
            </Field>
            <Field label="英文摘要">
              <textarea
                rows={2}
                className={inputCls}
                value={draft.summary_en ?? ""}
                onChange={(e) => setDraft({ ...draft, summary_en: e.target.value })}
              />
            </Field>
            <Field label="中文正文（Markdown）">
              <div className="flex items-center gap-2 mb-1.5">
                <ImageUploadButton
                  subdir={`blog/${draft.slug || "draft"}`}
                  onInsert={(md) => {
                    const ta = document.getElementById("blog-body-zh") as HTMLTextAreaElement | null;
                    if (ta) {
                      const start = ta.selectionStart;
                      const end = ta.selectionEnd;
                      const newVal = (draft.body_zh ?? "").slice(0, start) + md + "\n" + (draft.body_zh ?? "").slice(end);
                      setDraft({ ...draft, body_zh: newVal });
                    } else {
                      setDraft({ ...draft, body_zh: (draft.body_zh ?? "") + "\n" + md + "\n" });
                    }
                  }}
                />
              </div>
              <textarea
                id="blog-body-zh"
                rows={16}
                className={`${inputCls} font-mono text-sm`}
                value={draft.body_zh ?? ""}
                onChange={(e) => setDraft({ ...draft, body_zh: e.target.value })}
              />
            </Field>
            <Field label="英文正文（Markdown，留空则显示中文）">
              <div className="flex items-center gap-2 mb-1.5">
                <ImageUploadButton
                  subdir={`blog/${draft.slug || "draft"}`}
                  onInsert={(md) => {
                    const ta = document.getElementById("blog-body-en") as HTMLTextAreaElement | null;
                    if (ta) {
                      const start = ta.selectionStart;
                      const end = ta.selectionEnd;
                      const newVal = (draft.body_en ?? "").slice(0, start) + md + "\n" + (draft.body_en ?? "").slice(end);
                      setDraft({ ...draft, body_en: newVal });
                    } else {
                      setDraft({ ...draft, body_en: (draft.body_en ?? "") + "\n" + md + "\n" });
                    }
                  }}
                />
              </div>
              <textarea
                id="blog-body-en"
                rows={12}
                className={`${inputCls} font-mono text-sm`}
                value={draft.body_en ?? ""}
                onChange={(e) => setDraft({ ...draft, body_en: e.target.value })}
              />
            </Field>

            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-muted-foreground">预览</summary>
              <div className="markdown-body mt-3">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{draft.body_zh ?? ""}</ReactMarkdown>
              </div>
            </details>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={save}
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-full bg-ink text-cream px-5 py-2.5 text-sm font-semibold disabled:opacity-60"
              >
                <Save className="size-4" />
                {saving ? "保存中…" : "保存"}
              </button>
              <button
                onClick={() => setDraft(null)}
                className="rounded-full border border-ink/15 px-5 py-2.5 text-sm font-medium"
              >
                取消
              </button>
              {draft.id ? (
                <button
                  onClick={() => remove(draft.id!)}
                  className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-destructive/30 text-destructive px-5 py-2.5 text-sm font-medium"
                >
                  <Trash2 className="size-4" />
                  删除
                </button>
              ) : null}
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">从左边选择一篇文章编辑，或点击「新建文章」。</p>
        )}
      </div>
    </div>
  );
}
