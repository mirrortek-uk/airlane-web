# -*- coding: utf-8 -*-
# AirLane docs seed: upserts doc_sections + doc_pages for the full IA.
# Usage: python docs_seed.py   (reads SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY from .env)
import json, urllib.request

env = {}
for line in open('.env', encoding='utf-8'):
    if '=' in line and not line.startswith('#'):
        k, v = line.strip().split('=', 1)
        env[k] = v.strip('"').strip("'")

BASE = env['SUPABASE_URL'].rstrip('/') + '/rest/v1'
KEY = env['SUPABASE_SERVICE_ROLE_KEY']
H = {'apikey': KEY, 'Authorization': 'Bearer ' + KEY, 'Content-Type': 'application/json'}

def req(method, path, payload=None):
    r = urllib.request.Request(
        BASE + path, method=method,
        data=json.dumps(payload, ensure_ascii=False).encode('utf-8') if payload is not None else None,
        headers={**H, 'Prefer': 'return=representation'})
    raw = urllib.request.urlopen(r).read()
    return json.loads(raw) if raw else []

IMG = 'https://cdn.jsdelivr.net/gh/mirrortek-uk/airlane-web@main/public/docs-images'

SECTIONS = [
    {'slug': 'getting-started', 'title_zh': '开始使用', 'title_en': 'Getting Started', 'position': 1},
    {'slug': 'client-ui', 'title_zh': '客户端界面', 'title_en': 'Client UI', 'position': 2},
    {'slug': 'scenarios', 'title_zh': '场景教程', 'title_en': 'Scenarios', 'position': 3},
    {'slug': 'mesh', 'title_zh': 'Mesh 组网', 'title_en': 'Mesh Networking', 'position': 4},
    {'slug': 'account', 'title_zh': '账号与资源池', 'title_en': 'Account & Resources', 'position': 5},
    {'slug': 'troubleshooting', 'title_zh': '故障排查', 'title_en': 'Troubleshooting', 'position': 6},
    {'slug': 'protocols', 'title_zh': '参考', 'title_en': 'Reference', 'position': 7},
]

STUB_ZH = '> 本页正在编写中。可以先看看相关页面，或到 [GitHub](https://github.com/mirrortek-uk/airlane-web/issues) 提问。\n\n- [欢迎使用 AirLane](/docs/welcome)\n- [Mesh 是什么](/docs/mesh-intro)\n- [共享网络资源池](/docs/poolvip)\n'
STUB_EN = '> This page is being written. In the meantime, check related pages or ask on [GitHub](https://github.com/mirrortek-uk/airlane-web/issues).\n\n- [Welcome to AirLane](/en/docs/welcome)\n- [What is Mesh](/en/docs/mesh-intro)\n- [Shared resource pool](/en/docs/poolvip)\n'

PAGES = []

PAGES.append({
 'section': 'getting-started', 'position': 2, 'published': True,
 'slug': 'install',
 'title_zh': '下载与安装', 'title_en': 'Download & Install',
 'summary_zh': '按平台获取 AirLane 客户端并完成安装：Windows、macOS、Linux、Android、iOS。',
 'summary_en': 'Get the AirLane client for your platform and finish installation: Windows, macOS, Linux, Android and iOS.',
 'body_zh': '''AirLane 提供 Windows、macOS、Android、iOS 客户端，全部平台共享同一套策略树、订阅和 Mesh 能力。最新版本可以在 [下载页](/download) 或 GitHub Releases 获取。

<div class="co note"><div><div class="co-t">下载渠道</div>推荐从 <a href="/download">airlane.cloud/download</a> 下载，页面会自动识别平台并给出最新安装包；也可以到 GitHub Releases 手动选择。</div></div>

## Windows

1. 下载 Windows 安装包（`.exe` 或 `.msi`）。
2. 双击运行。如果出现 SmartScreen 提示，点「仍要运行」——安装包是正规签名的，新发布的版本可能还没积累信誉。
3. 首次启动如需 TUN 模式，客户端会请求管理员权限以安装虚拟网卡驱动（Wintun），允许即可。
4. 应用依赖系统自带的 WebView2 运行时；Windows 10/11 一般已内置，极少数精简系统会提示先安装 WebView2。

## macOS

1. 下载 `.dmg`（注意区分 Apple Silicon / Intel 版本）。
2. 将 AirLane 拖入 Applications。
3. 首次打开如果提示「无法验证开发者」，到 **系统设置 → 隐私与安全性** 点「仍要打开」，或右键图标选「打开」。
4. 启用 TUN 模式时系统会要求输入密码授权安装网络扩展。

## Linux

Linux 桌面版正在规划中。当前可以在 Linux 上通过命令行使用兼容的 sing-box 内核配置，或先用网页版 [仪表盘](/app) 管理账号与资源池。关注[更新日志](/docs/changelog)获取发布通知。

## Android

1. 从[下载页](/download)获取 APK。
2. 安装时按提示允许「安装未知来源应用」。
3. 首次启动会请求 VPN 权限，授予后即可工作。

## iOS

iOS 客户端通过 App Store 分发，下载页会跳转到商店链接。首次启动同样会请求添加 VPN 配置。

<div class="co tip"><div><div class="co-t">安装完成后</div>跟着 <a href="/docs/quick-start">5 分钟快速上手</a>完成首次配置：选身份模式 → 导入订阅 → 启用「AirLane 推荐」分流方案。</div></div>''',
 'body_en': '''AirLane ships clients for Windows, macOS, Android and iOS. All platforms share the same policy tree, subscriptions and Mesh capabilities. Get the latest build from the [download page](/download) or GitHub Releases.

<div class="co note"><div><div class="co-t">Download sources</div>The <a href="/download">airlane.cloud/download</a> page detects your platform and serves the latest installer. GitHub Releases lists every artifact for manual pick.</div></div>

## Windows

1. Download the Windows installer (`.exe` or `.msi`).
2. Run it. If SmartScreen warns, choose **Run anyway** — the installer is signed; freshly released builds simply haven't built reputation yet.
3. On first launch with TUN mode the client asks for admin rights to install the virtual NIC driver (Wintun). Allow it.
4. The app uses the system WebView2 runtime, which ships with Windows 10/11. Stripped-down images may be prompted to install it first.

## macOS

1. Download the `.dmg` (pick Apple Silicon vs Intel correctly).
2. Drag AirLane into Applications.
3. If Gatekeeper says the developer can't be verified, open **System Settings → Privacy & Security** and click **Open Anyway**, or right-click the icon → Open.
4. Enabling TUN mode prompts for your password to install the network extension.

## Linux

A desktop Linux build is planned. Meanwhile you can run a compatible sing-box core config, or manage your account and resource pool from the [dashboard](/app). Watch the [changelog](/en/docs/changelog) for release news.

## Android

1. Get the APK from the [download page](/download).
2. Allow "install unknown apps" when prompted.
3. Grant the VPN permission on first launch and it works immediately.

## iOS

The iOS client is distributed via the App Store — the download page links straight to it. On first launch, approve adding a VPN configuration.

<div class="co tip"><div><div class="co-t">After install</div>Follow <a href="/en/docs/quick-start">Quick Start in 5 minutes</a>: pick an identity mode → import a subscription → enable the recommended routing profile.</div></div>''',
})

PAGES.append({
 'section': 'getting-started', 'position': 4, 'published': True,
 'slug': 'import-subscription',
 'title_zh': '导入订阅', 'title_en': 'Import a Subscription',
 'summary_zh': '三种方式把节点带进 AirLane：订阅链接、Clash 配置迁移、手动添加——自动去重并按地区分组。',
 'summary_en': 'Three ways to bring nodes into AirLane: subscription URL, Clash config migration, manual import — auto deduped and grouped by region.',
 'body_zh': '''AirLane 通过「订阅」管理远端节点。支持订阅链接、Clash / Mihomo 配置一键迁移、以及手动粘贴节点链接三种导入方式。

<div class="shot"><div class="frame"><span class="frame-t">订阅 · 添加 AirLane 订阅</span><img class="frame-img" src="{IMG}/welcome/add-subscription.png" alt="添加订阅窗口：输入订阅地址，支持本地/远端/手动三种来源，勾选自动更新和到期检测"></div><p class="cap">添加订阅：填一个订阅地址就够了，其余交给 AirLane</p></div>

## 导入方式对比

| 方式 | 适合 | 入口 |
| --- | --- | --- |
| 订阅链接 | 机场 / 服务商提供的订阅地址 | 订阅 → 添加订阅 → 远端 |
| Clash 迁移 | 已有 Clash / Mihomo YAML 配置 | 订阅 → 添加订阅 → 从 Clash 导入 |
| 手动添加 | 单个或少量节点链接（vless://、hy2:// 等） | 订阅 → 添加订阅 → 手动 |

## 导入之后会发生什么

- **自动去重**：按指纹合并重复节点，去重报告会告诉你删掉了多少条（见[节点与订阅](/docs/nodes)）。
- **地区分组**：按节点地区自动生成分组，如「香港」「美国」，供策略树绑定。
- **自动更新**：勾选「自动更新」后订阅会定期刷新，支持设置更新周期。
- **到期检测**：订阅包含套餐信息时会跟踪流量和到期时间，快到期会提醒。

<div class="co tip"><div><div class="co-t">迁移不用手工搬运</div>Clash 配置导入后会解析所有节点、按地区建组，并生成一份迁移报告——哪些节点成功、哪些协议需要留意，一目了然。</div></div>

## 更新与回滚

- 每次更新前自动保存**快照**，更新失败或节点异常时一键回滚。
- 「上次更新 · 来源 · 更新间隔」显示在订阅条上，随时可查。

## 分享与备份

订阅管理面板支持生成分享链接、二维码、整套订阅打包导出，以及 WebDAV 备份——详见[节点与订阅 → 分享与备份](/docs/nodes#share)。''',
 'body_en': '''AirLane manages remote nodes through Subscriptions. Three import paths are supported: a subscription URL, one-click Clash / Mihomo config migration, and manually pasting node links.

<div class="shot"><div class="frame"><span class="frame-t">Subscriptions · Add AirLane subscription</span><img class="frame-img" src="{IMG}/welcome/add-subscription.png" alt="Add subscription dialog with local/remote/manual sources, auto-update and expiry checks"></div><p class="cap">Add a subscription: one URL is all it needs (UI shown in Chinese)</p></div>

## Import paths

| Method | Best for | Entry |
| --- | --- | --- |
| Subscription URL | URLs provided by your service | Subscriptions → Add → Remote |
| Clash migration | Existing Clash / Mihomo YAML | Subscriptions → Add → From Clash |
| Manual | Single node links (`vless://`, `hy2://`…) | Subscriptions → Add → Manual |

## What happens on import

- **Dedup**: duplicate nodes are merged by fingerprint; a report shows how many were dropped (see [Nodes & Subscriptions](/en/docs/nodes)).
- **Region groups**: nodes are grouped by region automatically (e.g. "Hong Kong", "United States") for the policy tree to bind.
- **Auto-update**: enable it and the subscription refreshes on a configurable interval.
- **Expiry tracking**: plan traffic and expiry are tracked when the subscription carries them, with reminders near the end.

<div class="co tip"><div><div class="co-t">No manual migration</div>A Clash import parses every node, builds region groups and produces a migration report — what succeeded and which protocols need attention.</div></div>

## Update & rollback

- A **snapshot** is saved before every refresh; roll back instantly if an update misbehaves.
- Each subscription row shows last update time, source and interval.

## Sharing & backup

The panel generates share links, QR codes, full-subscription exports and WebDAV backups — see [Nodes & Subscriptions → Sharing](/en/docs/nodes#share).''',
})

PAGES.append({
 'section': 'client-ui', 'position': 1, 'published': True,
 'slug': 'ui-overview',
 'title_zh': '主界面总览', 'title_en': 'Main Window Overview',
 'summary_zh': '一次看懂 AirLane 主窗口：左侧模块导航、仪表盘卡片、状态栏与托盘。',
 'summary_en': 'A tour of the AirLane main window: module navigation, dashboard cards, status bar and tray.',
 'body_zh': '''主窗口左侧是模块导航：**仪表盘、网络、订阅、策略、洞察、工具、设置**，右侧是当前模块的内容区。窗口右下角常驻内存占用，顶部状态栏显示当前代理模式与界面主题。

<div class="shot"><div class="frame"><span class="frame-t">仪表盘 · AirLane</span><img class="frame-img" src="{IMG}/welcome/dashboard.png" alt="AirLane 仪表盘：左侧模块导航，连接卡片、今日流量、健康度、转发路径等卡片"></div><p class="cap">仪表盘：打开客户端看到的第一屏</p></div>

## 仪表盘卡片

- **连接**：一键启停代理，显示当前模式（TUN/系统代理）与工作时长。
- **今日流量**：上传/下载量与趋势。
- **健康度**：出口可用性概览。
- **转发路径**：当前流量从入站到出站的完整链路（入口 → 分类 → 策略 → 出口）。

<div class="shot"><div class="frame"><span class="frame-t">转发路径</span><img class="frame-img" src="{IMG}/welcome/route-path.png" alt="转发路径卡片：入口→分类器→行为→策略→出口→目标"></div><p class="cap">转发路径：四层调度模型的实时可视化</p></div>

## 状态栏与托盘

- **状态栏**：显示「未连接 / 已连接」、当前代理模式（如 TUN）、主题切换。
- **托盘图标**：右键菜单可直接切换「关闭 / 系统代理 / TUN 模式」，并列出所有出口供快速切换——见[设置 → 托盘](/docs/settings#tray)。

## 各模块一页直达

| 模块 | 讲什么 | 文档 |
| --- | --- | --- |
| 网络 | 出口池、局域网共享 | [节点与订阅](/docs/nodes) |
| 订阅 | 导入、迁移、快照 | [节点与订阅](/docs/nodes) |
| 策略 | 四层调度模型 | [策略树](/docs/policy-tree) |
| 洞察 | 连接与日志 | [连接与日志](/docs/connections) |
| 工具 | 诊断、追踪、解锁测试 | [决策追踪](/docs/decision-trace) |
| 设置 | 网络 / DNS / 内核 / 身份 | [设置](/docs/settings) |''',
 'body_en': '''The left rail lists the modules — **Dashboard, Network, Subscriptions, Policy, Insights, Tools, Settings** — and the right pane shows the active one. Memory usage sits at the bottom-right; the status bar shows the proxy mode and theme.

<div class="shot"><div class="frame"><span class="frame-t">Dashboard · AirLane</span><img class="frame-img" src="{IMG}/welcome/dashboard.png" alt="AirLane dashboard: module rail plus cards for connection, traffic, health and route path"></div><p class="cap">The dashboard: first screen on launch (UI shown in Chinese)</p></div>

## Dashboard cards

- **Connection**: start/stop the proxy; shows mode (TUN / system proxy) and uptime.
- **Traffic today**: upload/download volume and trend.
- **Health**: exit availability at a glance.
- **Route path**: the live chain from inbound to outbound (entry → classify → policy → exit).

<div class="shot"><div class="frame"><span class="frame-t">Route path</span><img class="frame-img" src="{IMG}/welcome/route-path.png" alt="Route path card: entry, classifier, behavior, policy, exit, destination"></div><p class="cap">Route path: the four-layer model visualized live</p></div>

## Status bar & tray

- **Status bar**: connected state, proxy mode (e.g. TUN), theme toggle.
- **Tray**: right-click switches between Off / System proxy / TUN and lists exits for fast switching — see [Settings → Tray](/en/docs/settings#tray).

## Module map

| Module | Covers | Doc |
| --- | --- | --- |
| Network | Exit pools, LAN share | [Nodes & Subscriptions](/en/docs/nodes) |
| Subscriptions | Import, migrate, snapshots | [Nodes & Subscriptions](/en/docs/nodes) |
| Policy | Four-layer model | [Policy tree](/en/docs/policy-tree) |
| Insights | Connections & logs | [Connections & logs](/en/docs/connections) |
| Tools | Diagnostics, tracing, unlock tests | [Decision tracing](/en/docs/decision-trace) |
| Settings | Network / DNS / core / identity | [Settings](/en/docs/settings) |''',
})

PAGES.append({
 'section': 'client-ui', 'position': 2, 'published': True,
 'slug': 'nodes',
 'title_zh': '节点与订阅', 'title_en': 'Nodes & Subscriptions',
 'summary_zh': '节点列表、订阅管理、自动去重与地区分组、Clash 迁移报告、快照回滚、分享与备份。',
 'summary_en': 'Node list, subscription management, auto dedup and region groups, Clash migration report, snapshot rollback, sharing and backup.',
 'body_zh': '''「订阅」模块管理所有节点来源，「网络」模块管理这些节点组成的出口。节点导入后的完整生命周期都在这里：去重、分组、更新、回滚、分享。

<div class="shot"><div class="frame"><span class="frame-t">节点列表</span><img class="frame-img" src="{IMG}/nodes/node-list.png" alt="节点列表：按订阅分组，显示协议徽章、地区旗标和延迟"></div><p class="cap">节点列表：协议徽章、地区旗标、延迟一目了然</p></div>

## 节点列表

- 按订阅或分组组织，每个节点显示**协议徽章**（VLESS / Hy2 / SS 等）、**地区旗标**和**实测延迟**。
- 延迟列按颜色区分优劣，支持按延迟排序快速找出最快节点。

## 自动去重

<div class="shot"><div class="frame"><span class="frame-t">去重报告</span><img class="frame-img" src="{IMG}/nodes/dedup.png" alt="订阅去重报告：合并前后节点数对比"></div><p class="cap">去重报告：导入前后节点数对比，重复节点按指纹合并</p></div>

同一节点在多个订阅里重复出现是常态。AirLane 按**指纹**（协议 + 地址 + 端口 + 关键参数）识别重复节点并自动合并，去重报告显示合并了多少条。

## 地区分组

导入后自动按节点地区生成分组（香港、美国、日本……）。策略树绑定的是**分组**而不是单个节点，节点更新、下线都不需要改策略。

## Clash 迁移

<div class="shot"><div class="frame"><span class="frame-t">Clash 迁移报告</span><img class="frame-img" src="{IMG}/nodes/migration.png" alt="Clash 迁移报告：解析的节点数、分组和注意事项"></div><p class="cap">Clash 迁移报告</p></div>

导入 Clash / Mihomo YAML 后生成迁移报告：解析出多少节点、建了哪些分组、哪些配置项需要留意。

## 快照与回滚

<div class="shot"><div class="frame"><span class="frame-t">版本历史</span><img class="frame-img" src="{IMG}/nodes/version-history.png" alt="订阅版本历史：每次更新的快照列表"></div><p class="cap">版本历史：每次更新一个快照，出问题一键回滚</p></div>

每次订阅更新前自动保存快照。更新后节点异常、延迟暴涨？回滚到上一个版本即可。

## 分享与备份

<div class="shot"><div class="frame"><span class="frame-t">分享与导出</span><img class="frame-img" src="{IMG}/nodes/share-export.png" alt="订阅分享与导出面板"></div><p class="cap">分享链接、二维码、整套打包导出、WebDAV 备份</p></div>

- **分享**：生成分享链接或二维码，把订阅发给其他设备。
- **导出**：整套订阅打包成文件。
- **备份**：支持 WebDAV 备份，换设备时完整还原。''',
 'body_en': '''The **Subscriptions** module manages node sources; **Network** manages the exits those nodes form. The full node lifecycle lives here: dedup, grouping, updates, rollback and sharing.

<div class="shot"><div class="frame"><span class="frame-t">Node list</span><img class="frame-img" src="{IMG}/nodes/node-list.png" alt="Node list grouped by subscription with protocol badges, region flags and latency"></div><p class="cap">Node list: protocol badges, region flags, latency at a glance (UI in Chinese)</p></div>

## Node list

- Organized by subscription or group. Each node shows a **protocol badge** (VLESS / Hy2 / SS…), **region flag** and **measured latency**.
- Latency is color-coded; sort by it to surface the fastest nodes.

## Automatic dedup

<div class="shot"><div class="frame"><span class="frame-t">Dedup report</span><img class="frame-img" src="{IMG}/nodes/dedup.png" alt="Subscription dedup report comparing node counts before and after merge"></div><p class="cap">Dedup report: duplicates merged by fingerprint</p></div>

The same node often appears in several subscriptions. AirLane fingerprints nodes (protocol + address + port + key parameters) and merges duplicates automatically; the report shows how many were dropped.

## Region groups

Nodes are grouped by region on import (Hong Kong, United States, Japan…). The policy tree binds to **groups**, not individual nodes — so node churn never breaks your policy.

## Clash migration

<div class="shot"><div class="frame"><span class="frame-t">Clash migration report</span><img class="frame-img" src="{IMG}/nodes/migration.png" alt="Migration report: parsed nodes, groups and notes"></div><p class="cap">Clash migration report</p></div>

Importing a Clash / Mihomo YAML produces a report: how many nodes were parsed, which groups were created, and which fields need attention.

## Snapshots & rollback

<div class="shot"><div class="frame"><span class="frame-t">Version history</span><img class="frame-img" src="{IMG}/nodes/version-history.png" alt="Subscription version history with snapshots per update"></div><p class="cap">Version history: one snapshot per update, one-click rollback</p></div>

A snapshot is saved before every refresh. If an update brings dead nodes or bad latency, roll back to the previous version.

## Sharing & backup

<div class="shot"><div class="frame"><span class="frame-t">Share & export</span><img class="frame-img" src="{IMG}/nodes/share-export.png" alt="Subscription share and export panel"></div><p class="cap">Share links, QR codes, full export, WebDAV backup</p></div>

- **Share**: generate a link or QR code to move a subscription to another device.
- **Export**: pack the whole subscription set into a file.
- **Backup**: WebDAV backup restores everything on a new device.''',
})

PAGES.append({
 'section': 'client-ui', 'position': 3, 'published': True,
 'slug': 'policy-tree',
 'title_zh': '策略树', 'title_en': 'Policy Tree',
 'summary_zh': 'AirLane 的核心抽象：流量 → 分类器 → 行为 → 策略 → 出口，四层调度替代 Clash 的 Proxy Group。',
 'summary_en': 'AirLane core abstraction: traffic → classifier → behavior → policy → exit. A four-layer model replacing Clash proxy groups.',
 'body_zh': '''策略树是 AirLane 区别于传统代理客户端的核心：不再用「代理组 + 规则列表」的扁平模型，而是把调度拆成四层——**流量、分类器、行为、策略、出口**，每一层只做一件事。

<div class="shot"><div class="frame"><span class="frame-t">策略 · 总览</span><img class="frame-img" src="{IMG}/welcome/policy-overview.png" alt="策略总览：分类器、行为、策略列表和出口池"></div><p class="cap">策略总览</p></div>

## 四层模型

| 层 | 回答的问题 | 例子 |
| --- | --- | --- |
| 流量 Traffic | 这是什么流量？ | AI 服务、流媒体、游戏、社交 |
| 分类器 Classifier | 怎么识别它？ | 域名规则集、进程名、端口 |
| 行为 Behavior | 识别后做什么？ | Route（走代理）/ Direct（直连）/ Block（拦截）|
| 策略 Policy | 走哪个出口？ | 绑定一个出口池 |

一条流量的完整路径：**入口 → 分类器识别 → 行为决定 → 策略选出口池 → 具体出口 → 目标**。

## 分类器

<div class="shot"><div class="frame"><span class="frame-t">分类器</span><img class="frame-img" src="{IMG}/policy-tree/classifier.png" alt="分类器编辑界面：流量类型匹配规则"></div><p class="cap">分类器：定义「什么算这类流量」</p></div>

分类器把流量归类：按域名规则集（GEOSITE、自定义列表）、进程名、端口、IP 段等条件匹配。内置了 AI 服务、流媒体、广告等常见分类。

## 行为

<div class="shot"><div class="frame"><span class="frame-t">行为</span><img class="frame-img" src="{IMG}/policy-tree/behavior.png" alt="行为编辑：Route/Direct/Block/Reject/DNS 五种行为"></div><p class="cap">行为：Route / Direct / Block / Reject / DNS</p></div>

识别到流量后执行什么动作：**Route**（交给策略走代理）、**Direct**（直连）、**Block**（静默丢弃）、**Reject**（主动拒绝）、**DNS**（仅做 DNS 层面的处理）。

## 策略与出口池

<div class="shot"><div class="frame"><span class="frame-t">策略列表</span><img class="frame-img" src="{IMG}/policy-tree/policy-list.png" alt="策略列表：每条策略绑定流量类型和出口池"></div><p class="cap">策略列表：一行一条「流量 → 出口池」</p></div>

每条策略把一类流量绑到一个出口池。「AI 服务 → 美国组」「流媒体 → 德国组」就是两行策略。出口池支持多种选择器：

<div class="shot"><div class="frame"><span class="frame-t">选择器类型</span><img class="frame-img" src="{IMG}/policy-tree/selectors.png" alt="出口池选择器：手动/自动测速/负载均衡等类型"></div><p class="cap">出口池选择器：手动、自动测速、负载均衡……</p></div>

- **手动**：固定用你选的节点。
- **自动测速**：实时测延迟，自动切到最快节点。
- **负载均衡**：流量分散到多个节点。
- **故障转移**：按顺序 fallback，主节点挂了自动切下一个。

<div class="co tip"><div><div class="co-t">和 Clash 的本质区别</div>Clash 的 Proxy Group 把「选节点」和「谁来选」混在一起；AirLane 把「流量是谁」「要不要走代理」「走哪个池」拆成独立对象，每层的命中情况都可以在<a href="/docs/decision-trace">决策追踪</a>里回放到每一跳。</div></div>''',
 'body_en': '''The policy tree is what sets AirLane apart from traditional proxy clients: instead of a flat "proxy group + rule list" model, routing is split into layers — **traffic, classifier, behavior, policy, exit** — each doing exactly one job.

<div class="shot"><div class="frame"><span class="frame-t">Policy · Overview</span><img class="frame-img" src="{IMG}/welcome/policy-overview.png" alt="Policy overview: classifiers, behaviors, policy list and exit pools"></div><p class="cap">Policy overview (UI in Chinese)</p></div>

## The four-layer model

| Layer | Question it answers | Examples |
| --- | --- | --- |
| Traffic | What kind of traffic is this? | AI services, streaming, gaming, social |
| Classifier | How is it recognized? | Domain rulesets, process names, ports |
| Behavior | What to do once matched? | Route / Direct / Block / Reject |
| Policy | Which exit does it take? | Bound to an exit pool |

Full path of a connection: **entry → classified → behavior decided → policy picks a pool → concrete exit → destination**.

## Classifiers

<div class="shot"><div class="frame"><span class="frame-t">Classifier</span><img class="frame-img" src="{IMG}/policy-tree/classifier.png" alt="Classifier editor matching traffic types"></div><p class="cap">Classifiers define what counts as a traffic type</p></div>

Classifiers sort traffic by domain rulesets (GEOSITE, custom lists), process names, ports or IP ranges. Built-in categories cover AI services, streaming, ads and more.

## Behaviors

<div class="shot"><div class="frame"><span class="frame-t">Behavior</span><img class="frame-img" src="{IMG}/policy-tree/behavior.png" alt="Behavior editor with Route/Direct/Block/Reject/DNS"></div><p class="cap">Behaviors: Route / Direct / Block / Reject / DNS</p></div>

What happens to matched traffic: **Route** (hand to a policy), **Direct** (bypass proxy), **Block** (drop silently), **Reject** (refuse actively), **DNS** (DNS-level handling only).

## Policies & exit pools

<div class="shot"><div class="frame"><span class="frame-t">Policy list</span><img class="frame-img" src="{IMG}/policy-tree/policy-list.png" alt="Policy list binding traffic types to exit pools"></div><p class="cap">One row = "traffic type → exit pool"</p></div>

Each policy binds a traffic type to an exit pool. "AI services → US pool" and "Streaming → Germany pool" are two rows. Exit pools support several selector types:

<div class="shot"><div class="frame"><span class="frame-t">Selector types</span><img class="frame-img" src="{IMG}/policy-tree/selectors.png" alt="Exit pool selectors: manual, url-test, load-balance"></div><p class="cap">Selectors: manual, auto url-test, load-balance…</p></div>

- **Manual**: always use the node you picked.
- **URL test**: measure latency live, switch to the fastest.
- **Load balance**: spread traffic across nodes.
- **Fallback**: ordered failover when the primary dies.

<div class="co tip"><div><div class="co-t">vs Clash</div>Clash proxy groups entangle "which node" with "who chooses". AirLane separates who the traffic is, whether it proxies, and which pool it takes — and every hop is replayable in <a href="/en/docs/decision-trace">decision tracing</a>.</div></div>''',
})

PAGES.append({
 'section': 'client-ui', 'position': 4, 'published': True,
 'slug': 'rules',
 'title_zh': '规则', 'title_en': 'Rules',
 'summary_zh': '规则集（GEOSITE/GEOIP/远程订阅/自定义）、匹配优先级、命中分析与匹配模拟。',
 'summary_en': 'Rulesets (GEOSITE/GEOIP/remote/custom), match priority, hit analytics and match simulation.',
 'body_zh': '''规则告诉分类器「这条流量属于哪一类」。AirLane 的规则由**规则集**组成：GEOSITE / GEOIP 数据库、远程规则订阅、以及你的自定义规则。

<div class="shot"><div class="frame"><span class="frame-t">规则集管理</span><img class="frame-img" src="{IMG}/rules/rulesets.png" alt="规则集列表：GEOSITE/GEOIP/远程规则/内置分类"></div><p class="cap">规则集：GEOSITE、GEOIP、远程订阅、内置分类</p></div>

## 规则集类型

| 类型 | 内容 | 更新方式 |
| --- | --- | --- |
| GEOSITE | 按域名分类的数据库（geosite:category-ads-all 等） | 定期更新 |
| GEOIP | 按 IP 归属地分类 | 定期更新 |
| 远程规则 | 订阅的第三方规则列表 | 自动更新 |
| 自定义 | 你自己写的域名/进程/IP 规则 | 手动 |

内置分类（AI 服务、流媒体、广告追踪等）已经预置好了常用规则集，开箱即用。

## 匹配优先级

- 规则**自上而下**匹配，先命中的生效。
- 自定义规则优先于数据库规则——想让某个域名走特定线路，加一条自定义规则即可。
- 没有命中任何规则的流量走**兜底策略**（FINAL）。

<div class="co warn"><div><div class="co-t">顺序很重要</div>把「广告拦截」放在「流媒体」后面，可能导致广告域名先被当成流媒体放行。调整顺序后可用<a href="#match-sim">匹配模拟</a>验证。</div></div>

## 匹配模拟

<div class="shot"><div class="frame"><span class="frame-t">匹配模拟</span><img class="frame-img" src="{IMG}/rules/match-sim.png" alt="匹配模拟：输入域名，输出命中的规则和行为"></div><p class="cap">匹配模拟：输入一个域名，告诉你命中了哪条规则、会执行什么行为</p></div>

「这个网站会走哪条线？」不用猜——输入域名，模拟器直接给出命中的分类器、规则和行为。调试规则必备。

## 命中分析

<div class="shot"><div class="frame"><span class="frame-t">命中分析</span><img class="frame-img" src="{IMG}/rules/hit-analytics.png" alt="命中分析：各规则的命中次数统计"></div><p class="cap">命中分析：每条规则实际被命中了多少次</p></div>

统计每条规则的真实命中次数。长期 0 命中的规则可以清理，误判的规则能直接看出来。''',
 'body_en': '''Rules tell classifiers which bucket a connection belongs to. AirLane rules come as **rulesets**: GEOSITE / GEOIP databases, remote rule subscriptions, and your own custom rules.

<div class="shot"><div class="frame"><span class="frame-t">Rulesets</span><img class="frame-img" src="{IMG}/rules/rulesets.png" alt="Ruleset list: GEOSITE, GEOIP, remote and built-in sets"></div><p class="cap">Rulesets: GEOSITE, GEOIP, remote subscriptions, built-ins (UI in Chinese)</p></div>

## Ruleset types

| Type | Contents | Updates |
| --- | --- | --- |
| GEOSITE | Domain-category database (`geosite:category-ads-all`…) | Periodic |
| GEOIP | IP-to-region database | Periodic |
| Remote | Third-party rule lists you subscribe to | Automatic |
| Custom | Your own domain/process/IP rules | Manual |

Built-in categories (AI services, streaming, ad/tracking…) ship with curated rulesets out of the box.

## Match priority

- Rules match **top to bottom**; first hit wins.
- Custom rules take precedence over database rules — pin a domain to a lane by adding one line.
- Traffic matching nothing falls through to the **final** policy.

<div class="co warn"><div><div class="co-t">Order matters</div>Putting "ad blocking" after "streaming" may let ad domains out as streaming first. Reorder, then verify with the <a href="#match-sim">match simulator</a>.</div></div>

## Match simulation

<div class="shot"><div class="frame"><span class="frame-t">Match simulation</span><img class="frame-img" src="{IMG}/rules/match-sim.png" alt="Match simulator: enter a domain, see the matched rule and behavior"></div><p class="cap">Type a domain, get the classifier, rule and behavior it hits</p></div>

"Which lane does this site take?" — don't guess. The simulator returns the matched classifier, rule and behavior. Essential for rule debugging.

## Hit analytics

<div class="shot"><div class="frame"><span class="frame-t">Hit analytics</span><img class="frame-img" src="{IMG}/rules/hit-analytics.png" alt="Hit analytics: per-rule hit counts"></div><p class="cap">How many times each rule actually fired</p></div>

Real hit counts per rule. Rules stuck at zero can be cleaned up; misfiring rules stand out immediately.''',
})

PAGES.append({
 'section': 'client-ui', 'position': 5, 'published': True,
 'slug': 'decision-trace',
 'title_zh': '决策追踪', 'title_en': 'Decision Tracing',
 'summary_zh': '每一条连接为什么走这条线：从入口到出口的逐跳回放，网络可观测性的核心。',
 'summary_en': 'Why every connection took its lane: hop-by-hop replay from entry to exit — the core of network observability.',
 'body_zh': '''传统代理客户端出了问题只能看日志猜。AirLane 把每条连接的决策过程完整记录下来：**链路追踪**展示一条流量从入口到出口经过的每一跳。

<div class="shot"><div class="frame"><span class="frame-t">工具 · 链路追踪</span><img class="frame-img" src="{IMG}/welcome/chain-trace.png" alt="链路追踪面板"></div><p class="cap">链路追踪：一条连接为什么走这条线</p></div>

## 每一跳都能看到什么

一条追踪记录包含：

1. **入口**：流量从哪进来（TUN / 系统代理 / 局域网共享）。
2. **分类**：命中了哪个分类器、哪条规则。
3. **行为**：Route / Direct / Block 的决定。
4. **策略**：选了哪个出口池。
5. **出口**：实际用了池里的哪个节点、延迟多少。

## 和匹配模拟的关系

- **匹配模拟**（[规则 → 匹配模拟](/docs/rules#match-sim)）：事前预测——「这个域名会走哪条线」。
- **链路追踪**：事后回放——「这条连接刚才走了哪条线、为什么」。

## 典型用法

- 网站打不开 → 追踪一下：是被 Block 了，还是走了个挂掉的出口。
- 速度不对 → 看出口那跳用了哪个节点，是不是池子选错了。
- 规则没生效 → 看分类那跳命中了什么，是不是被前面的规则截胡。

<div class="co note"><div><div class="co-t">AI 也会读这条链</div>决策追踪输出的结构化链路（entry → classify → behavior → policy → exit → target）同时是给 <a href="/docs/mesh-intro">Mesh</a> 和自动化用的数据——自动化规则可以基于命中结果触发动作，见<a href="/docs/settings">设置 → 自动化</a>。</div></div>''',
 'body_en': '''With traditional proxy clients, debugging means guessing through logs. AirLane records the full decision of every connection: **chain tracing** replays each hop a flow took from entry to exit.

<div class="shot"><div class="frame"><span class="frame-t">Tools · Chain trace</span><img class="frame-img" src="{IMG}/welcome/chain-trace.png" alt="Chain trace panel"></div><p class="cap">Chain trace: why this connection took this lane (UI in Chinese)</p></div>

## What each hop shows

A trace record contains:

1. **Entry**: where the flow came in (TUN / system proxy / LAN share).
2. **Classification**: which classifier and rule matched.
3. **Behavior**: the Route / Direct / Block decision.
4. **Policy**: which exit pool was selected.
5. **Exit**: the concrete node used and its latency.

## Tracing vs simulation

- **Match simulation** ([Rules → simulation](/en/docs/rules#match-sim)): predicts — "which lane would this domain take".
- **Chain trace**: replays — "which lane did this connection just take, and why".

## Typical uses

- Site won't open → trace it: was it Blocked, or sent through a dead exit?
- Speed feels wrong → check which node the exit hop used; maybe the pool is mis-picked.
- Rule not firing → see what the classification hop matched; an earlier rule may have caught it first.

<div class="co note"><div><div class="co-t">AI reads this chain too</div>The structured trace (entry → classify → behavior → policy → exit → target) is the same data consumed by <a href="/en/docs/mesh-intro">Mesh</a> and automation — rules can trigger actions on match results; see <a href="/en/docs/settings">Settings → Automation</a>.</div></div>''',
})

PAGES.append({
 'section': 'client-ui', 'position': 6, 'published': True,
 'slug': 'health',
 'title_zh': '健康与自愈', 'title_en': 'Health & Self-healing',
 'summary_zh': '节点健康监测、24 小时延迟曲线、自动故障转移、一键网络诊断与配置自检。',
 'summary_en': 'Node health monitoring, 24h latency curves, automatic failover, one-click network diagnostics and config self-check.',
 'body_zh': '''AirLane 持续监测每个节点和出口的健康状态，异常时自动切换——你不用盯着节点列表手动换线。

<div class="shot"><div class="frame"><span class="frame-t">节点稳定性</span><img class="frame-img" src="{IMG}/health/stability.png" alt="节点稳定性报告：24 小时延迟曲线、P95、7 天可用率、切换次数"></div><p class="cap">节点稳定性：24h 延迟曲线、P95、7 天可用率、切换次数</p></div>

## 健康指标

- **延迟曲线**：24 小时实测延迟趋势。
- **P95 延迟**：比平均值更真实的「最坏情况」指标。
- **可用率**：7 天在线率，劣质节点一眼识别。
- **切换次数**：出口池 failover 了多少次——频繁切换说明池里节点不稳定。

## 自动故障转移

出口池用「自动测速 / 故障转移」选择器时，节点超时或失败会自动切到下一个可用节点，应用无感知。切换记录可以在稳定性报告里回看。

## 网络诊断

<div class="shot"><div class="frame"><span class="frame-t">工具 · 网络诊断</span><img class="frame-img" src="{IMG}/health/diagnostics.png" alt="网络诊断：逐项检查结果列表"></div><p class="cap">网络诊断：十几项检查一次跑完</p></div>

「工具 → 网络诊断」一键检查：DNS 解析、系统代理状态、TUN 驱动、端口占用、订阅连通性、出口延迟……每项给出结果和修复建议。详见[连不上 / 无网络](/docs/trouble-connect)。

## 配置自检

<div class="shot"><div class="frame"><span class="frame-t">配置检查</span><img class="frame-img" src="{IMG}/health/config-check.png" alt="配置检查：可自动修复的问题列表"></div><p class="cap">配置检查：发现问题可以直接「一键修复」</p></div>

自检会扫描配置里的常见问题（冲突的端口、失效的规则集、异常的分流方案），大多数问题提供**自动修复**按钮。

<div class="co tip"><div><div class="co-t">先跑诊断再排查</div>90% 的「连不上」都能被网络诊断直接定位——先跑一遍再手动排查，省一半时间。</div></div>''',
 'body_en': '''AirLane continuously monitors node and exit health, and fails over automatically when something degrades — no babysitting the node list.

<div class="shot"><div class="frame"><span class="frame-t">Node stability</span><img class="frame-img" src="{IMG}/health/stability.png" alt="Stability report: 24h latency curve, P95, 7-day uptime, switch count"></div><p class="cap">Stability: 24h latency curve, P95, 7-day uptime, failover count (UI in Chinese)</p></div>

## Health metrics

- **Latency curve**: 24-hour measured latency trend.
- **P95 latency**: the honest "worst case" number — more truthful than averages.
- **Uptime**: 7-day availability; bad nodes are obvious.
- **Switch count**: how often the pool failed over — frequent switches mean unstable nodes.

## Automatic failover

With URL-test or fallback selectors, a timing-out node is swapped for the next healthy one transparently. Every switch is recorded in the stability report for review.

## Network diagnostics

<div class="shot"><div class="frame"><span class="frame-t">Tools · Diagnostics</span><img class="frame-img" src="{IMG}/health/diagnostics.png" alt="Network diagnostics check results"></div><p class="cap">A dozen checks in one pass</p></div>

Tools → Network diagnostics checks DNS resolution, system-proxy state, the TUN driver, port conflicts, subscription reachability, exit latency… each item comes back with a result and a fix suggestion. See [Can't connect / no internet](/en/docs/trouble-connect).

## Config self-check

<div class="shot"><div class="frame"><span class="frame-t">Config check</span><img class="frame-img" src="{IMG}/health/config-check.png" alt="Config check with auto-fixable issues"></div><p class="cap">Found issues can be fixed with one click</p></div>

Self-check scans for common config problems (port conflicts, dead rulesets, odd routing profiles) and offers **auto-fix** for most of them.

<div class="co tip"><div><div class="co-t">Diagnose first, debug second</div>Diagnostics pinpoint 90% of "can't connect" cases on the first pass — run it before digging manually.</div></div>''',
})

PAGES.append({
 'section': 'client-ui', 'position': 7, 'published': True,
 'slug': 'connections',
 'title_zh': '连接与日志', 'title_en': 'Connections & Logs',
 'summary_zh': '实时连接表、流量排行、归属识别、内核日志——网络可观测性的另一半。',
 'summary_en': 'Live connection table, traffic ranking, attribution, core logs — the other half of observability.',
 'body_zh': '''「洞察」模块回答两个问题：**现在有哪些连接在跑**、**它们都是谁**。

<div class="shot"><div class="frame"><span class="frame-t">洞察 · 实时连接</span><img class="frame-img" src="{IMG}/welcome/connections.png" alt="实时连接表：进程、目标、链路、流量、时长"></div><p class="cap">实时连接：每条连接都能展开看完整链路</p></div>

## 实时连接

每条连接一行：进程、目标域名/IP、走的链路（分类 → 策略 → 出口）、累计流量、存活时长。点开任意一条可以看它的决策链（见[决策追踪](/docs/decision-trace)）。

## 流量排行

<div class="shot"><div class="frame"><span class="frame-t">流量排行</span><img class="frame-img" src="{IMG}/connections/ranking.png" alt="流量排行：按进程和域名统计流量占比"></div><p class="cap">流量排行：谁在吃带宽一目了然</p></div>

按进程和域名统计流量占比。某个应用在后台偷跑流量？排行榜上藏不住。

## 归属识别

<div class="shot"><div class="frame"><span class="frame-t">归属识别</span><img class="frame-img" src="{IMG}/connections/attribution.png" alt="流量归属：每个目标识别为具体服务"></div><p class="cap">归属识别：把 IP/域名翻译成「这是哪个服务」</p></div>

连接的的目标 IP 会被识别成具体服务（OpenAI、Netflix、Cloudflare……），不用对着 IP 猜这是谁。

## 内核日志

<div class="shot"><div class="frame"><span class="frame-t">内核日志</span><img class="frame-img" src="{IMG}/connections/kernel-log.png" alt="sing-box 内核实时日志"></div><p class="cap">内核日志：sing-box 的原始输出，调试底层问题时用</p></div>

sing-box 内核的实时日志流。日常排查看链路追踪更直观，内核日志留给底层问题（握手失败、协议错误等）。''',
 'body_en': '''The **Insights** module answers two questions: **what connections are running right now** and **who they belong to**.

<div class="shot"><div class="frame"><span class="frame-t">Insights · Live connections</span><img class="frame-img" src="{IMG}/welcome/connections.png" alt="Live connection table: process, target, chain, traffic, duration"></div><p class="cap">Live connections: every row expands into a full decision chain (UI in Chinese)</p></div>

## Live connections

One row per connection: process, target domain/IP, the lane it took (classify → policy → exit), cumulative traffic and age. Expand any row to see its decision chain (see [Decision tracing](/en/docs/decision-trace)).

## Traffic ranking

<div class="shot"><div class="frame"><span class="frame-t">Traffic ranking</span><img class="frame-img" src="{IMG}/connections/ranking.png" alt="Traffic ranking by process and domain"></div><p class="cap">Ranking: whoever eats bandwidth can't hide</p></div>

Traffic share by process and domain. Background apps secretly burning bandwidth show up here immediately.

## Attribution

<div class="shot"><div class="frame"><span class="frame-t">Attribution</span><img class="frame-img" src="{IMG}/connections/attribution.png" alt="Attribution mapping targets to named services"></div><p class="cap">Attribution: IPs/domains resolved to "which service this is"</p></div>

Target IPs are resolved into named services (OpenAI, Netflix, Cloudflare…) — no more guessing who an IP belongs to.

## Core logs

<div class="shot"><div class="frame"><span class="frame-t">Core logs</span><img class="frame-img" src="{IMG}/connections/kernel-log.png" alt="sing-box core log stream"></div><p class="cap">Raw sing-box output — for lower-level debugging</p></div>

Live log stream from the sing-box core. Chain tracing is the friendlier daily tool; core logs are for lower-level issues (handshake failures, protocol errors).''',
})

PAGES.append({
 'section': 'client-ui', 'position': 8, 'published': True,
 'slug': 'settings',
 'title_zh': '设置', 'title_en': 'Settings',
 'summary_zh': '常规、网络（TUN/系统代理）、DNS、内核、分流方案、身份模式与托盘行为。',
 'summary_en': 'General, network (TUN/system proxy), DNS, core, routing profiles, identity modes and tray behavior.',
 'body_zh': '''设置按页面分组：**常规、网络、DNS、内核、分流方案、配置管理、账户**。

<div class="shot"><div class="frame"><span class="frame-t">设置 · 常规</span><img class="frame-img" src="{IMG}/settings/basic.png" alt="常规设置：开机启动、语言、主题、关闭行为"></div><p class="cap">常规：开机启动、语言、主题、关闭按钮行为</p></div>

## 常规

- **开机启动**、语言（中/英）、主题（跟随系统/亮/暗）。
- **关闭行为**：点 × 是最小化到托盘还是退出。

## 网络

<div class="shot"><div class="frame"><span class="frame-t">设置 · 网络</span><img class="frame-img" src="{IMG}/welcome/settings-network.png" alt="网络设置：TUN 模式、系统代理、端口、IPv6、流量嗅探"></div><p class="cap">网络：TUN、系统代理、端口、IPv6、流量嗅探</p></div>

- **TUN 模式**：虚拟网卡接管全部流量（需管理员权限）。详见[TUN vs 系统代理](/docs/scenario-tun)。
- **系统代理**：只接管支持代理的应用。
- **混合端口**：本地代理监听端口。
- **IPv6 / 流量嗅探**：按需开关。

## DNS

<div class="shot"><div class="frame"><span class="frame-t">设置 · DNS</span><img class="frame-img" src="{IMG}/settings/dns.png" alt="DNS 设置：方案选择、自定义 DNS、Fake-IP、污染检测"></div><p class="cap">DNS：方案、自定义解析、Fake-IP、污染检测</p></div>

- **方案**：大陆优化 / 海外优化，一键切换。
- **自定义 DNS**：DoH/DoT 上游可改。
- **Fake-IP**、DNS 污染检测、Split-DNS——详见[DNS 与 FakeIP](/docs/scenario-dns)。

## 内核

<div class="shot"><div class="frame"><span class="frame-t">设置 · 内核</span><img class="frame-img" src="{IMG}/settings/kernel.png" alt="内核设置：sing-box 版本、日志级别"></div><p class="cap">内核：sing-box 版本与日志级别</p></div>

查看内核版本、调整日志级别。日常不需要动。

## 分流方案

<div class="shot"><div class="frame"><span class="frame-t">分流方案</span><img class="frame-img" src="{IMG}/settings/config-mgmt.png" alt="分流方案管理：AirLane 推荐/全局/直连 等预设"></div><p class="cap">分流方案：一键切换整套调度规则</p></div>

预设方案一键切换整套策略：**AirLane 推荐**（分流）、**全局**（全走代理）、**直连**（全直连）。也可以保存自己的方案。

## 账户

<div class="shot"><div class="frame"><span class="frame-t">设置 · 账户</span><img class="frame-img" src="{IMG}/welcome/settings-user.png" alt="账户设置：身份模式选择"></div><p class="cap">账户：身份模式——匿名 / 账号 / 私有部署</p></div>

三种身份模式：**匿名**（不登录，用共享资源池配额）、**账号**（登录同步配额）、**私有部署**（接自己的后端）。详见[账号中心](/docs/account-center)。

## 托盘

<div class="shot"><div class="frame"><span class="frame-t">托盘菜单</span><img class="frame-img" src="{IMG}/settings/tray.png" alt="托盘菜单：代理模式切换、出口选择"></div><p class="cap">托盘：不打开主窗口也能切模式、换出口</p></div>

托盘右键菜单直接切换「关闭 / 系统代理 / TUN」，并列出所有出口供快速切换。''',
 'body_en': '''Settings are grouped by page: **General, Network, DNS, Core, Routing profiles, Config management, Account**.

<div class="shot"><div class="frame"><span class="frame-t">Settings · General</span><img class="frame-img" src="{IMG}/settings/basic.png" alt="General settings: launch on boot, language, theme, close behavior"></div><p class="cap">General: autostart, language, theme, close-button behavior (UI in Chinese)</p></div>

## General

- **Launch at login**, language (中/EN), theme (system/light/dark).
- **Close behavior**: the × button minimizes to tray or quits.

## Network

<div class="shot"><div class="frame"><span class="frame-t">Settings · Network</span><img class="frame-img" src="{IMG}/welcome/settings-network.png" alt="Network settings: TUN, system proxy, port, IPv6, sniffing"></div><p class="cap">Network: TUN, system proxy, port, IPv6, sniffing</p></div>

- **TUN mode**: virtual NIC takes over all traffic (needs admin). See [TUN vs system proxy](/en/docs/scenario-tun).
- **System proxy**: only proxy-aware apps are captured.
- **Mixed port**: local listener port.
- **IPv6 / sniffing**: toggles as needed.

## DNS

<div class="shot"><div class="frame"><span class="frame-t">Settings · DNS</span><img class="frame-img" src="{IMG}/settings/dns.png" alt="DNS settings: profile, custom DNS, Fake-IP, pollution detection"></div><p class="cap">DNS: profile, custom resolvers, Fake-IP, pollution detection</p></div>

- **Profile**: mainland-optimized / overseas-optimized presets.
- **Custom DNS**: DoH/DoT upstreams.
- **Fake-IP**, pollution detection, split-DNS — see [DNS & FakeIP](/en/docs/scenario-dns).

## Core

<div class="shot"><div class="frame"><span class="frame-t">Settings · Core</span><img class="frame-img" src="{IMG}/settings/kernel.png" alt="Core settings: sing-box version, log level"></div><p class="cap">Core: sing-box version and log level</p></div>

Shows the core version and log level. Rarely needs touching.

## Routing profiles

<div class="shot"><div class="frame"><span class="frame-t">Routing profiles</span><img class="frame-img" src="{IMG}/settings/config-mgmt.png" alt="Routing profiles: AirLane recommended / Global / Direct presets"></div><p class="cap">Profiles: switch the whole ruleset in one click</p></div>

Presets switch your entire policy set: **AirLane recommended** (split), **Global** (proxy everything), **Direct** (bypass everything). Save your own profiles too.

## Account

<div class="shot"><div class="frame"><span class="frame-t">Settings · Account</span><img class="frame-img" src="{IMG}/welcome/settings-user.png" alt="Account settings: identity modes"></div><p class="cap">Account: identity — anonymous / account / self-hosted</p></div>

Three identity modes: **anonymous** (no login, shared-pool quota), **account** (synced quota), **self-hosted** (your own backend). See [Account center](/en/docs/account-center).

## Tray

<div class="shot"><div class="frame"><span class="frame-t">Tray menu</span><img class="frame-img" src="{IMG}/settings/tray.png" alt="Tray menu: proxy modes and exit picker"></div><p class="cap">Tray: switch modes and exits without opening the window</p></div>

The tray menu switches Off / System proxy / TUN directly and lists all exits for fast switching.''',
})

PAGES.append({
 'section': 'scenarios', 'position': 1, 'published': True,
 'slug': 'scenario-ai',
 'title_zh': '让 AI 走亚洲线路', 'title_en': 'Route AI Services via Asia',
 'summary_zh': '把 ChatGPT / Claude 等 AI 流量绑到亚洲出口池：分类器 → 行为 → 策略 → 出口，四步配好。',
 'summary_en': 'Bind ChatGPT/Claude traffic to an Asia exit pool in four steps: classifier → behavior → policy → exit.',
 'body_zh': '''目标：所有 AI 服务（ChatGPT、Claude、Gemini、OpenAI API……）固定走亚洲节点，其他流量不受影响。AirLane 的做法是「流量类型 → 出口池」一行策略，不用手写规则。

<div class="mini"><span class="k">策略</span><span class="arr">→</span><span class="k">AI 服务</span><span class="arr">→</span><span class="k">绑定出口池：亚洲</span><span class="ok">✓</span></div>

## 配置步骤

1. **确认分类器**：策略 → 分类器里找到内置的「AI 服务」分类（已预置 OpenAI、Anthropic、Google AI 等域名规则集）。
2. **建出口池**：网络 → 出口分组里，把香港/日本/新加坡等亚洲节点加入一个分组（或直接用自动测速池）。
3. **建策略**：策略列表加一行：流量「AI 服务」→ 行为「Route」→ 出口池「亚洲组」。
4. **验证**：工具 → 链路追踪 输入 `chatgpt.com`，确认出口那跳走的是亚洲节点。

## 为什么不用手写规则

- 内置 AI 规则集已覆盖主流服务，新服务上线后随规则集更新。
- 绑的是「组」不是「节点」：池里换节点、加节点，策略不用动。
- 用「自动测速」选择器，亚洲池内部永远跑当前最快的节点。

<div class="co tip"><div><div class="co-t">反向也成立</div>想让 AI 走「非大陆以外任意」线路？同样一行策略，把出口池换成对应分组即可——策略不关心池里装了什么。</div></div>

## 相关

- [策略树](/docs/policy-tree)——四层模型详解
- [决策追踪](/docs/decision-trace)——验证实际走向
- [流媒体与游戏分流](/docs/scenario-streaming)''',
 'body_en': '''Goal: pin all AI services (ChatGPT, Claude, Gemini, OpenAI API…) to Asia exits while everything else stays untouched. In AirLane this is one policy row — "traffic type → exit pool" — no hand-written rules.

<div class="mini"><span class="k">Policy</span><span class="arr">→</span><span class="k">AI services</span><span class="arr">→</span><span class="k">bind pool: Asia</span><span class="ok">✓</span></div>

## Steps

1. **Check the classifier**: Policy → Classifiers — the built-in "AI services" category already carries rulesets for OpenAI, Anthropic, Google AI and more.
2. **Build the pool**: Network → Exit groups — put Hong Kong / Japan / Singapore nodes into one group (or use a url-test pool).
3. **Add the policy**: one row — traffic "AI services" → behavior "Route" → pool "Asia".
4. **Verify**: Tools → Chain trace, enter `chatgpt.com` — the exit hop should show an Asia node.

## Why no hand-written rules

- The built-in AI ruleset covers mainstream services and updates as new ones appear.
- You bind a **group**, not nodes — swap nodes inside the pool, the policy stays valid.
- With the url-test selector, the pool always lands on its fastest current node.

<div class="co tip"><div><div class="co-t">Works in reverse</div>Want AI on "anything-but-X" lanes? Same single row — just bind a different pool. The policy doesn't care what's inside it.</div></div>

## Related

- [Policy tree](/en/docs/policy-tree) — the four-layer model
- [Decision tracing](/en/docs/decision-trace) — verify the actual lane
- [Streaming & gaming](/en/docs/scenario-streaming)''',
})

PAGES.append({
 'section': 'scenarios', 'position': 2, 'published': True,
 'slug': 'scenario-streaming',
 'title_zh': '流媒体与游戏分流', 'title_en': 'Streaming & Gaming Lanes',
 'summary_zh': '流媒体走解锁区、游戏走低延迟直连：两条策略 + 解锁测试验证。',
 'summary_en': 'Streaming through unlock regions, games on low-latency direct: two policies plus an unlock test.',
 'body_zh': '''两个最常见的分流需求：**流媒体要「对的地区」**（Netflix 解锁区），**游戏要「低的延迟」**（通常直连或专线最好）。

## 流媒体

1. 网络 → 出口分组：把解锁流媒体好的节点放进「流媒体池」。
2. 策略 → 加一行：流量「流媒体」→ Route → 流媒体池。
3. 验证：工具 → **流媒体解锁测试**，一键测 Netflix / Disney+ / YouTube 等在该出口下的解锁状态。

<div class="shot"><div class="frame"><span class="frame-t">流媒体解锁测试</span><img class="frame-img" src="{IMG}/welcome/unlock-test.png" alt="流媒体解锁测试：各平台解锁状态"></div><p class="cap">解锁测试：直接告诉你哪个出口能解锁什么</p></div>

## 游戏

- 游戏流量通常走**直连**最快：策略里「游戏」→ 行为「Direct」即可。
- 需要加速的游戏绑「低延迟池」（自动测速选择器，永远挑当前延迟最低的节点）。
- 主机游戏走 UDP：确保节点支持 UDP 转发（hy2 / tuic 协议节点 UDP 表现最好）。

<div class="co note"><div><div class="co-t">进程级分流</div>除了域名，分类器也支持按<b>进程名</b>匹配——可以给某个游戏 exe 单独建分类，比域名规则更可靠。</div></div>

## 相关

- [策略树](/docs/policy-tree)
- [规则 → 匹配模拟](/docs/rules#match-sim)''',
 'body_en': '''The two most common splits: **streaming wants the right region** (unlock zones for Netflix) and **gaming wants low latency** (usually direct or a fast lane).

## Streaming

1. Network → Exit groups: put your unlock-friendly nodes into a "Streaming" pool.
2. Policy → add a row: traffic "Streaming" → Route → Streaming pool.
3. Verify: Tools → **Streaming unlock test** — one click checks Netflix / Disney+ / YouTube unlock status through that exit.

<div class="shot"><div class="frame"><span class="frame-t">Streaming unlock test</span><img class="frame-img" src="{IMG}/welcome/unlock-test.png" alt="Unlock test results per platform"></div><p class="cap">Unlock test: shows which exit unlocks what (UI in Chinese)</p></div>

## Gaming

- Game traffic is usually fastest **direct**: policy "Gaming" → behavior "Direct".
- For games needing acceleration, bind a "low-latency pool" (url-test selector keeps the current fastest node).
- Console games use UDP: make sure your nodes forward UDP (hysteria2 / tuic nodes perform best).

<div class="co note"><div><div class="co-t">Per-process lanes</div>Besides domains, classifiers match on <b>process names</b> — give one game exe its own category; more reliable than domain rules.</div></div>

## Related

- [Policy tree](/en/docs/policy-tree)
- [Rules → Match simulation](/en/docs/rules#match-sim)''',
})

PAGES.append({
 'section': 'scenarios', 'position': 3, 'published': True,
 'slug': 'scenario-tun',
 'title_zh': 'TUN 模式 vs 系统代理', 'title_en': 'TUN Mode vs System Proxy',
 'summary_zh': '两种接管方式的区别、各自适用场景，以及什么时候该开 TUN。',
 'summary_en': 'How the two takeover modes differ, which fits what scenario, and when to enable TUN.',
 'body_zh': '''AirLane 有两种方式接管设备流量：**系统代理**和 **TUN 模式**。在[设置 → 网络](/docs/settings)里切换，托盘菜单也可以快速切换。

<div class="shot"><div class="frame"><span class="frame-t">设置 · 网络</span><img class="frame-img" src="{IMG}/welcome/settings-network.png" alt="网络设置：TUN 模式与系统代理开关"></div><p class="cap">设置 → 网络：两个开关都在这里</p></div>

## 对比

| | 系统代理 | TUN 模式 |
| --- | --- | --- |
| 原理 | 告诉系统「流量发给本地代理端口」 | 虚拟网卡接管全部流量 |
| 覆盖 | 只有遵守系统代理的应用 | **所有应用**，包括无视代理设置的 |
| UDP / 游戏 | 通常不支持 | 支持 |
| 权限要求 | 无 | 管理员 / root（装虚拟网卡驱动） |
| 兼容性 | 偶尔有应用不遵守 | 极少数软件与虚拟网卡冲突 |

## 怎么选

- **日常浏览**：系统代理够用，无权限要求。
- **游戏、命令行、不接代理的应用**（Docker、部分 IDE、主机流量）：必须 TUN。
- **局域网共享**（把电脑变成其他设备的网关）：需要 TUN。

<div class="co warn"><div><div class="co-t">TUN 需要权限</div>Windows 首次启用 TUN 会请求管理员权限安装 Wintun 驱动；macOS 会要求密码授权网络扩展。授权一次即可。</div></div>

<div class="co tip"><div><div class="co-t">可以混用</div>两个开关不互斥——开了 TUN 后系统代理设置保留，关掉 TUN 立即回到系统代理模式。</div></div>''',
 'body_en': '''AirLane can take over device traffic two ways: **system proxy** and **TUN mode**. Switch in [Settings → Network](/en/docs/settings), or quickly from the tray menu.

<div class="shot"><div class="frame"><span class="frame-t">Settings · Network</span><img class="frame-img" src="{IMG}/welcome/settings-network.png" alt="Network settings with TUN and system proxy toggles"></div><p class="cap">Settings → Network: both toggles live here (UI in Chinese)</p></div>

## Comparison

| | System proxy | TUN mode |
| --- | --- | --- |
| How | Tells the OS to send traffic to a local port | A virtual NIC captures everything |
| Coverage | Only apps that respect proxy settings | **Every app**, even ones ignoring proxy settings |
| UDP / games | Usually unsupported | Supported |
| Privileges | None | Admin/root (installs a virtual NIC driver) |
| Compatibility | Some apps ignore it | Rare conflicts with the virtual NIC |

## Which to pick

- **Daily browsing**: system proxy is enough — no privileges needed.
- **Games, CLI tools, proxy-unaware apps** (Docker, some IDEs, console traffic): TUN required.
- **LAN sharing** (your PC as gateway for other devices): TUN required.

<div class="co warn"><div><div class="co-t">TUN needs privileges</div>First TUN launch on Windows asks admin rights to install the Wintun driver; macOS asks for your password to add a network extension. One-time only.</div></div>

<div class="co tip"><div><div class="co-t">They compose</div>Not mutually exclusive — with TUN on, system-proxy settings stay; disable TUN and you're back on system proxy instantly.</div></div>''',
})

PAGES.append({
 'section': 'scenarios', 'position': 4, 'published': True,
 'slug': 'scenario-dns',
 'title_zh': 'DNS 与 FakeIP', 'title_en': 'DNS & Fake-IP',
 'summary_zh': 'DNS 方案选择、Fake-IP 原理、污染检测和 Split-DNS——为什么 DNS 是分流的地基。',
 'summary_en': 'DNS profiles, how Fake-IP works, pollution detection and split-DNS — why DNS is the foundation of routing.',
 'body_zh': '''分流的一切从 DNS 开始：访问一个域名时，先解析、后连接。DNS 没配对，轻则解析到被污染的 IP 打不开网站，重则流量根本没进对分类器。配置都在[设置 → DNS](/docs/settings)。

<div class="shot"><div class="frame"><span class="frame-t">设置 · DNS</span><img class="frame-img" src="{IMG}/settings/dns.png" alt="DNS 设置：方案、Fake-IP、污染检测"></div><p class="cap">设置 → DNS</p></div>

## DNS 方案

- **大陆优化**：境内域名走本地 DNS，境外域名走加密 DNS——适合国内网络。
- **海外优化**：全部走可信上游。
- **自定义**：自己写 DoH / DoT 上游。

## Fake-IP 是什么

开启后，AirLane 对域名解析先返回一个**虚拟 IP**（198.18.x.x 段），应用拿着这个假 IP 来连接时，客户端反查出真实域名再分流。

好处：**域名信息保住了**——应用直接连 IP 时也能按域名规则分流，而且解析飞快（不等待真实 DNS 往返）。

## 污染检测

检测你的本地 DNS 返回的结果是否被污染（解析到错误 IP）。检测到污染会自动切换到加密 DNS 通道。

## Split-DNS

不同域名走不同 DNS：境内域名问本地运营商 DNS（快），境外域名问加密上游（准）。方案预设已经配好，一般不用手调。

<div class="co note"><div><div class="co-t">排查 DNS 问题</div>「能连但网站打不开」八成是 DNS：先跑<a href="/docs/health">网络诊断</a>里的 DNS 检查，再试试切换 DNS 方案。详见<a href="/docs/trouble-site">某个网站打不开</a>。</div></div>''',
 'body_en': '''Everything in routing starts with DNS: resolve first, connect second. Wrong DNS means polluted IPs at best — at worst, traffic never reaches the right classifier. All of it lives in [Settings → DNS](/en/docs/settings).

<div class="shot"><div class="frame"><span class="frame-t">Settings · DNS</span><img class="frame-img" src="{IMG}/settings/dns.png" alt="DNS settings: profile, Fake-IP, pollution detection"></div><p class="cap">Settings → DNS (UI in Chinese)</p></div>

## DNS profiles

- **Mainland-optimized**: domestic domains via local DNS, overseas domains via encrypted DNS — for networks in China.
- **Overseas-optimized**: everything through trusted upstreams.
- **Custom**: your own DoH / DoT upstreams.

## What Fake-IP does

With Fake-IP on, AirLane answers lookups with a **virtual IP** (198.18.x.x). When an app connects to it, the client looks up the real domain and routes by name.

The win: **the domain is preserved** — even apps connecting by raw IP still hit domain rules, and resolution is instant (no real DNS round-trip).

## Pollution detection

Detects whether your local DNS returns poisoned results (wrong IPs). On detection, it switches to the encrypted DNS channel automatically.

## Split-DNS

Different domains ask different resolvers: domestic domains use the local ISP DNS (fast), overseas domains use encrypted upstreams (accurate). The presets ship configured — rarely needs tuning.

<div class="co note"><div><div class="co-t">Debugging DNS</div>"Connected but the site won't open" is usually DNS: run the DNS check in <a href="/en/docs/health">network diagnostics</a>, then try switching profiles. See <a href="/en/docs/trouble-site">A site won't open</a>.</div></div>''',
})

PAGES.append({
 'section': 'mesh', 'position': 1, 'published': True,
 'slug': 'mesh-intro',
 'title_zh': 'Mesh 是什么', 'title_en': 'What is Mesh',
 'summary_zh': '把你的多台设备组成一张私有网络：互相发现、共享网络能力，一台设备的出口可以变成另一台的线路。',
 'summary_en': 'Join your devices into a private fabric: they discover each other, share network capabilities, and one device\'s exit becomes another\'s lane.',
 'body_zh': '''AirLane Mesh 把你名下的多台设备（电脑、手机、路由器）组成一张**私有网络**。设备之间互相发现、共享网络能力——最典型的用法：一台设备的出口可以变成另一台设备的线路。

## 能做什么

- **跨设备共享出口**：家里的电脑有原生 IP？把它设为出口，手机在外也能走家里的网络。
- **设备互访**：组网内设备像在同一个局域网，互传文件、远程桌面不再依赖公网 IP。
- **策略同步**：策略树、订阅在设备间同步，一处配置处处生效。

## 和 Tailscale / Headscale 的区别

传统 Mesh 方案（Tailscale 等）只解决「设备互通」。AirLane Mesh 内建在代理客户端里——**组网能力和调度能力是同一套**：一台设备既是 Mesh 节点，也是策略树可以引用的出口资源。不需要再单独部署 Headscale 协调服务。

## 概念速览

| 概念 | 说明 |
| --- | --- |
| 节点 Node | 组网里的一台设备 |
| 出口节点 Exit Node | 把自己的网络共享出去的节点 |
| DERP 中继 | NAT 打不通时的兜底加密中继 |
| 资源池 | 跨设备共享的出口与线路集合 |

<div class="co note"><div><div class="co-t">与身份模式的关系</div>Mesh 需要登录账号或接入私有部署——匿名模式下没有「你的设备」这个概念。见<a href="/docs/account-center">账号中心</a>。</div></div>

## 下一步

- 把设备加入网络（即将上线）
- 设置出口节点（即将上线）
- DERP 中继（即将上线）''',
 'body_en': '''AirLane Mesh joins your devices (laptop, phone, router) into a **private network**. Devices discover each other and share network capabilities — the classic use: one device's exit becomes another device's lane.

## What it enables

- **Cross-device exits**: your home PC has a clean residential IP? Make it an exit node; your phone routes through home from anywhere.
- **Device interconnect**: meshed devices behave as if on one LAN — file transfer and remote desktop without public IPs.
- **Policy sync**: the policy tree and subscriptions sync across devices — configure once, applies everywhere.

## vs Tailscale / Headscale

Traditional mesh stacks (Tailscale et al.) only solve device connectivity. AirLane Mesh is built into the proxy client — **fabric and routing are one system**: a device is both a mesh node and an exit resource the policy tree can reference. No separate Headscale coordination service to deploy.

## Concepts

| Term | Meaning |
| --- | --- |
| Node | A device in the mesh |
| Exit node | A node sharing its network outward |
| DERP relay | Encrypted fallback relay when NAT traversal fails |
| Resource pool | The shared set of exits and lanes across devices |

<div class="co note"><div><div class="co-t">Identity requirement</div>Mesh requires an account or a self-hosted backend — "your devices" don't exist in anonymous mode. See <a href="/en/docs/account-center">Account center</a>.</div></div>

## Next

- Join a device to the mesh (coming soon)
- Set up an exit node (coming soon)
- DERP relays (coming soon)''',
})

PAGES.append({
 'section': 'mesh', 'position': 2, 'published': False,
 'slug': 'mesh-join',
 'title_zh': '把设备加入网络', 'title_en': 'Join a Device',
 'summary_zh': '登录同一账号的设备自动发现彼此，加入 Mesh 网络的步骤。',
 'summary_en': 'Devices on the same account discover each other — steps to join the mesh.',
 'body_zh': STUB_ZH, 'body_en': STUB_EN,
})

PAGES.append({
 'section': 'mesh', 'position': 3, 'published': False,
 'slug': 'mesh-exit',
 'title_zh': '设置出口节点', 'title_en': 'Set Up an Exit Node',
 'summary_zh': '把一台设备的网络共享给整个 Mesh：其他设备可以把它当出口用。',
 'summary_en': 'Share one device\'s network to the whole mesh — other devices can exit through it.',
 'body_zh': STUB_ZH, 'body_en': STUB_EN,
})

PAGES.append({
 'section': 'mesh', 'position': 4, 'published': False,
 'slug': 'mesh-derp',
 'title_zh': 'DERP 中继', 'title_en': 'DERP Relays',
 'summary_zh': 'NAT 打洞失败时的加密兜底中继：什么时候会用到、延迟代价。',
 'summary_en': 'Encrypted fallback relays for when NAT traversal fails: when they\'re used and the latency cost.',
 'body_zh': STUB_ZH, 'body_en': STUB_EN,
})

PAGES.append({
 'section': 'account', 'position': 2, 'published': True,
 'slug': 'poolvip',
 'title_zh': '共享网络资源池', 'title_en': 'Shared Resource Pool',
 'summary_zh': 'PoolVIP：平台共享的 VPS 与住宅 IP 出口池，没订阅也能立刻用——按身份模式给配额。',
 'summary_en': 'PoolVIP: the platform\'s shared pool of VPS and residential-IP exits — usable without your own subscription, with quota by identity mode.',
 'body_zh': '''PoolVIP 是 AirLane 平台提供的**共享出口池**：一批由平台维护的 VPS 和住宅 IP 线路。它解决的是「有客户端、没节点」的冷启动问题——装好 AirLane，不导入任何订阅也能立刻有出口用。

## 池子里有什么

- **VPS 出口**：机房线路，速度快、稳定，适合日常浏览。
- **住宅 IP 出口**：家宽 IP，适合对机房 IP 敏感的服务（部分流媒体、登录风控严格的站点）。

## 配额按身份模式分

| 模式 | 资源池配额 |
| --- | --- |
| 匿名 | 基础额度，够用但有限 |
| 账号 | 按订阅套餐给额度，用量在[账号中心](/docs/account-center)可查 |
| 私有部署 | 用自己的资源池，不受平台配额约束 |

<div class="co tip"><div><div class="co-t">资源池 vs 订阅</div>资源池是平台喂给你的「保底口粮」；自己的订阅（机场/自建节点）仍然可以导入，两者在出口池里共存、自由组合。见<a href="/docs/nodes">节点与订阅</a>。</div></div>

## 在策略里怎么用

PoolVIP 出口在「网络 → 出口分组」里和你的订阅节点并列显示，建出口池、绑策略的方式完全一样——分类器绑到池，池里混装资源池出口和自己的节点都行。

## 用量与限制

- 用量统计在客户端「账户」页和网页[账号中心](/account)同步显示。
- 额度用尽后流量回落到直连/你自己的订阅出口，不会断网。
- 住宅 IP 出口因为成本高，配额通常比 VPS 少——留给真正需要它的服务。''',
 'body_en': '''PoolVIP is AirLane\'s **shared exit pool**: a set of VPS and residential-IP lines maintained by the platform. It solves the cold-start problem — install AirLane and you have working exits before importing any subscription.

## What's inside

- **VPS exits**: datacenter lines — fast and stable, good for everyday traffic.
- **Residential exits**: home-broadband IPs for services that distrust datacenter IPs (some streaming, sites with strict login risk control).

## Quota by identity mode

| Mode | Pool quota |
| --- | --- |
| Anonymous | Basic allowance — usable but limited |
| Account | Scaled to your plan; usage shown in the [account center](/en/docs/account-center) |
| Self-hosted | Your own resource pool, no platform quota |

<div class="co tip"><div><div class="co-t">Pool vs subscription</div>The pool is your guaranteed baseline; your own subscriptions import alongside it. Both coexist in exit pools and combine freely — see <a href="/en/docs/nodes">Nodes & Subscriptions</a>.</div></div>

## Using it in policies

PoolVIP exits appear next to your subscription nodes under Network → Exit groups. Building pools and binding policies works identically — a classifier binds to a pool, and the pool can mix resource-pool exits with your own nodes.

## Usage & limits

- Usage syncs between the client's Account page and the web [account center](/en/account).
- When quota runs out, traffic falls back to direct or your own exits — never a hard cutoff.
- Residential exits cost more, so their quota is smaller — save them for services that need them.''',
})

PAGES.append({
 'section': 'account', 'position': 3, 'published': True,
 'slug': 'poolvip-import',
 'title_zh': '导入 PoolVIP 线路', 'title_en': 'Import PoolVIP Lines',
 'summary_zh': '把 PoolVIP 资源池的线路导入到出口分组，和自己的订阅节点混用。',
 'summary_en': 'Pull PoolVIP lines into your exit groups and mix them with your own subscription nodes.',
 'body_zh': '''PoolVIP 的线路不是单独的订阅，而是出现在「网络 → 出口分组」里的可用出口。把它们用起来只需要两步：

<div class="mini"><span class="k">网络</span><span class="arr">→</span><span class="k">出口分组</span><span class="arr">→</span><span class="k">选 PoolVIP 线路加入分组</span><span class="ok">✓</span></div>

## 步骤

1. 打开**网络 → 出口分组**，新建或选一个分组。
2. 在可用出口列表里找到标有 **PoolVIP** 的线路（VPS / 住宅 IP 会标注类型）。
3. 加入分组后，[策略树](/docs/policy-tree)里绑这个组即可——和订阅节点完全同一套流程。

## 和订阅的区别

| | PoolVIP 线路 | 订阅节点 |
| --- | --- | --- |
| 来源 | 平台资源池 | 你的机场/自建 |
| 更新 | 平台维护，自动 | 按订阅更新周期 |
| 配额 | 按身份模式限流 | 不限 |

<div class="co note"><div><div class="co-t">看不到 PoolVIP？</div>确认身份模式：匿名模式有基础额度；完全没显示的话，去<a href="/docs/health">网络诊断</a>跑一次连通性检查。</div></div>''',
 'body_en': '''PoolVIP lines aren't a separate subscription — they appear as available exits under **Network → Exit groups**. Two steps to use them:

<div class="mini"><span class="k">Network</span><span class="arr">→</span><span class="k">Exit groups</span><span class="arr">→</span><span class="k">add PoolVIP lines to a group</span><span class="ok">✓</span></div>

## Steps

1. Open **Network → Exit groups**, create or pick a group.
2. Find lines tagged **PoolVIP** in the available exits list (VPS / residential are labeled by type).
3. Add them to the group, then bind the group in the [policy tree](/en/docs/policy-tree) — same flow as subscription nodes.

## vs subscriptions

| | PoolVIP lines | Subscription nodes |
| --- | --- | --- |
| Source | Platform pool | Your provider/self-hosted |
| Updates | Maintained by the platform | Subscription interval |
| Quota | Rate-limited by identity mode | Unlimited |

<div class="co note"><div><div class="co-t">No PoolVIP visible?</div>Check your identity mode — anonymous gets a basic allowance. If nothing shows at all, run a connectivity pass in <a href="/en/docs/health">network diagnostics</a>.</div></div>''',
})

PAGES.append({
 'section': 'troubleshooting', 'position': 1, 'published': True,
 'slug': 'trouble-connect',
 'title_zh': '连不上 / 无网络', 'title_en': "Can't Connect / No Internet",
 'summary_zh': '代理连不上或者开了代理就没网：先跑网络诊断，再按症状逐项排查。',
 'summary_en': 'Proxy won\'t connect or internet dies with the proxy on: run diagnostics first, then work through the checklist.',
 'body_zh': '''别急着手动排查——「工具 → 网络诊断」就是为这个场景做的，十几项检查一次跑完，大多数问题直接定位。

<div class="shot"><div class="frame"><span class="frame-t">工具 · 网络诊断</span><img class="frame-img" src="{IMG}/health/diagnostics.png" alt="网络诊断检查结果"></div><p class="cap">网络诊断：每项检查都有结果和修复建议</p></div>

## 诊断之后按症状排查

| 症状 | 最可能的原因 | 处理 |
| --- | --- | --- |
| 点连接没反应 | 内核没起来 / 端口被占 | 看[内核日志](/docs/connections)；改混合端口 |
| 连上了但没网 | 出口全挂 / DNS 挂了 | 看[健康度](/docs/health)；切 DNS 方案 |
| TUN 开不起来 | 驱动没装 / 权限不够 | 以管理员身份重启客户端 |
| 订阅节点全部超时 | 订阅过期或机场挂了 | 检查订阅到期检测；换出口池 |
| 只有某个出口池不行 | 池内节点全失效 | 看该池的稳定性报告，换池或换节点 |

## 配置自检

<div class="shot"><div class="frame"><span class="frame-t">配置检查</span><img class="frame-img" src="{IMG}/health/config-check.png" alt="配置检查：可自动修复项"></div><p class="cap">配置检查：大部分问题可以一键修复</p></div>

「工具 → 配置检查」扫描端口冲突、失效规则集、异常分流方案等配置级问题，大多带**自动修复**按钮。

## 还是不行

- 切「直连」分流方案确认基础网络正常 → 再切回来二分定位。
- [决策追踪](/docs/decision-trace)回放一条失败连接：卡在哪一跳一目了然。
- 到 [GitHub](https://github.com/mirrortek-uk/airlane-web/issues) 提 issue，附上诊断结果截图。''',
 'body_en': '''Don't debug by hand first — Tools → Network diagnostics exists for exactly this: a dozen checks in one pass, and most problems get pinpointed immediately.

<div class="shot"><div class="frame"><span class="frame-t">Tools · Diagnostics</span><img class="frame-img" src="{IMG}/health/diagnostics.png" alt="Network diagnostics results"></div><p class="cap">Every check comes back with a result and a fix hint (UI in Chinese)</p></div>

## After diagnostics, by symptom

| Symptom | Likely cause | Action |
| --- | --- | --- |
| Connect button does nothing | Core not running / port conflict | Check [core logs](/en/docs/connections); change the mixed port |
| Connected, but no internet | All exits dead / DNS broken | Check [health](/en/docs/health); switch DNS profile |
| TUN won't enable | Driver missing / no privileges | Restart the client as administrator |
| All subscription nodes time out | Subscription expired or provider down | Check expiry tracking; switch pools |
| Only one exit pool fails | Every node in the pool is dead | Open its stability report; swap pool or nodes |

## Config self-check

<div class="shot"><div class="frame"><span class="frame-t">Config check</span><img class="frame-img" src="{IMG}/health/config-check.png" alt="Config check with auto-fixable items"></div><p class="cap">Most config-level issues have a one-click fix</p></div>

Tools → Config check scans for port conflicts, dead rulesets and broken profiles — most items offer **auto-fix**.

## Still stuck

- Switch to the "Direct" profile to confirm base connectivity, then bisect from there.
- Replay a failed connection in [decision tracing](/en/docs/decision-trace) — the broken hop is obvious.
- File an issue on [GitHub](https://github.com/mirrortek-uk/airlane-web/issues) with a diagnostics screenshot.''',
})

PAGES.append({
 'section': 'troubleshooting', 'position': 2, 'published': True,
 'slug': 'trouble-site',
 'title_zh': '某个网站打不开', 'title_en': "A Specific Site Won't Open",
 'summary_zh': '别的都正常、就一个站点打不开：匹配模拟查分类，污染检测查 DNS，解锁测试查出口。',
 'summary_en': 'Everything works except one site: match simulation for classification, pollution check for DNS, unlock test for the exit.',
 'body_zh': '''单站点问题的排查顺序：**分类 → DNS → 出口**，每一步都有对应工具。

## 第一步：匹配模拟——它命中了什么？

<div class="shot"><div class="frame"><span class="frame-t">匹配模拟</span><img class="frame-img" src="{IMG}/rules/match-sim.png" alt="匹配模拟结果"></div><p class="cap">输入打不开的域名，看命中了哪条规则</p></div>

工具 → 匹配模拟，输入域名：

- 命中 **Block** → 被拦截规则截了（常见于广告规则误伤），加一条自定义放行规则。
- 命中意外的分类 → 规则集把域名归错了类，自定义规则覆盖。
- 什么都没命中 → 走了兜底策略，看兜底出口是否正常。

## 第二步：DNS——解析对不对？

- 跑[网络诊断](/docs/health)里的 DNS 检查：解析结果是不是错误 IP（污染）。
- 开了 Fake-IP 还打不开？试试切 DNS 方案（大陆 ↔ 海外），见[DNS 与 FakeIP](/docs/scenario-dns)。

## 第三步：出口——这条线能到吗？

- **链路追踪**回放一条到该站点的连接，看出口那跳：节点超时？被目标站拒绝？
- **流媒体解锁测试**：如果打不开的是 Netflix / Disney+，直接测该出口的解锁状态——不是网不好，是 IP 被平台封了，换住宅 IP 或别的出口。

<div class="shot"><div class="frame"><span class="frame-t">泄漏检测</span><img class="frame-img" src="{IMG}/health/leak-test.png" alt="DNS/WebRTC 泄漏检测结果"></div><p class="cap">泄漏检测：确认真的是出口 IP 在出站</p></div>

<div class="co tip"><div><div class="co-t">常见结论</div>单站点打不开 70% 是「域名被分错了类」或「出口 IP 被目标站风控」——前者用自定义规则修，后者换出口。</div></div>''',
 'body_en': '''For single-site failures, debug in order: **classification → DNS → exit**. Each step has a dedicated tool.

## Step 1: Match simulation — what did it hit?

<div class="shot"><div class="frame"><span class="frame-t">Match simulation</span><img class="frame-img" src="{IMG}/rules/match-sim.png" alt="Match simulation result"></div><p class="cap">Enter the broken domain, see which rule matched (UI in Chinese)</p></div>

Tools → Match simulation, enter the domain:

- Hit **Block** → caught by a blocking rule (ad-ruleset false positive is common); add a custom allow rule.
- Hit an unexpected category → the ruleset misclassified it; override with a custom rule.
- Hit nothing → fell through to the final policy; check that exit.

## Step 2: DNS — is resolution correct?

- Run the DNS check in [network diagnostics](/en/docs/health): is the resolved IP bogus (poisoned)?
- Still broken with Fake-IP on? Switch DNS profiles (mainland ↔ overseas) — see [DNS & Fake-IP](/en/docs/scenario-dns).

## Step 3: Exit — can this lane reach it?

- Replay a connection to the site in **chain trace** and inspect the exit hop: node timeout? Rejected by the target?
- **Unlock test**: if it's Netflix / Disney+ that won't open, test the exit's unlock status directly — it's not your network, the IP is banned. Switch to a residential IP or another exit.

<div class="shot"><div class="frame"><span class="frame-t">Leak test</span><img class="frame-img" src="{IMG}/health/leak-test.png" alt="DNS/WebRTC leak test results"></div><p class="cap">Leak test: confirm the exit IP is really what goes out</p></div>

<div class="co tip"><div><div class="co-t">Usual verdicts</div>70% of single-site failures are "domain classified wrong" or "exit IP risk-flagged by the target" — fix the first with a custom rule, the second by changing exits.</div></div>''',
})

PAGES.append({
 'section': 'troubleshooting', 'position': 3, 'published': True,
 'slug': 'trouble-slow',
 'title_zh': '速度慢', 'title_en': 'Slow Speeds',
 'summary_zh': '延迟高、跑不满带宽：先看稳定性报告找真实延迟，再调出口池选择器和协议。',
 'summary_en': 'High latency, low throughput: check the stability report for real numbers, then tune pool selectors and protocols.',
 'body_zh': '''「慢」先量化再修：看节点列表的延迟列、出口分组的延迟表、和[稳定性报告](/docs/health)的 24h 曲线——区分是**节点慢**、**策略绕路**还是**本地问题**。

## 按原因排查

| 现象 | 原因 | 处理 |
| --- | --- | --- |
| 延迟列全红 | 订阅节点整体质量差 | 换订阅 / 加 PoolVIP 线路 |
| 延迟低但下载慢 | 出口带宽小 / 协议开销 | 换带宽大的节点；试 hy2/tuic |
| 延迟忽高忽低 | 池内节点不稳定 | 稳定性报告看切换记录，剔除波动节点 |
| 只有某些服务慢 | 分流到了绕路出口 | [链路追踪](/docs/decision-trace)看实际出口 |

## 出口池选择器

- **自动测速（url-test）**：周期性测延迟，自动切最快——治「节点快慢波动」。
- **负载均衡**：多条节点分摊流量，单节点带宽不够时提速。
- **手动**：测速结果不准（比如游戏场景）时手动钉死最优节点。

<div class="shot"><div class="frame"><span class="frame-t">出口延迟表</span><img class="frame-img" src="{IMG}/welcome/exit-groups.png" alt="出口分组与延迟表"></div><p class="cap">出口分组：按延迟排序，快慢一眼可见</p></div>

## 协议差异

同一条线路不同协议体验差别很大：Hysteria2 / TUIC（QUIC）在丢包网络下明显快于 TCP 系协议。节点支持多种协议时，优先 QUIC 系——背景见[代理协议演化](/blog/proxy-protocol-evolution)。

## 本地因素

- TUN 模式下 DNS 未优化 → 切 DNS 方案，见[DNS 与 FakeIP](/docs/scenario-dns)。
- 局域网共享拖慢主机 → 给共享流量单独绑池或限速。''',
 'body_en': '''Quantify "slow" before fixing it: the node list's latency column, per-group latency tables and the 24h curve in the [stability report](/en/docs/health) — figure out whether it's **slow nodes**, **detoured routing**, or a **local issue**.

## By cause

| Symptom | Cause | Action |
| --- | --- | --- |
| All latency red | Bad subscription overall | Change provider / add PoolVIP lines |
| Low latency, slow downloads | Small exit bandwidth / protocol overhead | Pick fatter nodes; try hy2/tuic |
| Latency fluctuates | Unstable nodes in the pool | Check switch records in stability; drop flapping nodes |
| Only some services slow | Routed through a detour exit | See the real exit in [decision tracing](/en/docs/decision-trace) |

## Pool selectors

- **URL test**: measures latency periodically, auto-picks the fastest — fixes "node speed varies".
- **Load balance**: spreads traffic across nodes when a single node's bandwidth caps you.
- **Manual**: pin the best node yourself when measurements mislead (e.g. games).

<div class="shot"><div class="frame"><span class="frame-t">Exit latency table</span><img class="frame-img" src="{IMG}/welcome/exit-groups.png" alt="Exit groups with latency table"></div><p class="cap">Exit groups sorted by latency (UI in Chinese)</p></div>

## Protocol matters

Same line, different protocol, very different feel: Hysteria2 / TUIC (QUIC) beat TCP-family protocols badly on lossy networks. Prefer QUIC-family when a node offers several — background in [the protocol evolution post](/en/blog/proxy-protocol-evolution).

## Local factors

- DNS not optimized under TUN → switch DNS profiles, see [DNS & Fake-IP](/en/docs/scenario-dns).
- LAN share slowing the host → bind shared traffic to its own pool or rate-limit it.''',
})

PAGES.append({
 'section': 'troubleshooting', 'position': 4, 'published': True,
 'slug': 'trouble-platform',
 'title_zh': '平台常见问题', 'title_en': 'Platform FAQ',
 'summary_zh': 'Windows/macOS/Android/iOS 各平台的高频安装与运行问题。',
 'summary_en': 'High-frequency install and runtime issues per platform: Windows, macOS, Android, iOS.',
 'body_zh': '''## Windows

- **打不开 / 白屏**：缺 WebView2 运行时。装一下微软官方的 WebView2 Runtime 再开。
- **SmartScreen 拦截**：新发布版本信誉未积累，点「仍要运行」。
- **TUN 启用失败**：需要管理员权限装 Wintun 驱动——右键「以管理员身份运行」。
- **托盘退出后再开报错**：残留进程占端口，任务管理器结束进程后重启。

## macOS

- **「无法验证开发者」**：系统设置 → 隐私与安全性 → 仍要打开（或右键 → 打开）。
- **TUN 提示输入密码**：授权安装网络扩展，正常流程。
- **Apple Silicon / Intel 装错包**：下错架构的 dmg 会闪退或无法安装，重新下对应版本。

## Android

- **VPN 权限弹窗反复出现**：系统把 VPN 服务杀了——给客户端加后台白名单 / 电池优化豁免。
- **某些国产 ROM 杀后台**：MIUI、EMUI 等需要在「自启动管理」里手动允许。

## iOS

- **VPN 配置安装失败**：删掉旧的 VPN 配置描述文件后重试。
- **App Store 搜不到**：部分区域商店未上架，见[下载页](/download)的分发说明。

## 通用

- **更新后异常**：分流方案快照可回滚；订阅有[版本历史](/docs/nodes)。
- **日志在哪**：[洞察 → 内核日志](/docs/connections)，反馈问题时附上。
- 还不行 → [GitHub Issues](https://github.com/mirrortek-uk/airlane-web/issues)。''',
 'body_en': '''## Windows

- **Won't open / white screen**: missing WebView2 runtime — install Microsoft's WebView2 Runtime and retry.
- **SmartScreen block**: fresh builds lack reputation — click **Run anyway**.
- **TUN fails to enable**: the Wintun driver needs admin — right-click → Run as administrator.
- **Error reopening after tray quit**: a leftover process holds the port; kill it in Task Manager.

## macOS

- **"Developer cannot be verified"**: System Settings → Privacy & Security → Open Anyway (or right-click → Open).
- **Password prompt for TUN**: authorizing the network extension — expected.
- **Installed the wrong dmg**: Apple Silicon vs Intel builds crash or refuse to install — grab the right one.

## Android

- **VPN permission prompt keeps returning**: the OS killed the VPN service — exempt the app from battery optimization.
- **Aggressive ROMs kill it**: MIUI, EMUI etc. need manual "autostart" permission.

## iOS

- **VPN profile fails to install**: delete stale VPN configuration profiles and retry.
- **Not in the App Store**: not yet listed in some regions — see distribution notes on the [download page](/download).

## General

- **Broke after an update**: routing-profile snapshots roll back; subscriptions have [version history](/en/docs/nodes).
- **Where are logs**: Insights → Core logs (see [Connections & Logs](/en/docs/connections)) — attach them when reporting.
- Still stuck → [GitHub Issues](https://github.com/mirrortek-uk/airlane-web/issues).''',
})

PAGES.append({
 'section': 'protocols', 'position': 1, 'published': True,
 'slug': 'ref-protocols',
 'title_zh': '支持的协议', 'title_en': 'Supported Protocols',
 'summary_zh': 'AirLane 基于 sing-box 内核，原生支持 38+ 协议：VLESS、Hysteria2、TUIC、Trojan、Shadowsocks-2022、WireGuard 等。',
 'summary_en': 'Built on the sing-box core, AirLane supports 38+ protocols natively: VLESS, Hysteria2, TUIC, Trojan, Shadowsocks-2022, WireGuard and more.',
 'body_zh': '''AirLane 使用 sing-box 内核，原生支持 38+ 协议——框架内协议和独立 QUIC 协议栈全部覆盖，不需要额外插件。

## 代理协议

| 类别 | 协议 |
| --- | --- |
| 主流抗审查 | **VLESS**（含 Reality / XTLS Vision）、**Trojan**、**Hysteria2**、**TUIC v5** |
| 经典 | VMess、Shadowsocks、**Shadowsocks-2022**、Socks、HTTP |
| VPN 协议 | **WireGuard** |
| 其他 | SSH、Direct、Block、DNS outbound 等 sing-box 出站类型 |

## 传输层 / 伪装

- **Reality**：借真实网站握手，目前最强的伪装方案（VLESS 配套）。
- **XTLS Vision**：Reality 的流控配套，减少握手特征。
- WebSocket、gRPC、HTTPUpgrade 等传输方式。
- TLS / uTLS 指纹模拟。

## 订阅格式

- Clash / Mihomo YAML——一键迁移，见[导入订阅](/docs/import-subscription)。
- 节点分享链接（vless://、vmess://、hy2://、tuic://、trojan://、ss://）。
- sing-box 原生 JSON 出站。

<div class="co tip"><div><div class="co-t">选哪个协议？</div>丢包严重的网络选 QUIC 系（Hysteria2 / TUIC）；要最稳的伪装选 VLESS+Reality；企业 VPN 互联用 WireGuard。协议背后的演化史：<a href="/blog/proxy-protocol-evolution">从 SS 到 Reality</a>。</div></div>''',
 'body_en': '''AirLane runs on the sing-box core and supports 38+ protocols natively — both framework protocols and independent QUIC stacks, no extra plugins.

## Proxy protocols

| Category | Protocols |
| --- | --- |
| Mainstream anti-censorship | **VLESS** (with Reality / XTLS Vision), **Trojan**, **Hysteria2**, **TUIC v5** |
| Classic | VMess, Shadowsocks, **Shadowsocks-2022**, Socks, HTTP |
| VPN | **WireGuard** |
| Others | SSH, Direct, Block, DNS outbounds and other sing-box types |

## Transports & camouflage

- **Reality**: borrows a real website's handshake — currently the strongest disguise (pairs with VLESS).
- **XTLS Vision**: Reality's flow-control companion, minimizing handshake fingerprints.
- WebSocket, gRPC, HTTPUpgrade transports.
- TLS / uTLS fingerprint emulation.

## Subscription formats

- Clash / Mihomo YAML — one-click migration, see [Import a subscription](/en/docs/import-subscription).
- Node share links (`vless://`, `vmess://`, `hy2://`, `tuic://`, `trojan://`, `ss://`).
- Native sing-box JSON outbounds.

<div class="co tip"><div><div class="co-t">Which protocol?</div>QUIC family (Hysteria2 / TUIC) wins on lossy networks; VLESS+Reality for the toughest disguise; WireGuard for VPN-style interconnect. The story behind them: <a href="/en/blog/proxy-protocol-evolution">from SS to Reality</a>.</div></div>''',
})

PAGES.append({
 'section': 'protocols', 'position': 2, 'published': True,
 'slug': 'ref-syntax',
 'title_zh': '规则语法', 'title_en': 'Rule Syntax',
 'summary_zh': '自定义规则的匹配字段参考：domain、domain_suffix、geosite、geoip、process_name、ip_cidr、port、final。',
 'summary_en': 'Match fields for custom rules: domain, domain_suffix, geosite, geoip, process_name, ip_cidr, port, final.',
 'body_zh': '''自定义规则在「规则 → 自定义」里逐条添加。每条规则 = **匹配条件 + 目标分类器**。条件字段和 sing-box route rule 对齐。

## 匹配字段

| 字段 | 匹配 | 例子 |
| --- | --- | --- |
| `domain` | 精确域名 | `openai.com` |
| `domain_suffix` | 域名后缀（含子域） | `google.com` 命中 `*.google.com` |
| `domain_keyword` | 域名包含关键词 | `netflix` |
| `geosite` | GEOSITE 分类 | `geosite:category-ads-all` |
| `geoip` | IP 归属地 | `geoip:cn` |
| `ip_cidr` | IP 段 | `91.108.56.0/22` |
| `process_name` | 进程名 | `steam.exe` |
| `port` | 目标端口 | `22` |
| `network` | 协议类型 | `udp`、`tcp` |

## 示例

把公司内网域名钉死直连：

- `domain_suffix` = `corp.example.com` → 分类器「直连」

把某个游戏进程走加速池：

- `process_name` = `game.exe` → 分类器「游戏」

## 兜底

- **final**：所有规则都没命中时走的策略——在分流方案里设置，通常是「默认 Route」或「默认 Direct」。

<div class="co note"><div><div class="co-t">不用手写 JSON</div>界面里的自定义规则会被编译进 sing-box 内核配置——你填字段，语法由 AirLane 保证。想直接编辑原始配置的用户在<a href="/docs/settings">设置 → 分流方案</a>里有 raw config 入口。</div></div>''',
 'body_en': '''Custom rules live under Rules → Custom, one per line. Each rule = **match condition + target classifier**. Fields align with sing-box route rules.

## Match fields

| Field | Matches | Example |
| --- | --- | --- |
| `domain` | Exact domain | `openai.com` |
| `domain_suffix` | Domain + subdomains | `google.com` hits `*.google.com` |
| `domain_keyword` | Keyword inside domain | `netflix` |
| `geosite` | GEOSITE category | `geosite:category-ads-all` |
| `geoip` | IP origin | `geoip:cn` |
| `ip_cidr` | IP range | `91.108.56.0/22` |
| `process_name` | Process name | `steam.exe` |
| `port` | Destination port | `22` |
| `network` | Protocol | `udp`, `tcp` |

## Examples

Pin the company intranet to direct:

- `domain_suffix` = `corp.example.com` → classifier "Direct"

Send one game's process through the fast pool:

- `process_name` = `game.exe` → classifier "Gaming"

## Fallback

- **final**: where traffic goes when nothing matched — set in the routing profile, usually "default Route" or "default Direct".

<div class="co note"><div><div class="co-t">No raw JSON needed</div>UI rules compile into the sing-box core config — you fill fields, AirLane guarantees the syntax. Raw config editing lives under <a href="/en/docs/settings">Settings → Routing profiles</a>.</div></div>''',
})

PAGES.append({
 'section': 'protocols', 'position': 3, 'published': False,
 'slug': 'ref-shortcuts',
 'title_zh': '快捷键', 'title_en': 'Keyboard Shortcuts',
 'summary_zh': '客户端全局与界面快捷键速查表。',
 'summary_en': 'Global and in-app keyboard shortcut reference.',
 'body_zh': STUB_ZH, 'body_en': STUB_EN,
})

PAGES.append({
 'section': 'protocols', 'position': 4, 'published': True,
 'slug': 'changelog',
 'title_zh': '更新日志', 'title_en': 'Changelog',
 'summary_zh': '各版本更新内容：新功能、修复与协议支持变化。',
 'summary_en': 'What changed in each release: features, fixes and protocol support updates.',
 'body_zh': '''## 最新版本

完整版本历史和安装包见 [GitHub Releases](https://github.com/mirrortek-uk/airlane-web/releases) 与[下载页](/download)。

## v1.4

- **PoolVIP 线路导入**：资源池线路可直接加入出口分组，与订阅节点混用（见[导入 PoolVIP 线路](/docs/poolvip-import)）。
- **决策追踪**上线：链路追踪、匹配模拟、命中分析全套可观测工具（见[决策追踪](/docs/decision-trace)）。
- 出口分组延迟表、流媒体解锁测试、DNS/WebRTC 泄漏检测。

## v1.0.x

- 首个正式版：四层调度模型（流量/分类器/行为/策略/出口）替代 Clash Proxy Group。
- Mesh 组网、共享资源池（PoolVIP）、三种身份模式（匿名/账号/私有部署）。
- sing-box 内核，38+ 协议支持，Clash/Mihomo 订阅一键迁移。
- Windows / macOS / Android / iOS 客户端 + 网页版。

<div class="co note"><div><div class="co-t">文档同步更新</div>本文档站点随产品版本更新——页面右上角的「更新日期」显示每页的最后修订时间。</div></div>''',
 'body_en': '''## Latest

Full release history and installers: [GitHub Releases](https://github.com/mirrortek-uk/airlane-web/releases) and the [download page](/download).

## v1.4

- **PoolVIP line import**: resource-pool lines join exit groups directly and mix with subscription nodes (see [Import PoolVIP lines](/en/docs/poolvip-import)).
- **Decision tracing** shipped: chain trace, match simulation and hit analytics (see [Decision tracing](/en/docs/decision-trace)).
- Per-group latency tables, streaming unlock test, DNS/WebRTC leak detection.

## v1.0.x

- First stable: the four-layer model (traffic/classifier/behavior/policy/exit) replacing Clash proxy groups.
- Mesh networking, shared resource pool (PoolVIP), three identity modes (anonymous/account/self-hosted).
- sing-box core, 38+ protocols, one-click Clash/Mihomo subscription migration.
- Windows / macOS / Android / iOS clients plus the web app.

<div class="co note"><div><div class="co-t">Docs track releases</div>This docs site updates with product versions — each page shows its last-revised date in the header.</div></div>''',
})

# ---- upsert ----
sec_by_slug = {s['slug']: s for s in req('GET', '/doc_sections?select=id,slug')}
for s in SECTIONS:
    row = {'slug': s['slug'], 'title_zh': s['title_zh'], 'title_en': s['title_en'], 'position': s['position']}
    if s['slug'] in sec_by_slug:
        req('PATCH', '/doc_sections?slug=eq.' + s['slug'], row)
        s['id'] = sec_by_slug[s['slug']]['id']
    else:
        s['id'] = req('POST', '/doc_sections', row)[0]['id']
    print('section', s['slug'], '->', s['id'])

existing = {p['slug']: p['id'] for p in req('GET', '/doc_pages?select=id,slug')}

# keep existing docs in their sections/positions
POSITION_FIX = {
    'welcome': ('getting-started', 1),
    'quick-start': ('getting-started', 3),
    'account-center': ('account', 1),
}
sec_ids = {s['slug']: s['id'] for s in SECTIONS}
for slug, (sec, pos) in POSITION_FIX.items():
    if slug in existing:
        req('PATCH', '/doc_pages?slug=eq.' + slug, {'section_id': sec_ids[sec], 'position': pos})
        print('fix', slug, '->', sec, pos)

for p in PAGES:
    row = {
        'section_id': sec_ids[p['section']],
        'slug': p['slug'], 'title_zh': p['title_zh'], 'title_en': p['title_en'],
        'summary_zh': p['summary_zh'], 'summary_en': p['summary_en'],
        'body_zh': (p.get('body_zh') or STUB_ZH).format(IMG=IMG),
        'body_en': (p.get('body_en') or STUB_EN).format(IMG=IMG),
        'position': p['position'], 'published': p['published'],
        'updated_at': 'now()',
    }
    if p['slug'] in existing:
        req('PATCH', '/doc_pages?slug=eq.' + p['slug'], row)
        print('update', p['slug'])
    else:
        req('POST', '/doc_pages', row)
        print('create', p['slug'])

print('done:', len(PAGES), 'pages')
