-- ============================================================================
-- Removes ALL demo incident records added by insert_demo_incidents.sql.
--
-- Only rows whose incident_id starts with "DEMO" are deleted. Real records
-- (INC001, INC002, …) are not touched. The demo victims/suspects are removed
-- automatically because incident_persons has ON DELETE CASCADE.
--
-- HOW TO USE: Supabase Dashboard → SQL Editor → paste this file → Run.
-- ============================================================================

DELETE FROM incidents WHERE incident_id LIKE 'DEMO%';

-- Quick check: both numbers should be 0.
SELECT
  (SELECT count(*) FROM incidents WHERE incident_id LIKE 'DEMO%') AS demo_incidents,
  (SELECT count(*) FROM incident_persons WHERE incident_id LIKE 'DEMO%') AS demo_persons;
