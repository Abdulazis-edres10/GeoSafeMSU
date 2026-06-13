// Ray-casting point-in-polygon test.
// `polygon` is an array of [lat, lng] points (matches zone.boundaryCoordinates).
export function pointInPolygon(lat, lng, polygon) {
  if (!Array.isArray(polygon) || polygon.length < 3) return false
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [latI, lngI] = polygon[i]
    const [latJ, lngJ] = polygon[j]
    const intersect =
      ((latI > lat) !== (latJ > lat)) &&
      (lng < ((lngJ - lngI) * (lat - latI)) / (latJ - latI) + lngI)
    if (intersect) inside = !inside
  }
  return inside
}

// Returns the first zone whose boundary contains the given point, or null.
export function findZoneForPoint(lat, lng, zones = []) {
  return zones.find(z => pointInPolygon(lat, lng, z.boundaryCoordinates)) ?? null
}
