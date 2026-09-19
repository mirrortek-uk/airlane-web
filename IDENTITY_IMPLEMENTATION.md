# AirLane 统一身份系统实施规范

> 版本：v1.0 · 2026-09-19
> 定位：Identity Plane 的唯一实施基线。架构白皮书（V2.0）负责"为什么这么设计"，本文档负责"怎么落地"。
> 后续所有新功能（Mesh / PoolVIP / Resource / Subscription）的业务表一律挂在 `identities` 根上，禁止再开新的身份根。

**核心链（不可变）：**

```
Identity → Device → Node → Mesh → Resource → Network
```

---

## 1. 现状盘点（基线）

已有且保留的：

| 现有 | 对应白皮书概念 |
|---|---|
| `profiles`（id = auth.users.id） | Registered Identity 的账号档案（≈ accounts 表） |
| `guest_sessions`（token_hash 认证） | Anonymous Identity 的凭证雏形 |
| `devices`（双外键归属） | Device（缺 device_public_key） |
| `pairing_codes` | 设备配对码 |
| `cloud_snapshots` / `node_favorites` | 用户云端数据 |
| `mesh_groups` / `mesh_members` | Mesh 雏形（支持匿名成员） |
| `upgradeGuestSession` | 升级迁移逻辑雏形 |
| `requireSupabaseAuth` 中间件 | Bearer JWT → context.userId |
| `supabaseAdmin`（service role） | 匿名路径的服务端执行体 |

要改造的：

| 现状问题 | 目标 |
|---|---|
| 双身份根：每张业务表挂 `owner_user_id` + `guest_session_id` 两个外键 | 统一挂 `identity_id` 一个外键 |
| 匿名身份 = `guest_sessions` 行，会过期，过期即身份死亡 | 身份持久；过期的只是凭证（token） |
| 无恢复手段：token 丢了身份就成孤儿 | Recovery Code 可换发新 token |
| 升级是"数据搬家"（重指向外键） | 升级是"身份转正"（identity 本体不变） |

---

## 2. 目标数据模型

### 2.1 `identities` —— 唯一身份根

```sql
create table public.identities (
    id            uuid primary key default gen_random_uuid(),
    kind          text not null check (kind in ('anonymous','registered')),
    status        text not null default 'active'
                  check (status in ('active','revoked')),
    -- 注册身份指向 auth.users.id（= profiles.id）；匿名为 NULL
    auth_user_id  uuid references auth.users(id) on delete set null,
    display_label text,
    created_at    timestamptz not null default now(),
    last_seen_at  timestamptz not null default now(),
    upgraded_at   timestamptz
);

-- 一个 auth user 最多一个 identity（普通唯一索引即可：Postgres 中多个 NULL 不冲突）
create unique index identities_auth_user_uidx
    on public.identities(auth_user_id);
```

### 2.2 `identity_credentials` —— 凭证表（匿名 token + 恢复码）

```sql
create table public.identity_credentials (
    id           uuid primary key default gen_random_uuid(),
    identity_id  uuid not null references public.identities(id) on delete cascade,
    kind         text not null check (kind in ('access_token','recovery_code')),
    token_hash   text not null unique,     -- 只存 sha256，永不存明文
    expires_at   timestamptz,              -- access_token 90 天滚动过期；recovery_code 为 NULL（永不过期）
    last_used_at timestamptz,
    created_at   timestamptz not null default now(),
    revoked_at   timestamptz
);
```

规则：

- `access_token`：匿名身份的日常凭证，48 位 hex 随机串，90 天滚动过期（每次使用刷新），同一 identity 可有多条（多浏览器/多客户端并存）。
- `recovery_code`：创建匿名身份时强制生成一条，格式 `XXXX-XXXX-XXXX-XXXX`（去除易混淆字符），**永不过期**，明文只展示一次。
- 找回 = recovery_code 换发新 access_token，identity_id 不变。

### 2.3 `devices` 补列

```sql
alter table public.devices
    add column identity_id uuid references public.identities(id) on delete cascade,
    add column device_public_key text,   -- 客户端生成的设备公钥；私钥永不出设备
    add column revoked_at timestamptz;
```

### 2.4 `profiles` 的角色

`profiles` 不退场，它是 `kind='registered'` 身份的账号档案（email / display_name / plan / account_role / parent_account_id），对应白皮书的 `accounts` 表。`identities.auth_user_id` 是 identities ↔ profiles 的桥（profiles.id = auth.users.id）。

### 2.5 后续表统一规则

所有新业务表（`mesh_nodes` / `mesh_invitations` / `resources` / `resource_allocations` / `subscriptions` / `orders`）只挂 `identity_id`，**不再出现 `*_user_id` + `*_session_id` 双外键**。

---

## 3. 匿名用户详解

### 3.1 本质

**没有邮箱、没有密码。一个随机字符串就是全部凭证。** 类比酒店房卡：谁拿着房卡，谁就是房间主人。

身份本体（`identities` 行）永久存在；凭证（`identity_credentials` 行）可过期、可有多条、可吊销。身份和凭证分离，是本设计相对旧 `guest_sessions` 的核心区别。

### 3.2 创建流程

```
用户点"免注册体验"（客户端或 /auth 页）
        │
        ▼
createAnonymousIdentity() 服务端三件事：
  ① identities 插一行：kind='anonymous'
  ② access_token  = 48 位随机 hex（例：a3f8c2…）
  ③ recovery_code = "K7M2-P9QX-4TWN-8RJD"（人类可读）
        │
        ▼
数据库只存 sha256 哈希，明文只在本次响应返回：
  identity_credentials: (identity_id, 'access_token',  sha256(token),    expires_at=now+90d)
                        (identity_id, 'recovery_code', sha256(recovery), expires_at=NULL)
        │
        ▼
前端：access_token 存 localStorage（key: airlane.guest.token）—— 这就是"登录状态"
      recovery_code 弹窗强制展示一次，用户确认已保存后才放行
```

### 3.3 日常请求流程

```
前端每次调 serverFn 都带上 token
        │
        ▼
resolveAnonymous(token):
  sha256(token) → 查 identity_credentials
  → kind='access_token' 且未过期且未吊销
  → 得到 identity_id，刷新 last_used_at / expires_at（滚动续期）
        │
        ▼
后续所有操作按 identity_id 过滤数据
```

数据库从不存 token 明文。库泄露 = 攻击者只拿到一堆哈希，反推不出可用凭证。

### 3.4 找回流程（token 丢了）

```
用户换了浏览器/清了缓存 → 手里只剩之前抄下的 recovery_code
        │
        ▼
/auth 页"找回匿名身份"输入恢复码
        │
        ▼
recoverAnonymousIdentity(recoveryCode):
  sha256(输入) → 匹配 kind='recovery_code' 且未吊销的行
  → 吊销该 identity 名下所有旧 access_token（可选策略，默认吊销）
  → 签发新 access_token 返回
        │
        ▼
前端存新 token → 同一个 identity_id，设备/Mesh/数据全在
```

### 3.5 丢失规则（产品层接受）

| 场景 | 结果 |
|---|---|
| token 丢了 + 有 recovery_code | 可找回 |
| token 丢了 + 没存 recovery_code | **永久孤儿，无法找回**（UI 必须明确警告） |
| token 没丢但 90 天没用 | token 过期 → 用 recovery_code 找回，身份仍在 |

### 3.6 升级流程（Anonymous → Registered）

**禁止新建 identity。** 错误做法：注册时新建 identity 再搬数据。正确做法：匿名 identity 本体转正。

```
匿名用户填邮箱注册 → supabase.auth.signUp → handle_new_user 触发器
        │
        ▼
此时库里可能存在两条 identity：
  A = 匿名 identity（有设备/Mesh/数据）
  B = 触发器自动建的 registered identity（全新，通常为空）
        │
        ▼
upgradeAnonymousIdentity(anonymousToken)：
  1. resolveAnonymous(token) → A.id（kind 必须是 'anonymous'）
  2. 若 uid 已有 identity B：
       把 B 名下所有业务行 identity_id 改成 A.id（一般 B 为空，幂等）
       删除 B
  3. A.auth_user_id = uid，A.kind = 'registered'，A.upgraded_at = now()
  4. 旧列同步：devices/snapshots/favorites/mesh_members/pairing_codes
     的 owner_user_id = uid, guest_session_id = NULL（过渡期双写）
  5. A 的匿名 access_token 吊销；recovery_code 保留（仍可恢复）
        │
        ▼
前端清掉本地匿名 token，改用 Supabase session
identity_id 不变，名下数据原封不动
```

幂等：同一 anonymousToken 重复升级 → 检测到已 registered → 直接返回 ok。

### 3.7 为什么不直接用 Supabase Anonymous Sign-in

Supabase 的 `signInAnonymously()` 能给匿名用户发真 JWT，但：

- 现有代码已是"自定义 token + service role"模式且工作正常；
- recovery code 用自定义凭证实现最直接（不用服务端铸造 session）；
- 匿名读也走 serverFn，正好避免给 anon key 开业务表行权限。

代价是匿名用户读数据必须过 serverFn —— VPS/SSR 反正要承担这类活，可接受。

---

## 4. 认证路径总览

| 路径 | 凭证 | 校验方式 | 数据访问 |
|---|---|---|---|
| 注册 | Supabase JWT | `requireSupabaseAuth` 中间件 → context.userId → `resolveIdentityByUserId` 查 `identities.auth_user_id` | RLS（auth.uid()）+ serverFn |
| 匿名 | access_token（非 JWT） | `resolveAnonymous` → sha256 查 `identity_credentials` | 仅 serverFn（service role），禁直连 |
| 找回 | recovery_code | sha256 匹配 → 换发 access_token | 一次性，仅签发 |

RLS 策略（过渡期双轨并存，旧 `owner_user_id` 策略保留）：

```sql
create policy devices_identity_select on public.devices for select to authenticated
  using (identity_id in (select id from public.identities where auth_user_id = auth.uid()));
```

---

## 5. 迁移计划（双根 → 单根）

迁移文件：`supabase/migrations/20260919000000_unified_identities.sql`

**M1 — 建表 + 回填（本文件，SQL Editor 执行一次，幂等可重跑）**

1. 建 `identities` / `identity_credentials`
2. 回填：每个 `profiles.id` → registered identity（`auth_user_id` 桥）；每个 `guest_sessions` → anonymous identity（临时列 `legacy_guest_id` 桥）+ 其 `token_hash` 迁移为 access_token credential
3. `devices` / `cloud_snapshots` / `node_favorites` / `pairing_codes` / `mesh_members` 加 `identity_id` 并回填；`mesh_groups` 加 `owner_identity_id`
4. `devices` 补 `device_public_key` / `revoked_at`
5. 更新 `handle_new_user()` 触发器：新注册自动建 registered identity
6. 删临时列 `legacy_guest_id`

**M2 — 代码切换（本次代码改动）**

- `src/lib/identity.functions.ts`：匿名身份全套 serverFn
- `src/lib/account.functions.ts`：内部改走 identity 模型，导出名兼容
- 写入双写：`identity_id` + 旧列同时填（旧 RLS 策略继续生效）
- 读取：匿名走 `identity_id`，注册走 `identity_id`（或旧列，结果一致）

**M3 — 清理（观察稳定后，后续单独做）**

- drop 旧列 `owner_user_id` / `guest_session_id` / `guest_sessions` 表
- 删旧 RLS 策略
- `types.ts` 重新生成

---

## 6. Anti-Abuse 限额

```ts
ANONYMOUS_LIMITS  = { devices: 2, snapshots: 2, favorites: 10, meshGroups: 2 }
REGISTERED_LIMITS = { devices: 10, snapshots: 20, favorites: 100, meshGroups: 5 }
```

限额常量集中在 `src/lib/identity.functions.ts`，检查走 `checkLimit(identityId, resource)`。

---

## 7. 安全规则（不可妥协）

1. 私钥不出设备：`device_public_key` 上行，私钥永不离开客户端
2. 凭证只存 sha256；明文只在创建响应中返回一次
3. recovery_code 展示一次，UI 强制"我已保存"确认
4. 匿名 token 丢失且无 recovery_code = 永久孤儿（产品层接受并明示）
5. `supabaseAdmin` 只在 serverFn/服务端使用，禁入客户端 bundle
6. 匿名写路径依赖 Supabase 侧限速；找回接口加频次限制（同一 IP/identity 连续失败冷却）

---

## 8. API 映射

| serverFn | 说明 |
|---|---|
| `createAnonymousIdentity()` | 建匿名身份，返回 `{token, recoveryCode, id, expiresAt}` |
| `getAnonymousIdentity({token})` | 查状态 + 用量 + 设备 |
| `endAnonymousIdentity({token})` | 吊销身份（级联删数据） |
| `recoverAnonymousIdentity({recoveryCode})` | 恢复码换新 token |
| `rotateRecoveryCode({token})` | 重新生成恢复码（旧码吊销） |
| `upgradeAnonymousIdentity({token})` | 匿名转注册（需登录 JWT） |
| `resolveAnonymousByToken(token)` | 内部 helper，非 RPC |
| `resolveIdentityByUserId(userId)` | 内部 helper，非 RPC |

`account.functions.ts` 的旧导出名（`createGuestSession` 等）保留为兼容包装，内部走新模型。

---

## 9. Phase 映射

| Phase | 内容 | 状态 |
|---|---|---|
| P1.1 | SQL 迁移 M1 | 本次 |
| P1.2 | identity.functions.ts | 本次 |
| P1.3 | account.functions.ts 改造 | 本次 |
| P1.4 | /auth 匿名入口 + 找回 + recovery 展示 | 本次 |
| P1.5 | /account 匿名面板恢复码管理 | 本次 |
| P1.6 | types.ts 更新 + build | 本次 |
| P1.7 | M3 清旧列 | 观察期后 |
| P2 | mesh_nodes + mesh_invitations + Headscale | 后续 |
| P3+ | resources / subscriptions / orders | 后续 |
