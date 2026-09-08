# 什么是 QUIC？为什么 AirLane 选择基于 QUIC 的代理协议

QUIC（Quick UDP Internet Connections）是一种快速、安全的现代传输协议，为 HTTP/3 提供底层支持。它最初由 Google 开发，后由 IETF 标准化（RFC 9000），如今已被越来越多的网络通信采用。根据 W3Techs 的数据，QUIC 已被约 9% 的网站使用，HTTP/3 的采用率已超过 38%。

对于代理客户端来说，QUIC 不仅仅是一个技术名词 — 它直接决定了你在高丢包、高延迟、网络切换等真实场景下的体验。AirLane 基于 sing-box 内核，原生支持 Hysteria2 和 TUIC v5 等基于 QUIC 的代理协议。本文将带你全面了解 QUIC 的工作原理、核心优势，以及它在 AirLane 中的实际应用。

![QUIC 与 TCP+TLS 握手对比](/blog-images/what-is-quic/cover.svg)

---

## QUIC 是什么？

理解 QUIC 最简单的方式是把它看作 **HTTP/2 + TLS 1.3 + UDP** 的融合体。它在传输层运行于 UDP 之上，但提供了 TCP 级别的可靠传输，同时大幅降低了延迟。

QUIC 的核心设计目标：

- **更快的连接建立**：将传输握手和加密握手合并为一步
- **消除队头阻塞**：多个流之间互不阻塞
- **连接迁移**：网络切换时连接不断
- **内置加密**：TLS 1.3 是 QUIC 的一部分，不是附加层

---

## QUIC 是如何工作的？

### 1. 更快的握手：1 RTT 甚至 0-RTT

传统 TCP + TLS 建立连接需要 3 个 RTT（往返时间）才能发送第一个数据包：

![TCP + TLS 握手流程](/blog-images/what-is-quic/tcp-tls-handshake.svg)

- TCP 握手：1 RTT（SYN → SYN-ACK → ACK）
- TLS 1.2 握手：2 RTT（ClientHello → ServerHello+Cert → KeyExchange+Finished → Finished）
- 总计：3 RTT 后才能发送 HTTP 数据

QUIC 将传输握手和 TLS 1.3 握手合并为一步：

![QUIC 握手流程](/blog-images/what-is-quic/quic-handshake.svg)

- 首次连接：1 RTT（Initial → Handshake → Data）
- 重连场景：0-RTT（客户端缓存了之前的握手参数，第一个包即可携带数据）

**对代理用户的意义：** 当你连接一个远程节点时，QUIC 协议能比 TCP 协议快 2 个 RTT。如果节点在地球另一端（单程延迟 150ms），这意味着连接建立快了约 300ms。

### 2. 消除队头阻塞（Head-of-Line Blocking）

HTTP/2 虽然支持多路复用，但底层仍依赖 TCP。TCP 必须保证字节流按序交付 — 一个包丢失，所有 HTTP/2 流都要等待重传。

![队头阻塞对比](/blog-images/what-is-quic/head-of-line-blocking.svg)

QUIC 在协议层面实现了独立流：

- 每个流有自己的丢包检测和重传机制
- 流 A 丢包，只重传流 A 的数据
- 流 B 和流 C 继续正常传输，不受影响

**对代理用户的意义：** 在不稳定的网络环境（如移动网络、公共 WiFi）中，QUIC 代理协议能保持更稳定的吞吐量。一个数据包的丢失不会拖慢你所有正在进行的连接。

### 3. 连接迁移：网络切换不断线

TCP 连接绑定到四元组（源 IP、源端口、目标 IP、目标端口）。当你的手机从 WiFi 切到 5G，IP 地址变了，TCP 连接就断了 — 代理隧道也会断。

![QUIC 连接迁移](/blog-images/what-is-quic/connection-migration.svg)

QUIC 使用连接标识符（CID）而非 IP 地址来标识连接：

- 每个 QUIC 连接分配一个唯一的 CID
- 从 WiFi 切到 5G，IP 变了，但 CID 不变
- 服务器通过 CID 识别这是同一个连接，连接保持不断

**对代理用户的意义：** 在地铁、公交、咖啡店等需要频繁切换网络的场景中，QUIC 代理协议能让你的代理隧道保持不断 — 不需要重新握手、不需要重新认证。

### 4. 内置加密

QUIC 将 TLS 1.3 集成为协议的一部分，而不是像 TCP 那样在上层附加 TLS：

- 所有 QUIC 数据包默认加密，不存在"明文 QUIC"
- 加密握手与传输握手合并，减少开销
- 每个数据包独立加密，不需要等待完整数据流

---

## QUIC vs TCP：代理协议的核心差异

| 特性 | TCP 代理（VLESS/VMess/Trojan over TCP） | QUIC 代理（Hysteria2/TUIC v5） |
|------|----------------------------------------|-------------------------------|
| 握手延迟 | 3 RTT（TCP + TLS） | 1 RTT（首次）/ 0-RTT（重连） |
| 队头阻塞 | 有，一个丢包阻塞全部流 | 无，流之间独立 |
| 连接迁移 | 不支持，IP 变化即断连 | 支持，CID 标识连接 |
| 丢包恢复 | TCP 层重传，阻塞所有数据 | 流级重传，仅影响丢包流 |
| 加密 | 上层附加 TLS | 内置 TLS 1.3 |
| 弱网表现 | 丢包率高时性能急剧下降 | 丢包率高时仍保持较好吞吐 |

---

## AirLane 中基于 QUIC 的代理协议

AirLane 基于 sing-box 内核，原生支持多种基于 QUIC 的代理协议：

![AirLane 中的 QUIC 协议](/blog-images/what-is-quic/airlane-quic-protocols.svg)

### Hysteria2

Hysteria2 是基于 QUIC 的高速代理协议，采用自定义的暴力拥塞控制算法：

- **高速传输**：在带宽充足时充分利用链路，不受 TCP 拥塞控制限制
- **抗丢包**：在高丢包网络中保持稳定吞吐
- **端口跳跃**：支持端口范围配置，增加抗封锁能力

在 AirLane 中，你可以将 Hysteria2 节点添加为出口，通过可视化策略树将其分配给特定流量（如流媒体、大文件下载）。

### TUIC v5

TUIC v5 是另一个基于 QUIC 的代理协议，专注于低延迟：

- **低延迟**：QUIC 的 0-RTT 重连特性使其在频繁连接场景下延迟极低
- **UDP 恶化场景优势**：当 TCP 被限速或干扰时，基于 UDP 的 TUIC 仍能正常工作
- **简洁设计**：协议设计精简，开销小

在 AirLane 中，TUIC v5 适合作为日常浏览、即时通讯等对延迟敏感流量的出口。

### AirLane 如何帮你选择

AirLane 的策略编排能力让你无需手动决定何时使用哪种协议：

1. **添加节点**：将 Hysteria2 和 TUIC v5 节点都添加为出口
2. **创建策略**：为不同流量类型创建策略 — 流媒体走 Hysteria2（高带宽），日常浏览走 TUIC v5（低延迟）
3. **决策追踪**：用 AirLane 的决策追踪功能查看每条流量走了哪个出口、为什么走这个出口
4. **健康自愈**：当某个 QUIC 节点出现问题时，AirLane 自动切换到备用线路

---

## QUIC 的应用场景

### 1. 移动网络环境

在 4G/5G 移动网络中，信号波动导致丢包率较高。TCP 代理在丢包时会大幅降速，而 QUIC 代理的流级重传机制能保持稳定性能。

### 2. 跨国远程连接

连接地球另一端的节点时，RTT 可能超过 200ms。QUIC 的 1-RTT 握手（重连 0-RTT）比 TCP 的 3-RTT 快了 400ms 以上，连接体验明显更好。

### 3. 频繁切换网络

在地铁、公交等需要频繁切换 WiFi 和移动数据的场景中，QUIC 的连接迁移让代理隧道保持不断。

### 4. 高丢包网络

某些网络环境（如公共 WiFi、跨境链路）丢包率较高。QUIC 的独立流重传机制比 TCP 的全局重传更高效。

---

## 总结

QUIC 不是 TCP 的简单替代，而是从设计上解决了 TCP 在现代网络环境中的几个根本问题：

- **握手慢** → 1-RTT / 0-RTT
- **队头阻塞** → 独立流
- **网络切换断连** → 连接迁移
- **加密是附加层** → 内置 TLS 1.3

AirLane 基于 sing-box 内核，原生支持 Hysteria2 和 TUIC v5 等 QUIC 代理协议。通过 AirLane 的可视化策略编排，你可以根据流量类型自动选择最优协议 — 不需要手动切换，不需要理解底层细节。

告别复杂配置，让 AirLane 帮你编排每一条流量的最优线路。
