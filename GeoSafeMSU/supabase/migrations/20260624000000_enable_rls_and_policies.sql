-- Enable Row Level Security (RLS) and add least-privilege policies on every
-- public table, to close the Supabase Security Advisor warnings.
--
-- Background: this app talks to Postgres directly from the browser using the
-- public `anon` key (it ships in the JS bundle). Without RLS, that key can
-- read AND write every row in these tables. RLS is the only layer that can
-- actually enforce access — UI rules in React cannot, because an attacker can
-- call the REST API directly and bypass the app.
--
-- Principle: RLS on everywhere, default-deny, then grant the minimum each role
-- needs:
--   * anon (guests)      -> SELECT only, on public data; no access to profiles.
--   * authenticated      -> SELECT + write on operational data.
--   * profiles writes     -> none from the client; handled by Edge Functions
--                            using the service-role key, which bypasses RLS.
--
-- The migration is idempotent: ENABLE ... is safe to re-run, and every policy
-- is DROP-then-CREATE, so it applies cleanly whether RLS is currently on, off,
-- or partially configured in the dashboard.

-- ---------------------------------------------------------------------------
-- incidents — public read (guest map/charts), writes require a logged-in user.
-- ---------------------------------------------------------------------------
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS incidents_select_public ON incidents;
CREATE POLICY incidents_select_public ON incidents
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS incidents_insert_authenticated ON incidents;
CREATE POLICY incidents_insert_authenticated ON incidents
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS incidents_update_authenticated ON incidents;
CREATE POLICY incidents_update_authenticated ON incidents
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS incidents_delete_authenticated ON incidents;
CREATE POLICY incidents_delete_authenticated ON incidents
  FOR DELETE TO authenticated USING (true);

-- ---------------------------------------------------------------------------
-- crime_types — reference data: public read, writes require a logged-in user.
-- ---------------------------------------------------------------------------
ALTER TABLE crime_types ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS crime_types_select_public ON crime_types;
CREATE POLICY crime_types_select_public ON crime_types
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS crime_types_insert_authenticated ON crime_types;
CREATE POLICY crime_types_insert_authenticated ON crime_types
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS crime_types_update_authenticated ON crime_types;
CREATE POLICY crime_types_update_authenticated ON crime_types
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS crime_types_delete_authenticated ON crime_types;
CREATE POLICY crime_types_delete_authenticated ON crime_types
  FOR DELETE TO authenticated USING (true);

-- ---------------------------------------------------------------------------
-- zones — reference data: public read, writes require a logged-in user.
-- ---------------------------------------------------------------------------
ALTER TABLE zones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS zones_select_public ON zones;
CREATE POLICY zones_select_public ON zones
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS zones_insert_authenticated ON zones;
CREATE POLICY zones_insert_authenticated ON zones
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS zones_update_authenticated ON zones;
CREATE POLICY zones_update_authenticated ON zones
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS zones_delete_authenticated ON zones;
CREATE POLICY zones_delete_authenticated ON zones
  FOR DELETE TO authenticated USING (true);

-- ---------------------------------------------------------------------------
-- profiles — sensitive. NOT exposed to guests. Logged-in users may read the
-- list (used for officer names + the user-management screen). All writes go
-- through Edge Functions with the service-role key, which bypasses RLS, so we
-- deliberately add NO insert/update/delete policy here. This also blocks a
-- user from escalating their own `role` to 'admin' via the client API.
-- ---------------------------------------------------------------------------
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS profiles_select_authenticated ON profiles;
CREATE POLICY profiles_select_authenticated ON profiles
  FOR SELECT TO authenticated USING (true);
