# The Evolution of Proxy Protocols: From Shadowsocks to VLESS + Reality

Pick a node from any subscription and you'll see a parade of names: VMess, VLESS, Trojan, Hysteria2, TUIC, SS-2022… How do they relate? Why do some live inside V2Ray while others need their own program? Here's the full family tree — **and it turns out there are only two trees**.

![The evolution of proxy protocols](https://cdn.jsdelivr.net/gh/mirrortek-uk/airlane-web@main/public/blog-images/proxy-protocol-evolution/cover.en.svg)

---

## First, one concept: protocol ≠ framework

The mental model you need before anything else:

- **Protocol**: how traffic is encrypted, disguised, and carried. VMess is an encrypted auth format; Reality is a camouflage scheme.
- **Framework / core**: a single program that hosts many protocols. V2Ray, Xray, sing-box, and mihomo are all frameworks — you don't run "the VMess app," you run a core that *implements* VMess.

Most confusion comes from conflating the two: Trojan is both a protocol and a standalone program (Trojan-Go), yet it also runs embedded inside Xray; Hysteria2 is a purely standalone stack that no framework "natively owns" — newer cores just implement it too.

Keep that in mind and the family tree below makes sense.

![Frameworks vs standalone protocols](https://cdn.jsdelivr.net/gh/mirrortek-uk/airlane-web@main/public/blog-images/proxy-protocol-evolution/lineage.en.svg)

---

## The prologue: enterprise VPNs (pre-2012)

Before circumvention protocols existed, "VPN" meant enterprise gear: PPTP, L2TP/IPsec, OpenVPN. They were designed to **securely reach a corporate LAN**, not to resist censorship — fixed handshakes, fixed ports, obvious fingerprints. DPI systems flag and block them trivially.

**The lesson carried forward**: surviving a hostile network means your traffic can't "look like a known protocol."

## Revolution one: Shadowsocks (2012–2015)

clowwindy's Shadowsocks was the watershed. The approach inverted completely: **don't build a VPN — build a SOCKS5 proxy that looks like random noise**. Full encryption, no handshake signature, no fixed format — DPI just sees an inscrutable byte stream.

Light, fast, easy to deploy — SS single-handedly dropped the barrier to "one binary + one command." The ShadowsocksR fork added obfuscation parameters but was abandoned, and plain SS was eventually fingerprinted anyway — **having no features turned out to be a feature**.

## The framework era: V2Ray and VMess (2016–2020)

V2Ray (Project V)'s real innovation wasn't a protocol — it was the **framework idea**: one program where protocols, transports, and routing rules compose plug-and-play. Its native protocol, VMess, used timestamp-based auth + AEAD encryption, far safer than SS's fixed passwords.

The ecosystem split settled in:

- **V2Ray (framework)** ↔ hosting VMess, VLESS, Trojan
- **Clash** rose in parallel, solving rule-based routing — but still "protocols run inside cores"

**Trojan** (2019) pushed camouflage to the next stage: stop hiding — **pretend to be HTTPS outright**. TLS handshake + password auth made proxy traffic nearly indistinguishable from real browsing. It also set a recurring pattern: a standalone implementation (Trojan-Go) plus embedded support inside frameworks.

## Forks and leaps: Xray, XTLS, Reality (2020–2022)

As V2Ray's original team slowed, the community forked **Xray-core** and kept evolving along the same line — with key differentiators:

- **XTLS / XTLS Vision**: precise reassembly of post-handshake TLS flows, erasing the chunk-size fingerprints early proxies left behind
- **VLESS**: a stripped-down VMess with no built-in encryption, delegating security entirely to the transport (TLS) — paving the road for Reality
- **Reality (2022, the watershed)**: the endgame of camouflage. Instead of *imitating* HTTPS, it **borrows a real major site's TLS handshake** (e.g., microsoft.com). Active probes get a genuine certificate, genuine parameters, genuine server behavior — indistinguishable at the protocol layer. For the first time, anti-detection went from "looks like" to "literally is"

That same year **Shadowsocks-2022** rewrote SS's crypto layer with modern AEAD ciphers. Note its status: **a standalone protocol that Xray merely supports** — not a framework-native protocol like VMess/VLESS.

## Two trees complete: the QUIC independents (2022–now)

A parallel line of UDP/QUIC protocols grew up as **full standalone programs, owned by no framework**:

- **Hysteria / Hysteria2**: QUIC stack with an aggressively tuned congestion controller — king of lossy links
- **TUIC**: a refined independent QUIC implementation with elegant multiplexing
- **WireGuard**: not a circumvention protocol per se, but essential for Mesh networking

Meanwhile the framework side finished consolidating:

- **Clash → mihomo**: in November 2023 the Clash repo was deleted and abandoned; the community forked mihomo to carry it forward
- **sing-box**: the new-generation universal core that unified **both** the V2Ray-lineage protocols (VMess/VLESS/Trojan/Reality) and the independents (Hy2/TUIC/SS-2022) into one data plane

The family tree is now complete: **one "frameworks carrying protocols" tree (V2Ray→Xray→mihomo/sing-box), one "standalone protocols" tree (SS-2022, Trojan-Go, TUIC, Hy2) — and the new cores swallowed both.**

---

## Three lessons from fifteen years

**1. Camouflage iterates toward "ever more real"**

Random traffic (SS) → imitated TLS (Trojan) → borrowed TLS (Reality). Each generation fixes the previous one's identifiability. **There's no final answer — only a current leader.** Reality is untouchable today, but statistical traffic analysis keeps evolving.

**2. Transport keeps swinging between TCP and UDP**

TCP protocols (Reality) hide well but suffer on weak links; QUIC protocols (Hy2/TUIC) fly but get throttled where UDP is limited. Both tracks will coexist — **no single transport wins every environment**.

**3. Protocols die; frameworks reorganize; multi-protocol survival is constant**

VMess aged out, SS got rewritten twice, the original Clash repo is gone — yet none of them truly disappeared; they were absorbed into bigger cores. **Betting on one protocol is a dead end; the ability to orchestrate many is the real asset.**

---

## And that's why AirLane

If the history has one ultimate takeaway: **what you need is "every protocol + smart dispatch," not "the right one."**

**1. Both trees, fully covered**

AirLane runs on the sing-box core with 38+ native protocols: the V2Ray lineage (VMess/VLESS/Trojan), Xray's exclusives (XTLS Vision, Reality), and the independents (Hysteria2/TUIC/SS-2022/WireGuard) — **every node on the family tree runs**. Import Clash or V2Ray subscriptions and self-hosted nodes with one click.

**2. Let each flow use the era-appropriate protocol**

History proves there's no silver bullet: stealth calls for Reality, speed calls for Hy2, mesh calls for WireGuard. AirLane's policy tree assigns protocols **per traffic class** — video takes QUIC for throughput, logins take Reality for camouflage — instead of locking your whole device to one choice.

**3. Survivability in complex environments**

UDP blocked? Reality's TCP takes over. Packet loss exploding? Hy2's brutal congestion control pushes through. Node burned? Health checks fail over to the next exit. AirLane turns protocol-layer adaptability into a product feature — **protocols rise and fall as history dictates; what survives is the ability to dispatch**.

---

## Summary

| Era | Representative | Core idea | Alive today? |
|-----|---------------|-----------|--------------|
| Enterprise VPN | OpenVPN/IPsec | Encrypted tunnels | Dead for circumvention |
| Lightweight proxy | Shadowsocks | Randomized traffic | Survives via SS-2022 |
| Framework era | VMess/VLESS | Pluggable protocols in one core | Still the installed base |
| Camouflage leap | Reality/Trojan | Genuine TLS handshakes | Reality = stealth ceiling |
| QUIC independents | Hy2/TUIC | UDP performance | First choice for speed |
| Universal cores | sing-box/mihomo | One core runs everything | **Current mainstream** |

Fifteen years of evolution produced no "ultimate protocol" — it produced **an ecosystem where many protocols coexist and get dispatched per scenario**. AirLane stands at the end of that tree — and at the start of the next one.

→ [Download AirLane](https://www.airlane.cloud/download) · [38+ protocol support](https://www.airlane.cloud)
