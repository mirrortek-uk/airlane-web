# AirLane — Open-Source Sing-box GUI & Proxy Client

**AirLane** is a cross-platform **Sing-box GUI**, **proxy client**, and **network proxy manager** — a modern **open-source Clash alternative** for Windows, macOS, Linux, iOS, and Android. It pairs the sing-box core with a visual dashboard for nodes, routing rules, DNS, leak detection, and traffic insights.

**Website:** [airlane.cloud](https://www.airlane.cloud) · **Download:** [airlane.cloud/download](https://www.airlane.cloud/download) · **Store:** [poolvip.airlane.cloud](https://poolvip.airlane.cloud)

## Why AirLane?

- **Sing-box GUI / Dashboard / Control Panel** — visual node manager, outbound groups, and per-app routing without editing JSON.
- **Clash & NekoBox alternative** — import Clash/V2Ray subscriptions, migrate configs, keep your workflow.
- **Full protocol support** — VLESS (Reality / XTLS Vision), VMess, Trojan, Shadowsocks, Hysteria2, TUIC, WireGuard, and standard subscription formats.
- **DNS & leak protection** — Fake-IP / split-DNS management, DNS leak test, WebRTC/IPv6 leak detection.
- **Network dashboard** — node latency, health monitoring, traffic visualization, and route analysis.
- **Cross-platform** — desktop via Tauri (Windows/macOS/Linux) plus iOS and Android builds.

## Keyword index

Looking for a specific use case? These pages go deeper:

| Search intent | Page |
|---|---|
| Sing-box GUI / client / desktop / manager | [airlane.cloud/sing-box-gui](https://www.airlane.cloud/sing-box-gui) |
| Clash alternative / Clash Verge replacement | [airlane.cloud/clash-alternative](https://www.airlane.cloud/clash-alternative) |
| Mihomo alternative | [airlane.cloud/mihomo-alternative](https://www.airlane.cloud/mihomo-alternative) |
| NekoBox alternative | [airlane.cloud/nekobox-alternative](https://www.airlane.cloud/nekobox-alternative) |
| V2RayN alternative | [airlane.cloud/v2rayn-alternative](https://www.airlane.cloud/v2rayn-alternative) |
| Qv2ray alternative | [airlane.cloud/qv2ray-alternative](https://www.airlane.cloud/qv2ray-alternative) |
| Hiddify alternative | [airlane.cloud/hiddify-alternative](https://www.airlane.cloud/hiddify-alternative) |
| Hysteria2 client / GUI | [airlane.cloud/hysteria2-client](https://www.airlane.cloud/hysteria2-client) |
| VLESS Reality client / desktop | [airlane.cloud/vless-reality-client](https://www.airlane.cloud/vless-reality-client) |
| TUIC client / GUI | [airlane.cloud/tuic-client](https://www.airlane.cloud/tuic-client) |
| Trojan client / GUI | [airlane.cloud/trojan-client](https://www.airlane.cloud/trojan-client) |
| Shadowsocks client / manager | [airlane.cloud/shadowsocks-client](https://www.airlane.cloud/shadowsocks-client) |
| VMess client / GUI | [airlane.cloud/vmess-client](https://www.airlane.cloud/vmess-client) |
| WireGuard client / manager | [airlane.cloud/wireguard-client](https://www.airlane.cloud/wireguard-client) |

## Development

Node.js + npm required.

```sh
git clone https://github.com/mirrortek-uk/airlane-web.git
cd airlane-web
npm i
npm run dev
```

## Built with

- TanStack Start + React + TypeScript
- Tauri (Rust core) for desktop/mobile shells
- sing-box network core
- Tailwind CSS
