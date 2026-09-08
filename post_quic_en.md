# What is QUIC? Why AirLane Chooses QUIC-Based Proxy Protocols

QUIC (Quick UDP Internet Connections) is a fast, secure modern transport protocol that powers HTTP/3. Originally developed by Google and later standardized by the IETF (RFC 9000), QUIC is now adopted by a growing number of network applications. According to W3Techs, QUIC is used by approximately 9% of websites, and HTTP/3 adoption has surpassed 38%.

For proxy clients, QUIC is more than a technical term — it directly determines your experience in real-world scenarios like packet loss, high latency, and network switching. AirLane, built on the sing-box core, natively supports QUIC-based proxy protocols like Hysteria2 and TUIC v5. This article will walk you through how QUIC works, its core advantages, and its practical application in AirLane.

![QUIC vs TCP+TLS handshake comparison](https://cdn.jsdelivr.net/gh/mirrortek-uk/airlane-web@main/public/blog-images/what-is-quic/cover.svg)

---

## What is QUIC?

The simplest way to understand QUIC is to think of it as a fusion of **HTTP/2 + TLS 1.3 + UDP**. It runs on top of UDP at the transport layer but provides TCP-level reliability while dramatically reducing latency.

QUIC's core design goals:

- **Faster connection establishment**: Combines transport and crypto handshakes into one step
- **Eliminates head-of-line blocking**: Independent streams don't block each other
- **Connection migration**: Connections survive network switches
- **Built-in encryption**: TLS 1.3 is part of QUIC, not an add-on layer

---

## How Does QUIC Work?

### 1. Faster Handshake: 1 RTT or Even 0-RTT

Traditional TCP + TLS requires 3 RTTs (round-trip times) before the first data packet:

![TCP + TLS handshake flow](https://cdn.jsdelivr.net/gh/mirrortek-uk/airlane-web@main/public/blog-images/what-is-quic/tcp-tls-handshake.svg)

- TCP handshake: 1 RTT (SYN → SYN-ACK → ACK)
- TLS 1.2 handshake: 2 RTT (ClientHello → ServerHello+Cert → KeyExchange+Finished → Finished)
- Total: 3 RTTs before HTTP data can be sent

QUIC merges the transport handshake and TLS 1.3 handshake into one step:

![QUIC handshake flow](https://cdn.jsdelivr.net/gh/mirrortek-uk/airlane-web@main/public/blog-images/what-is-quic/quic-handshake.svg)

- First connection: 1 RTT (Initial → Handshake → Data)
- Reconnection: 0-RTT (client caches previous handshake params, first packet carries data)

**What this means for proxy users:** When connecting to a remote node, QUIC can be 2 RTTs faster than TCP. If the node is on the other side of the planet (150ms one-way latency), this means ~300ms faster connection setup.

### 2. Eliminating Head-of-Line Blocking

HTTP/2 supports multiplexing, but it still relies on TCP underneath. TCP must deliver bytes in order — one lost packet blocks all HTTP/2 streams.

![Head-of-line blocking comparison](https://cdn.jsdelivr.net/gh/mirrortek-uk/airlane-web@main/public/blog-images/what-is-quic/head-of-line-blocking.svg)

QUIC implements independent streams at the protocol level:

- Each stream has its own packet loss detection and retransmission
- If stream A loses a packet, only stream A's data is retransmitted
- Streams B and C continue normally, unaffected

**What this means for proxy users:** In unstable networks (mobile, public WiFi), QUIC proxy protocols maintain more stable throughput. A single packet loss doesn't slow down all your active connections.

### 3. Connection Migration: No Disconnect on Network Switch

TCP connections are bound to a 4-tuple (source IP, source port, destination IP, destination port). When your phone switches from WiFi to 5G, the IP changes and the TCP connection breaks — your proxy tunnel breaks too.

![QUIC connection migration](https://cdn.jsdelivr.net/gh/mirrortek-uk/airlane-web@main/public/blog-images/what-is-quic/connection-migration.svg)

QUIC uses Connection IDs (CID) instead of IP addresses to identify connections:

- Each QUIC connection gets a unique CID
- Switching from WiFi to 5G changes the IP but not the CID
- The server recognizes the same connection via CID — the connection stays alive

**What this means for proxy users:** In scenarios requiring frequent network switching (subway, bus, cafe), QUIC proxy protocols keep your tunnel alive — no re-handshake, no re-authentication.

### 4. Built-in Encryption

QUIC integrates TLS 1.3 as part of the protocol, rather than adding TLS on top like TCP:

- All QUIC packets are encrypted by default — no "plaintext QUIC"
- Crypto handshake merges with transport handshake, reducing overhead
- Each packet is encrypted independently, no need to wait for a complete data stream

---

## QUIC vs TCP: Core Differences for Proxy Protocols

| Feature | TCP Proxy (VLESS/VMess/Trojan over TCP) | QUIC Proxy (Hysteria2/TUIC v5) |
|---------|----------------------------------------|-------------------------------|
| Handshake latency | 3 RTT (TCP + TLS) | 1 RTT (first) / 0-RTT (reconnect) |
| Head-of-line blocking | Yes, one loss blocks all streams | No, streams are independent |
| Connection migration | Not supported, IP change = disconnect | Supported, CID identifies connection |
| Packet loss recovery | TCP-level retransmit, blocks all data | Stream-level retransmit, only affects lost stream |
| Encryption | TLS added on top | Built-in TLS 1.3 |
| Weak network performance | Performance drops sharply with packet loss | Maintains good throughput with high packet loss |

---

## QUIC-Based Proxy Protocols in AirLane

AirLane, built on the sing-box core, natively supports multiple QUIC-based proxy protocols:

![QUIC protocols in AirLane](https://cdn.jsdelivr.net/gh/mirrortek-uk/airlane-web@main/public/blog-images/what-is-quic/airlane-quic-protocols.svg)

### Hysteria2

Hysteria2 is a high-speed proxy protocol based on QUIC with a custom aggressive congestion control algorithm:

- **High-speed transfer**: Fully utilizes available bandwidth, not limited by TCP congestion control
- **Packet loss resistance**: Maintains stable throughput in high-loss networks
- **Port hopping**: Supports port range configuration for anti-censorship

In AirLane, you can add Hysteria2 nodes as exits and assign them to specific traffic via the visual policy tree (e.g., streaming, large file downloads).

### TUIC v5

TUIC v5 is another QUIC-based proxy protocol focused on low latency:

- **Low latency**: QUIC's 0-RTT reconnection makes it extremely fast for frequent connections
- **UDP degradation advantage**: When TCP is throttled or interfered with, TUIC over UDP still works
- **Clean design**: Minimal protocol overhead

In AirLane, TUIC v5 is ideal as an exit for latency-sensitive traffic like browsing and instant messaging.

### How AirLane Helps You Choose

AirLane's policy orchestration means you don't have to manually decide which protocol to use:

1. **Add nodes**: Add both Hysteria2 and TUIC v5 nodes as exits
2. **Create policies**: Create policies for different traffic types — streaming goes to Hysteria2 (high bandwidth), browsing goes to TUIC v5 (low latency)
3. **Decision trace**: Use AirLane's decision tracing to see which exit each flow took and why
4. **Health & self-healing**: When a QUIC node has issues, AirLane automatically switches to a backup route

---

## QUIC Use Cases

### 1. Mobile Networks

In 4G/5G mobile networks, signal fluctuations cause higher packet loss. TCP proxies slow down dramatically with packet loss, while QUIC's stream-level retransmission maintains stable performance.

### 2. Long-Distance Connections

Connecting to a node on the other side of the world may have RTTs over 200ms. QUIC's 1-RTT handshake (0-RTT on reconnect) is 400ms+ faster than TCP's 3-RTT, noticeably better connection experience.

### 3. Frequent Network Switching

In scenarios requiring frequent WiFi/mobile data switching (subway, bus), QUIC's connection migration keeps the proxy tunnel alive.

### 4. High Packet Loss Networks

Some network environments (public WiFi, cross-border links) have high packet loss rates. QUIC's independent stream retransmission is more efficient than TCP's global retransmission.

---

## Conclusion

QUIC isn't a simple replacement for TCP — it fundamentally solves several problems TCP has in modern network environments:

- **Slow handshake** → 1-RTT / 0-RTT
- **Head-of-line blocking** → Independent streams
- **Network switch disconnect** → Connection migration
- **Encryption as add-on** → Built-in TLS 1.3

AirLane, built on the sing-box core, natively supports Hysteria2 and TUIC v5 QUIC proxy protocols. With AirLane's visual policy orchestration, you can automatically select the optimal protocol based on traffic type — no manual switching, no need to understand the underlying details.

Say goodbye to complex configuration. Let AirLane orchestrate the best route for every flow.
