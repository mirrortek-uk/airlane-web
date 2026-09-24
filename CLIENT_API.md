# AirLane 客户端对接 API 开发指导

面向 AirLane 桌面/移动客户端开发者。本文档描述客户端如何把设备绑定到
云端身份（正式账号或匿名账号）、如何上报在线状态，以及错误处理与
安全约定。

Base URL：`https://www.airlane.cloud`
所有接口均为 `application/json` POST，无需鉴权 header —— 配对码和
`device_id` 本身就是凭证。

> 接口契约以客户端仓库的 `AirLane/docs/CLIENT_API.md` 为准；
> 本文档是服务端实现侧的对照说明，若两处不一致以客户端文档为准。

---

## 1. 接入流程总览

```
用户在 www.airlane.cloud/account →「设备配对与管理」生成配对码
        │   (XXXX-XXXX 格式，10 分钟有效，仅可使用一次)
        ▼
客户端引导用户输入配对码
        ▼
POST /api/public/pair/claim  →  返回 device_id + plan（持久化保存）
        ▼
每次 App 启动：POST /api/public/devices/status → 刷新本地 plan
        ▼
POST /api/public/devices/resources → 拉取已购代理/节点凭据（§3.6）
        ▼
若启用 Mesh：周期性 POST /api/public/pair/heartbeat（也回带 plan）
若未启用 Mesh：不发心跳（见 §4）
```

**plan 同步是双通道的**：`devices/status` 是主通道（所有设备、低频），
`heartbeat` 顺带回带（仅 Mesh 设备、高频）。未启用 Mesh 的付费用户
升级套餐后，靠 status 接口在下一次启动时拿到新 plan。

配对码同时适用于正式账号与匿名账号，客户端无需区分 —— `claim`
响应里的 `identity` 字段会告诉你绑定到了哪种身份。

---

## 2. `POST /api/public/pair/claim` — 兑换配对码

把用户在网页端生成的配对码兑换成设备绑定。

### 请求体

| 字段 | 类型 | 必填 | 约束 | 说明 |
|---|---|---|---|---|
| `code` | string | ✅ | 4–16 字符 | 配对码，大小写不敏感（服务端转大写后匹配），建议保留 `-` 分隔符原样提交 |
| `name` | string | 否 | ≤80 字符 | 设备显示名，如 `"MacBook Pro"`；缺省 `"AirLane Client"` |
| `platform` | string | 否 | ≤40 字符 | 平台标识，建议用 `macos` / `windows` / `linux` / `ios` / `android`；缺省 `"unknown"` |
| `client_version` | string | 否 | ≤40 字符 | 客户端版本号，如 `"1.4.2"` |
| `device_public_key` | string | 否 | ≤128 字符 | 设备的 WireGuard 公钥（base64）。**私钥永不出设备**。Mesh 组网时使用；暂未启用 Mesh 可不上报，后续补报 |

### 成功响应 `200`

```json
{
  "device_id": "b5910d29-5d8f-470b-9916-6f49a1d22222",
  "name": "MacBook Pro",
  "platform": "macos",
  "identity": "account",
  "plan": "free",
  "limits": {
    "devices": 2,
    "configTemplates": 2,
    "sharedVps": 0,
    "residentialIp": 0,
    "meshGroups": 0,
    "cloudBackups": 2
  }
}
```

| 字段 | 说明 |
|---|---|
| `device_id` | 设备 UUID。**客户端必须持久化保存**（安全存储），它是之后心跳和将来配置下发的唯一凭证 |
| `identity` | `"account"` = 绑到正式账号；`"guest"` = 绑到匿名账号 |
| `plan` | 账号套餐：`"free"` / `"pro"`；匿名账号为 `null` |
| `limits` | 该套餐的配额明细，见下方「limits 字段」 |

### 错误响应

统一格式 `{ "error": "<code>" }`：

| HTTP | error | 含义 | 客户端建议处理 |
|---|---|---|---|
| 400 | `invalid_request` | 请求体校验失败 | 检查字段类型/长度 |
| 404 | `code_not_found` | 配对码不存在 | 提示"配对码无效，请核对后重试" |
| 409 | `code_already_used` | 配对码已被兑换 | 提示"配对码已使用，请回账号页重新生成" |
| 410 | `code_expired` | 配对码超过 10 分钟有效期 | 提示"配对码已过期，请重新生成" |
| 403 | `guest_device_limit` | 匿名账号设备数已达上限 | 提示"该匿名账号设备已满，请解绑旧设备或升级正式账号" |
| 403 | `device_limit_reached` | 正式账号设备数已达套餐上限 | 提示"设备数量已达上限，请解绑旧设备或升级套餐" |
| 500 | `pairing_failed` | 服务端写入失败 | 提示稍后重试 |

### limits 字段

`limits` 对象由数据库 `plan_limits` 表驱动 —— 服务端每次响应都读最新值，
调整配额不需要客户端发版。字段固定为：

| 字段 | 含义 |
|---|---|
| `devices` | 可绑定设备数 |
| `configTemplates` | 可云端存储的配置模板/节点文件数 |
| `sharedVps` | 可用共享 VPS 资源数 |
| `residentialIp` | 可用住宅 IP 资源数 |
| `meshGroups` | 可创建的 Mesh 组数 |
| `cloudBackups` | `cloud_snapshots` 云端备份条数（RLS 在插入时强制） |

`0` 表示该套餐不可用此能力。当前档位：anonymous `{2,0,2,2,2,0}`、
free `{2,2,0,0,0,2}`、pro `{10,15,0,0,0,10}` —— **以响应里的实际值为准**。

### 示例

```bash
curl -X POST https://www.airlane.cloud/api/public/pair/claim \
  -H 'content-type: application/json' \
  -d '{
    "code": "ABCD-2345",
    "name": "MacBook Pro",
    "platform": "macos",
    "client_version": "1.4.2",
    "device_public_key": "base64wireguardpubkey..."
  }'
```

---

## 3. `POST /api/public/pair/heartbeat` — 心跳

上报设备活性。云端据此更新账号页显示的在线状态和最后在线时间。

### 请求体

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `device_id` | uuid | ✅ | `claim` 返回的 device_id |
| `status` | enum | 否 | `"online"`（默认）/ `"idle"` / `"offline"`。客户端退后台可报 `idle`，退出前可报一次 `offline` |
| `client_version` | string | 否 | ≤40 字符；版本变化时带上，服务端会更新记录 |

### 响应

成功 `200`：

```json
{ "ok": true, "plan": "pro", "limits": { "devices": 10, "configTemplates": 15, "sharedVps": 0, "residentialIp": 0, "meshGroups": 0, "cloudBackups": 10 } }
```

`plan` 为 `"free"` / `"pro"` / `null`（匿名账号），`limits` 为该套餐
的最新配额明细。Mesh 设备每次心跳都会顺带拿到最新套餐与配额；
未启用 Mesh 的设备请通过 §3.5 的 status 接口同步 —— 两种途径
拿到的 plan 和 limits 都应写回本地缓存。

---

## 3.5 `POST /api/public/devices/status` — 状态拉取（plan 同步主通道）

低频接口，解决"Mesh 没开就不发心跳、就感知不到套餐变化"的问题。

**何时调用**：App 启动时一次即可；也可在进入"账号/配置"相关界面时
补一次。不要高频轮询。

### 请求体

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `device_id` | uuid | ✅ | `claim` 返回的 device_id |

### 响应 `200`

```json
{ "ok": true, "identity": "account", "plan": "pro", "limits": { "devices": 10, "configTemplates": 15, "sharedVps": 0, "residentialIp": 0, "meshGroups": 0, "cloudBackups": 10 } }
```

| 字段 | 说明 |
|---|---|
| `identity` | `"account"` / `"guest"` |
| `plan` | `"free"` / `"pro"`；匿名账号为 `null` |
| `limits` | 该套餐的配额明细（字段定义见 §2「limits 字段」）。每次调用都返回数据库最新值，客户端直接覆盖本地缓存即可 |

### 错误

| HTTP | error | 处理 |
|---|---|---|
| 400 | `invalid_request` | 检查请求体 |
| 404 | `device_not_found` | 设备已被解绑 → 清除本地 `device_id` |

| HTTP | error | 客户端建议处理 |
|---|---|---|
| 400 | `invalid_request` | 检查请求体 |
| 404 | `device_not_found` | **设备已在网页端被解绑** → 清除本地 `device_id`，回到未绑定状态，提示用户重新配对 |
| 500 | `heartbeat_failed` | 指数退避重试 |

### 示例

```bash
curl -X POST https://www.airlane.cloud/api/public/pair/heartbeat \
  -H 'content-type: application/json' \
  -d '{"device_id": "b5910d29-5d8f-470b-9916-6f49a1d22222", "status": "online"}'
```

---

## 3.6 `POST /api/public/devices/resources` — 已购资源拉取

返回当前身份下所有 `status=active` 的 PoolVIP 订单及其交付凭据，
供客户端把住宅 IP / VPS 节点直接导入本地节点列表，替代网页端
手动复制 `vpn_link`。

**何时调用**：配对成功后一次；进入"已购资源/节点"界面时；用户手动
下拉刷新时。不要高频轮询（建议间隔 ≥ 60 秒，本地缓存结果）。

### 请求体

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `device_id` | uuid | ✅ | `claim` 返回的 device_id |

### 响应 `200`

```json
{
  "ok": true,
  "resources": [
    {
      "order_id": "af1ea36d-…",
      "type": "direct",
      "title": { "zh": "ISP 企业代理 · 美国 · 7天", "en": "ISP Enterprise Proxy · US · 7d" },
      "provider": { "zh": "LinkStatic", "en": "LinkStatic" },
      "kind": "proxy",
      "ready": true,
      "expired": false,
      "credential": {
        "protocol": null,
        "host": "64.32.180.14",
        "port": 443,
        "username": "u…",
        "password": "p…"
      },
      "protocols": ["http", "socks5"],
      "vpn_link": "64.32.180.14:443:u…:p…",
      "expires_at": "2026-10-01T00:00:00Z",
      "traffic": { "plan_gb": 0, "used_gb": 0 }
    }
  ]
}
```

| 字段 | 说明 |
|---|---|
| `type` | `"direct"` 直购 / `"pool"` 拼团席位 |
| `title` / `provider` | 下单时的快照（`{zh, en}`），可能为 `null` |
| `kind` | `"proxy"` = 裸代理（`host:port:user:pass`）；`"link"` = URI 型链接或不可解析文本；`"pending"` = 已付款未交付（`vpn_link` 为 `pending://` 占位） |
| `ready` | `false` 时不要建节点，UI 显示"交付中" |
| `expired` | `current_period_end` 已过 → 服务端停供，UI 置灰 |
| `credential` | 结构化凭据；`kind=proxy` 时 `protocol=null`（上游同时支持 HTTP/SOCKS5，见 `protocols`）；`kind=link` 且 URI 可解析时 `protocol` 为 scheme（`trojan`/`ss`/`vless`/`http`/`socks5`…） |
| `protocols` | 客户端可尝试的协议列表；空数组 = 未知 |
| `vpn_link` | 原始交付串，调试用；客户端应优先用 `credential` |
| `traffic` | `plan_gb=0` 表示不限量 |

### 错误

| HTTP | error | 处理 |
|---|---|---|
| 400 | `invalid_request` | 检查请求体 |
| 404 | `device_not_found` | 设备已解绑 → 清 `device_id`，回到未绑定状态 |
| 500 | `resources_failed` | 指数退避重试 |

### 示例

```bash
curl -X POST https://www.airlane.cloud/api/public/devices/resources \
  -H 'content-type: application/json' \
  -d '{"device_id": "b5910d29-5d8f-470b-9916-6f49a1d22222"}'
```

---

## 4. 心跳规则：仅 Mesh 设备开启

**只有启用 Mesh 功能的设备才上报心跳。** 未启用 Mesh 的设备在绑定
成功后不要调用 heartbeat 接口。

- 心跳的目的：让云端知道设备活着，用于 Mesh 组网调度、共享资源
  下发、离线设备配额回收。纯代理本地使用、不入 Mesh 的设备没有
  这些需求，不应产生心跳流量。
- 实现建议：把心跳定时器挂在 Mesh 开关的生命周期上 ——
  用户开启 Mesh 时启动（建议间隔 60–120 秒），关闭时停止。
- 心跳间隔不要短于 30 秒，服务端会对过频请求做限速。

---

## 5. 客户端持久化

| 数据 | 存储位置 | 说明 |
|---|---|---|
| `device_id` | 系统安全存储（Keychain / DPAPI / Keystore） | 设备凭证，勿写日志、勿明文落盘到可被其他进程读取的位置 |
| `plan` | 本地配置/内存缓存 | 由 `devices/status`（启动时）和 `heartbeat`（Mesh 开启时）刷新；`null` 视为匿名账号档位 |
| `limits` | 本地配置/内存缓存 | 与 `plan` 同源刷新；每次响应都带数据库最新值，直接整体覆盖本地缓存，不要自行累加或写死 |
| 设备名 / 平台 | 本地配置 | 自己生成的，可自由存 |
| WireGuard 私钥 | 系统安全存储 | **永不上行**，只有公钥通过 `device_public_key` 上报 |

如果 heartbeat 返回 `device_not_found`，说明用户已在网页端解绑 ——
删除本地 `device_id`，UI 回到"未绑定"状态。

---

## 6. 匿名账号 vs 正式账号

| | 匿名账号 (`identity: "guest"`) | 正式账号·免费版 | 正式账号·Pro |
|---|---|---|---|
| 设备上限 | 2 台 | 2 台 | 10 台 |
| 配置模板/节点文件 | 不可用 | 2 个 | 15 个 |
| 共享 VPS / 住宅 IP | 各 2 个 | 0（由 `plan_limits` 控制） | 0（由 `plan_limits` 控制） |
| 超出时 claim 返回 | `guest_device_limit` (403) | `device_limit_reached` (403) | `device_limit_reached` (403) |

配额数字只是**当前默认值**——真源是数据库 `plan_limits` 表，
客户端应以 `limits` 响应字段为准。配置模板/节点文件存
`cloud_snapshots` 表；上传接口落地前客户端无需处理，服务端
会按套餐档位强制限额。

客户端不需要按 identity 区分逻辑 —— 正常处理错误码即可。

---

## 7. 已知缺口 / Roadmap

当前接口只覆盖"绑定 + 活性上报"。以下能力规划中，接入前先与后端
确认字段契约：

1. **心跳鉴权**：目前 `device_id` 是唯一凭证（UUID 熵足够，可当弱凭证）。
   计划在 claim 响应中增加 `device_token`，心跳改为
   `Authorization: Bearer <device_token>`。接入时预留读取响应中
   可选 `device_token` 字段的兼容逻辑。
2. **配置下发**：住宅 IP / 已购订单凭据已由 `POST /api/public/devices/resources`
   （§3.6）覆盖。仍规划中的部分：Mesh peer 列表、WireGuard 配置、
   共享 VPS 出口分配 —— 届时 `device_public_key` 会成为必填。
3. **解绑回调**：客户端主动解绑接口（`DELETE /api/public/devices/{id}`）
   规划中；目前解绑只能在网页端操作。

---

## 8. 快速自测清单

- [ ] 输入错误配对码 → 收到 `code_not_found`，UI 提示友好
- [ ] 输入正确配对码 → 拿到 `device_id` 并持久化
- [ ] 同一个码二次提交 → 收到 `code_already_used`
- [ ] 绑定后（Mesh 开启）心跳返回 `{"ok": true, "plan": ...}`，网页端设备显示"在线"
- [ ] 网页端解绑后 → 下一次心跳/status 收到 `device_not_found`，客户端清除本地凭证
- [ ] Mesh 关闭状态下不产生任何 heartbeat 请求，但启动时仍会调 status 同步 plan
- [ ] 免费版账号网页端升级 Pro 后 → 客户端下一次 status/心跳拿到 `"plan": "pro"` 并刷新本地档位

---

## 9. 版本更新检查与安装包镜像

发布事实源是公开仓库 `mirrortek-uk/AirLane-releases` 的 Releases。
官网提供两个免鉴权接口，客户端把 `update.rs` 里的 `RELEASES_API`
常量换成 §9.1 即可切换更新源（响应与 GitHub API 同构）。

### 9.1 `GET /api/releases/latest` — 最新版本

与 `api.github.com/.../releases/latest` 同构：`tag_name` / `name` /
`published_at` / `html_url` / `body` / `assets[]`。唯一差别是每个
asset 的 `browser_download_url` 被改写为官网镜像地址
`https://www.airlane.cloud/api/releases/download/<文件名>`；
原 GitHub 地址保留在 `assets[].github_url` 字段作备选。

每个 asset 另带 `mirrors[]` 下载渠道数组（按优先级排序）：
`ghproxy`（第三方 GitHub 代理）、`github`（官方直链）、
`r2`（Cloudflare R2 镜像，仅在服务端配置 `R2_MIRROR_BASE` 后出现）、
`vercel`（官网流式代理，兜底）。客户端/下载页可按需选用，
建议默认取 `mirrors[0]`。

服务端缓存 10 分钟 + Vercel 边缘缓存 5 分钟，新 Release 最迟
15 分钟内可见，无需改动官网代码。

### 9.2 `GET /api/releases/download/{filename}` — 安装包镜像

流式转发 GitHub Release 资产（跟随 302 到对象存储），带
`Content-Disposition: attachment`。只允许最新 Release 中已发布的
文件名，非开放代理。错误：`404 asset_not_found` /
`502 upstream_failed`。
