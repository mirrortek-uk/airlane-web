**AirLane 是一款可视化的流量调度客户端**：底层由 sing-box 内核驱动，上层把"节点、协议、规则、出口"封装成一套看得见的策略系统 —— 38+ 协议、可视化策略树、决策级链路追踪、自动化 Profile，覆盖 Windows、macOS、iOS 与 Android。

这篇文档用真实界面截图带你在 5 分钟内认识 AirLane 的全部功能模块（截图来自 Windows 中文版 v1.0.4，其他平台布局一致）。

## AirLane 和普通代理客户端的区别

| | 传统代理客户端 | AirLane |
|---|---|---|
| 配置方式 | 手写 YAML / JSON | 可视化策略树，编译下发 |
| 分流粒度 | 静态规则列表 | 流分类 → 流行为 → 流策略 → 出口池 四层模型 |
| 可观测性 | 连接日志 | 转发路径、命中分析、链路追踪、流量归属 |
| 故障处理 | 手动切换节点 | 健康检测自动 failover，自愈记录可查 |
| 节点来源 | 自备订阅 | 订阅 + PoolVIP 共享池 + Mesh 组网 + 共享 VPS |

## 界面总览：七大模块

左侧导航按编号分为 7 个模块：

| 模块 | 负责什么 |
|---|---|
| 01 仪表盘 | 连接开关、实时流量、转发路径、出口选择 |
| 02 网络 | 出口分组管理、局域网共享 |
| 03 订阅 | 订阅导入、节点管理、去重分组、分享导出 |
| 04 策略 | 流分类 / 流行为 / 流策略 / 出口池 / 规则集 / 路由链 |
| 05 洞察 | 实时连接、流量排行、流量归属、稳定性报告 |
| 06 工具 | 解锁检测、链路追踪、泄漏检测、诊断、自动化 |
| 07 设置 | 身份模式、TUN、DNS、内核、分流方案 |

## 仪表盘：连接状态与流量全景

<figure class="shot">
<div class="frame">
<div class="chrome"><i></i><i></i><i></i><span class="t">AirLane — 仪表盘</span></div>
<div class="frame-img">
<img src="https://cdn.jsdelivr.net/gh/mirrortek-uk/airlane-web@main/public/docs-images/welcome/dashboard.png" alt="AirLane 仪表盘：连接卡片、实时流量与网络健康度">
<span class="hs" data-i="0" style="left:9%;top:15%">1</span>
<span class="hs" data-i="1" style="left:25%;top:25%">2</span>
<span class="hs" data-i="2" style="left:89%;top:27%">3</span>
<span class="hs" data-i="3" style="left:30%;top:63%">4</span>
<span class="hs" data-i="4" style="left:75%;top:62%">5</span>
</div>
</div>
<div class="cap"><span><b>图 1</b> · 仪表盘主界面（Windows · v1.0.4 · 浅色模式）</span><span>⤢ 点击放大</span></div>
<ol class="legend">
<li data-i="0"><span class="n">1</span><div><b>左侧导航</b><span>七个编号模块：仪表盘、网络、订阅、策略、洞察、工具、设置</span></div></li>
<li data-i="1"><span class="n">2</span><div><b>连接卡片</b><span>当前出口节点、协议与延迟；播放按钮一键连接 / 断开</span></div></li>
<li data-i="2"><span class="n">3</span><div><b>出口健康</b><span>当前出口的综合健康度评分，附延迟与连接数</span></div></li>
<li data-i="3"><span class="n">4</span><div><b>实时流量</b><span>上下行速率曲线与累计流量统计</span></div></li>
<li data-i="4"><span class="n">5</span><div><b>网络健康度</b><span>延迟、抖动、丢包率、可用率条形图实时刷新</span></div></li>
</ol>
</figure>

<div class="co tip"><div><b>小技巧</b>把鼠标移到截图上的数字标记，下方会高亮对应说明。仪表盘下方的「流量转发路径」把一次请求走过的链路完整画出来：</div></div>

<figure class="shot">
<div class="frame">
<div class="chrome"><i></i><i></i><i></i><span class="t">AirLane — 流量转发路径</span></div>
<div class="frame-img">
<img src="https://cdn.jsdelivr.net/gh/mirrortek-uk/airlane-web@main/public/docs-images/welcome/route-path.png" alt="流量转发路径与出口选择表">
<span class="hs" data-i="0" style="left:30%;top:28%">1</span>
<span class="hs" data-i="1" style="left:48%;top:28%">2</span>
<span class="hs" data-i="2" style="left:91%;top:14%">3</span>
<span class="hs" data-i="3" style="left:50%;top:60%">4</span>
</div>
</div>
<div class="cap"><span><b>图 2</b> · 流量转发路径 + 出口选择表</span><span>⤢ 点击放大</span></div>
<ol class="legend">
<li data-i="0"><span class="n">1</span><div><b>转发路径链</b><span>本机 IP → TUN 入口 → 域名识别（Sniff + Fake-IP）→ 路由匹配 → 出口组 → 当前出口 → 出口 IP</span></div></li>
<li data-i="1"><span class="n">2</span><div><b>路由匹配</b><span>显示命中的流策略与规则数（示例：8 条规则）</span></div></li>
<li data-i="2"><span class="n">3</span><div><b>总延迟</b><span>整条链路的端到端延迟汇总</span></div></li>
<li data-i="3"><span class="n">4</span><div><b>出口选择</b><span>全部可用出口按延迟、抖动、丢包与综合评分实时排序，点击行即切换 —— 截图中 213 个出口在线</span></div></li>
</ol>
</figure>

## 网络：出口分组与局域网共享

![网络出口分组：AI 服务、流媒体、社交通讯等](https://cdn.jsdelivr.net/gh/mirrortek-uk/airlane-web@main/public/docs-images/welcome/exit-groups.png)

出口按**用途**分组：AI 服务走美国、流媒体走德国、社交通讯走英国……每组独立选择器，互不干扰。

![局域网共享设置](https://cdn.jsdelivr.net/gh/mirrortek-uk/airlane-web@main/public/docs-images/welcome/lan-share.png)

开启**局域网共享**后，手机、电视、平板可以直接把电脑的出口当代理用（默认端口 7891，可选接入认证），无需在每台设备上重复安装配置。

## 订阅：节点与配置管理

![添加配置：远程订阅、本地文件、手动添加](https://cdn.jsdelivr.net/gh/mirrortek-uk/airlane-web@main/public/docs-images/welcome/add-subscription.png)

三种导入方式：远程订阅 URL、本地文件、手动添加单个节点，支持定时自动更新与订阅源管理。

订阅管理的进阶能力：

- **自动去重与地区分组**：按节点指纹去重（213 → 175），按地区自动归组（13 组）
- **Clash 一键迁移**：导入 Clash YAML 自动生成迁移报告，策略平移不丢规则
- **版本快照**：每次变更自动保存 v1-v5 快照，可对比、可回滚
- **分享与导出**：节点链接、二维码、Clash YAML、sing-box JSON、AIRLANE 配置包、WebDAV 备份

<div class="co note"><div>从 Clash / mihomo 迁移？直接把 YAML 订阅链接或配置文件拖进「订阅 → 添加配置」，AirLane 会解析全部代理组并给出迁移报告。</div></div>

## 策略：AirLane 的核心

<figure class="shot">
<div class="frame">
<div class="chrome"><i></i><i></i><i></i><span class="t">AirLane — 策略总览</span></div>
<div class="frame-img">
<img src="https://cdn.jsdelivr.net/gh/mirrortek-uk/airlane-web@main/public/docs-images/welcome/policy-overview.png" alt="策略总览：流分类、流行为、流策略与出口池">
<span class="hs" data-i="0" style="left:43%;top:28%">1</span>
<span class="hs" data-i="1" style="left:60%;top:38%">2</span>
<span class="hs" data-i="2" style="left:40%;top:46%">3</span>
<span class="hs" data-i="3" style="left:77%;top:55%">4</span>
<span class="hs" data-i="4" style="left:45%;top:75%">5</span>
</div>
</div>
<div class="cap"><span><b>图 3</b> · 策略总览（流量策略总览 + 出口池）</span><span>⤢ 点击放大</span></div>
<ol class="legend">
<li data-i="0"><span class="n">1</span><div><b>策略总览</b><span>流分类、流行为、流策略、出口池、规则集与可用出口的实时统计</span></div></li>
<li data-i="1"><span class="n">2</span><div><b>策略健康</b><span>规则覆盖率与代理 / 直连 / 拦截占比</span></div></li>
<li data-i="2"><span class="n">3</span><div><b>策略子页</b><span>出口池、规则集、流分类、流行为、流策略、路由链、命中分析、匹配模拟</span></div></li>
<li data-i="3"><span class="n">4</span><div><b>按地域自动生成</b><span>一键把节点按国家地区归入出口池</span></div></li>
<li data-i="4"><span class="n">5</span><div><b>出口池列表</b><span>每个地区的健康节点数与平均延迟，可展开查看</span></div></li>
</ol>
</figure>

策略模块是 AirLane 区别于普通客户端的核心。所有流量按四层模型处理：

| 层 | 概念 | 作用 |
|---|---|---|
| 第一层 | **流分类** | 按域名 / IP / 进程 / 协议给流量贴标签 |
| 第二层 | **流行为** | 决定处置方式：Route（走代理）/ Direct（直连）/ Block（拦截）/ Reject（拒绝）/ DNS |
| 第三层 | **流策略** | 绑定出口池并选择选择器：自动 / 智能 / 手动 / 故障转移 / 负载均衡 |
| 第四层 | **出口池** | 候选节点集合，按地区与健康度组织 |

规则集支持 GEOSITE、GEOIP、远程 rule-provider 与本地内置集合（如 AirLane-AI 80 条、AirLane-Ads 广告库）。

![路由链：策略编译后的实际匹配顺序](https://cdn.jsdelivr.net/gh/mirrortek-uk/airlane-web@main/public/docs-images/welcome/route-chain.png)

**路由链**展示策略编译进 sing-box 后的真实匹配顺序与每条规则的命中数 —— 你看到的不是"配置文件"，而是"正在运行的路由表"。配套工具：

- **命中分析**：每条策略的累计 / 今日命中次数与流量统计，零命中规则一眼可见
- **匹配模拟**：输入任意域名（如 `chat.openai.com`）预览它会命中哪条规则、走哪个出口，并回答"为什么"

<div class="co warn"><div><b>注意</b>规则从上到下匹配，命中第一条就停止。范围大的规则（如 MATCH 兜底）永远放在最后。</div></div>

## 洞察：看清每一字节的去向

![实时连接：每条连接的进程、域名、规则与出口](https://cdn.jsdelivr.net/gh/mirrortek-uk/airlane-web@main/public/docs-images/welcome/connections.png)

- **实时连接**：每条活动连接的进程、目标域名、命中规则、使用出口，代理 / 直连 / 拦截分类统计
- **流量排行**：按 SNI 域名或应用进程排行的 Top 流量大户
- **流量归属**：每个出口节点消耗了多少流量，附周 / 月报表 —— 订阅流量去哪了一清二楚
- **延迟与稳定性**：24 小时延迟曲线、P95、7 日可用率与切换次数
- **内核日志**：sing-box 原始日志，按级别过滤

## 工具：专业诊断工具集

![链路追踪：单域名逐跳耗时分解](https://cdn.jsdelivr.net/gh/mirrortek-uk/airlane-web@main/public/docs-images/welcome/chain-trace.png)

**链路追踪**把一个域名的完整路径逐跳拆开：入站 → DNS → 流分类 → 流策略 → 出口 → 目标，每段耗时单独计时，慢在哪一跳直接看见。

![解锁检测：流媒体与 AI 服务可达性矩阵](https://cdn.jsdelivr.net/gh/mirrortek-uk/airlane-web@main/public/docs-images/welcome/unlock-test.png)

- **解锁检测**：Netflix / Disney+ / ChatGPT / YouTube / TikTok 可达性矩阵，显示真实出口地区（全解锁 / 部分受限 / 不可用）
- **泄漏检测**：出口、DNS、覆盖、路由、浏览器隐私五维实测，附严格防泄漏（WebRTC/STUN 拦截）与 IPv6 出站开关
- **配置检查**：对即将生成的 sing-box 配置做 11 项校验，带"修复"按钮的项目可自动修正
- **网络诊断**：14 项实时体检（内核进程、代理端口、TUN、DNS……），附故障自动切换的自愈记录，可导出报告

![自动化：Profile、网络感知与定时任务](https://cdn.jsdelivr.net/gh/mirrortek-uk/airlane-web@main/public/docs-images/welcome/automation.png)

**自动化**让 AirLane 按环境自己行动：Profile（整套策略 + DNS 配置一键切换）、网络感知触发器（切换 Wi-Fi 自动换 Profile）、定时任务。

## 设置：系统与内核

![网络设置：TUN 模式、系统代理与混合端口](https://cdn.jsdelivr.net/gh/mirrortek-uk/airlane-web@main/public/docs-images/welcome/settings-network.png)

- **TUN 模式**：接管系统级流量，IPv4/IPv6 双栈；内核服务常驻运行后 TUN 永久生效，无需重复提权
- **系统代理 / 混合端口**：连接时通过系统代理接管 HTTP/HTTPS，本地混合端口默认 7890
- **域名嗅探**：对纯 IP 流量嗅探 TLS SNI / HTTP Host / QUIC 后再分流
- **DNS**：中国大陆 / 海外两套方案、DoH 加密查询、Fake-IP（198.18.0.0/15）、污染检测、防 DNS 泄漏（Split-DNS）
- **内核**：当前内核 sing-box，MUX 连接复用、日志级别、应用前自动快照

<div class="co warn"><div><b>注意</b>TUN 模式需要管理员权限与 Wintun 驱动。首次开启会提示安装内核服务，之后随系统常驻，不再重复提权。</div></div>

![身份模式：用户账号与匿名模式](https://cdn.jsdelivr.net/gh/mirrortek-uk/airlane-web@main/public/docs-images/welcome/settings-user.png)

**身份模式**决定配置与共享资源如何同步：

- **用户账号**：用户名密码、邮箱 OTP 或 Google SSO 登录，配额完整
- **匿名模式**：无账号密码，在 airlane.cloud 生成配对码（XXXX-XXXX，10 分钟有效、仅可使用一次）绑定设备，最多 2 台设备，可使用共享 VPS、共享家宽 IP 与 Mesh 组网资源

<div class="co note"><div>匿名身份没有账号与密码，凭据仅存于本设备。长期离线会被回收，且没有配置模板配额 —— 需要多设备同步或完整配额时请选择用户账号。</div></div>

**配置管理**中的"分流方案"（Routing Profile）保存策略、规则集与用户规则的整体快照 —— 内置「AirLane 推荐」方案开箱即用；高级用户可直接查看与编辑下发给 sing-box 的最终 `config.json`。

最小化到托盘后，托盘菜单可直接切换各分组出口或断开连接，无需唤起主窗口。

## 五分钟上手

<ol class="steps">
<li><b>下载安装</b>
<p>到 <a href="/download">下载页</a>获取适合你平台的安装包，安装后首次启动完全本地运行，无需注册。</p>
<div class="mini"><span class="ui p">airlane.cloud/download</span>→<span class="ui">Windows / macOS / Android / iOS</span></div></li>
<li><b>导入订阅</b>
<p>打开「订阅 → 添加配置」，粘贴订阅 URL 或导入 Clash YAML / 本地文件。</p>
<div class="mini"><span class="ui">订阅</span>→<span class="ui">添加配置</span>→<span class="ui">远程订阅 URL</span></div></li>
<li><b>确认分流方案</b>
<p>「设置 → 配置管理」中确认正在使用「AirLane 推荐」Routing Profile —— 默认已按用途分好出口。</p></li>
<li><b>开启连接</b>
<p>回「仪表盘」点击连接按钮。需要接管全部流量时在「设置 → 网络」打开 TUN 模式。</p>
<div class="mini"><span class="ui p">▶ 连接</span>→<span class="ui">设置 → 网络 → TUN 模式</span></div></li>
<li><b>验证路径</b>
<p>打开「工具 → 链路追踪」，输入一个域名，确认它走了你预期的出口。</p></li>
</ol>

详细步骤见 [快速上手](/docs/quick-start)。

## 隐私与数据

- **本地优先**：未登录时所有数据仅保存在本机，节点凭据写入系统钥匙串（Credential Manager / Keychain）
- **登录只用于同步**：身份、配额与 PoolVIP / Mesh 共享资源需要账号；代理流量本身不经过 AirLane 服务器
- **匿名模式**：不需要邮箱与密码，配对码绑定即用，长期离线的匿名身份会被回收

## 常见问题

<details><summary>AirLane 用的是什么内核？</summary><p>sing-box。AirLane 在 sing-box 之上构建了可视化策略层 —— 策略树编译成 sing-box 原生 config.json 下发，不使用 fork 或私有协议。</p></details>
<details><summary>不注册账号能用吗？</summary><p>能。未登录时所有功能在本机运行；需要多设备同步或共享资源时可选择匿名模式（配对码绑定，无需邮箱）或注册用户账号。</p></details>
<details><summary>支持哪些代理协议？</summary><p>38+ 种，包括 Hysteria2、TUIC、VLESS + Reality、Trojan、Shadowsocks-2022、VMess、WireGuard 等 —— 由 sing-box 内核原生支持，见<a href="/blog/proxy-protocol-evolution">协议演化史</a>。</p></details>
<details><summary>AirLane 和 Clash / mihomo 客户端有什么区别？</summary><p>Clash/mihomo 是规则驱动的代理内核，AirLane 在其思路之上提供完整的可视化策略系统：四层流量模型、编译后路由链、命中分析、链路追踪、自动化 Profile，以及 PoolVIP / Mesh 云端资源池。</p></details>
<details><summary>支持哪些平台？</summary><p>Windows、macOS、iOS、Android。界面与功能跨平台一致。</p></details>
<details><summary>我的流量会被记录或上传吗？</summary><p>不会。连接记录、流量统计仅保存在本机；AirLane 服务器只承载账号、配额与共享资源元数据，不经过你的代理流量。</p></details>

## 下一步

- [快速上手](/docs/quick-start)：添加出口、创建策略、用链路追踪验证
- [账号中心](/docs/account-center)：匿名身份、配对码、设备管理与套餐配额
- [博客](/blog)：协议科普与实战教程
