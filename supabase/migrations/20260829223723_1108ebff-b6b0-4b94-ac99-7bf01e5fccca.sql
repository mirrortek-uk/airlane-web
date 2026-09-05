-- profiles
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  display_name text,
  plan text NOT NULL DEFAULT 'free',
  account_role text NOT NULL DEFAULT 'owner',
  parent_account_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id OR auth.uid() = parent_account_id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER profiles_set_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(COALESCE(NEW.email, ''), '@', 1)))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- guest sessions (server-only)
CREATE TABLE public.guest_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash text NOT NULL UNIQUE,
  label text,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT now() + interval '90 days',
  upgraded_to uuid REFERENCES public.profiles(id) ON DELETE SET NULL
);
GRANT ALL ON public.guest_sessions TO service_role;
ALTER TABLE public.guest_sessions ENABLE ROW LEVEL SECURITY;

-- devices
CREATE TABLE public.devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  guest_session_id uuid REFERENCES public.guest_sessions(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'AirLane Client',
  platform text NOT NULL DEFAULT 'unknown',
  client_version text,
  status text NOT NULL DEFAULT 'online',
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE, DELETE ON public.devices TO authenticated;
GRANT ALL ON public.devices TO service_role;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "devices_own" ON public.devices FOR SELECT TO authenticated USING (auth.uid() = owner_user_id);
CREATE POLICY "devices_update_own" ON public.devices FOR UPDATE TO authenticated USING (auth.uid() = owner_user_id) WITH CHECK (auth.uid() = owner_user_id);
CREATE POLICY "devices_delete_own" ON public.devices FOR DELETE TO authenticated USING (auth.uid() = owner_user_id);

-- pairing codes (server-only)
CREATE TABLE public.pairing_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  owner_user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  guest_session_id uuid REFERENCES public.guest_sessions(id) ON DELETE CASCADE,
  device_id uuid REFERENCES public.devices(id) ON DELETE SET NULL,
  expires_at timestamptz NOT NULL DEFAULT now() + interval '10 minutes',
  claimed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.pairing_codes TO service_role;
ALTER TABLE public.pairing_codes ENABLE ROW LEVEL SECURITY;

-- cloud snapshots (client-side encrypted)
CREATE TABLE public.cloud_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  guest_session_id uuid REFERENCES public.guest_sessions(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'snapshot',
  ciphertext text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cloud_snapshots TO authenticated;
GRANT ALL ON public.cloud_snapshots TO service_role;
ALTER TABLE public.cloud_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "snapshots_own" ON public.cloud_snapshots FOR ALL TO authenticated USING (auth.uid() = owner_user_id) WITH CHECK (auth.uid() = owner_user_id);

-- node favorites
CREATE TABLE public.node_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  guest_session_id uuid REFERENCES public.guest_sessions(id) ON DELETE CASCADE,
  label text NOT NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.node_favorites TO authenticated;
GRANT ALL ON public.node_favorites TO service_role;
ALTER TABLE public.node_favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "favorites_own" ON public.node_favorites FOR ALL TO authenticated USING (auth.uid() = owner_user_id) WITH CHECK (auth.uid() = owner_user_id);

-- mesh groups
CREATE TABLE public.mesh_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  invite_code text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(6), 'hex'),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mesh_groups TO authenticated;
GRANT ALL ON public.mesh_groups TO service_role;
ALTER TABLE public.mesh_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mesh_groups_owner" ON public.mesh_groups FOR ALL TO authenticated USING (auth.uid() = owner_user_id) WITH CHECK (auth.uid() = owner_user_id);

CREATE TABLE public.mesh_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.mesh_groups(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  guest_session_id uuid REFERENCES public.guest_sessions(id) ON DELETE CASCADE,
  member_role text NOT NULL DEFAULT 'member',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.mesh_members TO authenticated;
GRANT ALL ON public.mesh_members TO service_role;
ALTER TABLE public.mesh_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mesh_members_self" ON public.mesh_members FOR SELECT TO authenticated USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.mesh_groups g WHERE g.id = group_id AND g.owner_user_id = auth.uid()));
CREATE POLICY "mesh_members_owner_manage" ON public.mesh_members FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.mesh_groups g WHERE g.id = group_id AND g.owner_user_id = auth.uid()));
CREATE POLICY "mesh_members_owner_delete" ON public.mesh_members FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.mesh_groups g WHERE g.id = group_id AND g.owner_user_id = auth.uid()));