import { Table, Input, Tag, Button, Popconfirm, Space } from 'antd'
import { EditOutlined, InboxOutlined, UndoOutlined, SearchOutlined } from '@ant-design/icons'
import { useState } from 'react'

const STATUS_COLORS = {
  'Resolved': 'success',
  'Under Investigation': 'warning',
  'Pending': 'error',
}

function IncidentTable({ incidents = [], crimeTypes = [], zones = [], onEdit, onArchive, onRestore, archivedView = false, loading = false }) {
  const [search, setSearch] = useState('')

  const filtered = incidents.filter(i => {
    if (!search) return true
    const term = search.toLowerCase()
    const typeName = crimeTypes.find(c => c.crimeTypeID === i.crimeTypeID)?.typeName ?? ''
    return (
      i.incidentID.toLowerCase().includes(term) ||
      i.description.toLowerCase().includes(term) ||
      typeName.toLowerCase().includes(term) ||
      i.incidentStatus.toLowerCase().includes(term)
    )
  })

  const columns = [
    {
      title: 'ID',
      dataIndex: 'incidentID',
      key: 'incidentID',
      width: 100,
      render: id => <span style={{ fontWeight: 600, color: '#AE2448' }}>{id}</span>,
    },
    {
      title: 'Date & Time',
      dataIndex: 'dateTime',
      key: 'dateTime',
      width: 160,
      render: dt => new Date(dt).toLocaleString('en-PH', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
      }),
      sorter: (a, b) => new Date(a.dateTime) - new Date(b.dateTime),
      defaultSortOrder: 'descend',
    },
    {
      title: 'Crime Type',
      dataIndex: 'crimeTypeID',
      key: 'crimeTypeID',
      width: 150,
      render: id => crimeTypes.find(c => c.crimeTypeID === id)?.typeName ?? '—',
      filters: crimeTypes.map(c => ({ text: c.typeName, value: c.crimeTypeID })),
      onFilter: (value, record) => record.crimeTypeID === value,
    },
    {
      title: 'Zone',
      dataIndex: 'locationID',
      key: 'locationID',
      width: 180,
      render: id => zones.find(z => z.locationID === id)?.campusZoneName ?? '—',
    },
    {
      title: 'Status',
      dataIndex: 'incidentStatus',
      key: 'incidentStatus',
      width: 160,
      render: status => <Tag color={STATUS_COLORS[status]}>{status}</Tag>,
      filters: [
        { text: 'Resolved', value: 'Resolved' },
        { text: 'Under Investigation', value: 'Under Investigation' },
        { text: 'Pending', value: 'Pending' },
      ],
      onFilter: (value, record) => record.incidentStatus === value,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: text => text.length > 80 ? text.substring(0, 80) + '…' : text,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 110,
      fixed: 'right',
      render: (_, record) => (
        archivedView ? (
          <Popconfirm
            title="Restore incident?"
            description="It will move back to the active records."
            onConfirm={() => onRestore?.(record.incidentID)}
            okText="Restore"
          >
            <Button icon={<UndoOutlined />} size="small" title="Restore">Restore</Button>
          </Popconfirm>
        ) : (
          <Space>
            <Button
              icon={<EditOutlined />}
              size="small"
              onClick={() => onEdit?.(record)}
              title="Edit"
            />
            <Popconfirm
              title="Archive incident?"
              description="It will be hidden from active records but kept in the history."
              onConfirm={() => onArchive?.(record.incidentID)}
              okText="Archive"
            >
              <Button icon={<InboxOutlined />} size="small" title="Archive" />
            </Popconfirm>
          </Space>
        )
      ),
    },
  ]

  return (
    <div>
      <Input
        prefix={<SearchOutlined style={{ color: '#bbb' }} />}
        placeholder="Search by ID, description, type, or status…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ marginBottom: 16, maxWidth: 400 }}
        allowClear
      />
      <Table
        rowKey="incidentID"
        columns={columns}
        dataSource={filtered}
        loading={loading}
        pagination={{ pageSize: 10, showSizeChanger: true, showTotal: total => `${total} records` }}
        scroll={{ x: 900 }}
        size="middle"
        bordered
      />
    </div>
  )
}

export default IncidentTable
