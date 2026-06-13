import { Breadcrumb, Button, Avatar, Tag } from 'antd'
import { LogoutOutlined, UserOutlined } from '@ant-design/icons'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Sidebar from './Sidebar'
import '../css/MainLayout.css'

const BREADCRUMB_MAP = {
  '/dashboard': ['Home', 'Dashboard'],
  '/map': ['Home', 'Crime Map'],
  '/zones': ['Home', 'Campus Zones'],
  '/incidents': ['Home', 'Incidents'],
  '/crime-types': ['Home', 'Crime Types'],
  '/analytics': ['Home', 'Analytics'],
  '/admin': ['Home', 'User Management'],
}

const ROLE_COLORS = { admin: 'red', officer: 'blue' }

function MainLayout({ children }) {
  const { pathname } = useLocation()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const crumbs = BREADCRUMB_MAP[pathname] ?? ['Home']
  const breadcrumbItems = crumbs.map((title, i) => ({ title, key: i }))

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="main-layout">
      <Sidebar />
      <div className="layout-body">
        <div className="layout-topbar">
          <div className="layout-topbar-left">
            <Breadcrumb items={breadcrumbItems} />
          </div>
          <div className="layout-topbar-right">
            {user && (
              <div className="topbar-user">
                <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#AE2448' }} size={32} />
                <div>
                  <div className="topbar-user-name">{user.name}</div>
                  <div className="topbar-user-role">
                    <Tag color={ROLE_COLORS[user.role]} style={{ margin: 0, fontSize: 10 }}>
                      {user.role}
                    </Tag>
                  </div>
                </div>
              </div>
            )}
            <Button
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              size="small"
              danger
            >
              Logout
            </Button>
          </div>
        </div>
        <div className="layout-content">
          {children}
        </div>
      </div>
    </div>
  )
}

export default MainLayout
