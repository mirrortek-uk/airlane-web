# 如何使用 AirLane 搭建一台位置在美国的工作电脑

想让自己的电脑"看起来在美国"？用 AirLane 完全可以做到——但要先说清楚一件事：**网络层面可以做到非常接近，但不能让所有物理/设备层面的信息都变成美国**。这篇文章讲清楚 AirLane 能做到什么、做不到什么，以及如何把虚拟网络、虚拟位置、浏览器指纹这几层环境统一起来，搭一个稳定的美国工作环境（比如 Claude、Google、Netflix 等需要美国 IP 和稳定环境的场景）。

![搭建一台位置在美国的工作电脑](https://cdn.jsdelivr.net/gh/mirrortek-uk/airlane-web@main/public/blog-images/us-work-environment/cover.zh.svg)

---

## 先给结论：AirLane 能做到什么

假设你的拓扑是：

```text
中国电脑
192.168.x.x
    │
    │ AirLane TUN
    ↓
美国 VPS / Exit
203.x.x.x
    │
    ↓
Internet
```

AirLane 可以把电脑的大部分网络流量通过美国 Exit 出口：

- 公网 IP → 美国 IP
- TCP / UDP → 美国出口
- DNS → 美国 DNS / 美国 Exit
- IPv6 → 美国 Exit（如果正确配置）
- 浏览器访问网站 → 网站看到美国出口
- App → 可以统一经过美国 Exit
- WebRTC → 通过 AirLane 的网络路径控制，避免泄露真实网络地址

从**网络出口位置**来看，就非常接近"这台电脑在美国"——这就是所谓"虚拟位置"的正确实现方式：不是改 GPS，而是改出口。

## AirLane 的真正优势：美国环境 + 智能分流

很多人想到的方案是"VPN = 全部流量去美国"。但那样中国网站会变慢、银行 App 会风控、局域网打印机会失联。AirLane 的做法是按规则分流：

```text
AI 网站 / Google / YouTube / Netflix  →  US Exit
中国网站 / 银行 / 公司系统 / 局域网      →  DIRECT
```

也就是：**美国虚拟网络环境 + 智能分流**，对应 AirLane 的设计链路：

```text
Traffic Classifier
        │
        ├── US Services  →  US Exit
        ├── China        →  DIRECT
        └── Private      →  DIRECT
```

![智能分流](https://cdn.jsdelivr.net/gh/mirrortek-uk/airlane-web@main/public/blog-images/us-work-environment/split-routing.zh.svg)

国内服务不受影响，只有需要美国身份的目标走美国出口——这才是"工作电脑"的正确形态，而不是全局翻墙。

---

## 但有几个东西 VPN 改不了

即使所有网络流量都走美国，下面这些信息不会自动变化：

- Windows 系统地区不会自动变美国
- GPS 不会自动变美国
- 手机基站位置不会变
- 浏览器已有 Cookie 不会消失
- Google / Apple / Microsoft 账号的历史位置记录不会消失
- 某些网站会通过账号、Cookie、浏览器指纹推断你以前的位置
- 美国住宅服务能区分**美国住宅 IP** 和**美国数据中心 VPS IP**

所以更准确的描述是：

> **让你的网络连接看起来来自美国（Make your Internet connection appear to originate from the US）**

而不是"把电脑变成一台物理上在美国的电脑"。

---

## 「美国环境」的五层模型

要把这件事做完整，应该分五层来看。AirLane 能完全接管的是第一层，其余四层需要配合配置：

![五层模型](https://cdn.jsdelivr.net/gh/mirrortek-uk/airlane-web@main/public/blog-images/us-work-environment/layers.zh.svg)

| 层级 | 内容 | AirLane 能否解决 |
|------|------|------------------|
| 1. 网络层 | US IP、DNS、IPv4/IPv6、WebRTC、UDP | ✅ 完全可控 |
| 2. 设备层 | 系统地区、语言、时区、定位 | ✅ PC 上基本可控（改系统设置） |
| 3. 浏览器层 | 独立 Profile、Cookie、指纹、WebRTC | ⚠️ 可显著降低差异 |
| 4. 账号层 | Google/Apple/Microsoft 历史位置 | ⚠️ 无法删历史，只能新建账号 |
| 5. 出口类型 | 住宅 IP vs 数据中心 IP | 取决于你买的资源 |

### 第 1 层：网络层（AirLane 的主场）

1. 在 [PoolVIP](https://poolvip.airlane.cloud)（[https://poolvip.airlane.cloud](https://poolvip.airlane.cloud)）购买一台美国 VPS 或美国住宅 IP 资源
2. 打开 AirLane 客户端 → 账号中心绑定身份 → 资源自动同步为可用 Exit
3. 选择美国 Exit，启用 TUN 模式
4. 确认 DNS / IPv6 / WebRTC 都走美国路径——AirLane 内置泄漏检测，连接前跑一遍

完成后：Google、YouTube、Claude 看到的都是美国 IP。

### 第 2 层：设备层（Windows 设置）

如果是全新安装的电脑，最容易建立一致的美国环境：

```text
Windows Region    → United States
Display Language  → English (US)
Timezone          → America/New_York（或对应 Exit 所在城市）
Location          → 关闭或按 Exit 城市设置
```

注意：**GPS 是例外**。没有定位硬件的 PC 上，"把 GPS 改成纽约"不是 VPN 能做的事。好的做法是显示状态而不是伪装——比如 AirLane 可以告诉你：

```text
Network Location      ✓ United States
DNS Location          ✓ United States
Browser Timezone      ✓ United States
System Region         ✓ United States
Physical Location     — Not controlled
```

### 第 3 层：浏览器层（浏览器指纹）

**不要用你原来的 Chrome 直接用美国 Exit。** 正确做法是创建一个独立浏览器 Profile：

```text
AirLane US Browser Profile
  ├── Language   → en-US
  ├── Timezone   → US
  ├── Cookies    → 全新（不带历史记录）
  ├── WebRTC     → 走 AirLane 路径
  └── Fingerprint→ 与其他层一致
```

浏览器指纹的关键不是"伪装得像别人"，而是**内部一致**：语言、时区、IP、WebRTC、DNS 都指向美国，就比"美国 IP + 中文系统 + 东八区时区"的混搭可信得多。

### 第 4 层：账号层

AirLane 无法替你删除 Google/Apple 账号的历史位置记录。正确做法：**在美国环境里注册/使用独立账号**，而不是试图清洗老账号的历史。

### 第 5 层：出口类型

美国 VPS 的 IP 即使地理位置在美国，ASN 仍然是数据中心。部分服务（流媒体、支付、风控严格的平台）能识别出来。如果你的目标是"看起来像普通美国家庭网络"，就需要 **Residential Exit（住宅 IP）**——PoolVIP 的住宅 IP 资源就是为这一层准备的。

---

## 典型场景：Claude 中国接入的稳定环境

很多人搭美国环境就是为了 Claude 这类 AI 服务——它们不对中国大陆 IP 开放，且风控会校验 IP 一致性。用 AirLane 的做法：

```text
Claude / AI 服务   → US Exit（固定出口，IP 稳定）
其余流量           → 按策略分流
```

要点是**"稳定"**：Claude 风控最怕的是 IP 乱跳。固定使用同一个美国 Exit + 独立浏览器 Profile + 独立账号，五层一致，就是最稳的"Claude 中国接入"方案。反而频繁换节点、浏览器指纹和 IP 不匹配，是封号的高发原因。

---

## 检查清单

搭建完成后对照这张表：

```text
公网 IP          → 美国        ✓
DNS              → 美国 Exit   ✓
IPv6             → 美国 Exit   ✓（或禁用）
WebRTC           → 不泄露真实 IP ✓
UDP              → 美国 Exit   ✓
系统地区/时区     → 美国        ✓
浏览器 Profile    → 独立、干净  ✓
账号             → 美国环境内注册 ✓
GPS/物理位置      → 不控制      —
```

---

## 总结

- AirLane 能把**网络出口位置**做到"这台电脑在美国"的程度：IP、DNS、IPv4/IPv6、UDP、WebRTC 全部走美国 Exit
- 配合智能分流，中国服务和公司系统继续直连，互不影响
- 设备层改系统地区/时区/语言；浏览器层建独立 Profile；账号层用新账号；需要"像家庭宽带"就上住宅 IP
- VPN 改不了 GPS、基站和第三方账号历史——别指望 100% 伪装，把可控的五层做一致就足够稳

如果你已经有美国 VPS 或住宅 IP，直接打开 AirLane 导入资源、开 TUN、跑一遍泄漏检测，三分钟就能开始用。还没资源的话，去 [PoolVIP](https://poolvip.airlane.cloud) 选一个美国节点即可。
