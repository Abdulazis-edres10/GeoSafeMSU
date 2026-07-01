-- Account status: replace permanent user deletion with an enable/disable toggle.
--
-- A disabled account keeps EVERYTHING — its profile row, its recorded incidents,
-- and any logs referencing it stay intact. We only flip this flag and ban the
-- matching auth user (done in the set-user-status Edge Function) so the person
-- can no longer sign in. Re-enabling clears both.
--
-- Idempotent: ADD COLUMN IF NOT EXISTS is safe to re-run.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS disabled boolean NOT NULL DEFAULT false;

-- No RLS policy change needed: authenticated users can already SELECT profiles
-- (so the admin screen + login can read this flag), and all writes still go
-- exclusively through Edge Functions using the service-role key.
