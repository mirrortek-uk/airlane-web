-- Centralized plan quotas. API responses (pair claim / heartbeat / device
-- status) echo these limits so clients stay in sync when values change here.

CREATE TABLE IF NOT EXISTS public.plan_limits (
  plan text PRIMARY KEY,
  device_limit integer NOT NULL,
  config_template_limit integer NOT NULL DEFAULT 0,
  shared_vps_limit integer NOT NULL DEFAULT 0,
  residential_ip_limit integer NOT NULL DEFAULT 0,
  mesh_group_limit integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.plan_limits ENABLE ROW LEVEL SECURITY;
-- No public policies: only the service role reads/writes this table. Clients
-- receive limits through the public API endpoints, not direct table access.

INSERT INTO public.plan_limits
  (plan, device_limit, config_template_limit, shared_vps_limit, residential_ip_limit, mesh_group_limit)
VALUES
  ('anonymous', 2, 0, 2, 2, 2),
  ('free', 2, 2, 0, 0, 0),
  ('pro', 10, 15, 0, 0, 0)
ON CONFLICT (plan) DO NOTHING;
