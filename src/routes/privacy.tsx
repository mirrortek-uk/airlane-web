import { createFileRoute, Link } from "@tanstack/react-router";
import { canonical, jsonLd, breadcrumbSchema, organizationSchema } from "@/lib/seo";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "隐私政策 | AirLane" },
      {
        name: "description",
        content: "AirLane 隐私政策：我们收集什么数据、如何使用、存储在哪里，以及你的权利。本地代理流量不上传云端。",
      },
      { property: "og:title", content: "隐私政策 | AirLane" },
      { property: "og:type", content: "website" },
      { property: "og:url", content: canonical("/privacy") },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "canonical", href: canonical("/privacy") },
      { rel: "alternate", hrefLang: "zh-CN", href: canonical("/privacy") },
      { rel: "alternate", hrefLang: "en", href: canonical("/en/privacy") },
      { rel: "alternate", hrefLang: "x-default", href: canonical("/privacy") },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: jsonLd([
          organizationSchema("zh-CN"),
          breadcrumbSchema([
            { name: "首页", url: canonical("/") },
            { name: "隐私政策", url: canonical("/privacy") },
          ]),
        ]),
      },
    ],
  }),
  component: PrivacyPage,
});

const SECTIONS: Array<{ h: string; body: string[] }> = [
  {
    h: "1. 概述",
    body: [
      "本隐私政策说明 AirLane（以下简称「我们」）在你使用 AirLane 客户端、网站（airlane.cloud 及其子域名）与云端服务时，如何收集、使用与保护你的信息。",
      "AirLane 的核心原则是「本地优先」：客户端的代理、策略、规则评估与流量处理全部在你的设备本地完成，我们不会、也无法查看你的代理流量内容。",
    ],
  },
  {
    h: "2. 我们收集的数据",
    body: [
      "匿名身份：创建匿名账号时，我们生成随机身份 ID 并存储访问令牌与恢复码的哈希值（SHA-256），不存储明文。匿名账号不需要邮箱。",
      "正式账号：注册时收集你的邮箱地址（用于登录验证与账号通知）。通过 Google 等第三方登录时，我们接收该服务商返回的邮箱与基本资料。",
      "设备信息：绑定客户端设备时，我们存储设备名称、平台类型、客户端版本与最近在线时间。",
      "云端配置：你选择开启的云端功能（如 Mesh 共享组成员关系、配置快照）按你的指令存储。",
      "人机验证：匿名账号创建使用 Cloudflare Turnstile 验证，该过程由 Cloudflare 处理并受其隐私政策约束。",
    ],
  },
  {
    h: "3. 我们不收集的数据",
    body: [
      "不记录你的代理流量内容、访问的网站或 DNS 查询明细。",
      "客户端的规则评估、策略决策与流量转发全部在本地执行，决策日志默认保留在本机。",
      "不会在未经你明确操作的情况下上传本地配置文件。",
    ],
  },
  {
    h: "4. 数据存储与第三方服务",
    body: [
      "账号与身份数据存储于 Supabase（PostgreSQL）托管的数据库中。",
      "网站托管于 Vercel；访问日志由 Vercel 按其隐私政策处理。",
      "登录认证可能使用 Google OAuth，受其服务条款与隐私政策约束。",
      "人机验证使用 Cloudflare Turnstile。",
    ],
  },
  {
    h: "5. Cookie 与本地存储",
    body: [
      "我们使用浏览器 localStorage 保存你的登录会话与匿名访问令牌，不用于跟踪或广告。",
      "网站不使用第三方广告跟踪 Cookie。",
    ],
  },
  {
    h: "6. 你的权利",
    body: [
      "你可以在账号中心查看你的身份 ID、设备列表与配额使用情况。",
      "你可以随时退出匿名会话（将删除云端匿名身份及其关联数据）或联系我们来删除正式账号。",
      "匿名身份的恢复码仅由你持有；我们无法替你找回丢失的恢复码。",
    ],
  },
  {
    h: "7. 数据保留",
    body: [
      "匿名身份在访问令牌连续 90 天未使用后可能过期失效；恢复码可随时重新激活身份。",
      "正式账号数据在账号存续期间保留；删除账号后，关联数据将在合理期限内移除。",
    ],
  },
  {
    h: "8. 政策更新",
    body: ["我们可能不定期更新本政策。重大变更将在网站公布。继续使用服务即表示接受更新后的政策。"],
  },
  {
    h: "9. 联系我们",
    body: ["如对本政策有疑问，可通过 airlane@googlegroups.com 联系我们。"],
  },
];

function PrivacyPage() {
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
          <h1 className="font-display text-4xl tracking-tight text-foreground">隐私政策</h1>
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
            <Link to="/terms" className="text-brand hover:underline">
              服务条款 →
            </Link>
          </p>
        </article>
      </main>
    </div>
  );
}
