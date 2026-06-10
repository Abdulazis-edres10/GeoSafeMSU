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

import { MapContainer, TileLayer, Polygon, Tooltip } from 'react-leaflet'
import IncidentMarker from './IncidentMarker'
import HeatmapLayer from './HeatmapLayer'
import { ZONES } from '../../data/mockData'
import '../../css/MapView.css'

// Real MSU Main Campus, Marawi.
const MSU_CENTER = [7.99688, 124.26149]
const DEFAULT_ZOOM = 17

function MapView({ incidents = [], showHeatmap = false, showZones = true, onMarkerClick, className = 'map-container' }) {
  return (
    <MapContainer
      center={MSU_CENTER}
      zoom={DEFAULT_ZOOM}
      className={className}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {showZones && ZONES.map(zone => (
        <Polygon
          key={zone.locationID}
          positions={zone.boundaryCoordinates}
          pathOptions={{ color: '#2C3E6B', weight: 1.5, fillColor: '#2C3E6B', fillOpacity: 0.06 }}
        >
          <Tooltip direction="center" permanent className="zone-label">
            {zone.campusZoneName}
          </Tooltip>
        </Polygon>
      ))}
      {incidents.map(incident => (
        <IncidentMarker
          key={incident.incidentID}
          incident={incident}
          onClick={onMarkerClick}
        />
      ))}
      {showHeatmap && <HeatmapLayer incidents={incidents} />}
    </MapContainer>
  )
}

export default MapView
