-- File attachments (photos, documents, …) for an incident's victims and
-- suspects, shown under each list on the Victims & Suspects page.
--
-- Files live in a PRIVATE Storage bucket, laid out as
--   <incident_id>/<victim|suspect>/<timestamp>-<file name>
-- so listing a folder gives that side's attachments without an extra table.
-- Being private, files are only reachable through short-lived signed URLs.
--
-- Like incident_persons, this is evidence/personal data: guests (anon) get no
-- access at all; only logged-in DSS users may read, upload or delete.
--
-- Idempotent: safe to re-run.

INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('incident-attachments', 'incident-attachments', false, 20971520) -- 20 MB per file
ON CONFLICT (id) DO UPDATE
  SET public = false, file_size_limit = EXCLUDED.file_size_limit;

DROP POLICY IF EXISTS incident_attachments_select_authenticated ON storage.objects;
CREATE POLICY incident_attachments_select_authenticated ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'incident-attachments');

DROP POLICY IF EXISTS incident_attachments_insert_authenticated ON storage.objects;
CREATE POLICY incident_attachments_insert_authenticated ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'incident-attachments');

DROP POLICY IF EXISTS incident_attachments_delete_authenticated ON storage.objects;
CREATE POLICY incident_attachments_delete_authenticated ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'incident-attachments');
