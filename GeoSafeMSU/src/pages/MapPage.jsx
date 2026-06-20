import { useState, useEffect } from 'react'
import { Switch, Spin, Typography, Space, Segmented } from 'antd'
import { EnvironmentOutlined } from '@ant-design/icons'
import MapView from '../components/map/MapView'
import MapFilters from '../components/map/MapFilters'
import HeatmapLegend from '../components/map/HeatmapLegend'
import { getIncidents, getZones, getUsers, getCrimeTypes } from '../services/api'

const { Title } = Typography

// Heatmap intensity presets — drive the leaflet.heat radius/blur.
const INTENSITY = {
  Low: { radius: 18, blur: 14 },
  Medium: { radius: 28, blur: 18 },
  High: { radius: 42, blur: 24 },
}

function MapPage() {
  const [incidents, setIncidents] = useState([])
  const [zones, setZones] = useState([])
  const [users, setUsers] = useState([])
  const [crimeTypes, setCrimeTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showHeatmap, setShowHeatmap] = useState(false)
  const [intensity, setIntensity] = useState('Medium')
  const [filters, setFilters] = useState({ crimeTypeID: null, locationID: null, dateRange: null })

  useEffect(() => {
    setLoading(true)
    getIncidents(filters).then(data => {
      setIncidents(data)
      setLoading(false)
    })
  }, [filters])

  // Zones, users, and crime types don't depend on the filters, so fetch them
  // once on mount.
  useEffect(() => {
    getZones().then(setZones).catch(() => {})
    getUsers().then(setUsers).catch(() => {})
    getCrimeTypes().then(setCrimeTypes).catch(() => {})
  }, [])

  const { radius, blur } = INTENSITY[intensity]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <Title level={3} style={{ margin: 0, color: '#AE2448' }}>
          <EnvironmentOutlined style={{ marginRight: 8 }} />
          Crime Map — MSU Main Campus
        </Title>
        <Space>
          <span style={{ fontSize: 14, color: '#555' }}>
            Showing <strong>{incidents.length}</strong> incident{incidents.length !== 1 ? 's' : ''}
          </span>
          <span style={{ color: '#888' }}>|</span>
          <span style={{ fontSize: 14 }}>Heatmap</span>
          <Switch
            checked={showHeatmap}
            onChange={setShowHeatmap}
            style={{ background: showHeatmap ? '#AE2448' : undefined }}
          />
          {showHeatmap && (
            <Segmented
              size="small"
              options={['Low', 'Medium', 'High']}
              value={intensity}
              onChange={setIntensity}
            />
          )}
        </Space>
      </div>

      <MapFilters filters={filters} onChange={setFilters} crimeTypes={crimeTypes} zones={zones} />

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
          <Spin size="large" tip="Loading incidents…" />
        </div>
      ) : (
        <div style={{ position: 'relative' }}>
          <MapView
            incidents={incidents}
            zones={zones}
            users={users}
            crimeTypes={crimeTypes}
            showHeatmap={showHeatmap}
            heatmapRadius={radius}
            heatmapBlur={blur}
          />
          {showHeatmap && <HeatmapLegend />}
        </div>
      )}
    </div>
  )
}

export default MapPage
