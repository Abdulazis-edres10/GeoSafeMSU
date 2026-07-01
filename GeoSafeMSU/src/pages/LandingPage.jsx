import 'antd/dist/reset.css'
import '../css/LandingPage.css'
import { Button } from 'antd'
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
        </div>
      </header>

      <div className="hero-section">
        <div className="hero-aurora" aria-hidden="true">
          <span className="aurora aurora-1" />
          <span className="aurora aurora-2" />
        </div>
        <div className="hero-content">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            Official DSS Monitoring Platform
          </div>
          <h1 className="hero-title">
            Campus Safety,<br />
            <span className="hero-title-accent">Mapped in Real Time</span>
          </h1>
          <p className="hero-desc">
            The official geospatial crime monitoring platform for MSU — Marawi Campus,
            empowering the DSS with actionable data to keep the community safe.
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

      <footer className="landing-footer">
        <p>© 2025 GeoSafe MSU · Department of Security and Services · Mindanao State University, Marawi City</p>
      </footer>
    </div>
  )
}

export default LandingPage
