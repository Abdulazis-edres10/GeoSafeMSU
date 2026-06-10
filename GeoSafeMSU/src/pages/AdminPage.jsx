import { useState, useEffect, useCallback } from 'react'
import {
  Table, Button, Modal, Form, Input, Select, Tag,
  Popconfirm, message, Typography, Space,
} from 'antd'
import { PlusOutlined, TeamOutlined, DeleteOutlined } from '@ant-design/icons'
import { getUsers, createUser, deleteUser } from '../services/api'

const { Title } = Typography

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Admin' },
  { value: 'officer', label: 'Security Officer' },
  { value: 'guest', label: 'Guest (View-Only)' },
]

const ROLE_COLORS = { admin: 'red', officer: 'blue', guest: 'green' }

function AdminPage() {
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

  const handleDelete = async (id) => {
    try {
      await deleteUser(id)
      message.success('User removed.')
      loadUsers()
    } catch {
      message.error('Failed to remove user.')
    }
  }

  const handleSubmit = async (values) => {
    setSaving(true)
    try {
      await createUser(values)
      message.success('User created successfully.')
      setModalOpen(false)
      loadUsers()
    } catch {
      message.error('Failed to create user.')
    } finally {
      setSaving(false)
    }
  }

  const columns = [
    {
      title: 'User ID',
      dataIndex: 'userID',
      width: 90,
      render: id => <span style={{ color: '#AE2448', fontWeight: 600 }}>{id}</span>,
    },
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
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Popconfirm
          title="Remove this user?"
          description="This action cannot be undone."
          onConfirm={() => handleDelete(record.userID)}
          okText="Remove"
          okButtonProps={{ danger: true }}
        >
          <Button icon={<DeleteOutlined />} danger size="small">Remove</Button>
        </Popconfirm>
      ),
    },
  ]

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
        dataSource={users}
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
