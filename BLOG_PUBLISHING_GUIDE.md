# AirLane 博客发布指南

本文档详细说明如何为 AirLane 网站发布一篇新的图文博客文章。AI 或人工均可按照以下步骤操作。

---

## 概述

一篇博客文章涉及以下部分：

| 部分 | 存储位置 | 说明 |
|------|----------|------|
| 文章正文（中/英） | Supabase `blog_posts` 表 | Markdown 格式，通过 API 写入 |
| 文章图片 | `public/blog-images/<slug>/` 目录 | SVG/PNG/JPG，随 Git 仓库部署到 Vercel |
| SSR 元数据 | `src/routes/blog.$slug.tsx` 的 `POST_META` | 用于服务端渲染 `<head>` 标签 |
| Sitemap | `public/sitemap-blog.xml` | 添加新文章 URL |
| LLMs 文本 | `public/llms.txt` 和 `public/llms-full.txt` | 供 AI 系统发现文章 |
| 本地备份 | `post_<slug>_zh.md` 和 `post_<slug>_en.md` | 文章 Markdown 源文件备份 |

---

## 前置条件

1. 项目目录: `D:\projects\airlane-web`
2. `.env` 文件中包含以下 Supabase 环境变量：
   - `SUPABASE_URL` — Supabase 项目 URL
   - `SUPABASE_SERVICE_ROLE_KEY` — Service Role Key（用于绕过 RLS 写入数据）
   - `VITE_SUPABASE_PUBLISHABLE_KEY` — Publishable Key（前端读取用）
3. Git 已配置 safe directory（如遇到 ownership 问题）
4. Git author identity 已配置

---

## 步骤 1：确定文章 slug

选择一个 URL 友好的英文 slug，全小写，用连字符分隔。

示例：
- `what-is-quic`
- `airlane-vs-clash-smarter-proxy-client`
- `singbox-vs-clash-mihomo`

最终 URL 将是：
- 中文：`https://www.airlane.cloud/blog/<slug>`
- 英文：`https://www.airlane.cloud/en/blog/<slug>`

---

## 步骤 2：创建图片目录

在 `public/blog-images/` 下创建以 slug 命名的子目录：

```powershell
New-Item -ItemType Directory -Path "public\blog-images\<slug>" -Force
```

示例：
```powershell
New-Item -ItemType Directory -Path "public\blog-images\what-is-quic" -Force
```

---

## 步骤 3：准备图片文件

将所有图片放入 `public/blog-images/<slug>/` 目录。

### 图片格式建议

- **图表/示意图**：使用 SVG（矢量、体积小、清晰度高）
- **截图/照片**：使用 WebP 或 JPG（压缩率高）
- **封面图**：建议 1200×630 像素（OG 标准尺寸）

### SVG 图表制作要点

- 设置 `width="900"` 左右，`height="400-500"` 左右
- 使用浅色背景（`#f8fafc` 或 `#f1f5f9`）
- 使用项目配色：主色 `#6366f1`（靛蓝）、辅色 `#f59e0b`（琥珀）、绿色 `#22c55e`、红色 `#ef4444`
- 文字字体：`'Space Grotesk', sans-serif`（标题）、`'JetBrains Mono', monospace`（代码/标签）

### 在 Markdown 中引用图片

使用相对路径引用图片：

```markdown
![图片描述](/blog-images/<slug>/filename.svg)
```

示例：
```markdown
![TCP + TLS 握手流程](/blog-images/what-is-quic/tcp-tls-handshake.svg)
```

> **注意**：路径以 `/blog-images/` 开头，不要加 `public/` 前缀。Vercel 部署后 `public/` 目录内容会映射到网站根路径。

---

## 步骤 4：撰写文章 Markdown

分别撰写中文和英文版本的 Markdown 文件，保存到项目根目录：

- `post_<slug>_zh.md` — 中文版
- `post_<slug>_en.md` — 英文版

### Markdown 格式要求

- 使用标准 GitHub Flavored Markdown（GFM）
- 图片用 `![alt](/blog-images/<slug>/filename.svg)` 语法
- 表格、列表、代码块均支持
- 标题层级从 `#`（H1）开始，作为文章主标题
- 中英文版本的结构应保持一致，图片引用路径相同

### 文章结构建议

```markdown
# 文章标题

简短导语（1-2 段），说明文章主题和读者价值。

![封面图](/blog-images/<slug>/cover.svg)

---

## 第一部分标题

正文内容...

![示意图](/blog-images/<slug>/diagram1.svg)

---

## 第二部分标题

正文内容...

| 列1 | 列2 | 列3 |
|-----|-----|-----|
| ... | ... | ... |

---

## 总结

总结段落...
```

---

## 步骤 5：写入 Supabase 数据库

使用 Supabase REST API 将文章写入 `blog_posts` 表。

### PowerShell 脚本模板

```powershell
cd D:\projects\airlane-web

# 读取环境变量
$envContent = Get-Content .env -Raw
$supabaseUrl = [regex]::Match($envContent, 'SUPABASE_URL=([^\r\n]+)').Groups[1].Value.Trim('"').Trim("'")
$serviceKey = [regex]::Match($envContent, 'SUPABASE_SERVICE_ROLE_KEY=([^\r\n]+)').Groups[1].Value.Trim('"').Trim("'")

# 必须使用 Service Role Key（publishable key 会被 RLS 拦截）
$headers = @{
  "apikey" = $serviceKey
  "Authorization" = "Bearer $serviceKey"
  "Content-Type" = "application/json"
  "Prefer" = "return=representation"
}

# 读取 Markdown 文件
$zhBody = Get-Content "post_<slug>_zh.md" -Raw
$enBody = Get-Content "post_<slug>_en.md" -Raw

# 构建文章数据
$body = @{
  slug = "<slug>"
  title_zh = "中文标题"
  title_en = "English Title"
  summary_zh = "中文摘要（1-2 句话，用于 SEO meta description）"
  summary_en = "English summary (1-2 sentences, for SEO meta description)"
  body_zh = $zhBody
  body_en = $enBody
  cover_url = "https://www.airlane.cloud/blog-images/<slug>/cover.svg"
  tags = @("tag1", "tag2", "tag3")
  published = $true
  published_at = "2026-09-06T10:00:00Z"
} | ConvertTo-Json -Depth 3

# 写入数据库
$resp = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/blog_posts" -Method Post -Headers $headers -Body $body
$resp | ConvertTo-Json -Depth 3
```

### 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `slug` | string | URL 路径标识符，唯一 |
| `title_zh` | string | 中文标题 |
| `title_en` | string | 英文标题 |
| `summary_zh` | string | 中文摘要（SEO description） |
| `summary_en` | string | 英文摘要（SEO description） |
| `body_zh` | string | 中文正文 Markdown |
| `body_en` | string | 英文正文 Markdown |
| `cover_url` | string | 封面图完整 URL |
| `tags` | string[] | 标签数组 |
| `published` | boolean | 是否发布 |
| `published_at` | string | 发布时间 ISO 8601 格式 |

### 注意事项

- **必须使用 `SUPABASE_SERVICE_ROLE_KEY`**，不能用 `VITE_SUPABASE_PUBLISHABLE_KEY`，否则会报 RLS 权限错误（`42501`）
- 如果 slug 已存在，需要用 `PATCH` 方法更新而非 `POST` 创建：
  ```powershell
  Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/blog_posts?slug=eq.<slug>" -Method Patch -Headers $headers -Body $body
  ```

---

## 步骤 6：添加 SSR 元数据

编辑 `src/routes/blog.$slug.tsx`，在 `POST_META` 对象中添加新文章的元数据。

```typescript
export const POST_META: Record<string, { title_zh: string; title_en: string; summary_zh: string; summary_en: string }> = {
  // ... 已有文章 ...

  "<slug>": {
    title_zh: "中文标题",
    title_en: "English Title",
    summary_zh: "中文摘要",
    summary_en: "English summary",
  },
};
```

### 为什么要这一步

`POST_META` 用于服务端渲染（SSR）时生成 `<head>` 中的 `<title>`、`<meta description>`、Open Graph、Twitter Card 等标签。如果不添加，爬虫和 AI 在首次抓取时只能看到 fallback 的默认标题（`<slug> | AirLane 博客`），不利于 SEO。

---

## 步骤 7：更新 Sitemap

编辑 `public/sitemap-blog.xml`，添加新文章的中英文 URL。

```xml
  <url>
    <loc>https://www.airlane.cloud/blog/<slug></loc>
    <lastmod>2026-09-06</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://www.airlane.cloud/en/blog/<slug></loc>
    <lastmod>2026-09-06</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
```

在 `</urlset>` 闭合标签之前添加。

---

## 步骤 8：更新 llms.txt

编辑 `public/llms.txt`，在 `## Blog` 部分添加新文章的摘要链接。

```markdown
- [文章标题](https://www.airlane.cloud/blog/<slug>): 一句话描述文章内容
```

---

## 步骤 9：更新 llms-full.txt

编辑 `public/llms-full.txt`，在文件末尾添加新文章的详细摘要。

```markdown
---

## 文章标题

文章核心内容的详细摘要，包括主要观点、技术要点和结论。
供 AI 系统（Perplexity、ChatGPT、Claude 等）在回答相关问题时引用。
```

---

## 步骤 10：构建并验证

```powershell
cd D:\projects\airlane-web
npm run build
```

确认构建成功，无 TypeScript 错误或路由生成错误。

构建成功标志：
```
✓ built in X.XXs
✓ Generated .vercel/output/nitro.json
```

---

## 步骤 11：提交并推送

```powershell
cd D:\projects\airlane-web

# 暂存文件（注意 $slug 在 PowerShell 中需要用单引号包裹含 $ 的文件名）
git add "public/blog-images/<slug>/" `
  "public/sitemap-blog.xml" `
  "public/llms.txt" `
  "public/llms-full.txt" `
  "src/routes/blog.`$slug.tsx" `
  "post_<slug>_zh.md" `
  "post_<slug>_en.md"

# 写入 commit message
@'
Publish blog post: 文章标题

- New blog post (zh + en): 简要描述
- Includes N images/diagrams: 列出图片
- Add POST_META entry for SSR head metadata
- Update sitemap-blog.xml, llms.txt, llms-full.txt

Generated with [Devin](https://devin.ai)

Co-Authored-By: Devin <158243242+devin-ai-integration[bot]@users.noreply.github.com>
'@ | Set-Content .git/COMMIT_MSG.txt

# 提交并推送
git commit -F .git/COMMIT_MSG.txt
git push origin main
```

### PowerShell 注意事项

- 文件名包含 `$slug` 时，必须用**单引号**包裹：`'src/routes/blog.$slug.tsx'`
- 双引号会让 PowerShell 把 `$slug` 当变量解析，导致 `git add` 找不到文件
- Commit message 用 `Set-Content` 写入文件再用 `-F` 参数读取，避免 heredoc 语法问题

---

## 步骤 12：验证部署

1. 等待 Vercel 部署完成（通常 1-2 分钟）
2. 访问以下 URL 确认文章正常显示：
   - `https://www.airlane.cloud/blog/<slug>`
   - `https://www.airlane.cloud/en/blog/<slug>`
3. 检查图片是否正常加载
4. 查看页面源代码确认 SSR 输出包含文章标题和 meta 标签

---

## 完整文件清单

发布一篇博客文章需要修改/创建的文件：

```
public/blog-images/<slug>/              # 新建：图片目录
  ├── cover.svg                         # 新建：封面图
  ├── diagram1.svg                       # 新建：示意图
  └── ...
public/sitemap-blog.xml                 # 修改：添加 URL
public/llms.txt                         # 修改：添加摘要链接
public/llms-full.txt                    # 修改：添加详细摘要
src/routes/blog.$slug.tsx               # 修改：添加 POST_META 条目
post_<slug>_zh.md                       # 新建：中文 Markdown 备份
post_<slug>_en.md                       # 新建：英文 Markdown 备份
```

Supabase 数据库：
```
blog_posts 表                           # 新增一行：文章正文和元数据
```

---

## 常见问题

### Q: 为什么用 Service Role Key 而不是 Publishable Key？

`blog_posts` 表有 Row Level Security (RLS) 策略，只允许已认证用户写入。Publishable Key 是匿名访问，会被 RLS 拦截（错误码 `42501`）。Service Role Key 绕过 RLS，可以直接写入。

### Q: 图片为什么不传到 Supabase Storage？

Vercel 免费版的带宽和 Supabase Storage 免费版的容量都有限。将图片放在 `public/` 目录随 Git 部署到 Vercel，利用 Vercel 的 CDN 分发，是最经济的方式。SVG 图表体积通常只有 2-4KB，非常节省带宽。

### Q: 文章发布后可以编辑吗？

可以。修改 `post_<slug>_zh.md` 和 `post_<slug>_en.md`，然后用 `PATCH` 方法更新 Supabase 中的记录：

```powershell
Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/blog_posts?slug=eq.<slug>" `
  -Method Patch -Headers $headers -Body $body
```

### Q: 如何删除文章？

1. 从 Supabase 删除记录：
   ```powershell
   Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/blog_posts?slug=eq.<slug>" -Method Delete -Headers $headers
   ```
2. 从 `POST_META` 中删除对应条目
3. 从 `sitemap-blog.xml`、`llms.txt`、`llms-full.txt` 中删除对应条目
4. 删除 `public/blog-images/<slug>/` 目录
5. 删除 `post_<slug>_zh.md` 和 `post_<slug>_en.md`
6. 提交并推送

### Q: 为什么 Markdown 中的图片路径是 `/blog-images/...` 而不是 `public/blog-images/...`？

Vite 构建时会把 `public/` 目录的内容映射到网站根路径。所以 `public/blog-images/what-is-quic/cover.svg` 在网站上的 URL 是 `/blog-images/what-is-quic/cover.svg`。Markdown 中必须用网站 URL 路径，而不是文件系统路径。

---

## 示例：完整发布流程（以 what-is-quic 为例）

```powershell
# 1. 创建图片目录
New-Item -ItemType Directory -Path "public\blog-images\what-is-quic" -Force

# 2. 创建 SVG 图片（手动或用 AI 生成）
#    保存到 public/blog-images/what-is-quic/cover.svg
#    保存到 public/blog-images/what-is-quic/tcp-tls-handshake.svg
#    等等...

# 3. 撰写 Markdown 文章
#    保存到 post_what-is-quic_zh.md
#    保存到 post_what-is-quic_en.md

# 4. 写入 Supabase
$envContent = Get-Content .env -Raw
$supabaseUrl = [regex]::Match($envContent, 'SUPABASE_URL=([^\r\n]+)').Groups[1].Value.Trim('"').Trim("'")
$serviceKey = [regex]::Match($envContent, 'SUPABASE_SERVICE_ROLE_KEY=([^\r\n]+)').Groups[1].Value.Trim('"').Trim("'")
$headers = @{ "apikey"=$serviceKey; "Authorization"="Bearer $serviceKey"; "Content-Type"="application/json"; "Prefer"="return=representation" }
$zhBody = Get-Content "post_what-is-quic_zh.md" -Raw
$enBody = Get-Content "post_what-is-quic_en.md" -Raw
$body = @{ slug="what-is-quic"; title_zh="什么是 QUIC？..."; title_en="What is QUIC?..."; summary_zh="..."; summary_en="..."; body_zh=$zhBody; body_en=$enBody; cover_url="https://www.airlane.cloud/blog-images/what-is-quic/cover.svg"; tags=@("quic","hysteria2","tuic"); published=$true; published_at="2026-09-06T10:00:00Z" } | ConvertTo-Json -Depth 3
Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/blog_posts" -Method Post -Headers $headers -Body $body

# 5. 编辑 src/routes/blog.$slug.tsx — 添加 POST_META 条目
# 6. 编辑 public/sitemap-blog.xml — 添加 URL
# 7. 编辑 public/llms.txt — 添加摘要链接
# 8. 编辑 public/llms-full.txt — 添加详细摘要

# 9. 构建
npm run build

# 10. 提交并推送
git add 'public/blog-images/what-is-quic/' public/sitemap-blog.xml public/llms.txt public/llms-full.txt 'src/routes/blog.$slug.tsx' post_what-is-quic_zh.md post_what-is-quic_en.md
git commit -m "Publish blog post: What is QUIC?"
git push origin main
```
