import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";

import { useI18n } from "@/i18n";
import { docLang, docsQueries, pick } from "@/lib/docs";

export const Route = createFileRoute("/docs/")({
  head: () => ({
    meta: [
      { title: "AirLane 帮助中心 — 文档与使用指南" },
      {
        name: "description",
        content:
          "AirLane 在线帮助中心：安装、协议与出口、策略编排、Mesh 组网、账号与设备的完整使用文档。",
      },
      { property: "og:title", content: "AirLane 帮助中心 — 文档与使用指南" },
      {
        property: "og:description",
        content: "安装、协议、策略编排、Mesh 组网与账号设备的完整文档。",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DocsIndex,
});

function DocsIndex() {
  const { locale } = useI18n();
  const lang = docLang(locale);
  const sections = useQuery(docsQueries.sections());
  const pages = useQuery(docsQueries.pages());

  return (
    <div>
      <h1 className="font-display text-4xl tracking-tight">
        {lang === "zh" ? "AirLane 帮助中心" : "AirLane Documentation"}
      </h1>
      <p className="mt-3 text-muted-foreground max-w-2xl leading-relaxed">
        {lang === "zh"
          ? "从安装到策略编排、Mesh 组网与账号体系，这里有你需要的一切。"
          : "Everything from installation to policy orchestration, mesh networking and accounts."}
      </p>

      <div className="mt-10 grid sm:grid-cols-2 gap-5">
        {(sections.data ?? []).map((section) => {
          const items = (pages.data ?? []).filter((p) => p.section_id === section.id);
          return (
            <div
              key={section.id}
              className="rounded-2xl border border-ink/10 bg-white/60 p-6 hover:bg-white transition"
            >
              <h2 className="font-display text-xl">{pick(section, "title", lang)}</h2>
              <ul className="mt-4 space-y-2">
                {items.map((page) => (
                  <li key={page.id}>
                    <Link
                      to="/docs/$slug"
                      params={{ slug: page.slug }}
                      className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-brand transition"
                    >
                      {pick(page, "title", lang)}
                      <ArrowRight className="size-3.5 opacity-0 group-hover:opacity-100 transition" />
                    </Link>
                  </li>
                ))}
                {items.length === 0 ? (
                  <li className="text-sm text-muted-foreground/70">
                    {lang === "zh" ? "内容筹备中" : "Coming soon"}
                  </li>
                ) : null}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
