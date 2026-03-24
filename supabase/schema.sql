-- Leadership positions (for blog page)
CREATE TABLE leadership (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  position TEXT NOT NULL,
  name TEXT NOT NULL,
  organization TEXT NOT NULL CHECK (organization IN ('FPVM', 'STAF')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add description to churches (for existing DBs)
ALTER TABLE IF EXISTS churches ADD COLUMN IF NOT EXISTS description TEXT;

-- Add image_url to sampana (for existing DBs)
ALTER TABLE IF EXISTS sampana ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add branch_type_id to sampana (for existing DBs)
ALTER TABLE IF EXISTS sampana ADD COLUMN IF NOT EXISTS branch_type_id UUID;

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

-- Branch type (type sampana)
CREATE TABLE branch_type (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sampana (linked to a church, leader, and branch type)
CREATE TABLE sampana (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  leader_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  branch_type_id UUID REFERENCES branch_type(id) ON DELETE SET NULL,
  color TEXT DEFAULT '#7C3AED',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure FK constraint exists for existing DBs
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'sampana'
  )
  AND EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'branch_type'
  )
  AND NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_schema = 'public'
      AND table_name = 'sampana'
      AND constraint_name = 'sampana_branch_type_id_fkey'
  ) THEN
    ALTER TABLE sampana
      ADD CONSTRAINT sampana_branch_type_id_fkey
      FOREIGN KEY (branch_type_id)
      REFERENCES branch_type(id)
      ON DELETE SET NULL;
  END IF;
END $$;

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
ALTER TABLE branch_type ENABLE ROW LEVEL SECURITY;
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

-- Branch type RLS
CREATE POLICY "All authenticated can view branch_type" ON branch_type FOR SELECT
  USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage branch_type" ON branch_type FOR ALL
  USING (get_my_role() IN ('super_admin', 'church_admin'));

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

INSERT INTO churches (id, name, city, description) VALUES
  ('aaaaaaaa-0000-0000-0000-000000000001', 'FJKM Antananarivo Centre', 'Antananarivo', 'Ny Fiangonana Protestanta Vaovao eto Madagasikara dia manana sampana 2'),
  ('aaaaaaaa-0000-0000-0000-000000000002', 'ECAR Fianarantsoa', 'Fianarantsoa', 'Ny ECAR Fianarantsoa dia manana sampana 10'),
  ('aaaaaaaa-0000-0000-0000-000000000003', 'FPVM Ambohipo', 'Antananarivo', 'Ny FPVM Ambohipo Tanana dia manana sampana 2'),
  ('aaaaaaaa-0000-0000-0000-000000000004', 'FPVM Ampitatafika', 'Antananarivo', 'Ny FPVM Ampitatafika dia manana sampana 10');

-- Seed leadership data
INSERT INTO leadership (position, name, organization) VALUES
  ('Filohan\'ny FPVM', 'Pasteur RANDRIANATOANDRO Jean Joseph', 'FPVM'),
  ('Filohan\'ny STAF', 'Pasteur Juliano', 'STAF'),
  ('Filoha lefitra FPVM', 'Pasteur Romain', 'FPVM'),
  ('Filoha lefitra STAF', 'Pasteur Hanitra', 'STAF');

-- Seed branch types
INSERT INTO branch_type (id, name, description) VALUES
  ('bbbbbbbb-0000-0000-0000-000000000001', 'Mpamakilay', 'Sampana ho an\'ny mpamakilay sy tanora'),
  ('bbbbbbbb-0000-0000-0000-000000000002', 'Vehivavy', 'Sampana natokana ho an\'ny vehivavy'),
  ('bbbbbbbb-0000-0000-0000-000000000003', 'Ara-panahy', 'Sampana miasa amin\'ny asa ara-panahy');

-- Seed sampana data (linked to churches + branch types)
INSERT INTO sampana (name, church_id, branch_type_id, color, description, image_url) VALUES
  ('MiM', 'aaaaaaaa-0000-0000-0000-000000000003', 'bbbbbbbb-0000-0000-0000-000000000001', '#7C3AED', 'Ny Sampana mpamakilay dia isan'\''ny fikambanana SCOUT mijoro eto anivon'\''ny FPVM', '/images.jpg'),
  ('AFAFI', 'aaaaaaaa-0000-0000-0000-000000000004', 'bbbbbbbb-0000-0000-0000-000000000002', '#3B82F6', 'AFAFI dia sampana an'\''ny vehivavy mpitory', '/images (1).png'),
  ('CLAM', 'aaaaaaaa-0000-0000-0000-000000000003', 'bbbbbbbb-0000-0000-0000-000000000003', '#10B981', 'CLAM dia sampana ara-panahy', '/images.jpg'),
  ('FFM', 'aaaaaaaa-0000-0000-0000-000000000004', 'bbbbbbbb-0000-0000-0000-000000000003', '#F59E0B', 'FFM dia sampana ara-panahy', '/images.jpg');

-- Add RLS policies for leadership
ALTER TABLE leadership ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view leadership" ON leadership FOR SELECT USING (true);
