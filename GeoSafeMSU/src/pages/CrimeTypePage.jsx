import { useState, useEffect, useCallback } from 'react'
import {
  Table, Button, Modal, Form, Input, Tag,
  Popconfirm, message, Typography,
} from 'antd'
import { PlusOutlined, TagsOutlined, DeleteOutlined } from '@ant-design/icons'
import { getCrimeTypes, createCrimeType, deleteCrimeType, getIncidents } from '../services/api'

const { Title } = Typography

function CrimeTypePage() {
  const [crimeTypes, setCrimeTypes] = useState([])
  const [usage, setUsage] = useState({})
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form] = Form.useForm()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [types, incidents] = await Promise.all([getCrimeTypes(), getIncidents()])
      const counts = incidents.reduce((acc, i) => {
        acc[i.crimeTypeID] = (acc[i.crimeTypeID] ?? 0) + 1
        return acc
      }, {})
      setCrimeTypes(types)
      setUsage(counts)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleAdd = () => {
    form.resetFields()
    setModalOpen(true)
  }

  const handleDelete = async (id) => {
    try {
      await deleteCrimeType(id)
      message.success('Crime type removed.')
      load()
    } catch (err) {
      message.error(err.code === 'IN_USE'
        ? 'Cannot remove — this crime type is used by existing incidents.'
        : 'Failed to remove crime type.')
    }
  }

  const handleSubmit = async (values) => {
    setSaving(true)
    try {
      await createCrimeType(values)
      message.success('Crime type added successfully.')
      setModalOpen(false)
      load()
    } catch {
      message.error('Failed to add crime type.')
    } finally {
      setSaving(false)
    }
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'crimeTypeID',
      width: 90,
      render: id => <span style={{ color: '#AE2448', fontWeight: 600 }}>{id}</span>,
    },
    {
      title: 'Crime Type',
      dataIndex: 'typeName',
      sorter: (a, b) => a.typeName.localeCompare(b.typeName),
      render: name => <strong>{name}</strong>,
    },
    { title: 'Description', dataIndex: 'description', ellipsis: true },
    {
      title: 'Incidents',
      key: 'usage',
      width: 110,
      align: 'center',
      render: (_, record) => {
        const count = usage[record.crimeTypeID] ?? 0
        return <Tag color={count ? 'blue' : 'default'}>{count}</Tag>
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 110,
      render: (_, record) => {
        const inUse = (usage[record.crimeTypeID] ?? 0) > 0
        return (
          <Popconfirm
            title="Remove this crime type?"
            description="This action cannot be undone."
            onConfirm={() => handleDelete(record.crimeTypeID)}
            okText="Remove"
            okButtonProps={{ danger: true }}
            disabled={inUse}
          >
            <Button
              icon={<DeleteOutlined />}
              danger
              size="small"
              disabled={inUse}
              title={inUse ? 'In use by existing incidents' : 'Remove crime type'}
            >
              Remove
            </Button>
          </Popconfirm>
        )
      },
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Title level={3} style={{ margin: 0, color: '#AE2448' }}>
          <TagsOutlined style={{ marginRight: 8 }} />
          Crime Types
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          style={{ background: '#AE2448', border: 'none' }}
          onClick={handleAdd}
        >
          Add Crime Type
        </Button>
      </div>

      <Table
        rowKey="crimeTypeID"
        columns={columns}
        dataSource={crimeTypes}
        loading={loading}
        pagination={{ pageSize: 10, showTotal: total => `${total} crime types` }}
        bordered
        size="middle"
      />

      <Modal
        title="Add New Crime Type"
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
          <Form.Item
            label="Crime Type Name"
            name="typeName"
            rules={[
              { required: true, message: 'Please enter a crime type name.' },
              { min: 3, message: 'Minimum 3 characters.' },
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve()
                  const exists = crimeTypes.some(
                    c => c.typeName.toLowerCase() === value.trim().toLowerCase()
                  )
                  return exists
                    ? Promise.reject(new Error('This crime type already exists.'))
                    : Promise.resolve()
                },
              },
            ]}
          >
            <Input placeholder="e.g. Cybercrime" />
          </Form.Item>
          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: 'Please provide a short description.' }]}
          >
            <Input.TextArea rows={3} placeholder="Brief description of this crime type…" />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Button onClick={() => setModalOpen(false)} style={{ marginRight: 8 }}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={saving}
              style={{ background: '#AE2448', border: 'none' }}
            >
              Add Crime Type
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default CrimeTypePage
