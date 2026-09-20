import { createFileRoute, Link } from "@tanstack/react-router";
import { canonical, jsonLd, breadcrumbSchema, organizationSchema } from "@/lib/seo";

export const Route = createFileRoute("/en/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy | AirLane" },
      {
        name: "description",
        content: "AirLane privacy policy: what we collect, how we use it, where it's stored, and your rights. Local proxy traffic never leaves your device.",
      },
      { property: "og:title", content: "Privacy Policy | AirLane" },
      { property: "og:type", content: "website" },
      { property: "og:url", content: canonical("/en/privacy") },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "canonical", href: canonical("/en/privacy") },
      { rel: "alternate", hrefLang: "zh-CN", href: canonical("/privacy") },
      { rel: "alternate", hrefLang: "en", href: canonical("/en/privacy") },
      { rel: "alternate", hrefLang: "x-default", href: canonical("/privacy") },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: jsonLd([
          organizationSchema("en"),
          breadcrumbSchema([
            { name: "Home", url: canonical("/en/") },
            { name: "Privacy Policy", url: canonical("/en/privacy") },
          ]),
        ]),
      },
    ],
  }),
  component: EnPrivacyPage,
});

const SECTIONS: Array<{ h: string; body: string[] }> = [
  {
    h: "1. Overview",
    body: [
      'This Privacy Policy explains how AirLane ("we") collects, uses and protects your information when you use the AirLane client, website (airlane.cloud and its subdomains) and cloud services.',
      'AirLane is "local-first": proxying, policies, rule evaluation and traffic processing all run on your device. We cannot see your proxied traffic.',
    ],
  },
  {
    h: "2. Data we collect",
    body: [
      "Anonymous identity: creating an anonymous account generates a random identity ID and stores SHA-256 hashes of the access token and login code — never plaintext. No email required.",
      "Full account: your email address (for sign-in and account notifications). When signing in via Google or other providers, we receive the email and basic profile they return.",
      "Device info: when pairing a client device we store its name, platform, client version and last-seen time.",
      "Cloud data: features you enable (Mesh group memberships, config snapshots) are stored at your direction.",
      "Human verification: anonymous account creation uses Cloudflare Turnstile, processed by Cloudflare under its own privacy policy.",
    ],
  },
  {
    h: "3. Data we do not collect",
    body: [
      "We do not log proxied traffic contents, visited websites or DNS query details.",
      "Rule evaluation, policy decisions and traffic forwarding run locally; decision logs stay on your device by default.",
      "We never upload local config files without your explicit action.",
    ],
  },
  {
    h: "4. Storage & third-party services",
    body: [
      "Account and identity data is stored in a Supabase-hosted PostgreSQL database.",
      "The website is hosted on Vercel; access logs are handled under Vercel's privacy policy.",
      "Sign-in may use Google OAuth, subject to Google's terms and privacy policy.",
      "Human verification uses Cloudflare Turnstile.",
    ],
  },
  {
    h: "5. Cookies & local storage",
    body: [
      "We use browser localStorage for your sign-in session and anonymous access token — not for tracking or advertising.",
      "The site does not use third-party advertising cookies.",
    ],
  },
  {
    h: "6. Your rights",
    body: [
      "You can view your identity ID, device list and quota usage in the account center.",
      "You can end an anonymous session at any time (deleting the cloud identity and its data) or contact us to delete a full account.",
      "Anonymous login codes are held only by you; we cannot recover a lost code.",
    ],
  },
  {
    h: "7. Data retention",
    body: [
      "Anonymous access tokens may expire after 90 days of inactivity; the login code can reactivate the identity at any time.",
      "Full account data is kept while the account is active; associated data is removed within a reasonable period after deletion.",
    ],
  },
  {
    h: "8. Changes",
    body: ["We may update this policy from time to time. Material changes will be posted on this site. Continued use constitutes acceptance."],
  },
  {
    h: "9. Contact",
    body: ["Questions about this policy: airlane@googlegroups.com."],
  },
];

function EnPrivacyPage() {
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
          <h1 className="font-display text-4xl tracking-tight text-foreground">Privacy Policy</h1>
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
            <Link to="/en/terms" className="text-brand hover:underline">
              Terms of Service →
            </Link>
          </p>
        </article>
      </main>
    </div>
  );
}
