import { useState, useEffect } from 'react'
import { Button, Row, Col, Spin, Typography, Tag, ConfigProvider } from 'antd'
import {
  HomeOutlined, EyeOutlined, InfoCircleOutlined,
  EnvironmentOutlined, SafetyOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import MapView from '../components/map/MapView'
import { getIncidents } from '../services/api'
import { darkTheme } from '../theme'
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
    <ConfigProvider theme={darkTheme}>
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
            <span style={{ color: 'rgba(237,242,247,0.8)', fontSize: 13 }}>{user?.name || 'Guest'}</span>
            <Button
              icon={<HomeOutlined />}
              onClick={handleExit}
              size="small"
              style={{ color: '#EDF2F7', borderColor: 'rgba(237,242,247,0.5)', background: 'transparent' }}
            >
              Back to Home
            </Button>
          </div>
        </div>

        <div className="guest-content">
          <div className="guest-notice">
            <InfoCircleOutlined />
            You are viewing the public crime heatmap for MSU Main Campus.
            Incident details are anonymized. For full access, contact the DSS.
          </div>

          <Title level={4} style={{ marginBottom: 16 }}>
            Campus Safety Overview
          </Title>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
              <Spin size="large" />
            </div>
          ) : (
            <div style={{ marginBottom: 24 }}>
              <Title level={5} style={{ marginBottom: 12 }}>
                Crime Heatmap — MSU Main Campus
              </Title>
              <MapView incidents={incidents} showHeatmap={true} />
            </div>
          )}

          <section className="guest-about">
            <Title level={5} style={{ marginBottom: 8 }}>
              About GeoSafe MSU
            </Title>
            <p className="guest-about-intro">
              GeoSafe MSU is the geospatial crime monitoring system of the Department of
              Security and Services (DSS) of Mindanao State University, Marawi City. Officers
              record campus incidents with their exact location, and the system maps them so
              the DSS can spot crime hotspots and decide where patrols and safety measures
              are needed most.
            </p>

            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <div className="guest-about-card">
                  <div className="guest-about-card-header">
                    <EnvironmentOutlined className="guest-about-icon" />
                    <h4>Reading the heatmap</h4>
                  </div>
                  <p>
                    Each glow is built from reported incidents. Areas go from blue (few
                    reports) to red (many reports), so warmer spots are where incidents
                    happen most often.
                  </p>
                </div>
              </Col>
              <Col xs={24} md={12}>
                <div className="guest-about-card">
                  <div className="guest-about-card-header">
                    <SafetyOutlined className="guest-about-icon" />
                    <h4>Your privacy</h4>
                  </div>
                  <p>
                    Guest access is view-only. Victim, suspect, and officer records are not
                    shown to guests. The map shows where and when incidents happened, their
                    type, and their status.
                  </p>
                </div>
              </Col>
            </Row>
          </section>
        </div>
      </div>
    </ConfigProvider>
  )
}

export default GuestDashboard
