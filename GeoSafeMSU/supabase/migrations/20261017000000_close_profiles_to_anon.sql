-- Close the `profiles` table to guests (anon) without breaking login.
--
-- The leak: login turns a username into an email BEFORE the user is signed in,
-- so it runs as `anon`. To make that work, a policy letting anon SELECT from
-- profiles was added — and that exposed every row (names, emails, roles) to
-- anyone holding the public anon key, i.e. anyone who opens DevTools.
--
-- The fix: anon gets NO table access. Instead it may call one narrow function
-- that answers a single question — "what is the email for this username?" —
-- for one username at a time. SECURITY DEFINER lets the function read profiles
-- with the owner's rights; `set search_path = ''` stops it being hijacked by
-- objects in other schemas (a Supabase linter requirement).
--
-- Idempotent: safe to re-run.

-- ---------------------------------------------------------------------------
-- 1. The narrow login lookup.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_login_email(p_username text)
RETURNS TABLE (email text, disabled boolean)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT p.email, p.disabled
  FROM public.profiles p
  WHERE p.username = p_username
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_login_email(text) FROM public;
GRANT EXECUTE ON FUNCTION public.get_login_email(text) TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- 2. Drop every profiles policy that applies to guests. We don't know the exact
--    name the dashboard gave it, so match on the roles instead: `anon`, or
--    `public` (Postgres' "every role", which includes anon).
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'profiles'
      AND roles && ARRAY['anon', 'public']::name[]
  LOOP
    EXECUTE format('DROP POLICY %I ON public.profiles', pol.policyname);
  END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- 3. Re-assert the intended state: RLS on, logged-in users may read.
-- ---------------------------------------------------------------------------
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS profiles_select_authenticated ON profiles;
CREATE POLICY profiles_select_authenticated ON profiles
  FOR SELECT TO authenticated USING (true);

NOTIFY pgrst, 'reload schema';
