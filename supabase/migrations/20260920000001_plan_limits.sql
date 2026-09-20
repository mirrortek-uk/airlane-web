-- Centralized plan quotas. API responses (pair claim / heartbeat / device
-- status) echo these limits so clients stay in sync when values change here.

CREATE TABLE IF NOT EXISTS public.plan_limits (
  plan text PRIMARY KEY,
  device_limit integer NOT NULL,
  config_template_limit integer NOT NULL DEFAULT 0,
  shared_vps_limit integer NOT NULL DEFAULT 0,
  residential_ip_limit integer NOT NULL DEFAULT 0,
  mesh_group_limit integer NOT NULL DEFAULT 0,
  cloud_backup_limit integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.plan_limits ENABLE ROW LEVEL SECURITY;
-- No public policies: only the service role reads/writes this table. Clients
-- receive limits through the public API endpoints, not direct table access.

INSERT INTO public.plan_limits
  (plan, device_limit, config_template_limit, shared_vps_limit, residential_ip_limit, mesh_group_limit, cloud_backup_limit)
VALUES
  ('anonymous', 2, 0, 2, 2, 2, 0),
  ('free', 2, 2, 0, 0, 0, 2),
  ('pro', 10, 15, 0, 0, 0, 10)
ON CONFLICT (plan) DO UPDATE SET
  device_limit = EXCLUDED.device_limit,
  config_template_limit = EXCLUDED.config_template_limit,
  shared_vps_limit = EXCLUDED.shared_vps_limit,
  residential_ip_limit = EXCLUDED.residential_ip_limit,
  mesh_group_limit = EXCLUDED.mesh_group_limit,
  cloud_backup_limit = EXCLUDED.cloud_backup_limit;

-- ---------- cloud_snapshots quota enforcement ----------
-- Clients write cloud_snapshots directly via PostgREST, so the quota must be
-- enforced in RLS. A SECURITY DEFINER function avoids RLS recursion on the
-- table itself and can read the service-role-only plan_limits table.

CREATE OR REPLACE FUNCTION public.cloud_snapshot_under_quota()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  lim integer;
  cnt integer;
BEGIN
  SELECT pl.cloud_backup_limit INTO lim
  FROM public.plan_limits pl
  WHERE pl.plan = COALESCE(
    (SELECT p.plan FROM public.profiles p WHERE p.id = auth.uid()),
    'free'
  );
  lim := COALESCE(lim, 2);
  SELECT count(*) INTO cnt
  FROM public.cloud_snapshots s
  WHERE s.owner_user_id = auth.uid()
     OR s.identity_id IN (
          SELECT i.id FROM public.identities i WHERE i.auth_user_id = auth.uid()
        );
  RETURN cnt < lim;
END;
$$;

-- Replace the FOR ALL policies with per-operation ones so the quota check only
-- applies to INSERT (updates/deletes must stay allowed when at the cap).
DROP POLICY IF EXISTS snapshots_own ON public.cloud_snapshots;
DROP POLICY IF EXISTS snapshots_identity_all ON public.cloud_snapshots;

DROP POLICY IF EXISTS snapshots_select ON public.cloud_snapshots;
CREATE POLICY snapshots_select ON public.cloud_snapshots FOR SELECT TO authenticated
  USING (
    owner_user_id = auth.uid()
    OR identity_id IN (SELECT id FROM public.identities WHERE auth_user_id = auth.uid())
  );

DROP POLICY IF EXISTS snapshots_insert ON public.cloud_snapshots;
CREATE POLICY snapshots_insert ON public.cloud_snapshots FOR INSERT TO authenticated
  WITH CHECK (
    (
      owner_user_id = auth.uid()
      OR identity_id IN (SELECT id FROM public.identities WHERE auth_user_id = auth.uid())
    )
    AND public.cloud_snapshot_under_quota()
  );

DROP POLICY IF EXISTS snapshots_update ON public.cloud_snapshots;
CREATE POLICY snapshots_update ON public.cloud_snapshots FOR UPDATE TO authenticated
  USING (
    owner_user_id = auth.uid()
    OR identity_id IN (SELECT id FROM public.identities WHERE auth_user_id = auth.uid())
  )
  WITH CHECK (
    owner_user_id = auth.uid()
    OR identity_id IN (SELECT id FROM public.identities WHERE auth_user_id = auth.uid())
  );

DROP POLICY IF EXISTS snapshots_delete ON public.cloud_snapshots;
CREATE POLICY snapshots_delete ON public.cloud_snapshots FOR DELETE TO authenticated
  USING (
    owner_user_id = auth.uid()
    OR identity_id IN (SELECT id FROM public.identities WHERE auth_user_id = auth.uid())
  );
