import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import { Plus, Trash2, Save, ShieldCheck } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { claimFirstAdmin } from "@/lib/docs-admin.functions";
import { docsQueries, type DocPage } from "@/lib/docs";

export const Route = createFileRoute("/docs/admin")({
  head: () => ({
    meta: [
      { title: "文档编辑 — AirLane 帮助中心" },
      { name: "description", content: "AirLane 帮助中心的内容编辑后台。" },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "文档编辑 — AirLane 帮助中心" },
      { property: "og:description", content: "AirLane 帮助中心的内容编辑后台。" },
    ],
  }),
  component: DocsAdmin,
});

const emptyDraft = (sectionId: string): Partial<DocPage> => ({
  section_id: sectionId,
  slug: "",
  title_zh: "",
  title_en: "",
  summary_zh: "",
  summary_en: "",
  body_zh: "",
  body_en: "",
  position: 99,
  published: true,
});

function DocsAdmin() {
  const qc = useQueryClient();
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const sections = useQuery(docsQueries.sections());
  const pages = useQuery(docsQueries.pages());
  const admin = useQuery(docsQueries.admin());

  const [draft, setDraft] = useState<Partial<DocPage> | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(Boolean(data.session)));
  }, []);

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["doc_pages"] });
    qc.invalidateQueries({ queryKey: ["doc_sections"] });
  };

  if (signedIn === false) {
    return (
      <div className="max-w-md">
        <h1 className="font-display text-2xl">请先登录</h1>
        <p className="mt-2 text-muted-foreground text-sm">编辑文档需要一个已登录的管理员账号。</p>
        <Link
          to="/auth"
          className="mt-5 inline-flex rounded-full bg-ink text-cream px-5 py-2.5 text-sm font-semibold"
        >
          去登录
        </Link>
      </div>
    );
  }

  if (admin.isLoading || signedIn === null) {
    return <p className="text-muted-foreground">加载中…</p>;
  }

  if (!admin.data) {
    return (
      <div className="max-w-lg">
        <h1 className="font-display text-2xl">你还不是文档管理员</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          如果这是全新的站点，第一个认领的账号会成为管理员；之后需要现有管理员为你开通。
        </p>
        <button
          onClick={async () => {
            try {
              const res = await claimFirstAdmin();
              if (res.granted) {
                toast.success("已成为文档管理员");
                qc.invalidateQueries({ queryKey: ["docs_is_admin"] });
              } else {
                toast.error("已有管理员，请联系管理员开通权限");
              }
            } catch {
              toast.error("操作失败，请重试");
            }
          }}
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-ink text-cream px-5 py-2.5 text-sm font-semibold"
        >
          <ShieldCheck className="size-4" />
          认领管理员
        </button>
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
      section_id: draft.section_id ?? null,
      slug: draft.slug,
      title_zh: draft.title_zh ?? "",
      title_en: draft.title_en || draft.title_zh || "",
      summary_zh: draft.summary_zh ?? "",
      summary_en: draft.summary_en ?? "",
      body_zh: draft.body_zh ?? "",
      body_en: draft.body_en ?? "",
      position: Number(draft.position ?? 99),
      published: draft.published ?? true,
    };
    const res = draft.id
      ? await supabase.from("doc_pages").update(payload).eq("id", draft.id)
      : await supabase.from("doc_pages").insert(payload);
    setSaving(false);
    if (res.error) {
      toast.error(res.error.message);
      return;
    }
    toast.success("已保存");
    setDraft(null);
    refresh();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("doc_pages").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("已删除");
    setDraft(null);
    refresh();
  };

  const addSection = async () => {
    const slug = window.prompt("新分区的地址标识（英文，如 guides）");
    if (!slug) return;
    const title = window.prompt("分区中文名称");
    if (!title) return;
    const { error } = await supabase.from("doc_sections").insert({
      slug,
      title_zh: title,
      title_en: title,
      position: (sections.data?.length ?? 0) + 1,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("分区已创建");
    refresh();
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl">文档编辑</h1>
        <div className="flex gap-2">
          <button
            onClick={addSection}
            className="rounded-full border border-ink/15 bg-white/70 px-4 py-2 text-sm font-medium hover:bg-white transition"
          >
            新建分区
          </button>
          <button
            onClick={() => setDraft(emptyDraft(sections.data?.[0]?.id ?? ""))}
            className="inline-flex items-center gap-1.5 rounded-full bg-ink text-cream px-4 py-2 text-sm font-semibold"
          >
            <Plus className="size-4" />
            新建文档
          </button>
        </div>
      </div>

      <div className="mt-8 grid lg:grid-cols-[280px_1fr] gap-8">
        <div className="space-y-5">
          {(sections.data ?? []).map((section) => (
            <div key={section.id}>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {section.title_zh}
              </p>
              <ul className="mt-2 space-y-1">
                {(pages.data ?? [])
                  .filter((p) => p.section_id === section.id)
                  .map((p) => (
                    <li key={p.id}>
                      <button
                        onClick={() => setDraft(p)}
                        className={`w-full text-left rounded-lg px-3 py-2 text-sm transition ${
                          draft?.id === p.id
                            ? "bg-ink text-cream"
                            : "hover:bg-white/70 text-muted-foreground"
                        }`}
                      >
                        {p.title_zh}
                        {p.published ? "" : " · 草稿"}
                      </button>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>

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
              <Field label="所属分区">
                <select
                  className={inputCls}
                  value={draft.section_id ?? ""}
                  onChange={(e) => setDraft({ ...draft, section_id: e.target.value })}
                >
                  {(sections.data ?? []).map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title_zh}
                    </option>
                  ))}
                </select>
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
              <Field label="排序">
                <input
                  type="number"
                  className={inputCls}
                  value={draft.position ?? 99}
                  onChange={(e) => setDraft({ ...draft, position: Number(e.target.value) })}
                />
              </Field>
              <Field label="状态">
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

            <Field label="中文正文（Markdown）">
              <textarea
                rows={16}
                className={`${inputCls} font-mono text-sm`}
                value={draft.body_zh ?? ""}
                onChange={(e) => setDraft({ ...draft, body_zh: e.target.value })}
              />
            </Field>
            <Field label="英文正文（Markdown，留空则显示中文）">
              <textarea
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
          <p className="text-muted-foreground text-sm">
            从左边选择一篇文档进行编辑，或点击「新建文档」。
          </p>
        )}
      </div>
    </div>
  );
}

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
