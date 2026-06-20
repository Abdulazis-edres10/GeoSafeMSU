import { supabase } from './supabase'

// ---------------------------------------------------------------------------
// Field mapping: the database speaks snake_case (incident_id, crime_type_id),
// but the React app speaks camelCase (incidentID, crimeTypeID). These helpers
// translate in both directions so the rest of the app never has to care.
// ---------------------------------------------------------------------------

// DB row -> app object
function toIncident(row) {
  return {
    incidentID: row.incident_id,
    dateTime: row.date_time,
    lat: row.lat,
    lng: row.lng,
    incidentStatus: row.incident_status,
    description: row.description,
    crimeTypeID: row.crime_type_id,
    locationID: row.location_id,
    reportingOfficer: row.reporting_officer,
    archived: row.archived,
    archivedAt: row.archived_at,
  }
}

// app object -> DB row. Only includes keys that are actually present, so this
// works for both full inserts and partial updates.
function fromIncident(data) {
  const row = {}
  if ('dateTime' in data) row.date_time = data.dateTime
  if ('lat' in data) row.lat = data.lat
  if ('lng' in data) row.lng = data.lng
  if ('incidentStatus' in data) row.incident_status = data.incidentStatus
  if ('description' in data) row.description = data.description
  if ('crimeTypeID' in data) row.crime_type_id = data.crimeTypeID
  if ('locationID' in data) row.location_id = data.locationID
  if ('reportingOfficer' in data) row.reporting_officer = data.reportingOfficer
  if ('archived' in data) row.archived = data.archived
  if ('archivedAt' in data) row.archived_at = data.archivedAt
  return row
}

const toCrimeType = (row) => ({
  crimeTypeID: row.crime_type_id,
  typeName: row.type_name,
  description: row.description,
})

const toZone = (row) => ({
  locationID: row.location_id,
  campusZoneName: row.campus_zone_name,
  description: row.description,
  boundaryCoordinates: row.boundary_coordinates,
})

const toUser = (row) => ({
  userID: row.id, // profiles.id (the auth user's UUID)
  name: row.name,
  username: row.username,
  role: row.role,
})

// ---------------------------------------------------------------------------
// Incidents
// ---------------------------------------------------------------------------

// GET /api/incidents
// By default only active (non-archived) incidents are returned. Pass
// { archivedOnly: true } for the history view, or { includeArchived: true }
// to get everything.
export async function getIncidents(filters = {}) {
  // Start a query, then chain filters onto it. Supabase builds the SQL for us.
  let query = supabase.from('incidents').select('*')

  if (filters.archivedOnly) {
    query = query.eq('archived', true)
  } else if (!filters.includeArchived) {
    query = query.eq('archived', false)
  }
  if (filters.crimeTypeID) query = query.eq('crime_type_id', filters.crimeTypeID)
  if (filters.locationID) query = query.eq('location_id', filters.locationID)
  if (filters.dateRange && filters.dateRange[0] && filters.dateRange[1]) {
    query = query
      .gte('date_time', new Date(filters.dateRange[0]).toISOString())
      .lte('date_time', new Date(filters.dateRange[1]).toISOString())
  }

  const { data, error } = await query
  if (error) throw error
  return data.map(toIncident)
}

// POST /api/incidents
export async function createIncident(data) {
  // Generate the next sequential ID (INC001, INC002, …) — same scheme as crime
  // types and zones. We read every incident_id and take the highest, but only
  // count well-formed sequential IDs: legacy timestamp IDs (INC<13 digits>) are
  // ignored so they don't push the counter into the billions.
  const { data: existing, error: readErr } = await supabase
    .from('incidents')
    .select('incident_id')
  if (readErr) throw readErr
  const maxNum = existing.reduce((max, i) => {
    const match = /^INC(\d{1,6})$/.exec(i.incident_id)
    if (!match) return max
    return Math.max(max, parseInt(match[1], 10))
  }, 0)

  const row = {
    ...fromIncident(data),
    incident_id: `INC${String(maxNum + 1).padStart(3, '0')}`,
    archived: false,
  }
  const { data: inserted, error } = await supabase
    .from('incidents')
    .insert(row)
    .select()
    .single() // .single() => return the one inserted row, not an array
  if (error) throw error
  return toIncident(inserted)
}

// PUT /api/incidents/:id
export async function updateIncident(id, data) {
  const { data: updated, error } = await supabase
    .from('incidents')
    .update(fromIncident(data))
    .eq('incident_id', id)
    .select()
    .single()
  if (error) throw error
  return toIncident(updated)
}

// PATCH /api/incidents/:id/archive — soft delete: keep the record but hide it
// from the active list so it can still be viewed in the history.
export async function archiveIncident(id) {
  const { data: updated, error } = await supabase
    .from('incidents')
    .update({ archived: true, archived_at: new Date().toISOString() })
    .eq('incident_id', id)
    .select()
    .single()
  if (error) throw error
  return toIncident(updated)
}

// PATCH /api/incidents/:id/restore — bring an archived incident back.
export async function unarchiveIncident(id) {
  const { data: updated, error } = await supabase
    .from('incidents')
    .update({ archived: false, archived_at: null })
    .eq('incident_id', id)
    .select()
    .single()
  if (error) throw error
  return toIncident(updated)
}

// DELETE /api/incidents/:id — permanent removal (kept for completeness; the UI
// now archives instead of deleting).
export async function deleteIncident(id) {
  const { error } = await supabase.from('incidents').delete().eq('incident_id', id)
  if (error) throw error
  return { success: true }
}

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

// GET /api/users — the user list is now the profiles table (the source of truth
// linked to real auth accounts). Never selects any password — there is none here.
export async function getUsers() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, username, role')
  if (error) throw error
  return data.map(toUser)
}

// POST /api/users — creates a REAL login account via the create-user Edge Function.
// The function runs server-side (service-role key) so it can create the auth.users
// credential + profiles row. invoke() automatically attaches the caller's session
// token, which the function uses to confirm the caller is an admin.
export async function createUser(data) {
  const { data: result, error } = await supabase.functions.invoke('create-user', {
    body: {
      name: data.name,
      username: data.username,
      password: data.password,
      role: data.role,
    },
  })
  if (error) {
    // On a non-2xx the function's JSON body holds a human-readable reason.
    let messageText = 'Failed to create user.'
    try {
      const body = await error.context.json()
      if (body?.error) messageText = body.error
    } catch { /* body unreadable — keep the generic message */ }
    throw new Error(messageText)
  }
  return result // { id, username, name, role }
}

// DELETE /api/users/:id — removes the real account (auth.users + profiles row)
// via the delete-user Edge Function. invoke() attaches the caller's session token,
// which the function uses to confirm the caller is an admin (and isn't deleting
// themselves). `id` is the profiles/auth UUID.
export async function deleteUser(id) {
  const { error } = await supabase.functions.invoke('delete-user', {
    body: { id },
  })
  if (error) {
    let messageText = 'Failed to delete user.'
    try {
      const body = await error.context.json()
      if (body?.error) messageText = body.error
    } catch { /* body unreadable — keep the generic message */ }
    throw new Error(messageText)
  }
  return { success: true }
}

// ---------------------------------------------------------------------------
// Crime types
// ---------------------------------------------------------------------------

// GET /api/crime-types
export async function getCrimeTypes() {
  const { data, error } = await supabase.from('crime_types').select('*')
  if (error) throw error
  return data.map(toCrimeType)
}

// POST /api/crime-types
export async function createCrimeType(data) {
  const { data: existing, error: readErr } = await supabase
    .from('crime_types')
    .select('crime_type_id')
  if (readErr) throw readErr
  const maxNum = existing.reduce((max, c) => {
    const n = parseInt(c.crime_type_id.replace('CT', ''), 10)
    return Number.isNaN(n) ? max : Math.max(max, n)
  }, 0)

  const row = {
    crime_type_id: `CT${String(maxNum + 1).padStart(3, '0')}`,
    type_name: data.typeName.trim(),
    description: data.description?.trim() ?? '',
  }
  const { data: inserted, error } = await supabase.from('crime_types').insert(row).select().single()
  if (error) throw error
  return toCrimeType(inserted)
}

// DELETE /api/crime-types/:id
export async function deleteCrimeType(id) {
  // Guard: don't orphan incidents that reference this crime type. (The database
  // foreign key would also reject this, but we check first to give a clear error.)
  const { count, error: countErr } = await supabase
    .from('incidents')
    .select('incident_id', { count: 'exact', head: true })
    .eq('crime_type_id', id)
  if (countErr) throw countErr
  if (count > 0) {
    const err = new Error('Crime type is in use by existing incidents.')
    err.code = 'IN_USE'
    throw err
  }

  const { error } = await supabase.from('crime_types').delete().eq('crime_type_id', id)
  if (error) throw error
  return { success: true }
}

// ---------------------------------------------------------------------------
// Zones
// ---------------------------------------------------------------------------

// GET /api/zones
export async function getZones() {
  const { data, error } = await supabase.from('zones').select('*')
  if (error) throw error
  return data.map(toZone)
}

// POST /api/zones
export async function createZone(data) {
  const { data: existing, error: readErr } = await supabase.from('zones').select('location_id')
  if (readErr) throw readErr
  const maxNum = existing.reduce((max, z) => {
    const n = parseInt(z.location_id.replace('Z', ''), 10)
    return Number.isNaN(n) ? max : Math.max(max, n)
  }, 0)

  const row = {
    location_id: `Z${String(maxNum + 1).padStart(3, '0')}`,
    campus_zone_name: data.campusZoneName.trim(),
    description: data.description?.trim() ?? '',
    boundary_coordinates: data.boundaryCoordinates,
  }
  const { data: inserted, error } = await supabase.from('zones').insert(row).select().single()
  if (error) throw error
  return toZone(inserted)
}

// DELETE /api/zones/:id
// Rather than orphaning incidents that reference this zone, we archive the
// active ones (same UX as before), then clear the zone reference on every
// incident so the foreign key no longer blocks deleting the zone.
export async function deleteZone(id) {
  // 1. Archive the still-active incidents in this zone.
  const { data: archived, error: archErr } = await supabase
    .from('incidents')
    .update({ archived: true, archived_at: new Date().toISOString() })
    .eq('location_id', id)
    .eq('archived', false)
    .select('incident_id')
  if (archErr) throw archErr

  // 2. Null out the zone reference on ALL incidents pointing here. Without this
  //    the foreign key constraint would reject the delete in step 3.
  const { error: clearErr } = await supabase
    .from('incidents')
    .update({ location_id: null })
    .eq('location_id', id)
  if (clearErr) throw clearErr

  // 3. Now nothing references the zone, so it can be removed.
  const { error } = await supabase.from('zones').delete().eq('location_id', id)
  if (error) throw error
  return { success: true, archivedCount: archived.length }
}
