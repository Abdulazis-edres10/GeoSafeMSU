-- Give guests (anon) a safe, reduced view of incidents instead of the full table.
--
-- Before: `incidents_select_public` let anon SELECT every row and every column,
-- so anyone with DevTools could read descriptions (free text that can name
-- people), the reporting officer's ID, and archived incidents. RLS filters rows,
-- not columns, so a policy alone can't hide those fields.
--
-- After: anon has NO direct access to the incidents table. The guest dashboard
-- calls get_public_incidents(), which returns only "what, where, when" for
-- non-archived incidents — never who reported it or what was written.
-- Logged-in staff keep full access through the table as before.
--
-- Idempotent: safe to re-run.

-- ---------------------------------------------------------------------------
-- 1. The public, reduced view of incidents.
--    Casts pin each column to the declared return type so the function
--    doesn't fail if a column's underlying type is slightly different.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_public_incidents()
RETURNS TABLE (
  incident_id     text,
  date_time       timestamptz,
  lat             double precision,
  lng             double precision,
  incident_status text,
  crime_type_id   text,
  location_id     text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT
    i.incident_id::text,
    i.date_time::timestamptz,
    i.lat::double precision,
    i.lng::double precision,
    i.incident_status::text,
    i.crime_type_id::text,
    i.location_id::text
  FROM public.incidents i
  WHERE i.archived = false;
$$;

REVOKE ALL ON FUNCTION public.get_public_incidents() FROM public;
GRANT EXECUTE ON FUNCTION public.get_public_incidents() TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- 2. Remove every incidents policy that applies to guests (`anon`, or `public`
--    = every role). Matched by role, so dashboard-created ones are caught too.
--    This includes the original incidents_select_public.
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'incidents'
      AND roles && ARRAY['anon', 'public']::name[]
  LOOP
    EXECUTE format('DROP POLICY %I ON public.incidents', pol.policyname);
  END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- 3. Re-assert: RLS on, logged-in users may read the full table.
--    (Insert/update/delete policies for authenticated are unchanged.)
-- ---------------------------------------------------------------------------
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS incidents_select_authenticated ON incidents;
CREATE POLICY incidents_select_authenticated ON incidents
  FOR SELECT TO authenticated USING (true);

NOTIFY pgrst, 'reload schema';
