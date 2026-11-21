# Hysteria2 vs VLESS Reality: Which Proxy Protocol Should You Choose?

When self-hosting nodes or picking servers from a subscription, you inevitably face this question: **same server — should you run Hysteria2 or VLESS + Reality?** The internet is full of takes — "Hy2 is fast," "Reality is stealthy," "UDP gets blocked" — but few compare them on the same dimensions.

This article breaks down both protocols across transport layer, censorship resistance, speed, and ideal use cases — then lands on a clear conclusion: **you shouldn't have to pick just one**.

![Hysteria2 vs VLESS Reality](https://cdn.jsdelivr.net/gh/mirrortek-uk/airlane-web@main/public/blog-images/hysteria2-vs-vless-reality/cover.en.svg)

---

## TL;DR

| Dimension | Hysteria2 | VLESS + Reality |
|-----------|-----------|-----------------|
| Transport | QUIC (UDP) | TCP |
| Core idea | Aggressive congestion control grabs bandwidth | Camouflage as TLS to a real website |
| Speed (lossy links) | ★★★★★ | ★★★ |
| Speed (clean links) | ★★★★ | ★★★★ |
| Stealth / detectability | ★★★ | ★★★★★ |
| UDP-blocked networks | ❌ Dead | ✅ Works |
| High-loss international links | ✅ Clear winner | ⚠️ TCP head-of-line blocking |
| Setup difficulty | Easy (self-signed cert) | Needs a borrowed real domain handshake |
| Network switching (mobile) | ✅ QUIC connection migration | ⚠️ TCP must reconnect |

One-liner: **pick Hysteria2 for speed, Reality for stealth — or deploy both for resilience.**

---

## What each protocol actually does

### Hysteria2: squeezing UDP for everything it's worth

Hysteria2 is built on QUIC (the transport under HTTP/3), but what it does has little to do with browsing:

- **Brutal congestion control**: standard congestion control slows down when it detects loss. Hysteria2 does the opposite — you declare a target bandwidth and the protocol maintains it almost aggressively. On congested international links with 5–10% packet loss at peak hours, the effect is dramatic.
- **No head-of-line blocking**: QUIC streams are independent — one lost packet doesn't stall every other stream. Video, browsing, and downloads don't drag each other down the way they do over a single TCP connection.
- **Connection migration**: switching from Wi-Fi to cellular mid-session? QUIC keeps the session alive via Connection ID. On mobile, that's a night-and-day difference versus TCP.
- **Salamander obfuscation**: optional padding that makes the QUIC traffic look like generic UDP payloads.

The catch: **it rides on UDP, and UDP is a second-class citizen on many networks** — carrier QoS throttling of UDP is routine, and plenty of campus/corporate networks block it outright.

### VLESS + Reality: not "HTTPS-like" — it *is* HTTPS

VLESS by itself is a minimal transport with almost no camouflage. **Reality** is what makes it formidable.

Classic TLS-based protocols (Trojan, VMess+TLS) follow the "sign your own cert, pretend to be HTTPS" approach — but active probing exposes them instantly: wrong cert fingerprint, wrong handshake behavior, and the server won't actually serve the real site's content.

Reality flips the model:

- **Borrowed handshakes**: when you connect to the proxy, it borrows the certificate and handshake parameters of a real, legitimate site (`www.microsoft.com`, `gateway.icloud.com`, ...). An active prober sees a genuine certificate from a major website and identical server-side behavior — **short of the real site cooperating with the proxy, the exchange is indistinguishable at the protocol level**.
- **XTLS Vision flow control**: reassembles post-handshake data streams precisely, eliminating the chunk-size fingerprints older proxies left in their encrypted payloads — even traffic *shapes* look like normal browsing.
- **No domain, no certificate management**: the server doesn't need its own domain or cert — configuration actually gets simpler.

The cost: **it runs on TCP** — inheriting every TCP weakness: head-of-line blocking, jitter sensitivity on lossy links, full reconnects on network switches.

---

## Head-to-head on six dimensions

### 1. Transport: UDP vs TCP

The root of every other difference.

- **UDP (Hysteria2)**: connectionless, no built-in congestion control — the protocol can be as aggressive as it wants. That's what enables Brutal CC. But UDP is also the easiest traffic type to identify and throttle.
- **TCP (Reality)**: reliable delivery, and global infrastructure prioritizes it. TLS over TCP port 443 *is* the fabric of the modern web — blocking it categorically isn't feasible.

### 2. Stealth: Reality is the current ceiling

- **Hysteria2** tries to "look like random UDP." The problem: sustained high-volume UDP flows to foreign IPs are themselves a suspicious feature. Censors don't need to decrypt content — flow metadata (packet sizes, duration, destination ports) is enough to flag it. Since 2024, some regions have rolled out QoS and blocking targeting QUIC-based proxy traffic specifically.
- **Reality** borrows the shell of a real site. Active probes get a genuine certificate, genuine handshake parameters, genuine behavior. Blocking Reality today relies mostly on **statistical traffic analysis** (long-lived high-volume flows to one IP) and **IP reputation** — not protocol fingerprinting.

Verdict: **on "can the protocol itself be identified," Reality is nearly airtight while Hysteria2 has a real weakness.**

### 3. Speed and latency: link quality decides

- **Congested / high-loss international links (peak hours)**: Hysteria2 wins decisively. At 10% loss, TCP throughput can collapse to single-digit Mbps; Hy2's aggressive CC muscles through.
- **Clean links (IPLC/IEPL, premium BGP, nearby nodes)**: the gap narrows; Reality with XTLS Vision performs well and latency can even feel steadier (no QUIC crypto overhead).
- **Handshake latency**: QUIC's 0-RTT/1-RTT beats TCP+TLS, so Hy2 delivers first bytes faster.

### 4. Weak networks and carrier QoS

- On throttled peak-hour links, **Hy2 often keeps working while Reality stutters** — not Reality's fault; TCP just loses badly under loss plus rate-limiting.
- Conversely, on networks that specifically clamp UDP (some campuses, enterprises, or during sensitive windows), **Hy2 simply doesn't connect while Reality sails through**.

### 5. Mobile experience

- Walking between Wi-Fi and cellular, tunnels with weak signal — QUIC connection migration makes Hysteria2 nearly seamless; Reality has to rebuild TCP+TLS on every switch, and you'll feel the blip.

### 6. Ops burden

- **Hysteria2**: a single binary plus a self-signed cert and you're running; port hopping can also blunt IP bans. Minimal ops.
- **Reality**: needs a good "borrow" target (same CDN/region, TLS 1.3 + X25519), and if the target changes you may need to adjust. But once configured, it's extremely stable long-term with no certificate maintenance.

![Decision flow](https://cdn.jsdelivr.net/gh/mirrortek-uk/airlane-web@main/public/blog-images/hysteria2-vs-vless-reality/decision.en.svg)

---

## Recommendations by situation

| Your situation | Pick |
|----------------|------|
| Obvious peak-hour slowdowns, lossy international links | **Hysteria2** |
| School/corporate network, UDP throttled or blocked | **Reality** |
| Maximum stealth (high-risk environment) | **Reality** |
| Heavy mobile use, constant network switching | **Hysteria2** |
| Premium link quality (leased lines, good datacenters) | Either — Reality slightly steadier |
| Server IP already flagged | Reality (better camo) + Hy2 with port hopping |

---

## But the right answer is: don't choose

Notice the catch — **every recommendation above assumes you can only run one protocol**. Reality looks more like this:

- The same user on an office network by day (UDP possibly limited) and home broadband at night (UDP fine but international congestion);
- The same device needing throughput for video but stealth for account logins;
- The same link where Hy2 flies this month, then gets choked after the carrier retunes its QoS next month.

**The mental model of "pick a protocol" is itself wrong. A protocol is a transport-layer tool, not a religion.**

The right posture: **deploy both, and route different traffic classes through different exits**. Video and bulk downloads take Hysteria2 for speed; logins, payments, and sensitive browsing take Reality for stealth; if UDP dies you fall back to TCP; if a line gets burned you switch automatically.

The problem is that maintaining dual protocols + split routing + failover by hand is more configuration than most people want to own — which is exactly why AirLane exists.

---

## Why AirLane

**1. Both protocols are first-class, not bolted on**

AirLane is built on the sing-box core: Hysteria2 and VLESS Reality are native citizens among 38+ supported protocols. Import a subscription containing Hy2 or Reality nodes and they just work — no hand-assembled configs.

**2. A policy tree that turns "pick protocol per traffic" into a visual action**

No hand-written routing rules. In AirLane's policy tree you drag:

- `Streaming / bulk downloads` → Hysteria2 exits
- `Logins / payments / sensitive sites` → Reality exits
- `Domestic sites / LAN` → direct

Every decision has a trace — you can see exactly why a packet went via Hy2 rather than Reality.

**3. Health checks and automatic failover**

Carrier suddenly rate-limiting your UDP? Reality's borrowed target changed its handshake? AirLane continuously probes node health and fails over to the other protocol automatically — no midnight manual node swaps.

**4. The ecosystem supplies the exits too**

No nodes of your own? PoolVIP provides VPS and residential IP resources, and the Mesh network can turn your own devices into exits. That's where the protocol question truly closes: **it's not about using what you have — it's about giving each traffic class what it needs**.

---

## Summary

| Scenario | Answer |
|----------|--------|
| Forced to pick one, unknown network | **Reality** — TCP always gets through, stealth ceiling |
| Lossy links, speed-first | **Hysteria2** |
| Serious setup | **Both — assigned per traffic class** |

Hysteria2 and VLESS Reality aren't competitors — they're complements. One solves "fast," the other solves "hidden." The real question isn't "which protocol is better" but "**which protocol does this packet need right now**".

That's what AirLane is for: turning protocol selection from a one-time config into a per-flow routing decision.

→ [Download AirLane](https://www.airlane.cloud/download) · [Read the docs](https://www.airlane.cloud/docs)
