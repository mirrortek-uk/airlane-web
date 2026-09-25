import { createFileRoute } from "@tanstack/react-router";
import { AltLandingPage, altLandingHead } from "@/components/alt-landing";
import { LANDING_PAGES } from "@/lib/landing-pages";
import * as seo from "@/lib/seo";

const page = LANDING_PAGES["shadowsocks-client"].en;

export const Route = createFileRoute("/en/shadowsocks-client")({
  head: altLandingHead({
    path: "/shadowsocks-client",
    title: page.head.title,
    description: page.head.desc,
    ogTitle: page.head.ogTitle,
    ogDesc: page.head.ogDesc,
    locale: "en",
    breadcrumbName: page.head.crumb,
    seo,
  }),
  component: Page,
});

function Page() {
  return <AltLandingPage cfg={page.cfg} slug="shadowsocks-client" />;
}
