import { useState, useEffect, useCallback } from 'react'
import {
  Table, Button, Modal, Form, Input, Select, Tag,
  Popconfirm, message, Typography,
} from 'antd'
import { PlusOutlined, TeamOutlined, StopOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { getUsers, createUser, setUserStatus } from '../services/api'
import { useAuth } from '../hooks/useAuth'

const { Title } = Typography

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Admin' },
  { value: 'officer', label: 'Security Officer' },
]

const ROLE_COLORS = { admin: 'red', officer: 'blue' }

function AdminPage() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form] = Form.useForm()

  const loadUsers = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getUsers()
      setUsers(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadUsers() }, [loadUsers])

  const handleAdd = () => {
    form.resetFields()
    setModalOpen(true)
  }

  const handleToggleStatus = async (record) => {
    const nextDisabled = !record.disabled
    try {
      await setUserStatus(record.userID, nextDisabled)
      message.success(nextDisabled ? 'Account disabled.' : 'Account enabled.')
      loadUsers()
    } catch (e) {
      message.error(e.message || 'Failed to update account status.')
    }
  }

  const handleSubmit = async (values) => {
    setSaving(true)
    try {
      await createUser(values)
      message.success('User created successfully.')
      setModalOpen(false)
      loadUsers()
    } catch (e) {
      message.error(e.message || 'Failed to create user.')
    } finally {
      setSaving(false)
    }
  }

  const columns = [
    { title: 'Full Name', dataIndex: 'name', sorter: (a, b) => a.name.localeCompare(b.name) },
    { title: 'Username', dataIndex: 'username' },
    {
      title: 'Role',
      dataIndex: 'role',
      render: role => (
        <Tag color={ROLE_COLORS[role]} style={{ textTransform: 'capitalize' }}>
          {role === 'officer' ? 'Security Officer' : role.charAt(0).toUpperCase() + role.slice(1)}
        </Tag>
      ),
      filters: ROLE_OPTIONS.map(r => ({ text: r.label, value: r.value })),
      onFilter: (value, record) => record.role === value,
    },
    {
      title: 'Status',
      dataIndex: 'disabled',
      width: 110,
      render: disabled => (
        <Tag color={disabled ? 'default' : 'success'}>
          {disabled ? 'Disabled' : 'Active'}
        </Tag>
      ),
      filters: [
        { text: 'Active', value: false },
        { text: 'Disabled', value: true },
      ],
      onFilter: (value, record) => record.disabled === value,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 130,
      render: (_, record) => {
        const isSelf = record.userID === currentUser?.userID
        // An admin can't disable their own account (lockout guard). Enabling is
        // always allowed; disabling is blocked for self.
        if (isSelf && !record.disabled) {
          return <Button size="small" disabled>Disable</Button>
        }
        return (
          <Popconfirm
            title={record.disabled ? 'Enable this account?' : 'Disable this account?'}
            description={
              record.disabled
                ? 'The user will be able to log in again.'
                : 'The user will be blocked from logging in. Their data is kept.'
            }
            onConfirm={() => handleToggleStatus(record)}
            okText={record.disabled ? 'Enable' : 'Disable'}
            okButtonProps={{ danger: !record.disabled }}
          >
            {record.disabled ? (
              <Button icon={<CheckCircleOutlined />} size="small" style={{ color: '#389e0d', borderColor: '#389e0d' }}>
                Enable
              </Button>
            ) : (
              <Button icon={<StopOutlined />} danger size="small">Disable</Button>
            )}
          </Popconfirm>
        )
      },
    },
  ]

  // Hide the logged-in admin's own account — managing yourself here isn't useful
  // (you can't disable yourself anyway), so it only adds noise.
  const visibleUsers = users.filter(u => u.userID !== currentUser?.userID)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Title level={3} style={{ margin: 0, color: '#AE2448' }}>
          <TeamOutlined style={{ marginRight: 8 }} />
          User Management
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          style={{ background: '#AE2448', border: 'none' }}
          onClick={handleAdd}
        >
          Add User
        </Button>
      </div>

      <Table
        rowKey="userID"
        columns={columns}
        dataSource={visibleUsers}
        loading={loading}
        pagination={{ pageSize: 10, showTotal: total => `${total} users` }}
        bordered
        size="middle"
      />

      <Modal
        title="Add New User"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ paddingTop: 8 }}
        >
          <Form.Item label="Full Name" name="name" rules={[{ required: true }]}>
            <Input placeholder="e.g. Juan dela Cruz" />
          </Form.Item>
          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true }, { min: 4, message: 'Minimum 4 characters.' }]}
          >
            <Input placeholder="e.g. officer3" />
          </Form.Item>
          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true }, { min: 6, message: 'Minimum 6 characters.' }]}
          >
            <Input.Password placeholder="••••••••" />
          </Form.Item>
          <Form.Item label="Role" name="role" rules={[{ required: true }]}>
            <Select options={ROLE_OPTIONS} placeholder="Select role" />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Button onClick={() => setModalOpen(false)} style={{ marginRight: 8 }}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={saving}
              style={{ background: '#AE2448', border: 'none' }}
            >
              Create User
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default AdminPage
