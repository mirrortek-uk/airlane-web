# Welcome to AirLane

**AirLane is a visual traffic-orchestration client**: powered by the sing-box kernel, it wraps nodes, protocols, rules and exits into a policy system you can actually see — 38+ protocols, a visual policy tree, decision-level chain tracing and automation Profiles, across Windows, macOS, iOS and Android.

This guide tours every module of AirLane with real UI screenshots (taken from the Windows build v1.0.4; layout is identical on other platforms).

## AirLane vs. a typical proxy client

| | Typical proxy client | AirLane |
|---|---|---|
| Configuration | Hand-written YAML / JSON | Visual policy tree, compiled and pushed |
| Routing granularity | Static rule lists | Four-layer model: classifier → behavior → policy → exit pool |
| Observability | Connection logs | Route path, hit analytics, chain trace, traffic attribution |
| Failure handling | Manual node switching | Health-checked automatic failover with a self-healing log |
| Node sources | Your own subscriptions | Subscriptions + PoolVIP shared pool + Mesh + shared VPS |

## The seven modules

The left navigation is organized into seven numbered modules:

| Module | What it does |
|---|---|
| 01 Dashboard | Connect switch, live traffic, route path, exit selection |
| 02 Network | Exit groups, LAN sharing |
| 03 Subscriptions | Import, dedup & grouping, share & export |
| 04 Policies | Classifiers, behaviors, policies, exit pools, rule sets, route chain |
| 05 Insights | Live connections, traffic ranking, attribution, stability reports |
| 06 Tools | Unlock test, chain trace, leak test, diagnostics, automation |
| 07 Settings | Identity, TUN, DNS, kernel, routing profiles |

## Dashboard: connection status at a glance

![AirLane dashboard: connection card, live traffic and network health](https://cdn.jsdelivr.net/gh/mirrortek-uk/airlane-web@main/public/docs-images/welcome/dashboard.png)

- **Connection card**: current exit node, protocol, latency and health score, one-click connect/disconnect
- **Live traffic**: upload/download throughput curves
- **Network health**: per-exit latency bars refreshing in real time

![Route path visualization and the exit selection table](https://cdn.jsdelivr.net/gh/mirrortek-uk/airlane-web@main/public/docs-images/welcome/route-path.png)

The **route path** draws the chain every request walks: local IP → TUN inbound → domain sniffing (Sniff + Fake-IP) → rule matching → exit group → current exit → exit IP.

The **exit table** lists every available exit sorted live by latency, jitter, loss and composite score — 213 exits online in this capture.

## Network: exit groups and LAN sharing

![Exit groups: AI, streaming, social and more](https://cdn.jsdelivr.net/gh/mirrortek-uk/airlane-web@main/public/docs-images/welcome/exit-groups.png)

Exits are grouped **by purpose**: AI services via the US, streaming via Germany, social via the UK — each group has its own selector and never interferes with the others.

![LAN sharing settings](https://cdn.jsdelivr.net/gh/mirrortek-uk/airlane-web@main/public/docs-images/welcome/lan-share.png)

Turn on **LAN sharing** and phones, TVs and tablets can use the computer's exits as a proxy (default port 7891, optional access auth) — no per-device setup needed.

## Subscriptions: nodes and configs

![Add config: remote subscription, local file, manual node](https://cdn.jsdelivr.net/gh/mirrortek-uk/airlane-web@main/public/docs-images/welcome/add-subscription.png)

Three import paths: remote subscription URL, local file, or a single manual node — with scheduled auto-update and provider management.

Advanced subscription features:

- **Auto dedup & region grouping**: deduplicated by node fingerprint (213 → 175), grouped into 13 regions
- **One-click Clash migration**: import Clash YAML and get a migration report — rules carry over intact
- **Version snapshots**: every change saved as a v1–v5 snapshot, diffable and rollbackable
- **Share & export**: node links, QR codes, Clash YAML, sing-box JSON, AIRLANE config packs, WebDAV backup

## Policies: the heart of AirLane

![Policy overview: classifiers, behaviors, policies and exit pools](https://cdn.jsdelivr.net/gh/mirrortek-uk/airlane-web@main/public/docs-images/welcome/policy-overview.png)

All traffic flows through a four-layer model:

| Layer | Concept | Role |
|---|---|---|
| 1 | **Classifier** | Tag traffic by domain / IP / process / protocol |
| 2 | **Behavior** | Decide the action: Route / Direct / Block / Reject / DNS |
| 3 | **Policy** | Bind an exit pool and pick a selector: auto / smart / manual / failover / load-balance |
| 4 | **Exit pool** | Candidate node set, organized by region and health |

Rule sets support GEOSITE, GEOIP, remote rule-providers and built-in local sets (e.g. AirLane-AI, AirLane-Ads).

![Route chain: the compiled match order](https://cdn.jsdelivr.net/gh/mirrortek-uk/airlane-web@main/public/docs-images/welcome/route-chain.png)

The **route chain** shows the real match order after your policies compile into sing-box — not a config file, but the running route table, with per-rule hit counts. Companion tools:

- **Hit analytics**: cumulative / daily hit counts and traffic per policy; zero-hit rules stand out
- **Match simulator**: enter any domain (e.g. `chat.openai.com`) to preview which rule it hits and which exit it takes — with a "why" explanation

## Insights: where every byte goes

![Live connections: process, domain, rule and exit per connection](https://cdn.jsdelivr.net/gh/mirrortek-uk/airlane-web@main/public/docs-images/welcome/connections.png)

- **Live connections**: every active connection's process, target domain, matched rule and exit, tallied as proxied / direct / blocked
- **Traffic ranking**: top talkers by SNI domain or process
- **Traffic attribution**: how much traffic each exit node consumed, with weekly/monthly reports
- **Latency & stability**: 24h latency curve, P95, 7-day availability and switch count
- **Kernel log**: raw sing-box logs, filterable by level

## Tools: a professional diagnostic suite

![Chain trace: per-hop timing breakdown for a domain](https://cdn.jsdelivr.net/gh/mirrortek-uk/airlane-web@main/public/docs-images/welcome/chain-trace.png)

**Chain trace** breaks a domain's full path into hops: inbound → DNS → classifier → policy → exit → target, each timed separately so the slow hop is obvious.

![Unlock test: streaming and AI availability matrix](https://cdn.jsdelivr.net/gh/mirrortek-uk/airlane-web@main/public/docs-images/welcome/unlock-test.png)

- **Unlock test**: Netflix / Disney+ / ChatGPT / YouTube / TikTok matrix with real exit regions (unlocked / partial / unavailable)
- **Leak test**: five-dimension check across exit, DNS, coverage, routing and browser privacy, plus strict WebRTC/STUN blocking and IPv6 egress control
- **Config check**: 11 validations against the sing-box config about to be generated; fixable items auto-repair
- **Network diagnostics**: 14 live checks (kernel, proxy port, TUN, DNS…) with a self-healing failover log and exportable report

![Automation: Profiles, network awareness and scheduled tasks](https://cdn.jsdelivr.net/gh/mirrortek-uk/airlane-web@main/public/docs-images/welcome/automation.png)

**Automation** lets AirLane act on its own: Profiles (whole policy + DNS sets, switchable in one click), network-aware triggers (switch Profile when Wi-Fi changes), and scheduled tasks.

## Settings: system and kernel

![Network settings: TUN mode, system proxy and mixed port](https://cdn.jsdelivr.net/gh/mirrortek-uk/airlane-web@main/public/docs-images/welcome/settings-network.png)

- **TUN mode**: system-level traffic capture, IPv4/IPv6 dual-stack (requires admin and the Wintun driver; the kernel service keeps it alive without re-elevation)
- **System proxy / mixed port**: HTTP/HTTPS takeover via system proxy; local mixed port defaults to 7890
- **Domain sniffing**: sniff TLS SNI / HTTP Host / QUIC on bare-IP traffic before routing
- **DNS**: mainland-China / overseas schemes, DoH, Fake-IP (198.18.0.0/15), pollution detection, split-DNS leak prevention
- **Kernel**: sing-box, MUX multiplexing, log level, automatic snapshot before apply

![Identity mode: user account vs. anonymous mode](https://cdn.jsdelivr.net/gh/mirrortek-uk/airlane-web@main/public/docs-images/welcome/settings-user.png)

**Identity mode** decides how configs and shared resources sync:

- **User account**: username/password, email OTP or Google SSO, full quotas
- **Anonymous mode**: no credentials — generate a pairing code on airlane.cloud (XXXX-XXXX, valid 10 min, single use) to bind up to 2 devices, with access to shared VPS, residential-IP and Mesh resources

**Routing Profiles** in config management snapshot your policies, rule sets and user rules — the built-in "AirLane recommended" profile works out of the box; advanced users can view and edit the final sing-box `config.json` directly.

When minimized to the tray, the tray menu switches each group's exit or disconnects without opening the main window.

## Up and running in five minutes

1. [Download](/en/download) the build for your platform
2. Open **Subscriptions** and paste a subscription URL or import a Clash YAML
3. Make sure the "AirLane recommended" routing profile is active in Settings
4. Back on the Dashboard, hit connect — exits are already grouped by purpose
5. Open **Tools → Chain trace** and verify a domain exits where you expect

Full walkthrough: [Quick Start](/en/docs/quick-start).

## Privacy and data

- **Local-first**: while signed out, everything stays on the device; node credentials live in the system keychain (Credential Manager / Keychain)
- **Sign-in is only for sync**: identity, quotas and PoolVIP / Mesh shared resources need an account; proxied traffic never passes through AirLane servers
- **Anonymous mode**: no email or password — bind with a pairing code; long-offline anonymous identities are reclaimed

## FAQ

### What kernel does AirLane use?

sing-box. AirLane builds a visual policy layer on top of it — the policy tree compiles to a native sing-box config.json; no fork, no private protocol.

### Can I use it without an account?

Yes. Everything runs locally while signed out. For multi-device sync or shared resources, pick anonymous mode (pairing code, no email) or register an account.

### Which proxy protocols are supported?

38+, including Hysteria2, TUIC, VLESS + Reality, Trojan, Shadowsocks-2022, VMess, WireGuard — all natively via the sing-box kernel. See [the protocol evolution story](/en/blog/proxy-protocol-evolution).

### How is AirLane different from Clash / mihomo clients?

Clash/mihomo are rule-driven proxy kernels. AirLane adds a full visual policy system on top: a four-layer traffic model, the compiled route chain, hit analytics, chain tracing, automation Profiles, plus PoolVIP / Mesh cloud resources.

### Which platforms are supported?

Windows, macOS, iOS and Android, with a consistent UI.

### Is my traffic logged or uploaded?

No. Connection records and traffic stats stay on the device. AirLane servers only carry account, quota and shared-resource metadata — never your proxied traffic.

## Next steps

- [Quick Start](/en/docs/quick-start): add an exit, create policies, verify with chain trace
- [Account Center](/en/docs/account-center): anonymous identities, pairing codes, devices and quotas
- [Blog](/en/blog): protocol explainers and hands-on guides
