# 欢迎使用 AirLane

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

![AirLane 仪表盘：连接卡片、实时流量与网络健康度](https://cdn.jsdelivr.net/gh/mirrortek-uk/airlane-web@main/public/docs-images/welcome/dashboard.png)

- **连接卡片**：当前出口节点、协议、延迟与健康度评分，一键连接 / 断开
- **实时流量**：上下行速率曲线，连接前后对比一目了然
- **网络健康**：各出口延迟条实时刷新，劣质节点肉眼可辨

![流量转发路径与出口选择表](https://cdn.jsdelivr.net/gh/mirrortek-uk/airlane-web@main/public/docs-images/welcome/route-path.png)

**流量转发路径**把一次请求走过的链路画了出来：本机 IP → TUN 入口 → 域名识别（Sniff + Fake-IP）→ 路由匹配 → 出口组 → 当前出口 → 出口 IP。每一跳都是可点击的真实组件。

**出口选择**表格列出全部可用出口，按延迟、抖动、丢包与综合评分实时排序 —— 截图中 213 个出口在线。

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

## 策略：AirLane 的核心

![策略总览：流分类、流行为、流策略与出口池](https://cdn.jsdelivr.net/gh/mirrortek-uk/airlane-web@main/public/docs-images/welcome/policy-overview.png)

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

- **TUN 模式**：接管系统级流量，IPv4/IPv6 双栈（需管理员权限与 Wintun 驱动；内核服务常驻后无需重复提权）
- **系统代理 / 混合端口**：连接时通过系统代理接管 HTTP/HTTPS，本地混合端口默认 7890
- **域名嗅探**：对纯 IP 流量嗅探 TLS SNI / HTTP Host / QUIC 后再分流
- **DNS**：中国大陆 / 海外两套方案、DoH 加密查询、Fake-IP（198.18.0.0/15）、污染检测、防 DNS 泄漏（Split-DNS）
- **内核**：当前内核 sing-box，MUX 连接复用、日志级别、应用前自动快照

![身份模式：用户账号与匿名模式](https://cdn.jsdelivr.net/gh/mirrortek-uk/airlane-web@main/public/docs-images/welcome/settings-user.png)

**身份模式**决定配置与共享资源如何同步：

- **用户账号**：用户名密码、邮箱 OTP 或 Google SSO 登录，配额完整
- **匿名模式**：无账号密码，在 airlane.cloud 生成配对码（XXXX-XXXX，10 分钟有效、仅可使用一次）绑定设备，最多 2 台设备，可使用共享 VPS、共享家宽 IP 与 Mesh 组网资源

**配置管理**中的"分流方案"（Routing Profile）保存策略、规则集与用户规则的整体快照 —— 内置「AirLane 推荐」方案开箱即用；高级用户可直接查看与编辑下发给 sing-box 的最终 `config.json`。

最小化到托盘后，托盘菜单可直接切换各分组出口或断开连接，无需唤起主窗口。

## 五分钟上手

1. [下载安装](/download)适合你平台的版本
2. 打开「订阅」，粘贴订阅 URL 或导入 Clash YAML
3. 确认「设置 → 配置管理」中正在使用「AirLane 推荐」分流方案
4. 回「仪表盘」点连接 —— 默认已按用途分好出口
5. 打开「工具 → 链路追踪」，输入一个域名验证它走了预期的出口

详细步骤见 [快速上手](/docs/quick-start)。

## 隐私与数据

- **本地优先**：未登录时所有数据仅保存在本机，节点凭据写入系统钥匙串（Credential Manager / Keychain）
- **登录只用于同步**：身份、配额与 PoolVIP / Mesh 共享资源需要账号；代理流量本身不经过 AirLane 服务器
- **匿名模式**：不需要邮箱与密码，配对码绑定即用，长期离线的匿名身份会被回收

## 常见问题

### AirLane 用的是什么内核？

sing-box。AirLane 在 sing-box 之上构建了可视化策略层 —— 策略树编译成 sing-box 原生 config.json 下发，不使用 fork 或私有协议。

### 不注册账号能用吗？

能。未登录时所有功能在本机运行；需要多设备同步或共享资源时可选择匿名模式（配对码绑定，无需邮箱）或注册用户账号。

### 支持哪些代理协议？

38+ 种，包括 Hysteria2、TUIC、VLESS + Reality、Trojan、Shadowsocks-2022、VMess、WireGuard 等 —— 由 sing-box 内核原生支持，见[协议演化史](/blog/proxy-protocol-evolution)。

### AirLane 和 Clash / mihomo 客户端有什么区别？

Clash/mihomo 是规则驱动的代理内核，AirLane 在其思路之上提供完整的可视化策略系统：四层流量模型、编译后路由链、命中分析、链路追踪、自动化 Profile，以及 PoolVIP / Mesh 云端资源池。

### 支持哪些平台？

Windows、macOS、iOS、Android。界面与功能跨平台一致。

### 我的流量会被记录或上传吗？

不会。连接记录、流量统计仅保存在本机；AirLane 服务器只承载账号、配额与共享资源元数据，不经过你的代理流量。

## 下一步

- [快速上手](/docs/quick-start)：添加出口、创建策略、用链路追踪验证
- [账号中心](/docs/account-center)：匿名身份、配对码、设备管理与套餐配额
- [博客](/blog)：协议科普与实战教程
