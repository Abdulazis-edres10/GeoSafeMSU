import { useState, useEffect } from 'react'
import { Card, Form, Input, Button, Alert, Result, Spin, ConfigProvider, message } from 'antd'
import { LockOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabase'
import { PALETTE, darkTheme } from '../theme'

// Where the invite email's link lands. The link contains a one-time token;
// Supabase verifies it and redirects here with the session in the URL hash
// (#access_token=...&type=invite). The supabase-js client detects that hash
// automatically on page load and signs the user in — so by the time this
// component runs, a valid link means "we have a session". The user then sets
// their own private password (the admin never saw one).
//
// A bad/expired link redirects here with #error_code=otp_expired instead, and
// no session is created.

// 'checking'  — waiting for supabase to process the URL hash
// 'ready'     — session found, show the password form
// 'invalid'   — expired/used/missing link
const CHECK_TIMEOUT_MS = 5000

function SetPasswordPage() {
  const navigate = useNavigate()
  const [status, setStatus] = useState('checking')
  const [linkError, setLinkError] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    // An expired or already-used link comes back as an error in the hash
    // rather than a session. Surface Supabase's reason if it gave one.
    const hash = new URLSearchParams(window.location.hash.slice(1))
    if (hash.get('error')) {
      setLinkError(
        hash.get('error_description')?.replaceAll('+', ' ') ??
          'This invitation link is invalid or has expired.'
      )
      setStatus('invalid')
      return
    }

    let done = false
    const accept = () => {
      done = true
      setStatus('ready')
    }

    // The hash may already have been consumed (session exists) or still be
    // processing (SIGNED_IN fires shortly). Cover both, with a timeout so a
    // linkless visit doesn't spin forever.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && !done) accept()
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session && !done) accept()
      }
    )
    const timer = setTimeout(() => {
      if (!done) {
        setLinkError('This invitation link is invalid or has expired. Ask an administrator to send a new one.')
        setStatus('invalid')
      }
    }, CHECK_TIMEOUT_MS)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timer)
    }
  }, [])

  const handleSubmit = async ({ password }) => {
    setSaving(true)
    // The invite session lets the user change *their own* account only.
    const { error } = await supabase.auth.updateUser({ password })
    setSaving(false)
    if (error) {
      message.error(error.message || 'Could not set your password.')
      return
    }
    message.success('Password set! Welcome to GeoSafe MSU.')
    // Setting the password kept them signed in, so go straight to the app.
    navigate('/dashboard', { replace: true })
  }

  const mutedText = 'rgba(237, 242, 247, 0.65)'

  return (
    <ConfigProvider theme={darkTheme}>
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: PALETTE.bg,
          padding: 16,
        }}
      >
        <Card style={{ width: 420, boxShadow: '0 12px 32px rgba(0,0,0,0.45)' }}>
          {status === 'checking' && (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <Spin size="large" />
              <p style={{ marginTop: 16, color: mutedText }}>Verifying your invitation…</p>
            </div>
          )}

          {status === 'invalid' && (
            <Result
              status="warning"
              title="Invitation not valid"
              subTitle={linkError}
              extra={
                <Button onClick={() => navigate('/')} style={{ borderColor: '#E86A8A', color: '#E86A8A' }}>
                  Back to Home
                </Button>
              }
            />
          )}

          {status === 'ready' && (
            <>
              <h2 style={{ color: PALETTE.text, marginBottom: 4 }}>Set your password</h2>
              <p style={{ color: mutedText, marginBottom: 24 }}>
                Your identity is verified. Choose a private password to finish
                setting up your GeoSafe MSU account — only you will know it.
              </p>
              <Alert
                type="info"
                showIcon
                message="Your administrator cannot see the password you set here."
                style={{ marginBottom: 20 }}
              />
              <Form layout="vertical" onFinish={handleSubmit} requiredMark={false}>
                <Form.Item
                  label="New Password"
                  name="password"
                  rules={[
                    { required: true, message: 'Please choose a password.' },
                    { min: 6, message: 'Minimum 6 characters.' },
                  ]}
                  hasFeedback
                >
                  <Input.Password prefix={<LockOutlined />} placeholder="••••••••" size="large" />
                </Form.Item>
                <Form.Item
                  label="Confirm Password"
                  name="confirm"
                  dependencies={['password']}
                  hasFeedback
                  rules={[
                    { required: true, message: 'Please confirm your password.' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
                          return Promise.resolve()
                        }
                        return Promise.reject(new Error('The two passwords do not match.'))
                      },
                    }),
                  ]}
                >
                  <Input.Password prefix={<LockOutlined />} placeholder="••••••••" size="large" />
                </Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={saving}
                  size="large"
                  block
                  style={{ background: PALETTE.brand, border: 'none' }}
                >
                  Set Password & Sign In
                </Button>
              </Form>
            </>
          )}
        </Card>
      </div>
    </ConfigProvider>
  )
}

export default SetPasswordPage
