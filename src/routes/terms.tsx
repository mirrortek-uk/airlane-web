import { createFileRoute, Link } from "@tanstack/react-router";
import { canonical, jsonLd, breadcrumbSchema, organizationSchema } from "@/lib/seo";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "服务条款 | AirLane" },
      {
        name: "description",
        content: "AirLane 服务条款：账号类型、共享资源配额、可接受使用政策、免责与终止条款。",
      },
      { property: "og:title", content: "服务条款 | AirLane" },
      { property: "og:type", content: "website" },
      { property: "og:url", content: canonical("/terms") },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "canonical", href: canonical("/terms") },
      { rel: "alternate", hrefLang: "zh-CN", href: canonical("/terms") },
      { rel: "alternate", hrefLang: "en", href: canonical("/en/terms") },
      { rel: "alternate", hrefLang: "x-default", href: canonical("/terms") },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: jsonLd([
          organizationSchema("zh-CN"),
          breadcrumbSchema([
            { name: "首页", url: canonical("/") },
            { name: "服务条款", url: canonical("/terms") },
          ]),
        ]),
      },
    ],
  }),
  component: TermsPage,
});

const SECTIONS: Array<{ h: string; body: string[] }> = [
  {
    h: "1. 服务说明",
    body: [
      "AirLane 提供基于 sing-box 内核的可视化网络代理客户端、云端身份与设备管理、Mesh 组网，以及共享 VPS 与共享住宅 IP 等云端资源服务（统称「服务」）。",
      "客户端本地功能（代理、策略、规则评估）无需注册即可永久免费使用。",
    ],
  },
  {
    h: "2. 账号类型",
    body: [
      "匿名账号：无需邮箱即可创建，依赖访问令牌与恢复码。恢复码丢失且令牌失效后，身份将无法找回。",
      "正式账号：通过邮箱或第三方登录（如 Google）注册，拥有完整云端能力。",
      "你应对自己账号下的所有活动负责，请妥善保管恢复码与登录凭证。",
    ],
  },
  {
    h: "3. 可接受使用政策",
    body: [
      "你不得将服务用于任何非法用途，包括但不限于：攻击他人网络、分发恶意软件、发送垃圾信息、侵犯他人知识产权、绕过平台反欺诈机制进行规模化滥用。",
      "共享 VPS 与共享住宅 IP 资源受配额限制；不得转售、转租或以任何形式向第三方分发你的配额访问权限。",
      "我们有权在发现滥用行为时暂停或终止相关身份与资源，且不退还未使用部分。",
    ],
  },
  {
    h: "4. 配额与限制",
    body: [
      "匿名账号享有有限配额（如设备绑定、共享资源数量等），具体以账号中心页面显示为准。配额可能随产品策略调整。",
      "超出配额的请求可能被拒绝；滥用匿名创建机制（批量注册、绕过验证）将导致身份被吊销。",
    ],
  },
  {
    h: "5. 服务可用性与免责",
    body: [
      "服务按「现状」提供。我们努力保持可用性，但不保证服务不中断、无错误或完全满足你的需求。",
      "在法律允许的最大范围内，我们不对因使用或无法使用服务造成的间接、附带或衍生损失承担责任。",
      "共享资源的上游网络质量由资源提供者决定，我们不对第三方网络的可用性与内容负责。",
    ],
  },
  {
    h: "6. 内容与数据",
    body: [
      "你保留对自己配置与数据的全部权利。你授予我们仅为提供服务所必需的处理权限。",
      "你可以随时删除账号与数据；删除后我们将按隐私政策所述期限移除。",
    ],
  },
  {
    h: "7. 条款变更与终止",
    body: [
      "我们可能不定期更新本条款，重大变更将在网站公布。继续使用服务即表示接受更新后的条款。",
      "你可以随时停止使用并删除账号。我们可在违反本条款时终止你的访问权限。",
    ],
  },
  {
    h: "8. 联系我们",
    body: ["如对本条款有疑问，可通过 airlane@googlegroups.com 联系我们。"],
  },
];

function TermsPage() {
  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <header className="fixed top-0 inset-x-0 z-50">
        <div className="absolute inset-0 bg-cream/70 backdrop-blur-xl border-b border-ink/10" />
        <div className="relative max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/brand/lockup-on-light.svg" alt="AirLane" className="h-8 w-auto" />
          </Link>
          <Link
            to="/download"
            className="rounded-full bg-ink text-cream text-sm font-semibold px-5 py-2.5 shadow-card hover:bg-ink/90 transition"
          >
            下载
          </Link>
        </div>
      </header>

      <main className="pt-16">
        <article className="max-w-3xl mx-auto px-6 py-20">
          <h1 className="font-display text-4xl tracking-tight text-foreground">服务条款</h1>
          <p className="mt-3 text-sm text-muted-foreground">最后更新：2026 年 9 月</p>

          <div className="mt-10 space-y-8">
            {SECTIONS.map((s) => (
              <section key={s.h}>
                <h2 className="font-display text-xl tracking-tight text-foreground">{s.h}</h2>
                <div className="mt-3 space-y-2">
                  {s.body.map((p, i) => (
                    <p key={i} className="text-sm leading-relaxed text-muted-foreground">
                      {p}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <p className="mt-12 text-sm">
            <Link to="/privacy" className="text-brand hover:underline">
              隐私政策 →
            </Link>
          </p>
        </article>
      </main>
    </div>
  );
}
