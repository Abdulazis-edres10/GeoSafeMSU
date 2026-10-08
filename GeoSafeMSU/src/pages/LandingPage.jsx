import 'antd/dist/reset.css'
import '../css/LandingPage.css'
import { Button } from 'antd'
import { EnvironmentOutlined, FireOutlined, LockOutlined } from '@ant-design/icons'
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
              style={{ height: 48, paddingInline: 32, color: '#EDF2F7', borderColor: 'rgba(237,242,247,0.5)' }}
              onClick={() => navigate('/guest')}
            >
              View as Guest
            </Button>
          </div>
        </div>
      </div>

      <section className="landing-about">
        <h2 className="landing-about-title">About GeoSafe MSU</h2>
        <p className="landing-about-intro">
          GeoSafe MSU is a geospatial crime monitoring system built for the Department of
          Security and Services (DSS) of Mindanao State University, Marawi City. It brings
          campus incidents together on one map, so the DSS can see where crimes happen and
          respond where they are needed most.
        </p>

        <div className="landing-about-grid">
          <div className="landing-about-card">
            <div className="landing-about-card-header">
              <EnvironmentOutlined className="landing-about-icon" />
              <h3>Map every incident</h3>
            </div>
            <p>
              DSS officers record each incident with its exact location on the campus map,
              along with its crime type, date, and status.
            </p>
          </div>

          <div className="landing-about-card">
            <div className="landing-about-card-header">
              <FireOutlined className="landing-about-icon" />
              <h3>Spot crime hotspots</h3>
            </div>
            <p>
              A heatmap highlights the areas with the most reports, helping the DSS plan
              patrols and safety measures around campus.
            </p>
          </div>

          <div className="landing-about-card">
            <div className="landing-about-card-header">
              <LockOutlined className="landing-about-icon" />
              <h3>Secure, role-based access</h3>
            </div>
            <p>
              Administrators and officers sign in to manage records. Guests can view the
              public heatmap without an account, but cannot add or change any records.
            </p>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <p>© 2025 GeoSafe MSU · Department of Security and Services · Mindanao State University, Marawi City</p>
      </footer>
    </div>
  )
}

export default LandingPage
