import { useEffect } from 'react'
import L from 'leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

import { MapContainer, TileLayer, Polygon, Tooltip, useMap } from 'react-leaflet'
import IncidentMarker from './IncidentMarker'
import HeatmapLayer from './HeatmapLayer'
import { ZONES } from '../../data/mockData'
import '../../css/MapView.css'

// Real MSU Main Campus, Marawi.
const MSU_CENTER = [7.99688, 124.26149]
const DEFAULT_ZOOM = 17

// The rectangle the map is locked to — [south-west corner, north-east corner].
// These are rough estimates; tune them until the box hugs the campus.
const MSU_BOUNDS = [
  [7.985, 124.248], // SW corner (bottom-left)
  [8.010, 124.275], // NE corner (top-right)
]
const MIN_ZOOM = 16 // furthest you can zoom OUT (smaller number = see more area)

// Imperatively pans/zooms the map to a set of bounds whenever focusKey changes.
function MapFocuser({ bounds, focusKey }) {
  const map = useMap()
  useEffect(() => {
    if (bounds && bounds.length) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 18, animate: true })
    }
    // Only re-fit when the focus target changes, not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusKey])
  return null
}

function MapView({
  incidents = [],
  showHeatmap = false,
  showZones = true,
  onMarkerClick,
  onZoneClick,
  highlightZoneId = null,
  focusBounds = null,
  focusKey = null,
  className = 'map-container',
  heatmapRadius = 28,
  heatmapBlur = 18,
}) {
  return (
    <MapContainer
      center={MSU_CENTER}
      zoom={DEFAULT_ZOOM}
      minZoom={MIN_ZOOM}
      maxBounds={MSU_BOUNDS}
      maxBoundsViscosity={1.0}
      className={className}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {showZones && ZONES.map(zone => {
        const isHighlighted = zone.locationID === highlightZoneId
        return (
          <Polygon
            key={zone.locationID}
            positions={zone.boundaryCoordinates}
            pathOptions={isHighlighted
              ? { color: '#AE2448', weight: 3, fillColor: '#AE2448', fillOpacity: 0.25 }
              : { color: '#2C3E6B', weight: 1.5, fillColor: '#2C3E6B', fillOpacity: 0.06 }}
            eventHandlers={onZoneClick ? { click: () => onZoneClick(zone.locationID) } : undefined}
          >
            <Tooltip direction="center" permanent className="zone-label">
              {zone.campusZoneName}
            </Tooltip>
          </Polygon>
        )
      })}
      {incidents.map(incident => (
        <IncidentMarker
          key={incident.incidentID}
          incident={incident}
          onClick={onMarkerClick}
        />
      ))}
      {showHeatmap && <HeatmapLayer incidents={incidents} radius={heatmapRadius} blur={heatmapBlur} />}
      {focusBounds && <MapFocuser bounds={focusBounds} focusKey={focusKey} />}
    </MapContainer>
  )
}

export default MapView
