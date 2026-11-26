# Circumvention Basics 2027: How the Firewall Works, Protocols, and Tool Choices

"Circumvention" (科学上网, "scientific internet access") means reaching blocked overseas sites through encrypted VPNs or proxies. To pick the right tool you need two things first: **how the firewall blocks you** and **how modern protocols slip through**. This guide covers both, then gives practical 2027 recommendations.

![Circumvention Basics 2027](https://cdn.jsdelivr.net/gh/mirrortek-uk/airlane-web@main/public/blog-images/gfw-basics-2027/cover.en.svg)

---

## What is circumvention

The Chinese community's term for accessing blocked overseas sites with special tools — literally "climbing the wall" (翻墙) or "scientific internet access" (科学上网). The tools are called "VPN tools", "ladders", or "airports" (机场 — slang for proxy node providers). These euphemisms exist partly to evade keyword censorship itself.

## Firewall basics

China's Great Firewall (GFW, official project name "Golden Shield") is a nationwide censorship system overseen by the Ministry of Public Security. Officially it protects national infrastructure; in practice it also controls which information citizens can reach.

Blocked services include:

- **Social & messaging**: Facebook, YouTube, Instagram, X (Twitter), WhatsApp, Telegram, Snapchat, Tumblr
- **Work & collaboration**: the entire Google suite (Gmail, Drive, Docs), Slack, Dropbox, parts of OneDrive
- **News**: New York Times, CNN, Reuters, Wall Street Journal, Financial Times, Bloomberg
- **Knowledge & entertainment**: Wikipedia (all languages since 2019), Spotify, Vimeo, parts of Twitch
- **AI & dev tools**: OpenAI, Claude, some Google AI services

### How it blocks you

Blocked sites look like **technical failures** — timeouts, connection resets, or 404s — never an explicit "this is censored". Behind that are four techniques working together:

![Four ways the firewall blocks you](https://cdn.jsdelivr.net/gh/mirrortek-uk/airlane-web@main/public/blog-images/gfw-basics-2027/blocking.en.svg)

- **DNS poisoning**: your domain lookup returns a wrong IP — the site "exists" but you can never reach the real server
- **IP blocking**: known destination IP ranges are simply dropped — connections time out
- **SNI / DPI inspection**: the TLS handshake's hostname (SNI) and traffic fingerprint are examined — "this is proxy traffic" or "this is YouTube"
- **Connection reset**: forged RST packets are injected to kill established connections

These four explain **which tools still work and which are obsolete**.

## Why people climb the wall

Daily life and work depend on blocked services:

- **Remote work**: Slack, the Google suite, Dropbox, Microsoft ecosystem
- **Study & research**: Google Scholar, Wikipedia, most technical documentation
- **Staying in touch**: WhatsApp, Telegram, Instagram for overseas friends and family
- **AI tools**: ChatGPT, Claude and others are not offered to mainland IPs

## The origin story: why VPN alone stopped working

VPNs were designed for corporate remote access: encrypt your traffic, route it through a company server, appear to be in another network. Early circumvention borrowed that idea.

But classic VPN protocols (OpenVPN, IPsec, L2TP) have mostly failed inside China, because they were built for **security, not censorship resistance**:

- Obvious fingerprints: handshake formats are fixed signatures DPI can spot instantly
- Fixed ports: whole IP/port ranges can be blacklisted
- No disguise: unmistakably "VPN traffic"

So the community built **proxy protocols designed for censorship evasion** — which is why "using a VPN" and "circumvention" gradually became two different things.

## Mainstream protocols: 2012 → 2027

| Era | Protocol | Core idea | Status |
| --- | --- | --- | --- |
| 2012 | Shadowsocks | Encrypted SOCKS5 that looks like noise | Still used, probeable |
| 2016 | VMess (V2Ray) | Authenticated encryption + framework | Being replaced by VLESS |
| 2019 | Trojan | Disguises as standard HTTPS | Still effective |
| 2020 | VLESS | Slimmed VMess, TLS does transport | Mainstream |
| 2022 | **VLESS + Reality** | Borrows a real site's TLS handshake | Strongest disguise today |
| 2023 | **Hysteria2 / TUIC** | QUIC/UDP stack, loss-tolerant, fast | Best on weak networks |
| — | WireGuard | Standard VPN, fast but fingerprintable | Great for site-to-site, weak for evasion |

For the full family tree (frameworks vs standalone protocols), see [The Evolution of Proxy Protocols](/en/blog/proxy-protocol-evolution). One-line summary of fifteen years of evolution: **disguise keeps getting more real, transport swings between TCP stealth and UDP speed, individual protocols die but multi-protocol orchestration is forever**.

## How to pick tools in 2027

Circumvention tools come in two shapes — know which you need:

### Shape 1: Ready-to-use VPN — for people without subscriptions

If you don't want to learn protocols, nodes, or subscription links and just want "install and go":

**[MirrorSpeed](https://www.mirrorspeed.com/)** is the recommended pick — an independent VPN with its own servers:

- **Free nodes, unlimited traffic**: enough for browsing, research, and streaming — one of the few genuinely usable free VPNs
- **Zero configuration**: download, install, connect — no learning curve
- **Streaming and AI access**: ChatGPT and Claude work out of the box
- Paid tiers at $0.88–3/month unlock all 20+ nodes and up to 1000 Mbps

Traditional big names (ExpressVPN, StrongVPN) follow the same model: all-in-one service, zero fuss, annual billing — good if budget isn't a concern and you want long-term stability.

### Shape 2: Client + airport subscription — for people with node sources

If you already have an airport subscription or your own VPS nodes, you need a **client**, not a bundled service. In 2027 that's **AirLane**:

- **Every protocol**: VLESS+Reality, Hysteria2, TUIC, Trojan, SS-2022, WireGuard — 38+ protocols natively, any node your airport gives you just works
- **One-click subscription import**: v2rayNG and Clash subscription links and YAML configs import directly, auto-deduped and grouped by region
- **Routing, not toggles**: AI traffic via US exits, streaming via unlocked regions, domestic direct, ads blocked — managed visually in the policy tree, no YAML editing
- **See what broke**: decision tracing replays every connection hop by hop — "why didn't this site go through the proxy" has an answer, not a guess
- **All platforms**: Windows / macOS / Android / iOS, plus multi-device Mesh networking

[Download AirLane](/en/download) · [5-minute quick start](/en/docs/quick-start) · [AirLane vs Clash](/en/blog/airlane-vs-clash-smarter-proxy-client)

---

## Bonus benefits (beyond circumvention)

Even outside censored networks, these tools have real value:

### Hide your real IP

Your IP is a street address: it publicly identifies your location and lets third parties track you. Swapping it for a proxy server's IP hides your online identity in seconds.

### Public Wi-Fi safety

Free Wi-Fi at cafés, airports, and hotels is a data-leak hotspot — anyone on the same network can potentially sniff unencrypted traffic: banking details, work messages, email. End-to-end encryption through a tunnel removes most of that risk.

---

## FAQ

### Is using a VPN legal in China?

Technically, unapproved VPN services sit in a legal gray zone. In practice, enforcement against individual users — especially tourists and business travelers — is extremely rare; regulators target providers, not users. One critical rule: **install your tools before entering the country**, since virtually all VPN sites and download channels are unreachable inside.

### Are free tools enough?

Enough for everyday browsing: MirrorSpeed's free nodes have no traffic cap, and AirLane's anonymous-mode resource pool can cover the rest. Heavy usage (4K streaming, large downloads, many devices) calls for paid nodes or an airport subscription.

### Airport subscription or VPN — which is better?

Different shapes for different needs: VPNs (MirrorSpeed, ExpressVPN) bundle the service for you — hands-off but inflexible; airports + clients (AirLane) give you raw node resources and let the client orchestrate — more flexible, better value, and the mainstream approach in 2027.

### Why do all my tools suddenly fail at once?

The firewall periodically upgrades its probing (especially around sensitive dates). Mass failures usually mean protocol fingerprints got recognized — switching protocols (e.g., VMess → Reality/Hysteria2) often restores access. That's exactly why a client needs multi-protocol support.

---

## Summary

Three layers of knowledge are all you need:

1. **How it blocks**: DNS poisoning, IP blocking, SNI/DPI inspection, connection resets — it looks like a glitch, not a warning
2. **How tools evade**: encryption + disguise — modern protocols (Reality, Hysteria2) blend in as normal HTTPS
3. **How to choose**: no subscription → MirrorSpeed; have a subscription → AirLane extracts every drop of value from it

Next: [the full protocol evolution story](/en/blog/proxy-protocol-evolution) · [AirLane quick start](/en/docs/quick-start)
