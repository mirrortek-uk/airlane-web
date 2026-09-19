# AirLane 客户端对接 API 开发指导

面向 AirLane 桌面/移动客户端开发者。本文档描述客户端如何把设备绑定到
云端身份（正式账号或匿名账号）、如何上报在线状态，以及错误处理与
安全约定。

Base URL：`https://www.airlane.cloud`
所有接口均为 `application/json` POST，无需鉴权 header —— 配对码和
`device_id` 本身就是凭证。

---

## 1. 接入流程总览

```
用户在 www.airlane.cloud/account →「设备配对与管理」生成配对码
        │   (XXXX-XXXX 格式，10 分钟有效，仅可使用一次)
        ▼
客户端引导用户输入配对码
        ▼
POST /api/public/pair/claim  →  返回 device_id（持久化保存）
        ▼
若启用 Mesh：周期性 POST /api/public/pair/heartbeat
若未启用 Mesh：不发心跳（见 §4）
```

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
  "plan": "free"
}
```

| 字段 | 说明 |
|---|---|
| `device_id` | 设备 UUID。**客户端必须持久化保存**（安全存储），它是之后心跳和将来配置下发的唯一凭证 |
| `identity` | `"account"` = 绑到正式账号；`"guest"` = 绑到匿名账号 |
| `plan` | 账号套餐：`"free"` / `"pro"`；匿名账号为 `null`。用于本地限额提示（免费版 2 台设备 + 2 个配置模板，Pro 10 台 + 15 个） |

### 错误响应

统一格式 `{ "error": "<code>" }`：

| HTTP | error | 含义 | 客户端建议处理 |
|---|---|---|---|
| 400 | `invalid_request` | 请求体校验失败 | 检查字段类型/长度 |
| 404 | `code_not_found` | 配对码不存在 | 提示"配对码无效，请核对后重试" |
| 409 | `code_already_used` | 配对码已被兑换 | 提示"配对码已使用，请回账号页重新生成" |
| 410 | `code_expired` | 配对码超过 10 分钟有效期 | 提示"配对码已过期，请重新生成" |
| 403 | `guest_device_limit` | 匿名账号设备数已达上限（2 台） | 提示"该匿名账号设备已满，请解绑旧设备或升级正式账号" |
| 403 | `device_limit_reached` | 正式账号设备数已达上限（免费版 2 台 / Pro 10 台） | 提示"设备数量已达上限，请解绑旧设备或升级套餐" |
| 500 | `pairing_failed` | 服务端写入失败 | 提示稍后重试 |

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
{ "ok": true, "plan": "pro" }
```

`plan` 为 `"free"` / `"pro"` / `null`（匿名账号）。**每次心跳都会回带
最新套餐** —— 用户在网页端升级付费后，客户端下一次心跳即可感知，
应更新本地缓存的 plan 并刷新限额提示；无需重新配对。

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
| `plan` | 本地配置/内存缓存 | 每次心跳刷新；`null` 视为匿名账号档位 |
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
| 超出时 claim 返回 | `guest_device_limit` (403) | `device_limit_reached` (403) | `device_limit_reached` (403) |

配置模板/节点文件存 `cloud_snapshots` 表；上传接口落地前客户端
无需处理，服务端会按套餐档位强制限额。

客户端不需要按 identity 区分逻辑 —— 正常处理错误码即可。

---

## 7. 已知缺口 / Roadmap

当前接口只覆盖"绑定 + 活性上报"。以下能力规划中，接入前先与后端
确认字段契约：

1. **心跳鉴权**：目前 `device_id` 是唯一凭证（UUID 熵足够，可当弱凭证）。
   计划在 claim 响应中增加 `device_token`，心跳改为
   `Authorization: Bearer <device_token>`。接入时预留读取响应中
   可选 `device_token` 字段的兼容逻辑。
2. **配置下发**：`GET /api/public/devices/{id}/config`（规划中）——
   拉取 Mesh peer 列表、WireGuard 配置、分配的共享 VPS /
   住宅 IP 出口。届时 `device_public_key` 会成为必填。
3. **解绑回调**：客户端主动解绑接口（`DELETE /api/public/devices/{id}`）
   规划中；目前解绑只能在网页端操作。

---

## 8. 快速自测清单

- [ ] 输入错误配对码 → 收到 `code_not_found`，UI 提示友好
- [ ] 输入正确配对码 → 拿到 `device_id` 并持久化
- [ ] 同一个码二次提交 → 收到 `code_already_used`
- [ ] 绑定后（Mesh 开启）心跳返回 `{"ok": true}`，网页端设备显示"在线"
- [ ] 网页端解绑后 → 下一次心跳收到 `device_not_found`，客户端清除本地凭证
- [ ] Mesh 关闭状态下不产生任何 heartbeat 请求
