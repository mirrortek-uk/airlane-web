-- ============================================================
-- Unified Identities migration (M1)
-- Adds identities + identity_credentials as the single identity root,
-- backfills from profiles / guest_sessions, adds identity_id to business
-- tables for dual-write transition. Idempotent: safe to re-run.
-- See IDENTITY_IMPLEMENTATION.md §5.
-- ============================================================

-- ---------- 1. identities ----------
CREATE TABLE IF NOT EXISTS public.identities (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind          text NOT NULL CHECK (kind IN ('anonymous','registered')),
  status        text NOT NULL DEFAULT 'active' CHECK (status IN ('active','revoked')),
  auth_user_id  uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  display_label text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  last_seen_at  timestamptz NOT NULL DEFAULT now(),
  upgraded_at   timestamptz,
  -- temporary bridge for guest_sessions backfill; dropped at the end of this file
  legacy_guest_id uuid
);

-- A plain UNIQUE index already allows multiple NULLs (anonymous rows).
CREATE UNIQUE INDEX IF NOT EXISTS identities_auth_user_uidx
  ON public.identities(auth_user_id);
CREATE INDEX IF NOT EXISTS identities_legacy_guest_idx
  ON public.identities(legacy_guest_id) WHERE legacy_guest_id IS NOT NULL;

GRANT SELECT ON public.identities TO authenticated;
GRANT ALL ON public.identities TO service_role;
ALTER TABLE public.identities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS identities_select_own ON public.identities;
CREATE POLICY identities_select_own ON public.identities FOR SELECT TO authenticated
  USING (auth_user_id = auth.uid());

-- ---------- 2. identity_credentials ----------
CREATE TABLE IF NOT EXISTS public.identity_credentials (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identity_id  uuid NOT NULL REFERENCES public.identities(id) ON DELETE CASCADE,
  kind         text NOT NULL CHECK (kind IN ('access_token','recovery_code')),
  token_hash   text NOT NULL UNIQUE,
  expires_at   timestamptz,
  last_used_at timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now(),
  revoked_at   timestamptz
);
CREATE INDEX IF NOT EXISTS identity_credentials_identity_idx
  ON public.identity_credentials(identity_id);

GRANT ALL ON public.identity_credentials TO service_role;
ALTER TABLE public.identity_credentials ENABLE ROW LEVEL SECURITY;

-- ---------- 3. backfill: profiles -> registered identities ----------
INSERT INTO public.identities (kind, auth_user_id, display_label, created_at)
SELECT 'registered', p.id, p.display_name, p.created_at
FROM public.profiles p
ON CONFLICT (auth_user_id) DO NOTHING;

-- ---------- 4. backfill: guest_sessions -> anonymous identities ----------
INSERT INTO public.identities (kind, legacy_guest_id, created_at, last_seen_at)
SELECT 'anonymous', g.id, g.created_at, g.last_seen_at
FROM public.guest_sessions g
WHERE NOT EXISTS (
  SELECT 1 FROM public.identities i WHERE i.legacy_guest_id = g.id
);

INSERT INTO public.identity_credentials (identity_id, kind, token_hash, expires_at, last_used_at, created_at)
SELECT i.id, 'access_token', g.token_hash, g.expires_at, g.last_seen_at, g.created_at
FROM public.guest_sessions g
JOIN public.identities i ON i.legacy_guest_id = g.id
ON CONFLICT (token_hash) DO NOTHING;

-- ---------- 5. business tables: add identity_id (+device cols) ----------
ALTER TABLE public.devices
  ADD COLUMN IF NOT EXISTS identity_id uuid REFERENCES public.identities(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS device_public_key text,
  ADD COLUMN IF NOT EXISTS revoked_at timestamptz;

ALTER TABLE public.cloud_snapshots
  ADD COLUMN IF NOT EXISTS identity_id uuid REFERENCES public.identities(id) ON DELETE CASCADE;

ALTER TABLE public.node_favorites
  ADD COLUMN IF NOT EXISTS identity_id uuid REFERENCES public.identities(id) ON DELETE CASCADE;

ALTER TABLE public.pairing_codes
  ADD COLUMN IF NOT EXISTS identity_id uuid REFERENCES public.identities(id) ON DELETE CASCADE;

ALTER TABLE public.mesh_members
  ADD COLUMN IF NOT EXISTS identity_id uuid REFERENCES public.identities(id) ON DELETE CASCADE;

ALTER TABLE public.mesh_groups
  ADD COLUMN IF NOT EXISTS owner_identity_id uuid REFERENCES public.identities(id) ON DELETE CASCADE;

-- ---------- 6. backfill business rows ----------
-- registered side: owner_user_id / user_id -> identities.auth_user_id
UPDATE public.devices d SET identity_id = i.id
  FROM public.identities i
  WHERE d.identity_id IS NULL AND i.auth_user_id = d.owner_user_id;
UPDATE public.cloud_snapshots s SET identity_id = i.id
  FROM public.identities i
  WHERE s.identity_id IS NULL AND i.auth_user_id = s.owner_user_id;
UPDATE public.node_favorites f SET identity_id = i.id
  FROM public.identities i
  WHERE f.identity_id IS NULL AND i.auth_user_id = f.owner_user_id;
UPDATE public.pairing_codes p SET identity_id = i.id
  FROM public.identities i
  WHERE p.identity_id IS NULL AND i.auth_user_id = p.owner_user_id;
UPDATE public.mesh_members m SET identity_id = i.id
  FROM public.identities i
  WHERE m.identity_id IS NULL AND i.auth_user_id = m.user_id;
UPDATE public.mesh_groups g SET owner_identity_id = i.id
  FROM public.identities i
  WHERE g.owner_identity_id IS NULL AND i.auth_user_id = g.owner_user_id;

-- anonymous side: *_session_id -> identities.legacy_guest_id
UPDATE public.devices d SET identity_id = i.id
  FROM public.identities i
  WHERE d.identity_id IS NULL AND i.legacy_guest_id = d.guest_session_id;
UPDATE public.cloud_snapshots s SET identity_id = i.id
  FROM public.identities i
  WHERE s.identity_id IS NULL AND i.legacy_guest_id = s.guest_session_id;
UPDATE public.node_favorites f SET identity_id = i.id
  FROM public.identities i
  WHERE f.identity_id IS NULL AND i.legacy_guest_id = f.guest_session_id;
UPDATE public.pairing_codes p SET identity_id = i.id
  FROM public.identities i
  WHERE p.identity_id IS NULL AND i.legacy_guest_id = p.guest_session_id;
UPDATE public.mesh_members m SET identity_id = i.id
  FROM public.identities i
  WHERE m.identity_id IS NULL AND i.legacy_guest_id = m.guest_session_id;

-- ---------- 7. indexes on new columns ----------
CREATE INDEX IF NOT EXISTS devices_identity_idx        ON public.devices(identity_id);
CREATE INDEX IF NOT EXISTS snapshots_identity_idx      ON public.cloud_snapshots(identity_id);
CREATE INDEX IF NOT EXISTS favorites_identity_idx      ON public.node_favorites(identity_id);
CREATE INDEX IF NOT EXISTS pairing_codes_identity_idx  ON public.pairing_codes(identity_id);
CREATE INDEX IF NOT EXISTS mesh_members_identity_idx   ON public.mesh_members(identity_id);
CREATE INDEX IF NOT EXISTS mesh_groups_owner_identity_idx ON public.mesh_groups(owner_identity_id);

-- ---------- 8. identity-based RLS (kept alongside legacy policies) ----------
DROP POLICY IF EXISTS devices_identity_select ON public.devices;
CREATE POLICY devices_identity_select ON public.devices FOR SELECT TO authenticated
  USING (identity_id IN (SELECT id FROM public.identities WHERE auth_user_id = auth.uid()));
DROP POLICY IF EXISTS devices_identity_update ON public.devices;
CREATE POLICY devices_identity_update ON public.devices FOR UPDATE TO authenticated
  USING (identity_id IN (SELECT id FROM public.identities WHERE auth_user_id = auth.uid()))
  WITH CHECK (identity_id IN (SELECT id FROM public.identities WHERE auth_user_id = auth.uid()));
DROP POLICY IF EXISTS devices_identity_delete ON public.devices;
CREATE POLICY devices_identity_delete ON public.devices FOR DELETE TO authenticated
  USING (identity_id IN (SELECT id FROM public.identities WHERE auth_user_id = auth.uid()));

DROP POLICY IF EXISTS snapshots_identity_all ON public.cloud_snapshots;
CREATE POLICY snapshots_identity_all ON public.cloud_snapshots FOR ALL TO authenticated
  USING (identity_id IN (SELECT id FROM public.identities WHERE auth_user_id = auth.uid()))
  WITH CHECK (identity_id IN (SELECT id FROM public.identities WHERE auth_user_id = auth.uid()));

DROP POLICY IF EXISTS favorites_identity_all ON public.node_favorites;
CREATE POLICY favorites_identity_all ON public.node_favorites FOR ALL TO authenticated
  USING (identity_id IN (SELECT id FROM public.identities WHERE auth_user_id = auth.uid()))
  WITH CHECK (identity_id IN (SELECT id FROM public.identities WHERE auth_user_id = auth.uid()));

DROP POLICY IF EXISTS mesh_groups_identity_all ON public.mesh_groups;
CREATE POLICY mesh_groups_identity_all ON public.mesh_groups FOR ALL TO authenticated
  USING (owner_identity_id IN (SELECT id FROM public.identities WHERE auth_user_id = auth.uid()))
  WITH CHECK (owner_identity_id IN (SELECT id FROM public.identities WHERE auth_user_id = auth.uid()));

DROP POLICY IF EXISTS mesh_members_identity_select ON public.mesh_members;
CREATE POLICY mesh_members_identity_select ON public.mesh_members FOR SELECT TO authenticated
  USING (identity_id IN (SELECT id FROM public.identities WHERE auth_user_id = auth.uid()));

-- ---------- 9. auto-create registered identity on signup ----------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(COALESCE(NEW.email, ''), '@', 1)))
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.identities (kind, auth_user_id, display_label)
  VALUES ('registered', NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(COALESCE(NEW.email, ''), '@', 1)))
  ON CONFLICT (auth_user_id) DO NOTHING;
  RETURN NEW;
END; $$;

-- ---------- 10. drop migration bridge ----------
ALTER TABLE public.identities DROP COLUMN IF EXISTS legacy_guest_id;
