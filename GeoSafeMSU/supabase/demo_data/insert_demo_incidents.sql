-- ============================================================================
-- DEMO DATA — sample incident records for previewing the system.
--
-- These are NOT real incidents. Every row uses an incident_id that starts with
-- "DEMO" (DEMO001 … DEMO040), so they are easy to tell apart from real
-- records (INC001, INC002, …) and easy to remove again.
--
-- HOW TO USE
--   1. Supabase Dashboard → SQL Editor → New query
--   2. Paste this whole file and click Run
--
-- HOW TO REMOVE
--   Run delete_demo_incidents.sql (same folder) the same way.
--
-- Safe to run more than once: it clears any earlier DEMO rows first.
-- This file is NOT a migration — it lives outside supabase/migrations on
-- purpose, so it is never applied automatically.
-- ============================================================================

BEGIN;

-- Start clean (victims/suspects are removed too, via ON DELETE CASCADE).
DELETE FROM incidents WHERE incident_id LIKE 'DEMO%';

-- Every demo incident is filed under one existing admin account, because
-- reporting_officer must point at a real row in profiles.
INSERT INTO incidents
  (incident_id, date_time, lat, lng, incident_status, description,
   crime_type_id, location_id, reporting_officer, archived, archived_at)
SELECT
  v.incident_id, v.date_time::timestamptz, v.lat, v.lng, v.incident_status, v.description,
  v.crime_type_id, v.location_id,
  (SELECT id FROM profiles WHERE role = 'admin' ORDER BY id LIMIT 1),
  false, NULL
FROM (VALUES
  ('DEMO001', '2026-05-06 13:54:00+08', 8.000836, 124.266702, 'Under Investigation', 'A female student reported receiving repeated unwanted remarks from a man at the CHS parking area.', 'CT004', 'Z008'),
  ('DEMO002', '2026-05-07 12:02:00+08', 7.999822, 124.265235, 'Resolved', 'A brawl between two groups broke out at the walkway beside the King Faisal Center after a basketball game; DSS personnel dispersed them.', 'CT002', 'Z008'),
  ('DEMO003', '2026-05-09 20:01:00+08', 7.995036, 124.259052, 'Resolved', 'A window pane at the Grandstand bleachers was found broken; the cause is still being determined.', 'CT003', 'Z009'),
  ('DEMO004', '2026-05-16 01:21:00+08', 7.995664, 124.258012, 'Resolved', 'A student was punched by an unidentified man at the Grandstand and was brought to the infirmary.', 'CT002', 'Z009'),
  ('DEMO005', '2026-06-03 00:44:00+08', 7.994669, 124.258962, 'Resolved', 'A student reported being followed and catcalled by a group of men at the Grandstand bleachers.', 'CT004', 'Z009'),
  ('DEMO006', '2026-06-05 07:05:00+08', 7.995786, 124.257919, 'Resolved', 'A female student reported receiving repeated unwanted remarks from a man at the Grandstand.', 'CT004', 'Z009'),
  ('DEMO007', '2026-06-09 07:24:00+08', 8.000842, 124.267126, 'Resolved', 'A bicycle chained near the King Faisal Center was taken; the lock was found cut.', 'CT001', 'Z008'),
  ('DEMO008', '2026-06-16 10:58:00+08', 7.999857, 124.265528, 'Resolved', 'A student reported that a mobile phone was taken from an unattended bag at the CHS building.', 'CT001', 'Z008'),
  ('DEMO009', '2026-06-18 01:45:00+08', 7.995378, 124.257853, 'Resolved', 'A brawl between two groups broke out at the Grandstand after a basketball game; DSS personnel dispersed them.', 'CT002', 'Z009'),
  ('DEMO010', '2026-06-18 07:25:00+08', 7.995433, 124.258333, 'Resolved', 'A laptop left charging at the track oval was reported missing by its owner.', 'CT001', 'Z009'),
  ('DEMO011', '2026-06-22 13:00:00+08', 7.999740, 124.265116, 'Resolved', 'Graffiti was found spray-painted on a wall at the walkway beside the King Faisal Center.', 'CT003', 'Z008'),
  ('DEMO012', '2026-06-26 08:24:00+08', 7.994506, 124.258961, 'Resolved', 'A student reported that a mobile phone was taken from an unattended bag at the Grandstand bleachers.', 'CT001', 'Z009'),
  ('DEMO013', '2026-07-07 13:47:00+08', 7.999762, 124.265136, 'Resolved', 'A wallet containing cash and a school ID was reported stolen at the CHS building.', 'CT001', 'Z008'),
  ('DEMO014', '2026-07-10 14:05:00+08', 8.000220, 124.265128, 'Resolved', 'A student was punched by an unidentified man at the CHS parking area and was brought to the infirmary.', 'CT002', 'Z008'),
  ('DEMO015', '2026-07-12 16:28:00+08', 8.000896, 124.267068, 'Resolved', 'A campus signage near the CHS parking area was found torn down.', 'CT003', 'Z008'),
  ('DEMO016', '2026-07-14 11:35:00+08', 8.000260, 124.265633, 'Under Investigation', 'Two students got into a fistfight at the CHS parking area after an argument; one sustained minor bruises.', 'CT002', 'Z008'),
  ('DEMO017', '2026-07-23 09:17:00+08', 7.994869, 124.259296, 'Resolved', 'A student was punched by an unidentified man at the track oval and was brought to the infirmary.', 'CT002', 'Z009'),
  ('DEMO018', '2026-07-25 08:31:00+08', 8.000235, 124.264767, 'Pending', 'A student reported that a mobile phone was taken from an unattended bag at the walkway beside the King Faisal Center.', 'CT001', 'Z008'),
  ('DEMO019', '2026-07-25 16:08:00+08', 7.995184, 124.258262, 'Pending', 'A female student reported receiving repeated unwanted remarks from a man at the track oval.', 'CT004', 'Z009'),
  ('DEMO020', '2026-07-26 20:54:00+08', 8.000514, 124.267033, 'Resolved', 'A motorcycle helmet was stolen from a parked motorcycle at the CHS parking area.', 'CT001', 'Z008'),
  ('DEMO021', '2026-07-30 00:13:00+08', 7.999561, 124.265472, 'Under Investigation', 'A brawl between two groups broke out at the CHS building after a basketball game; DSS personnel dispersed them.', 'CT002', 'Z008'),
  ('DEMO022', '2026-08-05 17:42:00+08', 8.000131, 124.265505, 'Under Investigation', 'A student reported that a mobile phone was taken from an unattended bag at the King Faisal Center.', 'CT001', 'Z008'),
  ('DEMO023', '2026-08-17 14:29:00+08', 8.000725, 124.267111, 'Pending', 'A female student reported receiving repeated unwanted remarks from a man at the King Faisal Center.', 'CT004', 'Z008'),
  ('DEMO024', '2026-08-18 01:07:00+08', 7.994455, 124.258849, 'Under Investigation', 'A campus signage near the parking area near the Grandstand was found torn down.', 'CT003', 'Z009'),
  ('DEMO025', '2026-08-18 23:59:00+08', 7.995864, 124.257641, 'Under Investigation', 'A motorcycle helmet was stolen from a parked motorcycle at the Grandstand bleachers.', 'CT001', 'Z009'),
  ('DEMO026', '2026-08-19 18:34:00+08', 7.995883, 124.258179, 'Under Investigation', 'Graffiti was found spray-painted on a wall at the Grandstand bleachers.', 'CT003', 'Z009'),
  ('DEMO027', '2026-08-20 15:41:00+08', 8.000821, 124.266888, 'Pending', 'A window pane at the King Faisal Center was found broken; the cause is still being determined.', 'CT003', 'Z008'),
  ('DEMO028', '2026-08-21 11:56:00+08', 7.995532, 124.258206, 'Resolved', 'Graffiti was found spray-painted on a wall at the parking area near the Grandstand.', 'CT003', 'Z009'),
  ('DEMO029', '2026-08-24 08:09:00+08', 7.995898, 124.257933, 'Resolved', 'A window pane at the parking area near the Grandstand was found broken; the cause is still being determined.', 'CT003', 'Z009'),
  ('DEMO030', '2026-08-31 23:33:00+08', 7.999856, 124.264844, 'Under Investigation', 'Graffiti was found spray-painted on a wall at the walkway beside the King Faisal Center.', 'CT003', 'Z008'),
  ('DEMO031', '2026-08-31 12:35:00+08', 7.995495, 124.257702, 'Pending', 'A window pane at the track oval was found broken; the cause is still being determined.', 'CT003', 'Z009'),
  ('DEMO032', '2026-09-13 14:33:00+08', 7.994749, 124.258883, 'Resolved', 'Several chairs at the Grandstand bleachers were found damaged and overturned.', 'CT003', 'Z009'),
  ('DEMO033', '2026-09-17 10:40:00+08', 7.995783, 124.257919, 'Under Investigation', 'A person was reported to be using a suspected illegal substance at the parking area near the Grandstand.', 'CT006', 'Z009'),
  ('DEMO034', '2026-09-23 13:56:00+08', 7.998485, 124.266757, 'Pending', 'A laptop left charging at the CHS building was reported missing by its owner.', 'CT001', 'Z008'),
  ('DEMO035', '2026-09-24 12:45:00+08', 7.995167, 124.257708, 'Under Investigation', 'Graffiti was found spray-painted on a wall at the track oval.', 'CT003', 'Z009'),
  ('DEMO036', '2026-10-01 21:41:00+08', 7.994461, 124.259314, 'Under Investigation', 'A window pane at the Grandstand bleachers was found broken; the cause is still being determined.', 'CT003', 'Z009'),
  ('DEMO037', '2026-10-03 01:57:00+08', 7.994807, 124.258696, 'Pending', 'An outsider without a valid ID was found inside the track oval after closing hours.', 'CT005', 'Z009'),
  ('DEMO038', '2026-10-08 21:10:00+08', 7.994553, 124.258813, 'Pending', 'A window pane at the parking area near the Grandstand was found broken; the cause is still being determined.', 'CT003', 'Z009'),
  ('DEMO039', '2026-10-09 13:23:00+08', 7.994827, 124.258953, 'Pending', 'Two students got into a fistfight at the track oval after an argument; one sustained minor bruises.', 'CT002', 'Z009'),
  ('DEMO040', '2026-10-09 07:48:00+08', 7.994980, 124.259154, 'Pending', 'A brawl between two groups broke out at the parking area near the Grandstand after a basketball game; DSS personnel dispersed them.', 'CT002', 'Z009')
) AS v (incident_id, date_time, lat, lng, incident_status, description, crime_type_id, location_id);

-- Victims and suspects. All names and addresses are made up ("Sample …").
INSERT INTO incident_persons
  (incident_id, role, full_name, age, gender, civil_status, birthdate, address)
VALUES
  ('DEMO001', 'victim', 'Sample Mark Mendoza', 24, 'Male', 'Single', '2001-05-07', 'Sample Address, MSU Campus, Marawi City'),
  ('DEMO002', 'victim', 'Sample Juan Dela Cruz', 25, 'Male', 'Single', '2000-05-18', 'Sample Address, Iligan City'),
  ('DEMO003', 'suspect', 'Sample Carlo Bautista', 25, 'Male', 'Single', '2000-07-14', 'Sample Address, MSU Campus, Marawi City'),
  ('DEMO004', 'victim', 'Sample Norhana Bautista', 23, 'Female', 'Single', '2002-08-13', 'Sample Address, MSU Campus, Marawi City'),
  ('DEMO004', 'suspect', 'Sample Joy Mendoza', 27, 'Female', 'Single', '1998-04-08', 'Sample Address, Barangay 1, Marawi City'),
  ('DEMO005', 'suspect', 'Sample Juan Garcia', 18, 'Male', 'Single', '2007-05-15', 'Sample Address, Iligan City'),
  ('DEMO006', 'victim', 'Sample Joy Mendoza', 19, 'Female', 'Single', '2006-04-07', 'Sample Address, Iligan City'),
  ('DEMO006', 'suspect', 'Sample Fatima Flores', 27, 'Female', 'Single', '1998-04-20', 'Sample Address, Iligan City'),
  ('DEMO007', 'victim', 'Sample Anna Bautista', 26, 'Female', 'Single', '1999-11-04', 'Sample Address, MSU Campus, Marawi City'),
  ('DEMO008', 'victim', 'Sample Anna Bautista', 24, 'Female', 'Single', '2001-02-23', 'Sample Address, Student Dormitory, MSU Marawi'),
  ('DEMO008', 'suspect', 'Sample Anna Dela Cruz', 31, 'Female', 'Single', '1994-10-28', 'Sample Address, MSU Campus, Marawi City'),
  ('DEMO009', 'victim', 'Sample Amir Bautista', 21, 'Male', 'Single', '2004-10-04', 'Sample Address, Iligan City'),
  ('DEMO010', 'victim', 'Sample Joy Santos', 21, 'Female', 'Single', '2004-10-24', 'Sample Address, Iligan City'),
  ('DEMO012', 'victim', 'Sample Juan Reyes', 21, 'Male', 'Single', '2004-01-13', 'Sample Address, Student Dormitory, MSU Marawi'),
  ('DEMO012', 'suspect', 'Sample Jalil Reyes', 22, 'Male', 'Single', '2003-11-08', 'Sample Address, MSU Campus, Marawi City'),
  ('DEMO013', 'victim', 'Sample Maria Reyes', 19, 'Female', 'Single', '2006-07-11', 'Sample Address, Iligan City'),
  ('DEMO014', 'victim', 'Sample Norhana Santos', 19, 'Female', 'Single', '2006-05-07', 'Sample Address, Iligan City'),
  ('DEMO014', 'suspect', 'Sample Norhana Mendoza', 37, 'Female', 'Single', '1988-08-03', 'Sample Address, MSU Campus, Marawi City'),
  ('DEMO016', 'victim', 'Sample Juan Garcia', 22, 'Male', 'Single', '2003-05-08', 'Sample Address, Barangay 1, Marawi City'),
  ('DEMO016', 'suspect', 'Sample Jalil Santos', 26, 'Male', 'Single', '1999-09-11', 'Sample Address, MSU Campus, Marawi City'),
  ('DEMO017', 'victim', 'Sample Joy Dela Cruz', 20, 'Female', 'Single', '2005-09-06', 'Sample Address, Barangay 1, Marawi City'),
  ('DEMO018', 'victim', 'Sample Maria Mendoza', 23, 'Female', 'Single', '2002-05-15', 'Sample Address, Barangay 1, Marawi City'),
  ('DEMO019', 'victim', 'Sample Amir Garcia', 23, 'Male', 'Single', '2002-04-27', 'Sample Address, Student Dormitory, MSU Marawi'),
  ('DEMO020', 'victim', 'Sample Juan Bautista', 22, 'Male', 'Single', '2003-02-17', 'Sample Address, Student Dormitory, MSU Marawi'),
  ('DEMO021', 'victim', 'Sample Amir Garcia', 18, 'Male', 'Single', '2007-04-16', 'Sample Address, Barangay 1, Marawi City'),
  ('DEMO022', 'victim', 'Sample Rashid Santos', 25, 'Male', 'Single', '2000-04-16', 'Sample Address, Barangay 1, Marawi City'),
  ('DEMO022', 'suspect', 'Sample Maria Ramos', 32, 'Female', 'Single', '1993-06-07', 'Sample Address, Iligan City'),
  ('DEMO023', 'victim', 'Sample Maria Ramos', 19, 'Female', 'Single', '2006-09-22', 'Sample Address, Iligan City'),
  ('DEMO023', 'suspect', 'Sample Maria Flores', 26, 'Female', 'Single', '1999-12-04', 'Sample Address, Student Dormitory, MSU Marawi'),
  ('DEMO024', 'victim', 'Sample Juan Dela Cruz', 19, 'Male', 'Single', '2006-07-19', 'Sample Address, Iligan City'),
  ('DEMO025', 'victim', 'Sample Jalil Mendoza', 18, 'Male', 'Single', '2007-02-12', 'Sample Address, Barangay 1, Marawi City'),
  ('DEMO025', 'suspect', 'Sample Jalil Mendoza', 19, 'Male', 'Single', '2006-05-08', 'Sample Address, Iligan City'),
  ('DEMO027', 'suspect', 'Sample Jalil Mendoza', 32, 'Male', 'Married', '1993-06-07', 'Sample Address, Barangay 1, Marawi City'),
  ('DEMO029', 'victim', 'Sample Norhana Flores', 25, 'Female', 'Single', '2000-09-18', 'Sample Address, Iligan City'),
  ('DEMO031', 'suspect', 'Sample Anna Mendoza', 19, 'Female', 'Single', '2006-05-26', 'Sample Address, Student Dormitory, MSU Marawi'),
  ('DEMO039', 'suspect', 'Sample Carlo Ramos', 39, 'Male', 'Single', '1986-09-26', 'Sample Address, Iligan City');

COMMIT;

-- Quick check: should show 40 incidents and 36 persons.
SELECT
  (SELECT count(*) FROM incidents WHERE incident_id LIKE 'DEMO%') AS demo_incidents,
  (SELECT count(*) FROM incident_persons WHERE incident_id LIKE 'DEMO%') AS demo_persons;
