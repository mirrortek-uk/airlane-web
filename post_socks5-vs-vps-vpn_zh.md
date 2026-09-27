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

假设你在 PoolVIP 上买了一个 VPS。

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

## 对 PoolVIP 的产品启示

如果你的业务同时卖代理资源，建议是**两种都提供，但定位不同**：

- **SOCKS5 Proxy**：低价、简单、临时使用，适合"浏览器里临时换个 IP"的场景
- **VPN / AirLane 节点**：完整设备代理、分流、DNS、UDP、多 App 统一使用

更进一步，可以把同一个 VPS 包装成多种出口资源：

```text
VPS → 自动生成 SOCKS5 / HTTP / WireGuard / AirLane 节点
```

同一个 VPS 变成不同类型的"出口资源"，而不是只能卖一种代理形态。

而 AirLane + PoolVIP 最自然的产品链路其实是：

```text
PoolVIP 买 VPS → 自动部署 sing-box → 自动注册 AirLane
    → 用户直接拿到一个可用的 AirLane Exit
```

这样用户甚至不需要理解 SOCKS5、WireGuard 这些底层概念 —— 买了 VPS，打开 AirLane，就能用。

---

## 总结

- **只要浏览器/单个应用走代理** → SOCKS5 够用，便宜简单
- **要整台设备、所有 App、DNS、UDP、分流** → 用 VPN/TUN 方案（sing-box、WireGuard）
- **买 VPS 做出口资源池** → 两者都生成，让用户按场景选择；或者干脆封装成 AirLane Exit，用户零配置上手
