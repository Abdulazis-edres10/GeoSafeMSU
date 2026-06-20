-- Repoint incidents.reporting_officer from the old `users` table to `profiles`.
--
-- Background: the app originally stored the reporting officer as a TEXT id that
-- referenced the legacy mock `users` table. After migrating to real Supabase
-- Auth, the app now sends the logged-in user's `profiles` UUID. The old foreign
-- key still checked `users`, so every new incident failed with a 23503 foreign
-- key violation (incidents_reporting_officer_fkey). The column type also had to
-- change from TEXT to UUID to match profiles.id.
--
-- Applied manually via the Supabase SQL Editor on 2026-06-20; captured here so
-- the change is reproducible on a fresh database.

-- 1. Remove the old foreign key that pointed at the dead `users` table.
ALTER TABLE incidents
  DROP CONSTRAINT IF EXISTS incidents_reporting_officer_fkey;

-- 2. Reassign any rows still referencing a non-existent profile (old seed data)
--    to a real admin, so the column conversion + new FK below won't be rejected.
--    profiles.id is cast to text because reporting_officer is still TEXT here.
UPDATE incidents
SET reporting_officer = (SELECT id::text FROM profiles WHERE role = 'admin' LIMIT 1)
WHERE reporting_officer NOT IN (SELECT id::text FROM profiles);

-- 3. Convert the column from TEXT to UUID so it can reference profiles.id.
ALTER TABLE incidents
  ALTER COLUMN reporting_officer TYPE uuid USING reporting_officer::uuid;

-- 4. Add the foreign key back, now pointing at the real user source (profiles).
ALTER TABLE incidents
  ADD CONSTRAINT incidents_reporting_officer_fkey
  FOREIGN KEY (reporting_officer) REFERENCES profiles(id);
