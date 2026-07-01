import { useState } from 'react'
import { Menu } from 'antd'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  DashboardOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  BarChartOutlined,
  TeamOutlined,
  ApartmentOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons'
import { useAuth } from '../hooks/useAuth'
import shield from '../assets/shield.png'
import '../css/Sidebar.css'

const ALL_ITEMS = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: 'Dashboard', roles: ['admin', 'officer'] },
  { key: '/map', icon: <EnvironmentOutlined />, label: 'Crime Map', roles: ['admin', 'officer'] },
  { key: '/zones', icon: <ApartmentOutlined />, label: 'Campus Zones', roles: ['admin', 'officer'] },
  { key: '/incidents', icon: <FileTextOutlined />, label: 'Incidents', roles: ['admin', 'officer'] },
  { key: '/analytics', icon: <BarChartOutlined />, label: 'Analytics', roles: ['admin'] },
  { key: '/admin', icon: <TeamOutlined />, label: 'User Management', roles: ['admin'] },
]

function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const menuItems = ALL_ITEMS
    .filter(item => item.roles.includes(user?.role))
    .map(({ key, icon, label }) => ({ key, icon, label }))

  return (
    <div className={`sidebar${collapsed ? ' collapsed' : ''}`}>
      <div className="sidebar-logo">
        <img src={shield} alt="GeoSafe MSU" />
        {!collapsed && (
          <div className="sidebar-logo-text">
            GeoSafe MSU
            <span>DSS · MSU Marawi</span>
          </div>
        )}
      </div>

      <div className="sidebar-menu-wrapper">
        <Menu
          mode="inline"
          inlineCollapsed={collapsed}
          selectedKeys={[pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </div>

      <div className="sidebar-toggle">
        <button onClick={() => setCollapsed(c => !c)} title={collapsed ? 'Expand' : 'Collapse'}>
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </button>
      </div>
    </div>
  )
}

export default Sidebar
