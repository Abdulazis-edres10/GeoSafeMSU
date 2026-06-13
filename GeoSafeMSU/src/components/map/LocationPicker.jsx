import { useEffect } from 'react'
import L from 'leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import { MapContainer, TileLayer, Marker, Polygon, useMapEvents, useMap } from 'react-leaflet'

// Configure the default Leaflet marker icon here so the picker works on any page,
// even ones that don't import MapView (e.g. the incident form).
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

// Captures map clicks and reports the clicked coordinates upward.
function ClickCapture({ onPick }) {
  useMapEvents({
    click(e) {
      onPick(Number(e.latlng.lat.toFixed(6)), Number(e.latlng.lng.toFixed(6)))
    },
  })
  return null
}

// Pans the map to the center whenever it is changed from outside (e.g. typing
// coordinates), without fighting the user's own click/drag.
function Recenter({ center, recenterKey }) {
  const map = useMap()
  useEffect(() => {
    map.setView([center.lat, center.lng])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recenterKey])
  return null
}

// Leaflet inside a modal can mount at zero size; recompute once it's visible.
function InvalidateSize() {
  const map = useMap()
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 200)
    return () => clearTimeout(t)
  }, [map])
  return null
}

function LocationPicker({ center, previewBounds, onPick, recenterKey, height = 260 }) {
  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={16}
      scrollWheelZoom
      style={{ height, width: '100%', borderRadius: 8, border: '1px solid #e5e4e7' }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickCapture onPick={onPick} />
      <Recenter center={center} recenterKey={recenterKey} />
      <InvalidateSize />
      <Marker position={[center.lat, center.lng]} />
      {previewBounds && (
        <Polygon
          positions={previewBounds}
          pathOptions={{ color: '#AE2448', weight: 2, fillColor: '#AE2448', fillOpacity: 0.2 }}
        />
      )}
    </MapContainer>
  )
}

export default LocationPicker
