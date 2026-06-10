import { useState, useEffect } from 'react'
import { Button, Row, Col, Spin, Typography, Tag } from 'antd'
import { HomeOutlined, EyeOutlined, InfoCircleOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import MapView from '../components/map/MapView'
import CrimeTrendChart from '../components/analytics/CrimeTrendChart'
import CrimeTypeChart from '../components/analytics/CrimeTypeChart'
import StatsSummary from '../components/analytics/StatsSummary'
import { getIncidents } from '../services/api'
import shield from '../assets/shield.png'
import '../css/GuestDashboard.css'

const { Title } = Typography

function GuestDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [incidents, setIncidents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getIncidents().then(data => {
      setIncidents(data)
      setLoading(false)
    })
  }, [])

  const handleExit = () => {
    navigate('/', { replace: true })
  }

  return (
    <div className="guest-page">
      <div className="guest-header">
        <div className="guest-header-brand">
          <img src={shield} alt="GeoSafe MSU" />
          <div>
            <span>GeoSafe MSU</span>
            <div className="guest-header-sub">MSU Main Campus Safety Dashboard</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Tag color="green" style={{ margin: 0 }}>
            <EyeOutlined /> View-Only Access
          </Tag>
          <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>{user?.name || 'Guest'}</span>
          <Button
            icon={<HomeOutlined />}
            onClick={handleExit}
            size="small"
            ghost
          >
            Back to Home
          </Button>
        </div>
      </div>

      <div className="guest-content">
        <div className="guest-notice">
          <InfoCircleOutlined />
          You are viewing public crime trend data for MSU Main Campus.
          Incident details are anonymized. For full access, contact the DSS.
        </div>

        <Title level={4} style={{ color: '#2C3E6B', marginBottom: 16 }}>
          Campus Safety Overview
        </Title>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <Spin size="large" />
          </div>
        ) : (
          <>
            <StatsSummary incidents={incidents} />

            <div style={{ marginBottom: 24 }}>
              <Title level={5} style={{ color: '#555', marginBottom: 12 }}>
                Crime Heatmap — MSU Main Campus
              </Title>
              <MapView incidents={incidents} showHeatmap={true} />
            </div>

            <Row gutter={[16, 16]}>
              <Col xs={24} lg={12}>
                <CrimeTrendChart incidents={incidents} />
              </Col>
              <Col xs={24} lg={12}>
                <CrimeTypeChart incidents={incidents} />
              </Col>
            </Row>
          </>
        )}
      </div>
    </div>
  )
}

export default GuestDashboard
