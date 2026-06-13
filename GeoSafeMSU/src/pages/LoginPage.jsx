import { Button, Checkbox, Form, Input, Alert } from 'antd'
import { UserOutlined, LockOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import shield from '../assets/shield.png'
import '../css/LoginPage.css'

function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const onFinish = ({ username, password }) => {
    setLoading(true)
    setError(null)
    const result = login(username, password)
    setLoading(false)
    if (!result.success) {
      setError(result.message)
      return
    }
    navigate('/dashboard', { replace: true })
  }

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Branding panel */}
        <div className="login-brand">
          <div className="login-brand-overlay" />
          <div className="login-brand-content">
            <img src={shield} alt="GeoSafe MSU shield" className="login-brand-logo" />
            <h1>GeoSafe MSU</h1>
            <p className="login-brand-sub">Geospatial Crime Monitoring Platform</p>
            <div className="login-brand-divider" />
            <p className="login-brand-org">
              Department of Security and Services<br />
              Mindanao State University — Marawi Campus
            </p>
          </div>
        </div>

        {/* Form panel */}
        <div className="login-form-panel">
          <div className="login-form-inner">
            <h2 className="login-title">Welcome back</h2>
            <p className="login-subtitle">Sign in to access the GeoSafe MSU dashboard.</p>

            {error && (
              <Alert
                message={error}
                type="error"
                showIcon
                style={{ marginBottom: 20, textAlign: 'left' }}
                closable
                onClose={() => setError(null)}
              />
            )}

            <Form
              name="login"
              initialValues={{ remember: true }}
              onFinish={onFinish}
              autoComplete="off"
              layout="vertical"
              requiredMark={false}
            >
              <Form.Item
                label="Username"
                name="username"
                rules={[{ required: true, message: 'Please enter your username.' }]}
              >
                <Input
                  prefix={<UserOutlined className="login-input-icon" />}
                  placeholder="e.g. officer1"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                label="Password"
                name="password"
                rules={[{ required: true, message: 'Please enter your password.' }]}
              >
                <Input.Password
                  prefix={<LockOutlined className="login-input-icon" />}
                  placeholder="••••••••"
                  size="large"
                />
              </Form.Item>

              <div className="login-row">
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox>Remember me</Checkbox>
                </Form.Item>
              </div>

              <Form.Item style={{ marginBottom: 12 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  size="large"
                  block
                  className="login-submit-btn"
                >
                  Sign In
                </Button>
              </Form.Item>

              <Button
                type="text"
                size="large"
                block
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('/')}
                className="login-back-btn"
              >
                Back to Home
              </Button>
            </Form>

            <div className="login-demo">
              <span className="login-demo-label">Demo accounts</span>
              <div className="login-demo-grid">
                <span><strong>Admin</strong> admin1 / admin123</span>
                <span><strong>Officer</strong> officer1 / officer123</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
