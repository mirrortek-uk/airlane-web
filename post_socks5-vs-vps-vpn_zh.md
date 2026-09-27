# 如何选择代理类型：SOCKS5 还是自建 VPS VPN 代理服务器

买了 VPS，下一步该用什么方式把它变成可用的代理出口？很多人会在 SOCKS5 代理和自建 VPN/代理节点（WireGuard、sing-box、Xray）之间犹豫。两者看起来都是"把流量发到 VPS"，但工作方式完全不同：SOCKS5 更像是**给某个应用提供代理**，VPN 更像是**接管设备的整个网络出口**。

![SOCKS5 与 VPN 对比](https://cdn.jsdelivr.net/gh/mirrortek-uk/airlane-web@main/public/blog-images/socks5-vs-vps-vpn/cover.svg)

---

## 核心区别：应用层代理 vs 设备层接管

| 对比项 | SOCKS5 代理 | VPS 自建 VPN/代理（TUN） |
|--------|-------------|--------------------------|
| 工作层级 | 应用层代理 | TUN/VPN 层，系统级 |
| 浏览器 | 需要浏览器配置代理 | 无需单独配置 |
| Windows 全局流量 | ❌ 默认不管 | ✅ 可以接管 |
| 手机 App | 很多 App 不支持 SOCKS | ✅ 通常可以 |
| DNS | 取决于客户端配置 | 可以统一走 VPS |
| UDP | SOCKS5 支持但需客户端配合 | WireGuard/部分 sing-box 方案更自然 |
| 分流 | 依赖客户端 | sing-box 等可以做复杂分流 |
| 多应用统一使用 | 一般 | 很方便 |
| 搭建难度 | 低 | 较高 |
| 资源消耗 | 较低 | 略高 |
| 用户体验 | "配置代理" | "打开 VPN 就能用" |

---

## 举个最直观的例子

假设你在 [PoolVIP](https://poolvip.airlane.cloud)（https://poolvip.airlane.cloud）上买了一个 VPS。

### 用 SOCKS5

```text
Chrome ──SOCKS5──> VPS ──> Internet
```

Chrome 设置代理后确实能用。但是 Windows 微信、Windows 游戏、其他 App —— **不一定会走这个代理**。每个应用都要单独配置，而且很多应用压根不支持 SOCKS 设置。

### 用 VPN / TUN

```text
Windows
 ├─ Chrome
 ├─ 微信
 ├─ 游戏
 ├─ Telegram
 └─ 其他App
        ↓
    AirLane TUN
        ↓
       VPS
        ↓
    Internet
```

整条设备流量都被接管，所有应用自动走 VPS，不需要逐个配置。

### 更进一步：分流

AirLane 这类编排型客户端还能在接管的基础上做规则分流：

```text
中国网站   → DIRECT
国外网站   → VPS
Netflix    → 美国 VPS
公司网站   → DIRECT
```

"打开 VPN 就能用 + 各走各的出口"——这正是编排型客户端相比单纯 SOCKS5 服务最有价值的地方之一。

---

## 总结

- **只要浏览器/单个应用走代理** → SOCKS5 够用，便宜简单
- **要整台设备、所有 App、DNS、UDP、分流** → 用 VPN/TUN 方案（sing-box、WireGuard），或用 AirLane 直接接管设备出口，开箱即用
