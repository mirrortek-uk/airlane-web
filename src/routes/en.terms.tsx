import { createFileRoute, Link } from "@tanstack/react-router";
import { canonical, jsonLd, breadcrumbSchema, organizationSchema } from "@/lib/seo";

export const Route = createFileRoute("/en/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service | AirLane" },
      {
        name: "description",
        content: "AirLane terms of service: account types, shared-resource quotas, acceptable use policy, disclaimers and termination.",
      },
      { property: "og:title", content: "Terms of Service | AirLane" },
      { property: "og:type", content: "website" },
      { property: "og:url", content: canonical("/en/terms") },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "canonical", href: canonical("/en/terms") },
      { rel: "alternate", hrefLang: "zh-CN", href: canonical("/terms") },
      { rel: "alternate", hrefLang: "en", href: canonical("/en/terms") },
      { rel: "alternate", hrefLang: "x-default", href: canonical("/terms") },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: jsonLd([
          organizationSchema("en"),
          breadcrumbSchema([
            { name: "Home", url: canonical("/en/") },
            { name: "Terms of Service", url: canonical("/en/terms") },
          ]),
        ]),
      },
    ],
  }),
  component: EnTermsPage,
});

const SECTIONS: Array<{ h: string; body: string[] }> = [
  {
    h: "1. The service",
    body: [
      'AirLane provides a visual network proxy client built on the sing-box core, cloud identity and device management, Mesh networking, and cloud resources including shared VPS and shared residential IPs (collectively, the "Service").',
      "Local client features (proxying, policies, rule evaluation) are free forever and require no registration.",
    ],
  },
  {
    h: "2. Account types",
    body: [
      "Anonymous account: created without email, relying on an access token and login code. If the code is lost and the token expires, the identity cannot be recovered.",
      "Full account: registered via email or a third-party provider (e.g. Google) with complete cloud capabilities.",
      "You are responsible for all activity under your account; keep your login code and credentials safe.",
    ],
  },
  {
    h: "3. Acceptable use",
    body: [
      "You must not use the Service for any unlawful purpose, including but not limited to: attacking networks, distributing malware, sending spam, infringing intellectual property, or abusing anti-fraud mechanisms at scale.",
      "Shared VPS and shared residential-IP resources are quota-limited; you may not resell, sublease or redistribute access to your quota.",
      "We may suspend or terminate identities and resources involved in abuse, without refunding unused portions.",
    ],
  },
  {
    h: "4. Quotas & limits",
    body: [
      "Anonymous accounts receive limited quotas (device binding, shared resources, etc.) as shown in the account center. Quotas may change with product policy.",
      "Requests exceeding quotas may be rejected; abusing anonymous creation (mass sign-ups, bypassing verification) leads to identity revocation.",
    ],
  },
  {
    h: "5. Availability & disclaimers",
    body: [
      'The Service is provided "as is". We strive for availability but do not warrant uninterrupted, error-free operation or fitness for your needs.',
      "To the maximum extent permitted by law, we are not liable for indirect, incidental or consequential damages arising from use of the Service.",
      "Upstream network quality of shared resources depends on their providers; we are not responsible for third-party network availability or content.",
    ],
  },
  {
    h: "6. Content & data",
    body: [
      "You retain all rights to your configurations and data. You grant us only the processing rights needed to provide the Service.",
      "You may delete your account and data at any time; we remove it per the retention terms in our Privacy Policy.",
    ],
  },
  {
    h: "7. Changes & termination",
    body: [
      "We may update these terms from time to time; material changes will be posted on this site. Continued use constitutes acceptance.",
      "You may stop using the Service and delete your account at any time. We may terminate access for violations of these terms.",
    ],
  },
  {
    h: "8. Contact",
    body: ["Questions about these terms: airlane@googlegroups.com."],
  },
];

function EnTermsPage() {
  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <header className="fixed top-0 inset-x-0 z-50">
        <div className="absolute inset-0 bg-cream/70 backdrop-blur-xl border-b border-ink/10" />
        <div className="relative max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/en/" className="flex items-center gap-2.5">
            <img src="/brand/lockup-on-light.svg" alt="AirLane" className="h-8 w-auto" />
          </Link>
          <Link
            to="/en/download"
            className="rounded-full bg-ink text-cream text-sm font-semibold px-5 py-2.5 shadow-card hover:bg-ink/90 transition"
          >
            Download
          </Link>
        </div>
      </header>

      <main className="pt-16">
        <article className="max-w-3xl mx-auto px-6 py-20">
          <h1 className="font-display text-4xl tracking-tight text-foreground">Terms of Service</h1>
          <p className="mt-3 text-sm text-muted-foreground">Last updated: September 2026</p>

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
            <Link to="/en/privacy" className="text-brand hover:underline">
              Privacy Policy →
            </Link>
          </p>
        </article>
      </main>
    </div>
  );
}
