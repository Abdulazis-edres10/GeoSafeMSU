import { useState, useEffect } from 'react'
import { Card, Form, Input, Button, Alert, Result, Spin, message } from 'antd'
import { LockOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabase'

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

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f5f5',
        padding: 16,
      }}
    >
      <Card style={{ width: 420, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
        {status === 'checking' && (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <Spin size="large" />
            <p style={{ marginTop: 16, color: '#888' }}>Verifying your invitation…</p>
          </div>
        )}

        {status === 'invalid' && (
          <Result
            status="warning"
            title="Invitation not valid"
            subTitle={linkError}
            extra={
              <Button onClick={() => navigate('/')} style={{ borderColor: '#AE2448', color: '#AE2448' }}>
                Back to Home
              </Button>
            }
          />
        )}

        {status === 'ready' && (
          <>
            <h2 style={{ color: '#AE2448', marginBottom: 4 }}>Set your password</h2>
            <p style={{ color: '#888', marginBottom: 24 }}>
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
                style={{ background: '#AE2448', border: 'none' }}
              >
                Set Password & Sign In
              </Button>
            </Form>
          </>
        )}
      </Card>
    </div>
  )
}

export default SetPasswordPage
