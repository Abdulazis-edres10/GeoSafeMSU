import { useState } from 'react'
import { Breadcrumb, Dropdown, Avatar, Tag, ConfigProvider } from 'antd'
import { DownOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { darkTheme } from '../theme'
import Sidebar from './Sidebar'
import '../css/MainLayout.css'

const BREADCRUMB_MAP = {
  '/dashboard': ['Home', 'Dashboard'],
  '/map': ['Home', 'Crime Map'],
  '/zones': ['Home', 'Campus Zones'],
  '/incidents': ['Home', 'Incidents'],
  '/analytics': ['Home', 'Analytics'],
  '/admin': ['Home', 'User Management'],
}

const ROLE_COLORS = { admin: 'red', officer: 'blue' }

function MainLayout({ children }) {
  const { pathname } = useLocation()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const crumbs = BREADCRUMB_MAP[pathname] ?? ['Home']
  const breadcrumbItems = crumbs.map((title, i) => ({ title, key: i }))

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const handleMenuClick = ({ key }) => {
    if (key === 'logout') handleLogout()
  }

  // Initials from the user's name ("Juan Dela Cruz" → "JD"); icon if no name.
  const initials = (user?.name ?? '')
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0])
    .filter((_, i, all) => i === 0 || i === all.length - 1)
    .join('')
    .toUpperCase()

  const userAvatar = (size) => (
    <Avatar icon={initials ? null : <UserOutlined />} style={{ backgroundColor: '#AE2448' }} size={size}>
      {initials}
    </Avatar>
  )

  const menuItems = user
    ? [
        {
          type: 'group',
          label: (
            <div className="topbar-menu-header">
              {userAvatar(40)}
              <div className="topbar-menu-header-text">
                <div className="topbar-menu-name">{user.name}</div>
                <div className="topbar-menu-username">@{user.username}</div>
                <Tag color={ROLE_COLORS[user.role]} style={{ margin: '4px 0 0', fontSize: 10 }}>
                  {user.role}
                </Tag>
              </div>
            </div>
          ),
        },
        { type: 'divider' },
        { key: 'logout', icon: <LogoutOutlined />, label: 'Log out', danger: true },
      ]
    : []

  return (
    <ConfigProvider theme={darkTheme}>
      <div className="main-layout">
        <Sidebar />
        <div className="layout-body">
          <div className="layout-topbar">
            <div className="layout-topbar-left">
              <Breadcrumb items={breadcrumbItems} />
            </div>
            <div className="layout-topbar-right">
              {user && (
                <Dropdown
                  menu={{ items: menuItems, onClick: handleMenuClick }}
                  trigger={['click']}
                  placement="bottomRight"
                  open={menuOpen}
                  onOpenChange={setMenuOpen}
                >
                  <button
                    type="button"
                    className={`topbar-user${menuOpen ? ' topbar-user-open' : ''}`}
                    aria-label="Account menu"
                  >
                    <span className="topbar-user-avatar">
                      {userAvatar(32)}
                      <span className="topbar-user-status" />
                    </span>
                    <span className="topbar-user-text">
                      <span className="topbar-user-name">{user.name}</span>
                      <span className="topbar-user-role">{user.role}</span>
                    </span>
                    <DownOutlined className="topbar-user-caret" />
                  </button>
                </Dropdown>
              )}
            </div>
          </div>
          <div className="layout-content">
            {children}
          </div>
        </div>
      </div>
    </ConfigProvider>
  )
}

export default MainLayout
