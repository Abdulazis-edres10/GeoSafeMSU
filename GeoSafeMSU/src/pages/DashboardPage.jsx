import { useState, useEffect } from 'react'
import { Row, Col, Card, Table, Tag, Typography, Spin } from 'antd'
import { DashboardOutlined } from '@ant-design/icons'
import StatsSummary from '../components/analytics/StatsSummary'
import MapView from '../components/map/MapView'
import { getIncidents } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import { CRIME_TYPES, ZONES } from '../data/mockData'
import '../css/Dashboard.css'

const { Title } = Typography

const STATUS_COLORS = {
  'Resolved': 'success',
  'Under Investigation': 'warning',
  'Pending': 'error',
}

const recentColumns = [
  {
    title: 'ID',
    dataIndex: 'incidentID',
    width: 100,
    render: id => <span style={{ color: '#AE2448', fontWeight: 600 }}>{id}</span>,
  },
  {
    title: 'Date',
    dataIndex: 'dateTime',
    width: 130,
    render: dt => new Date(dt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }),
  },
  {
    title: 'Type',
    dataIndex: 'crimeTypeID',
    render: id => CRIME_TYPES.find(c => c.crimeTypeID === id)?.typeName ?? '—',
  },
  {
    title: 'Zone',
    dataIndex: 'locationID',
    render: id => ZONES.find(z => z.locationID === id)?.campusZoneName ?? '—',
  },
  {
    title: 'Status',
    dataIndex: 'incidentStatus',
    render: s => <Tag color={STATUS_COLORS[s]}>{s}</Tag>,
  },
]

function DashboardPage() {
  const { user } = useAuth()
  const [incidents, setIncidents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getIncidents().then(data => {
      setIncidents(data)
      setLoading(false)
    })
  }, [])

  const recent = [...incidents]
    .sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime))
    .slice(0, 5)

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div className="dashboard-content">
      <Title level={3} style={{ color: '#AE2448', marginBottom: 20 }}>
        <DashboardOutlined style={{ marginRight: 8 }} />
        Welcome back, {user?.name}
      </Title>

      <StatsSummary incidents={incidents} />

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={14}>
          <Card title="Campus Overview Map" style={{ marginBottom: 16 }}>
            <MapView incidents={incidents} className="map-container-mini" />
          </Card>
        </Col>
        <Col xs={24} xl={10}>
          <Card title="Recent Incidents" style={{ marginBottom: 16 }}>
            <Table
              rowKey="incidentID"
              columns={recentColumns}
              dataSource={recent}
              pagination={false}
              size="small"
              bordered
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default DashboardPage
