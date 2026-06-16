export const USERS = [
  { userID: 'U001', name: 'Admin One', username: 'admin1', password: 'admin123', role: 'admin' },
  { userID: 'U002', name: 'Admin Two', username: 'admin2', password: 'admin456', role: 'admin' },
  { userID: 'U003', name: 'Officer Santos', username: 'officer1', password: 'officer123', role: 'officer' },
  { userID: 'U004', name: 'Officer Macarambon', username: 'officer2', password: 'officer456', role: 'officer' },
]

// Campus center (real MSU Main Campus, Marawi): 7.99688 N, 124.26149 E.
// Zones are laid out around this center so every marker sits on campus.
export const ZONES = [
  {
    locationID: 'Z001',
    campusZoneName: 'Main Gate Area',
    description: 'The primary entrance and exit checkpoint of the campus, monitored by security personnel controlling vehicle and pedestrian access.',
    boundaryCoordinates: [[7.99500,124.26170],[7.99500,124.26290],[7.99400,124.26290],[7.99400,124.26170]],
  },
  {
    locationID: 'Z002',
    campusZoneName: 'College of Engineering',
    description: 'Academic complex housing engineering classrooms, laboratories, and faculty offices. High foot traffic during class hours.',
    boundaryCoordinates: [[7.99830,124.25920],[7.99830,124.26040],[7.99730,124.26040],[7.99730,124.25920]],
  },
  {
    locationID: 'Z003',
    campusZoneName: 'College of Science',
    description: 'Science department lecture halls and research laboratories, including chemistry, biology, and physics facilities.',
    boundaryCoordinates: [[7.99750,124.26320],[7.99750,124.26440],[7.99650,124.26440],[7.99650,124.26320]],
  },
  {
    locationID: 'Z004',
    campusZoneName: 'Administration Building',
    description: 'Central hub for university offices, student records, the registrar, and administrative services.',
    boundaryCoordinates: [[7.99740,124.26090],[7.99740,124.26210],[7.99640,124.26210],[7.99640,124.26090]],
  },
  {
    locationID: 'Z005',
    campusZoneName: 'Dormitory Area',
    description: 'On-campus residence halls for students. Subject to curfew hours and restricted overnight access.',
    boundaryCoordinates: [[7.99970,124.26260],[7.99970,124.26380],[7.99870,124.26380],[7.99870,124.26260]],
  },
  {
    locationID: 'Z006',
    campusZoneName: 'Sports Complex',
    description: 'Athletic fields, courts, and a gymnasium used for physical education, training, and campus events.',
    boundaryCoordinates: [[8.00100,124.25940],[8.00100,124.26060],[8.00000,124.26060],[8.00000,124.25940]],
  },
]

// --- Campus zone persistence --------------------------------------------
// Zones are editable (officers/admins can add new ones), so the full list is
// persisted to localStorage and re-hydrated in place on load — same pattern as
// crime types, keeping the ZONES reference stable for direct importers.
const ZONES_STORAGE_KEY = 'geosafe_zones'

export function saveZones() {
  try {
    localStorage.setItem(ZONES_STORAGE_KEY, JSON.stringify(ZONES))
  } catch {
    // localStorage unavailable — keep in-memory only.
  }
}

try {
  const stored = localStorage.getItem(ZONES_STORAGE_KEY)
  if (stored) {
    const parsed = JSON.parse(stored)
    if (Array.isArray(parsed) && parsed.length) {
      ZONES.splice(0, ZONES.length, ...parsed)
    }
  }
} catch {
  // Corrupt storage — fall back to seed data above.
}

export const CRIME_TYPES = [
  { crimeTypeID: 'CT001', typeName: 'Theft', description: 'Unauthorized taking of property' },
  { crimeTypeID: 'CT002', typeName: 'Physical Assault', description: 'Bodily harm or threat of harm' },
  { crimeTypeID: 'CT003', typeName: 'Vandalism', description: 'Destruction of campus property' },
  { crimeTypeID: 'CT004', typeName: 'Harassment', description: 'Verbal or physical harassment' },
  { crimeTypeID: 'CT005', typeName: 'Trespassing', description: 'Unauthorized entry to restricted areas' },
  { crimeTypeID: 'CT006', typeName: 'Drug-Related', description: 'Illegal substance possession or use' },
]

// --- Crime type persistence ---------------------------------------------
// Crime types are editable by admins/officers, so we persist the full list to
// localStorage. On load we replace the seed contents in place (keeping the same
// array reference) so modules that imported CRIME_TYPES directly stay in sync.
const CRIME_TYPES_STORAGE_KEY = 'geosafe_crime_types'

export function saveCrimeTypes() {
  try {
    localStorage.setItem(CRIME_TYPES_STORAGE_KEY, JSON.stringify(CRIME_TYPES))
  } catch {
    // localStorage unavailable (e.g. private mode) — keep in-memory only.
  }
}

try {
  const stored = localStorage.getItem(CRIME_TYPES_STORAGE_KEY)
  if (stored) {
    const parsed = JSON.parse(stored)
    if (Array.isArray(parsed) && parsed.length) {
      CRIME_TYPES.splice(0, CRIME_TYPES.length, ...parsed)
    }
  }
} catch {
  // Corrupt storage — fall back to seed data above.
}

// Each incident's lat/lng falls inside its labeled zone polygon above.
export const INCIDENTS = [
  {
    incidentID: 'INC001',
    dateTime: '2025-01-15T09:30:00',
    lat: 7.99800,
    lng: 124.25960,
    incidentStatus: 'Resolved',
    description: 'Student reported missing laptop from Engineering classroom. CCTV reviewed, suspect identified.',
    crimeTypeID: 'CT001',
    locationID: 'Z002',
    reportingOfficer: 'U003',
  },
  {
    incidentID: 'INC002',
    dateTime: '2025-01-28T14:15:00',
    lat: 7.99720,
    lng: 124.26360,
    incidentStatus: 'Resolved',
    description: 'Wallet stolen from student bag in Science building corridor during class hours.',
    crimeTypeID: 'CT001',
    locationID: 'Z003',
    reportingOfficer: 'U004',
  },
  {
    incidentID: 'INC003',
    dateTime: '2025-02-10T11:00:00',
    lat: 7.99940,
    lng: 124.26300,
    incidentStatus: 'Resolved',
    description: 'Altercation between two students near the dormitory entrance. Minor injuries sustained.',
    crimeTypeID: 'CT002',
    locationID: 'Z005',
    reportingOfficer: 'U003',
  },
  {
    incidentID: 'INC004',
    dateTime: '2025-02-22T20:45:00',
    lat: 8.00070,
    lng: 124.25980,
    incidentStatus: 'Under Investigation',
    description: 'Physical confrontation reported near the sports complex bleachers after evening practice.',
    crimeTypeID: 'CT002',
    locationID: 'Z006',
    reportingOfficer: 'U004',
  },
  {
    incidentID: 'INC005',
    dateTime: '2025-03-05T08:00:00',
    lat: 7.99710,
    lng: 124.26130,
    incidentStatus: 'Resolved',
    description: 'Graffiti found on the south wall of the Administration Building overnight.',
    crimeTypeID: 'CT003',
    locationID: 'Z004',
    reportingOfficer: 'U003',
  },
  {
    incidentID: 'INC006',
    dateTime: '2025-03-18T15:30:00',
    lat: 7.99470,
    lng: 124.26210,
    incidentStatus: 'Pending',
    description: 'Broken windows reported at the Main Gate guardhouse. Damage estimated at PHP 3,500.',
    crimeTypeID: 'CT003',
    locationID: 'Z001',
    reportingOfficer: 'U003',
  },
  {
    incidentID: 'INC007',
    dateTime: '2025-04-07T13:00:00',
    lat: 7.99770,
    lng: 124.26000,
    incidentStatus: 'Resolved',
    description: 'Female student reported repeated verbal harassment from an unknown individual near Engineering labs.',
    crimeTypeID: 'CT004',
    locationID: 'Z002',
    reportingOfficer: 'U004',
  },
  {
    incidentID: 'INC008',
    dateTime: '2025-04-21T10:20:00',
    lat: 7.99690,
    lng: 124.26400,
    incidentStatus: 'Under Investigation',
    description: 'Online harassment targeting Science department students traced to on-campus IP address.',
    crimeTypeID: 'CT004',
    locationID: 'Z003',
    reportingOfficer: 'U003',
  },
  {
    incidentID: 'INC009',
    dateTime: '2025-05-03T07:50:00',
    lat: 7.99680,
    lng: 124.26170,
    incidentStatus: 'Resolved',
    description: 'Unauthorized person found inside restricted server room near Admin Building. No damage.',
    crimeTypeID: 'CT005',
    locationID: 'Z004',
    reportingOfficer: 'U004',
  },
  {
    incidentID: 'INC010',
    dateTime: '2025-05-17T22:10:00',
    lat: 7.99910,
    lng: 124.26340,
    incidentStatus: 'Pending',
    description: 'Two non-students found trespassing in dormitory building after curfew hours.',
    crimeTypeID: 'CT005',
    locationID: 'Z005',
    reportingOfficer: 'U003',
  },
  {
    incidentID: 'INC011',
    dateTime: '2025-06-12T18:30:00',
    lat: 8.00040,
    lng: 124.26020,
    incidentStatus: 'Under Investigation',
    description: 'Suspected drug paraphernalia found in sports complex locker room during routine inspection.',
    crimeTypeID: 'CT006',
    locationID: 'Z006',
    reportingOfficer: 'U004',
  },
  {
    incidentID: 'INC012',
    dateTime: '2025-06-25T16:00:00',
    lat: 7.99660,
    lng: 124.26140,
    incidentStatus: 'Under Investigation',
    description: 'Student found in possession of prohibited substances near the Administration Building parking lot.',
    crimeTypeID: 'CT006',
    locationID: 'Z004',
    reportingOfficer: 'U003',
  },
  {
    incidentID: 'INC013',
    dateTime: '2025-07-08T12:45:00',
    lat: 7.99430,
    lng: 124.26250,
    incidentStatus: 'Resolved',
    description: 'Cellphone snatched from student near Main Gate while walking to the parking area.',
    crimeTypeID: 'CT001',
    locationID: 'Z001',
    reportingOfficer: 'U003',
  },
  {
    incidentID: 'INC014',
    dateTime: '2025-08-14T09:15:00',
    lat: 7.99890,
    lng: 124.26315,
    incidentStatus: 'Resolved',
    description: 'Physical assault between dormitory residents during a dispute over shared facilities.',
    crimeTypeID: 'CT002',
    locationID: 'Z005',
    reportingOfficer: 'U004',
  },
  {
    incidentID: 'INC015',
    dateTime: '2025-09-02T17:20:00',
    lat: 7.99670,
    lng: 124.26375,
    incidentStatus: 'Pending',
    description: 'Laboratory equipment vandalized in Science building. Several microscopes damaged.',
    crimeTypeID: 'CT003',
    locationID: 'Z003',
    reportingOfficer: 'U003',
  },
  {
    incidentID: 'INC016',
    dateTime: '2025-10-10T11:30:00',
    lat: 7.99700,
    lng: 124.26190,
    incidentStatus: 'Resolved',
    description: 'Faculty member reported harassment by a student following a grade dispute.',
    crimeTypeID: 'CT004',
    locationID: 'Z004',
    reportingOfficer: 'U004',
  },
  {
    incidentID: 'INC017',
    dateTime: '2025-11-19T06:45:00',
    lat: 7.99750,
    lng: 124.25975,
    incidentStatus: 'Resolved',
    description: 'Unauthorized access to closed wing of Engineering building by group of students.',
    crimeTypeID: 'CT005',
    locationID: 'Z002',
    reportingOfficer: 'U003',
  },
  {
    incidentID: 'INC018',
    dateTime: '2025-12-03T19:00:00',
    lat: 8.00020,
    lng: 124.25995,
    incidentStatus: 'Under Investigation',
    description: 'Drug-related incident near the Sports Complex; two individuals detained for questioning.',
    crimeTypeID: 'CT006',
    locationID: 'Z006',
    reportingOfficer: 'U004',
  },
]

// --- Incident persistence -----------------------------------------------
// Incidents can be created, edited, and archived. We persist the full list to
// localStorage (same in-place re-hydration pattern as zones/crime types) so the
// records — including their archived state — survive a page refresh.
const INCIDENTS_STORAGE_KEY = 'geosafe_incidents'

export function saveIncidents() {
  try {
    localStorage.setItem(INCIDENTS_STORAGE_KEY, JSON.stringify(INCIDENTS))
  } catch {
    // localStorage unavailable — keep in-memory only.
  }
}

try {
  const stored = localStorage.getItem(INCIDENTS_STORAGE_KEY)
  if (stored) {
    const parsed = JSON.parse(stored)
    if (Array.isArray(parsed) && parsed.length) {
      INCIDENTS.splice(0, INCIDENTS.length, ...parsed)
    }
  }
} catch {
  // Corrupt storage — fall back to seed data above.
}
