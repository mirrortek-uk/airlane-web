# 代理协议前世今生：从 Shadowsocks 到 VLESS + Reality

挑节点的时候你总会看到一串名字：VMess、VLESS、Trojan、Hysteria2、TUIC、SS-2022……它们之间是什么关系？为什么有的写在 V2Ray 里，有的要单独装程序？这篇把代理协议的族谱完整梳理一遍——**其实只有两棵树**。

![代理协议前世今生](https://cdn.jsdelivr.net/gh/mirrortek-uk/airlane-web@main/public/blog-images/proxy-protocol-evolution/cover.zh.svg)

---

## 先分清一个概念：协议 ≠ 框架

讨论之前必须建立的心智模型：

- **协议（Protocol）**：流量怎么加密、怎么伪装、怎么传。比如 VMess 是一种加密认证格式，Reality 是一种伪装方案。
- **框架 / 内核（Framework / Core）**：一个程序，里面可以装很多种协议。V2Ray、Xray、sing-box、mihomo 都是框架——你跑的不是"VMess 这个软件"，而是"支持 VMess 的内核"。

很多混乱来自把两者混为一谈：Trojan 既是协议也是独立程序（Trojan-Go），但它也能被嵌进 Xray 里跑；Hysteria2 是纯独立程序，任何框架都不"原生"拥有它，只是新内核们把它也实现了。

理解了这个，下面的族谱就清晰了。

![框架与独立协议族谱](https://cdn.jsdelivr.net/gh/mirrortek-uk/airlane-web@main/public/blog-images/proxy-protocol-evolution/lineage.zh.svg)

---

## 前夜：企业 VPN 时代（2012 之前）

在翻墙协议出现之前，"VPN"指的是企业级方案：PPTP、L2TP/IPsec、OpenVPN。它们的设计目标是**安全接入公司内网**，不是对抗审查——协议特征明显（固定握手、固定端口、特征指纹），深度包检测（DPI）一抓一个准。长城防火墙把它们按协议类型识别封锁，毫不费力。

**教训沉淀**：要在对抗网络里活下来，流量不能"长得像一个已知协议"。

## 第一次革命：Shadowsocks（2012–2015）

clowwindy 写的 Shadowsocks 是分水岭。它的思路完全反过来：**不做 VPN，做一个长得像随机流量的 SOCKS5 代理**。全流量加密、无握手特征、无固定格式——DPI 看到的只是一段不知所云的字节流。

轻量、快、好部署，SS 几乎以一己之力把翻墙门槛降到"一个二进制 + 一行命令"。后来的 SSRR/ShadowsocksR 分支加了混淆参数，但项目随后停更，SS 原版也因为"随机流量本身可疑"被逐步识别——**没有任何特征，本身就是一种特征**。

## 框架时代：V2Ray 与 VMess（2016–2020）

V2Ray（Project V）带来的最大创新不是某个协议，而是**框架思想**：一个程序里，协议、传输层、路由规则可插拔组合。它自己的原生协议 VMess 用时间戳认证 + AEAD 加密，比 SS 的固定密码认证安全得多。

从此生态分工成型：

- **V2Ray（框架）** ↔ 里面装着 VMess、VLESS、Trojan 这些协议
- 同一时期 **Clash** 走红，解决的是另一个问题——按规则分流，但核心仍是"协议跑在内核里"

2019 年出现的 **Trojan** 把伪装推进到下一阶段：不藏了，直接**假装成 HTTPS**。TLS 握手 + 密码认证，让代理流量和访问网站在外形上几乎一样。它也确立了一个后来反复使用的模式——Trojan 有独立实现（Trojan-Go），也同时被嵌进各框架。

## 分叉与跃迁：Xray、XTLS 与 Reality（2020–2022）

V2Ray 原团队放慢节奏后，社区 fork 出 **Xray-core**，沿着同一路线继续演进，但加了关键差异化能力：

- **XTLS / XTLS Vision 流控**：对 TLS 握手后的数据流做精确重组，消掉早期代理"密文切块"留下的流量特征
- **VLESS**：VMess 的极简版，剥离自带加密，把安全全部交给传输层（TLS）——为 Reality 铺路
- **Reality（2022，划时代）**：伪装思路的终极形态。不再"模仿"HTTPS，而是**借用真实大站（如 microsoft.com）的 TLS 握手**。主动探测拿到的是真证书、真参数、真服务端行为——协议层面无法区分。这是反检测技术第一次从"装得像"变成"就是"

同一年 **Shadowsocks-2022** 发布，用现代 AEAD 密码套件重写了老 SS 的加密层。注意它的身份：**独立协议，Xray 只是兼容支持**，跟 VMess/VLESS 这种"框架原生"不是一回事。

## 两棵树成型：QUIC 独立军（2022–至今）

另一条线是 UDP/QUIC 阵营的独立协议，**它们不依附任何框架，自己就是完整程序**：

- **Hysteria / Hysteria2**：魔改拥塞控制的 QUIC 协议栈，高丢包链路下的速度之王
- **TUIC**：同为 QUIC 的独立实现，设计更精致的多路复用
- **WireGuard**：严格说不算翻墙协议，但 Mesh 组网场景离不开它

而框架一侧完成了最后的整合：

- **Clash → mihomo**：2023 年 11 月 Clash 删库停更，社区 fork 出 mihomo 继续维护
- **sing-box**：新一代通用内核，把 V2Ray 系协议（VMess/VLESS/Trojan/Reality）和独立协议（Hy2/TUIC/SS-2022）**统一收进一个数据面**

至此族谱完整：**一棵"框架载协议"的树（V2Ray→Xray→mihomo/sing-box），一棵"独立协议"的树（SS-2022、Trojan-Go、TUIC、Hy2）——而新内核把两棵树都吃了进去。**

---

## 演化史教会我们三件事

**1. 伪装的迭代方向是"越来越真"**

随机流量（SS）→ 模仿 TLS（Trojan）→ 借用真 TLS（Reality）。每一代都解决上一代的可识别性问题。**没有终极答案，只有当前的领先者**——Reality 今天无敌，但流量统计特征分析仍在演进。

**2. 传输层在 TCP 和 UDP 之间来回摆**

TCP 协议（Reality）隐蔽但弱网差；QUIC 协议（Hy2/TUIC）快但 UDP 易被限速。两条路线长期共存——**单一传输层不可能通吃所有网络环境**。

**3. 协议会死，框架会重组，唯一不变的是"多协议共存"**

VMess 老了，SS 换过两次血，Clash 原库都没了——但每个协议都没真正消失，而是被收进更大的内核里。**押注单一协议是死路，能同时调度多种协议的能力才是资产。**

---

## 这就是为什么是 AirLane

如果演化史有什么终极结论，那就是：**你需要的是"全部协议 + 智能调度"，而不是"选对某一个"**。

**1. 两棵树全覆盖**

AirLane 基于 sing-box 内核，38+ 协议原生支持：V2Ray 系的 VMess/VLESS/Trojan、Xray 独有的 XTLS Vision 和 Reality、独立阵营的 Hysteria2/TUIC/SS-2022/WireGuard——**族谱上每一个节点都能跑**。机场的 Clash 订阅、V2Ray 订阅、自建节点，一键导入零成本迁移。

**2. 让每条流量用上"那个时代最合适的协议"**

看完演化史就知道没有银弹：隐蔽选 Reality、速度选 Hy2、组网选 WireGuard。AirLane 的策略树让你把这些**按流量类别可视化分配**——视频走 QUIC 抢带宽，账号登录走 Reality 保伪装，不用为整个设备锁定一个协议。

**3. 复杂环境的生存能力**

UDP 被封？Reality 的 TCP 顶上。线路丢包爆炸？Hy2 的暴力拥塞控制顶住。节点被识别？健康检测自动切到下一个出口。AirLane 把协议层面的"适应性"变成了产品功能——**协议兴衰是历史规律，能在历史里活下来的是调度能力**。

---

## 总结

| 时代 | 代表 | 核心思路 | 今天还活着吗 |
|------|------|---------|------------|
| 企业 VPN | OpenVPN/IPsec | 加密隧道 | 翻墙场景已淘汰 |
| 轻量代理 | Shadowsocks | 随机化流量 | SS-2022 续命 |
| 框架时代 | VMess/VLESS | 可插拔协议框架 | 仍是存量主力 |
| 伪装跃迁 | Reality/Trojan | 真 TLS 握手 | Reality 是隐蔽天花板 |
| QUIC 独立军 | Hy2/TUIC | UDP 性能压榨 | 速度首选 |
| 通用内核 | sing-box/mihomo | 一个内核跑全部 | **当下主流** |

十五年演化没有产生"终极协议"，产生的是**一个多协议共存、按场景调度的生态**。AirLane 站在这个生态的终点——也是下一次演化的起点。

→ [下载 AirLane](https://www.airlane.cloud/download) · [38+ 协议支持详情](https://www.airlane.cloud)
