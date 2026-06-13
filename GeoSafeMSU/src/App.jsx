import './App.css'
import 'antd/dist/reset.css'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Spin, Result, Button } from 'antd'
import { useAuth } from './hooks/useAuth'

import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import MapPage from './pages/MapPage'
import IncidentPage from './pages/IncidentPage'
import Analytics from './pages/Analytics'
import AdminPage from './pages/AdminPage'
import CrimeTypePage from './pages/CrimeTypePage'
import CampusZonesPage from './pages/CampusZonesPage'
import GuestDashboard from './pages/GuestDashboard'

import ProtectedRoute from './components/ProtectedRoute'
import MainLayout from './components/MainLayout'
import { useNavigate } from 'react-router-dom'

// The landing page is always the entry point. Authenticated admins/officers
// can still refresh into their protected pages directly (e.g. /dashboard),
// but starting the app never auto-jumps past the landing screen.
function RootRedirect() {
  return <LandingPage />
}

function UnauthorizedPage() {
  const navigate = useNavigate()
  return (
    <Result
      status="403"
      title="403 — Access Denied"
      subTitle="You do not have permission to view this page."
      extra={<Button type="primary" style={{ background: '#AE2448', border: 'none' }} onClick={() => navigate(-1)}>Go Back</Button>}
      style={{ marginTop: 80 }}
    />
  )
}

function App() {
  const { loading } = useAuth()

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Legacy alias. NOTE: do not add `/Dashboard` or `/Analytics` aliases —
          React Router matches case-insensitively, so they collide with the real
          `/dashboard` and `/analytics` routes and render a blank no-op redirect. */}
      <Route path="/LoginPage" element={<Navigate to="/login" replace />} />

      {/* Protected — admin + officer */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={['admin', 'officer']}>
            <MainLayout><DashboardPage /></MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/map"
        element={
          <ProtectedRoute allowedRoles={['admin', 'officer']}>
            <MainLayout><MapPage /></MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/incidents"
        element={
          <ProtectedRoute allowedRoles={['admin', 'officer']}>
            <MainLayout><IncidentPage /></MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute allowedRoles={['admin', 'officer']}>
            <MainLayout><Analytics /></MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/crime-types"
        element={
          <ProtectedRoute allowedRoles={['admin', 'officer']}>
            <MainLayout><CrimeTypePage /></MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/zones"
        element={
          <ProtectedRoute allowedRoles={['admin', 'officer']}>
            <MainLayout><CampusZonesPage /></MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Protected — admin only */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <MainLayout><AdminPage /></MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Public — guest view. Open access, no login required. */}
      <Route path="/guest" element={<GuestDashboard />} />
    </Routes>
  )
}

export default App
