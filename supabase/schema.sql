-- ============================================================
-- MiM SAMPANA MANAGER — SUPABASE SCHEMA
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── TABLES ────────────────────────────────────────────────

-- Churches (Fiangonana)
CREATE TABLE churches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  city TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User profiles (linked to Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'church_admin', 'leader')),
  church_id UUID REFERENCES churches(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sampana (linked to a church and a leader)
CREATE TABLE sampana (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  leader_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  color TEXT DEFAULT '#7C3AED',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Programme events (dates occupied by a sampana)
CREATE TABLE programme_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sampana_id UUID NOT NULL REFERENCES sampana(id) ON DELETE CASCADE,
  event_date DATE NOT NULL,
  title TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(sampana_id, event_date)
);

-- Invitations (from one sampana to another for a specific date)
CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inviter_sampana_id UUID NOT NULL REFERENCES sampana(id) ON DELETE CASCADE,
  invitee_sampana_id UUID NOT NULL REFERENCES sampana(id) ON DELETE CASCADE,
  event_date DATE NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'refused')),
  responded_at TIMESTAMPTZ,
  response_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT no_self_invite CHECK (inviter_sampana_id != invitee_sampana_id)
);

-- ─── ROW LEVEL SECURITY ────────────────────────────────────

ALTER TABLE churches ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sampana ENABLE ROW LEVEL SECURITY;
ALTER TABLE programme_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- Helper function: get current user role
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;

-- Helper function: get current user church
CREATE OR REPLACE FUNCTION get_my_church_id()
RETURNS UUID AS $$
  SELECT church_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;

-- Helper function: get sampana_id for current leader
CREATE OR REPLACE FUNCTION get_my_sampana_id()
RETURNS UUID AS $$
  SELECT id FROM sampana WHERE leader_id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER;

-- Churches RLS
CREATE POLICY "Anyone can view churches" ON churches FOR SELECT USING (true);
CREATE POLICY "Super admin can manage churches" ON churches FOR ALL
  USING (get_my_role() = 'super_admin');

-- Profiles RLS
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT
  USING (id = auth.uid() OR get_my_role() IN ('super_admin', 'church_admin'));
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE
  USING (id = auth.uid());
CREATE POLICY "Super admin full access profiles" ON profiles FOR ALL
  USING (get_my_role() = 'super_admin');

-- Sampana RLS
CREATE POLICY "All authenticated can view sampana" ON sampana FOR SELECT
  USING (auth.uid() IS NOT NULL);
CREATE POLICY "Church admin can manage their sampana" ON sampana FOR ALL
  USING (
    get_my_role() = 'super_admin' OR
    (get_my_role() = 'church_admin' AND church_id = get_my_church_id())
  );

-- Programme events RLS
CREATE POLICY "All authenticated can view events" ON programme_events FOR SELECT
  USING (auth.uid() IS NOT NULL);
CREATE POLICY "Leader can manage own sampana events" ON programme_events FOR ALL
  USING (
    get_my_role() = 'super_admin' OR
    sampana_id = get_my_sampana_id()
  );

-- Invitations RLS
CREATE POLICY "View own invitations" ON invitations FOR SELECT
  USING (
    get_my_role() = 'super_admin' OR
    inviter_sampana_id = get_my_sampana_id() OR
    invitee_sampana_id = get_my_sampana_id()
  );
CREATE POLICY "Leader can create invitations from own sampana" ON invitations FOR INSERT
  WITH CHECK (inviter_sampana_id = get_my_sampana_id());
CREATE POLICY "Leader can respond to invitations to own sampana" ON invitations FOR UPDATE
  USING (invitee_sampana_id = get_my_sampana_id() OR get_my_role() = 'super_admin');

-- ─── SEED DATA ─────────────────────────────────────────────

INSERT INTO churches (id, name, city) VALUES
  ('aaaaaaaa-0000-0000-0000-000000000001', 'FJKM Antananarivo Centre', 'Antananarivo'),
  ('aaaaaaaa-0000-0000-0000-000000000002', 'ECAR Fianarantsoa', 'Fianarantsoa');
