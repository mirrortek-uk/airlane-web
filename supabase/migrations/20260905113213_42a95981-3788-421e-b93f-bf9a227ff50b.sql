CREATE TABLE public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title_zh text NOT NULL DEFAULT '',
  title_en text NOT NULL DEFAULT '',
  summary_zh text NOT NULL DEFAULT '',
  summary_en text NOT NULL DEFAULT '',
  body_zh text NOT NULL DEFAULT '',
  body_en text NOT NULL DEFAULT '',
  cover_url text NOT NULL DEFAULT '',
  tags text[] NOT NULL DEFAULT '{}',
  published boolean NOT NULL DEFAULT true,
  published_at timestamptz NOT NULL DEFAULT now(),
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.blog_posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blog_posts TO authenticated;
GRANT ALL ON public.blog_posts TO service_role;

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "blog public read published" ON public.blog_posts
  FOR SELECT USING (published = true);

CREATE POLICY "blog admin read all" ON public.blog_posts
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "blog admin write" ON public.blog_posts
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER blog_posts_set_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX blog_posts_published_idx ON public.blog_posts (published, published_at DESC);

INSERT INTO public.blog_posts (slug, title_zh, title_en, summary_zh, summary_en, body_zh, body_en, tags, published_at) VALUES
('hello-airlane',
 'AirLane 1.0：从流量代理，到网络编排',
 'AirLane 1.0: from traffic proxying to network orchestration',
 '我们为什么要重做一个客户端：策略树、决策追踪、Mesh 组网与共享资源池。',
 'Why we rebuilt the client: policy trees, decision tracing, mesh networking and shared resource pools.',
 E'## 为什么是 AirLane\n\n传统客户端把「规则」写在配置文件里，出了问题只能靠猜。AirLane 把整条链路做成可视化的策略树，每一个请求都能回放它走过的判断。\n\n- **38+ 协议**：REALITY、Hysteria2、TUIC v5、AnyTLS、Snell v4、WireGuard 等\n- **决策追踪**：看到每个请求命中的规则、出口与耗时\n- **Mesh 组网**：把自己的设备连成一张私有网络\n\n## 下一步\n\n欢迎从 Clash / Mihomo 配置一键迁移，我们会保留你原有的规则语义。',
 E'## Why AirLane\n\nTraditional clients bury rules in a config file, so debugging is guesswork. AirLane turns the whole chain into a visual policy tree and lets you replay the decisions behind every request.\n\n- **38+ protocols**: REALITY, Hysteria2, TUIC v5, AnyTLS, Snell v4, WireGuard and more\n- **Decision tracing**: see the matched rule, egress and latency for each request\n- **Mesh networking**: link your own devices into a private network\n\n## Next\n\nImport your Clash / Mihomo config in one click — rule semantics are preserved.',
 ARRAY['产品','Release'], now());