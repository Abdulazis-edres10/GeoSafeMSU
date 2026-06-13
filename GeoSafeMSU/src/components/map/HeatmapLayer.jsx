import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet.heat'

// Active incidents contribute more "heat" than resolved ones, so the map
// surfaces where attention is actually needed rather than just raw counts.
const STATUS_WEIGHT = {
  'Pending': 1.0,
  'Under Investigation': 0.8,
  'Resolved': 0.45,
}

function HeatmapLayer({ incidents, radius = 28, blur = 18 }) {
  const map = useMap()

  useEffect(() => {
    const points = incidents.map(i => [i.lat, i.lng, STATUS_WEIGHT[i.incidentStatus] ?? 0.6])

    const heatLayer = L.heatLayer(points, {
      radius,
      blur,
      maxZoom: 17,
      minOpacity: 0.35,
      gradient: { 0.3: '#2C3E6B', 0.55: '#AE2448', 0.8: '#f39c12', 1.0: '#e74c3c' },
    })

    heatLayer.addTo(map)
    return () => { map.removeLayer(heatLayer) }
  }, [map, incidents, radius, blur])

  return null
}

export default HeatmapLayer
