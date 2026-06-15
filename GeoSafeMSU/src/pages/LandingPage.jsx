import 'antd/dist/reset.css'
import '../css/LandingPage.css'
import { Button } from 'antd'
import { ArrowRightOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import shield from '../assets/shield.png'

function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="landing-page">
      <header className="header">
        <div className="header-inner">
          <div className="header-brand">
            <div className="brand-logo-wrap">
              <img src={shield} alt="GeoSafe MSU" className="shield-logo" />
            </div>
            <div className="brand-text">
              <div className="brand-title">
                GeoSafe<span className="brand-title-accent">MSU</span>
              </div>
              <div className="brand-sub">Department of Security &amp; Services · MSU Marawi</div>
            </div>
          </div>

          <div className="header-actions">
            <button className="header-signin-btn" onClick={() => navigate('/login')}>
              Sign In
              <ArrowRightOutlined />
            </button>
          </div>
        </div>
      </header>

      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Campus Safety,<br />Mapped in Real Time</h1>
          <p className="hero-desc">
            GeoSafe MSU is the official geospatial crime monitoring platform for Mindanao State
            University — Marawi Campus. Empowering the DSS with actionable data to keep the
            university community safe.
          </p>
          <div className="hero-actions">
            <Button
              type="primary"
              size="large"
              style={{ background: '#AE2448', border: 'none', height: 48, paddingInline: 32 }}
              onClick={() => navigate('/login')}
            >
              Access System
            </Button>
            <Button
              size="large"
              ghost
              style={{ height: 48, paddingInline: 32, color: 'white', borderColor: 'rgba(255,255,255,0.4)' }}
              onClick={() => navigate('/guest')}
            >
              View as Guest
            </Button>
          </div>
        </div>
      </div>

      <div className="features-section">
        <div className="feature-card">
          <div className="feature-icon">🗺️</div>
          <h3>Interactive Crime Map</h3>
          <p>Visualize incidents across MSU campus zones with real-time pins and heatmap overlays.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">📊</div>
          <h3>Analytics Dashboard</h3>
          <p>Trend charts, zone breakdowns, and statistical summaries for informed decision-making.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🔒</div>
          <h3>Role-Based Access</h3>
          <p>Secure access for Admins, Security Officers, and read-only views for students and faculty.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">📋</div>
          <h3>Incident Management</h3>
          <p>Digital incident recording, tracking, and exportable PDF reports — no more paper forms.</p>
        </div>
      </div>

      <footer className="landing-footer">
        <p>© 2025 GeoSafe MSU · Department of Security and Services · Mindanao State University, Marawi City</p>
      </footer>
    </div>
  )
}

export default LandingPage
