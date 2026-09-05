
CREATE TYPE public.app_role AS ENUM ('admin','moderator','user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own roles readable" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

CREATE TABLE public.doc_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title_zh text NOT NULL,
  title_en text NOT NULL,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.doc_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id uuid REFERENCES public.doc_sections(id) ON DELETE CASCADE,
  slug text NOT NULL UNIQUE,
  title_zh text NOT NULL,
  title_en text NOT NULL,
  summary_zh text NOT NULL DEFAULT '',
  summary_en text NOT NULL DEFAULT '',
  body_zh text NOT NULL DEFAULT '',
  body_en text NOT NULL DEFAULT '',
  position integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX doc_pages_section_idx ON public.doc_pages(section_id, position);

GRANT SELECT ON public.doc_sections TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.doc_sections TO authenticated;
GRANT ALL ON public.doc_sections TO service_role;
GRANT SELECT ON public.doc_pages TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.doc_pages TO authenticated;
GRANT ALL ON public.doc_pages TO service_role;

ALTER TABLE public.doc_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doc_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sections public read" ON public.doc_sections FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "sections admin write" ON public.doc_sections FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "pages public read published" ON public.doc_pages FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "pages admin read all" ON public.doc_pages FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "pages admin write" ON public.doc_pages FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER doc_sections_updated BEFORE UPDATE ON public.doc_sections
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER doc_pages_updated BEFORE UPDATE ON public.doc_pages
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.doc_sections (slug, title_zh, title_en, position) VALUES
  ('getting-started','快速开始','Getting Started',1),
  ('protocols','协议与出口','Protocols & Egress',2),
  ('mesh','Mesh 组网','Mesh Networking',3),
  ('account','账号与设备','Account & Devices',4);

INSERT INTO public.doc_pages (section_id, slug, title_zh, title_en, summary_zh, summary_en, body_zh, body_en, position) VALUES
  ((SELECT id FROM public.doc_sections WHERE slug='getting-started'),'welcome','欢迎使用 AirLane','Welcome to AirLane','5 分钟了解 AirLane 的核心概念','Understand AirLane core concepts in 5 minutes',
'# 欢迎使用 AirLane

AirLane 是一个网络编排平台：不仅仅是流量代理，还包括策略树、决策追踪、Mesh 私有组网与共享资源池。

## 安装

1. 前往下载页获取对应平台的安装包。
2. 首次启动默认进入本地模式，不需要注册。
3. 需要云端同步时，可选择匿名体验或注册正式账号。

## 下一步

- 导入 Clash / Mihomo 配置
- 创建你的第一棵策略树
- 打开决策追踪查看每个请求走了哪条航线
',
'# Welcome to AirLane

AirLane is a network orchestration platform: more than a proxy, it adds policy trees, decision tracing, private mesh networking and shared resource pools.

## Install

1. Download the package for your platform.
2. The first launch runs fully local — no signup required.
3. When you need cloud sync, choose guest mode or create an account.

## Next steps

- Import a Clash / Mihomo config
- Build your first policy tree
- Open decision trace to see the route of every request
', 1),
  ((SELECT id FROM public.doc_sections WHERE slug='getting-started'),'quick-start','快速上手','Quick Start','从安装到第一条规则','From install to your first rule',
'# 快速上手

## 1. 添加出口

在「网络」页面添加订阅或手动录入节点，AirLane 支持 38+ 协议。

## 2. 创建策略

用策略树把流量按域名、应用、地区分流。

## 3. 验证

在「决策追踪」里查看请求命中的规则链。
',
'# Quick Start

## 1. Add egress

Add a subscription or manual nodes on the Network page. AirLane supports 38+ protocols.

## 2. Create policies

Use the policy tree to split traffic by domain, app or region.

## 3. Verify

Open Decision Trace to inspect the rule chain a request matched.
', 2);
