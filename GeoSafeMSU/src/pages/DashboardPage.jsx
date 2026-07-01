import { useState, useEffect } from 'react'
import { Row, Col, Card, Table, Tag, Typography, Spin } from 'antd'
import { DashboardOutlined } from '@ant-design/icons'
import StatsSummary from '../components/analytics/StatsSummary'
import MapView from '../components/map/MapView'
import { getIncidents, getCrimeTypes, getZones, getUsers } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import '../css/Dashboard.css'

const { Title } = Typography

const STATUS_COLORS = {
  'Resolved': 'success',
  'Under Investigation': 'warning',
  'Pending': 'error',
}

function DashboardPage() {
  const { user } = useAuth()
  const [incidents, setIncidents] = useState([])
  const [crimeTypes, setCrimeTypes] = useState([])
  const [zones, setZones] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getIncidents().then(data => {
      setIncidents(data)
      setLoading(false)
    })
    getCrimeTypes().then(setCrimeTypes).catch(() => {})
    getZones().then(setZones).catch(() => {})
    getUsers().then(setUsers).catch(() => {})
  }, [])

  // Built inside the component so the Type/Zone columns resolve names against
  // the live DB lists rather than a frozen copy.
  const recentColumns = [
    {
      title: 'Date',
      dataIndex: 'dateTime',
      width: 130,
      render: dt => new Date(dt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }),
    },
    {
      title: 'Type',
      dataIndex: 'crimeTypeID',
      render: id => crimeTypes.find(c => c.crimeTypeID === id)?.typeName ?? '—',
    },
    {
      title: 'Zone',
      dataIndex: 'locationID',
      render: id => zones.find(z => z.locationID === id)?.campusZoneName ?? '—',
    },
    {
      title: 'Status',
      dataIndex: 'incidentStatus',
      render: s => <Tag color={STATUS_COLORS[s]}>{s}</Tag>,
    },
  ]

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

      <StatsSummary incidents={incidents} crimeTypes={crimeTypes} zones={zones} />

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={14}>
          <Card title="Campus Overview Map" style={{ marginBottom: 16 }}>
            <MapView
              incidents={incidents}
              zones={zones}
              users={users}
              crimeTypes={crimeTypes}
              className="map-container-mini"
            />
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
