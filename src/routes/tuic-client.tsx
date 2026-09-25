import { createFileRoute } from "@tanstack/react-router";
import { AltLandingPage, altLandingHead } from "@/components/alt-landing";
import { LANDING_PAGES } from "@/lib/landing-pages";
import * as seo from "@/lib/seo";

const page = LANDING_PAGES["tuic-client"].zh;

export const Route = createFileRoute("/tuic-client")({
  head: altLandingHead({
    path: "/tuic-client",
    title: page.head.title,
    description: page.head.desc,
    ogTitle: page.head.ogTitle,
    ogDesc: page.head.ogDesc,
    locale: "zh-CN",
    breadcrumbName: page.head.crumb,
    seo,
  }),
  component: Page,
});

function Page() {
  return <AltLandingPage cfg={page.cfg} slug="tuic-client" />;
}
