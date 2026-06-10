import { useState, useEffect } from 'react'
import { Switch, Spin, Typography, Space } from 'antd'
import { EnvironmentOutlined } from '@ant-design/icons'
import MapView from '../components/map/MapView'
import MapFilters from '../components/map/MapFilters'
import { getIncidents } from '../services/api'

const { Title } = Typography

function MapPage() {
  const [incidents, setIncidents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showHeatmap, setShowHeatmap] = useState(false)
  const [filters, setFilters] = useState({ crimeTypeID: null, locationID: null, dateRange: null })

  useEffect(() => {
    setLoading(true)
    getIncidents(filters).then(data => {
      setIncidents(data)
      setLoading(false)
    })
  }, [filters])

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
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
        </Space>
      </div>

      <MapFilters filters={filters} onChange={setFilters} />

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
          <Spin size="large" tip="Loading incidents…" />
        </div>
      ) : (
        <MapView incidents={incidents} showHeatmap={showHeatmap} />
      )}
    </div>
  )
}

export default MapPage
