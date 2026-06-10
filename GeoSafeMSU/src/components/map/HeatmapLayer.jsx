import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet.heat'

function HeatmapLayer({ incidents }) {
  const map = useMap()

  useEffect(() => {
    const points = incidents.map(i => [i.lat, i.lng, 0.8])

    const heatLayer = L.heatLayer(points, {
      radius: 28,
      blur: 18,
      maxZoom: 17,
      gradient: { 0.3: '#2C3E6B', 0.55: '#AE2448', 0.8: '#f39c12', 1.0: '#e74c3c' },
    })

    heatLayer.addTo(map)
    return () => { map.removeLayer(heatLayer) }
  }, [map, incidents])

  return null
}

export default HeatmapLayer
