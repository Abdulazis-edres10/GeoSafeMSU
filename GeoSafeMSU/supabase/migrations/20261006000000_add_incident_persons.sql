-- Victim and suspect profiles attached to an incident.
--
-- One incident can involve several victims and several suspects, so people live
-- in their own table (one-to-many) instead of as extra columns on `incidents`.
-- `role` says which side of the incident the person is on.
--
-- ON DELETE CASCADE: if an incident row is ever permanently deleted, its people
-- go with it, so no orphaned personal records are left behind. (Archiving an
-- incident does not delete it, so archived incidents keep their people.)
--
-- Idempotent: safe to re-run.

CREATE TABLE IF NOT EXISTS incident_persons (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id    text NOT NULL REFERENCES incidents(incident_id) ON DELETE CASCADE,
  role           text NOT NULL CHECK (role IN ('victim', 'suspect')),
  full_name      text NOT NULL,
  age            integer CHECK (age IS NULL OR (age >= 0 AND age <= 150)),
  gender         text,
  civil_status   text,
  birthdate      date,
  address        text,
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS incident_persons_incident_id_idx
  ON incident_persons (incident_id);

-- ---------------------------------------------------------------------------
-- RLS — this is personal data (names, birthdates, home addresses), so unlike
-- `incidents` it is NOT readable by guests (anon). Only logged-in DSS users
-- may read or write it.
-- ---------------------------------------------------------------------------
ALTER TABLE incident_persons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS incident_persons_select_authenticated ON incident_persons;
CREATE POLICY incident_persons_select_authenticated ON incident_persons
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS incident_persons_insert_authenticated ON incident_persons;
CREATE POLICY incident_persons_insert_authenticated ON incident_persons
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS incident_persons_update_authenticated ON incident_persons;
CREATE POLICY incident_persons_update_authenticated ON incident_persons
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS incident_persons_delete_authenticated ON incident_persons;
CREATE POLICY incident_persons_delete_authenticated ON incident_persons
  FOR DELETE TO authenticated USING (true);

-- Make the REST API (PostgREST) see the new table immediately; otherwise the
-- app can keep getting "Could not find the table" until its cache refreshes.
NOTIFY pgrst, 'reload schema';
