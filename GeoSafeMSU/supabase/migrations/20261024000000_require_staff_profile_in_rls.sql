-- Require a real, enabled staff account — not just "any logged-in user".
--
-- The hole: every policy so far was `TO authenticated USING (true)`. In
-- Supabase, `authenticated` means "holds ANY valid login token", and public
-- sign-up was left on with auto-confirm. So anyone could create an account
-- straight against the Auth API (skipping our invite flow), get a token, and
-- read victims'/suspects' personal data or edit and delete every record.
--
-- Part 1 of the fix is in the dashboard (Authentication -> Sign In / Providers
-- -> turn OFF "Allow new users to sign up"). This migration is part 2, defense
-- in depth: even if a stray account ever exists again, it gets nothing unless
-- an admin onboarded it (it has a profiles row) and it is not disabled. That
-- also closes the gap where a disabled user's still-valid token kept working.
--
-- Guest (anon) access is unchanged: public read of crime_types and zones, and
-- the get_public_incidents() / get_login_email() functions.
--
-- Idempotent, and wrapped in one transaction so there is never a moment with
-- the old policies gone and the new ones not yet in place.

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. Helper: is the caller an onboarded, enabled staff member?
--    SECURITY DEFINER lets it read profiles regardless of profiles' own RLS
--    (which would otherwise make the check recursive). `(select auth.uid())`
--    is evaluated once per query instead of once per row.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_active_staff()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
      AND p.disabled = false
  );
$$;

REVOKE ALL ON FUNCTION public.is_active_staff() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.is_active_staff() TO authenticated;

-- ---------------------------------------------------------------------------
-- 2. Drop EVERY existing policy on these tables, including any created in the
--    dashboard under other names. Policies are OR-ed together, so a single
--    leftover `USING (true)` policy would silently undo this whole migration.
--    All the ones we still want are recreated below.
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('incidents', 'incident_persons', 'crime_types', 'zones', 'profiles')
  LOOP
    EXECUTE format('DROP POLICY %I ON public.%I', pol.policyname, pol.tablename);
  END LOOP;
END $$;

ALTER TABLE incidents        ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_persons ENABLE ROW LEVEL SECURITY;
ALTER TABLE crime_types      ENABLE ROW LEVEL SECURITY;
ALTER TABLE zones            ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles         ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- 3. incidents — staff only (guests use get_public_incidents()).
-- ---------------------------------------------------------------------------
CREATE POLICY incidents_select_staff ON incidents
  FOR SELECT TO authenticated USING ((SELECT public.is_active_staff()));
CREATE POLICY incidents_insert_staff ON incidents
  FOR INSERT TO authenticated WITH CHECK ((SELECT public.is_active_staff()));
CREATE POLICY incidents_update_staff ON incidents
  FOR UPDATE TO authenticated
  USING ((SELECT public.is_active_staff()))
  WITH CHECK ((SELECT public.is_active_staff()));
CREATE POLICY incidents_delete_staff ON incidents
  FOR DELETE TO authenticated USING ((SELECT public.is_active_staff()));

-- ---------------------------------------------------------------------------
-- 4. incident_persons — personal data, staff only.
-- ---------------------------------------------------------------------------
CREATE POLICY incident_persons_select_staff ON incident_persons
  FOR SELECT TO authenticated USING ((SELECT public.is_active_staff()));
CREATE POLICY incident_persons_insert_staff ON incident_persons
  FOR INSERT TO authenticated WITH CHECK ((SELECT public.is_active_staff()));
CREATE POLICY incident_persons_update_staff ON incident_persons
  FOR UPDATE TO authenticated
  USING ((SELECT public.is_active_staff()))
  WITH CHECK ((SELECT public.is_active_staff()));
CREATE POLICY incident_persons_delete_staff ON incident_persons
  FOR DELETE TO authenticated USING ((SELECT public.is_active_staff()));

-- ---------------------------------------------------------------------------
-- 5. crime_types / zones — public read stays (guest map needs the names);
--    writes are staff only.
-- ---------------------------------------------------------------------------
CREATE POLICY crime_types_select_public ON crime_types
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY crime_types_insert_staff ON crime_types
  FOR INSERT TO authenticated WITH CHECK ((SELECT public.is_active_staff()));
CREATE POLICY crime_types_update_staff ON crime_types
  FOR UPDATE TO authenticated
  USING ((SELECT public.is_active_staff()))
  WITH CHECK ((SELECT public.is_active_staff()));
CREATE POLICY crime_types_delete_staff ON crime_types
  FOR DELETE TO authenticated USING ((SELECT public.is_active_staff()));

CREATE POLICY zones_select_public ON zones
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY zones_insert_staff ON zones
  FOR INSERT TO authenticated WITH CHECK ((SELECT public.is_active_staff()));
CREATE POLICY zones_update_staff ON zones
  FOR UPDATE TO authenticated
  USING ((SELECT public.is_active_staff()))
  WITH CHECK ((SELECT public.is_active_staff()));
CREATE POLICY zones_delete_staff ON zones
  FOR DELETE TO authenticated USING ((SELECT public.is_active_staff()));

-- ---------------------------------------------------------------------------
-- 6. profiles — staff may read the list; anyone logged in may read THEIR OWN
--    row. The own-row rule matters: the app reads it on login to notice a
--    disabled account and sign it out with a clear message. Still no write
--    policies — all writes go through the Edge Functions (service role).
-- ---------------------------------------------------------------------------
CREATE POLICY profiles_select_own_or_staff ON profiles
  FOR SELECT TO authenticated
  USING (id = (SELECT auth.uid()) OR (SELECT public.is_active_staff()));

-- ---------------------------------------------------------------------------
-- 7. Attachments bucket — staff only.
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS incident_attachments_select_authenticated ON storage.objects;
DROP POLICY IF EXISTS incident_attachments_insert_authenticated ON storage.objects;
DROP POLICY IF EXISTS incident_attachments_delete_authenticated ON storage.objects;
DROP POLICY IF EXISTS incident_attachments_select_staff ON storage.objects;
DROP POLICY IF EXISTS incident_attachments_insert_staff ON storage.objects;
DROP POLICY IF EXISTS incident_attachments_delete_staff ON storage.objects;

CREATE POLICY incident_attachments_select_staff ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'incident-attachments' AND (SELECT public.is_active_staff()));
CREATE POLICY incident_attachments_insert_staff ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'incident-attachments' AND (SELECT public.is_active_staff()));
CREATE POLICY incident_attachments_delete_staff ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'incident-attachments' AND (SELECT public.is_active_staff()));

COMMIT;

NOTIFY pgrst, 'reload schema';
