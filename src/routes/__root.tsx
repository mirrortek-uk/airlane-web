import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useMatches,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { I18nProvider } from "@/i18n";
import { Toaster } from "@/components/ui/sonner";
import { organizationSchema, websiteSchema, faqSchema, softwareApplicationSchema, canonical, jsonLd } from "@/lib/seo";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-input bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "baidu-site-verification", content: "codeva-x5V6tsl0Dl" },
      { name: "bytedance-verification-code", content: "gw3uc6nfyJGO5HiUvhhQ" },
      { name: "sogou_site_verification", content: "eHWJE28q1q" },
      { title: "AirLane｜可视化流量调度客户端" },
      {
        name: "description",
        content:
          "支持订阅链接导入、应用分流、多出口策略管理、多终端Mesh组网与路由规则配置。告别复杂YAML配置，可视化编排你的网络流量。",
      },
      { name: "author", content: "AirLane" },
      {
        property: "og:title",
        content: "AirLane｜可视化流量调度客户端",
      },
      {
        property: "og:description",
        content:
          "支持订阅链接导入、应用分流、多出口策略管理、多终端Mesh组网与路由规则配置。告别复杂YAML配置，可视化编排你的网络流量。",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: canonical("/") },
      { property: "og:site_name", content: "AirLane" },
      { property: "og:locale", content: "zh_CN" },
      { property: "og:image", content: canonical("/brand/og-image.svg") },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@airlanecloud" },
      { name: "twitter:title", content: "AirLane｜可视化流量调度客户端" },
      {
        name: "twitter:description",
        content:
          "支持订阅链接导入、应用分流、多出口策略管理、多终端Mesh组网与路由规则配置。告别复杂YAML配置，可视化编排你的网络流量。",
      },
      { name: "twitter:image", content: canonical("/brand/og-image.svg") },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "canonical", href: canonical("/") },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: jsonLd([
          organizationSchema("zh-CN"),
          websiteSchema("zh-CN"),
          softwareApplicationSchema(),
          faqSchema("zh-CN"),
        ]),
      },
      {
        type: "text/javascript",
        children: `(function(){var el=document.createElement("script");el.src="https://lf1-cdn-tos.bytegoofy.com/goofy/ttzz/push.js?6e895f7e62d42eef227e6ff26cfd4125c89e58d9d9edada312b745660308be8d65e0a2ada1d5e86b11e7de7c1a83287d04743a02fd1ee8dd8558a8cad50e91cb354f8c6f3f78e5fd97613c481f678e6d";el.id="ttzz";var s=document.getElementsByTagName("script")[0];s.parentNode.insertBefore(el,s);})(window)`,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  const matches = useMatches();
  const isEnglish = matches.some((m) => m.pathname.startsWith("/en"));
  return (
    <html lang={isEnglish ? "en" : "zh-CN"}>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <Outlet />
        <Toaster position="top-center" richColors />
      </I18nProvider>
    </QueryClientProvider>
  );
}
