import { INCIDENTS, USERS, CRIME_TYPES, ZONES, saveCrimeTypes, saveZones, saveIncidents } from '../data/mockData'

const delay = (ms = 300) => new Promise(res => setTimeout(res, ms))

// GET /api/incidents
// By default only active (non-archived) incidents are returned. Pass
// { archivedOnly: true } for the history view, or { includeArchived: true }
// to get everything.
export async function getIncidents(filters = {}) {
  await delay()
  let results = [...INCIDENTS]
  if (filters.archivedOnly) {
    results = results.filter(i => i.archived)
  } else if (!filters.includeArchived) {
    results = results.filter(i => !i.archived)
  }
  if (filters.crimeTypeID) {
    results = results.filter(i => i.crimeTypeID === filters.crimeTypeID)
  }
  if (filters.locationID) {
    results = results.filter(i => i.locationID === filters.locationID)
  }
  if (filters.dateRange && filters.dateRange[0] && filters.dateRange[1]) {
    const start = new Date(filters.dateRange[0])
    const end = new Date(filters.dateRange[1])
    results = results.filter(i => {
      const d = new Date(i.dateTime)
      return d >= start && d <= end
    })
  }
  return results
}

// POST /api/incidents
export async function createIncident(data) {
  await delay()
  const newIncident = { ...data, incidentID: `INC${Date.now()}`, archived: false }
  INCIDENTS.push(newIncident)
  saveIncidents()
  return newIncident
}

// PUT /api/incidents/:id
export async function updateIncident(id, data) {
  await delay()
  const idx = INCIDENTS.findIndex(i => i.incidentID === id)
  if (idx === -1) throw new Error('Incident not found')
  INCIDENTS[idx] = { ...INCIDENTS[idx], ...data }
  saveIncidents()
  return INCIDENTS[idx]
}

// PATCH /api/incidents/:id/archive — soft delete: keep the record but hide it
// from the active list so it can still be viewed in the history.
export async function archiveIncident(id) {
  await delay()
  const idx = INCIDENTS.findIndex(i => i.incidentID === id)
  if (idx === -1) throw new Error('Incident not found')
  INCIDENTS[idx] = { ...INCIDENTS[idx], archived: true, archivedAt: new Date().toISOString() }
  saveIncidents()
  return INCIDENTS[idx]
}

// PATCH /api/incidents/:id/restore — bring an archived incident back.
export async function unarchiveIncident(id) {
  await delay()
  const idx = INCIDENTS.findIndex(i => i.incidentID === id)
  if (idx === -1) throw new Error('Incident not found')
  const { archivedAt: _removed, ...rest } = INCIDENTS[idx]
  INCIDENTS[idx] = { ...rest, archived: false }
  saveIncidents()
  return INCIDENTS[idx]
}

// DELETE /api/incidents/:id — permanent removal (kept for completeness; the UI
// now archives instead of deleting).
export async function deleteIncident(id) {
  await delay()
  const idx = INCIDENTS.findIndex(i => i.incidentID === id)
  if (idx !== -1) INCIDENTS.splice(idx, 1)
  saveIncidents()
  return { success: true }
}

// GET /api/users
export async function getUsers() {
  await delay()
  return USERS.map(({ password: _p, ...u }) => u)
}

// POST /api/users
export async function createUser(data) {
  await delay()
  const newUser = { ...data, userID: `U${String(USERS.length + 1).padStart(3, '0')}` }
  USERS.push(newUser)
  return newUser
}

// DELETE /api/users/:id
export async function deleteUser(id) {
  await delay()
  const idx = USERS.findIndex(u => u.userID === id)
  if (idx !== -1) USERS.splice(idx, 1)
  return { success: true }
}

// GET /api/crime-types
export async function getCrimeTypes() {
  await delay()
  return [...CRIME_TYPES]
}

// POST /api/crime-types
export async function createCrimeType(data) {
  await delay()
  const maxNum = CRIME_TYPES.reduce((max, c) => {
    const n = parseInt(c.crimeTypeID.replace('CT', ''), 10)
    return Number.isNaN(n) ? max : Math.max(max, n)
  }, 0)
  const newType = {
    crimeTypeID: `CT${String(maxNum + 1).padStart(3, '0')}`,
    typeName: data.typeName.trim(),
    description: data.description?.trim() ?? '',
  }
  CRIME_TYPES.push(newType)
  saveCrimeTypes()
  return newType
}

// DELETE /api/crime-types/:id
export async function deleteCrimeType(id) {
  await delay()
  // Guard: don't orphan incidents that reference this crime type.
  if (INCIDENTS.some(i => i.crimeTypeID === id)) {
    const err = new Error('Crime type is in use by existing incidents.')
    err.code = 'IN_USE'
    throw err
  }
  const idx = CRIME_TYPES.findIndex(c => c.crimeTypeID === id)
  if (idx !== -1) {
    CRIME_TYPES.splice(idx, 1)
    saveCrimeTypes()
  }
  return { success: true }
}

// GET /api/zones
export async function getZones() {
  await delay()
  return [...ZONES]
}

// POST /api/zones
export async function createZone(data) {
  await delay()
  const maxNum = ZONES.reduce((max, z) => {
    const n = parseInt(z.locationID.replace('Z', ''), 10)
    return Number.isNaN(n) ? max : Math.max(max, n)
  }, 0)
  const newZone = {
    locationID: `Z${String(maxNum + 1).padStart(3, '0')}`,
    campusZoneName: data.campusZoneName.trim(),
    description: data.description?.trim() ?? '',
    boundaryCoordinates: data.boundaryCoordinates,
  }
  ZONES.push(newZone)
  saveZones()
  return newZone
}

// DELETE /api/zones/:id
// Rather than orphaning incidents that reference this zone, we archive them so
// they drop out of the active list but remain in the incident history.
export async function deleteZone(id) {
  await delay()
  let archivedCount = 0
  INCIDENTS.forEach((incident, idx) => {
    if (incident.locationID === id && !incident.archived) {
      INCIDENTS[idx] = { ...incident, archived: true, archivedAt: new Date().toISOString() }
      archivedCount += 1
    }
  })
  if (archivedCount > 0) saveIncidents()

  const idx = ZONES.findIndex(z => z.locationID === id)
  if (idx !== -1) {
    ZONES.splice(idx, 1)
    saveZones()
  }
  return { success: true, archivedCount }
}
