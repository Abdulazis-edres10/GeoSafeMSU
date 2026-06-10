import { INCIDENTS, USERS, CRIME_TYPES, ZONES } from '../data/mockData'

const delay = (ms = 300) => new Promise(res => setTimeout(res, ms))

// GET /api/incidents
export async function getIncidents(filters = {}) {
  await delay()
  let results = [...INCIDENTS]
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
  const newIncident = { ...data, incidentID: `INC${Date.now()}` }
  INCIDENTS.push(newIncident)
  return newIncident
}

// PUT /api/incidents/:id
export async function updateIncident(id, data) {
  await delay()
  const idx = INCIDENTS.findIndex(i => i.incidentID === id)
  if (idx === -1) throw new Error('Incident not found')
  INCIDENTS[idx] = { ...INCIDENTS[idx], ...data }
  return INCIDENTS[idx]
}

// DELETE /api/incidents/:id
export async function deleteIncident(id) {
  await delay()
  const idx = INCIDENTS.findIndex(i => i.incidentID === id)
  if (idx !== -1) INCIDENTS.splice(idx, 1)
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

// GET /api/zones
export async function getZones() {
  await delay()
  return [...ZONES]
}
