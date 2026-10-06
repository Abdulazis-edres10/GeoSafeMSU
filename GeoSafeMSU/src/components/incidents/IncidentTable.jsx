import { Table, Input, Tag, Button, Popconfirm, Space, Row, Col, Descriptions } from 'antd'
import { EditOutlined, InboxOutlined, UndoOutlined, SearchOutlined } from '@ant-design/icons'
import { useState } from 'react'
import dayjs from 'dayjs'

const STATUS_COLORS = {
  'Resolved': 'success',
  'Under Investigation': 'warning',
  'Pending': 'error',
}

const VICTIM_COLOR = '#63B3ED'
const SUSPECT_COLOR = '#E86A8A'

function PersonNames({ persons, color }) {
  if (persons.length === 0) return <span style={{ color: '#bbb' }}>—</span>
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {persons.map(p => (
        <span key={p.personID} style={{ color }}>{p.fullName}</span>
      ))}
    </div>
  )
}

function PersonDetails({ title, persons, color }) {
  return (
    <div>
      <div style={{ fontWeight: 600, color, marginBottom: 8 }}>{title} ({persons.length})</div>
      {persons.length === 0 && <div style={{ color: '#888', fontSize: 12 }}>None recorded.</div>}
      {persons.map(p => (
        <Descriptions
          key={p.personID}
          size="small"
          bordered
          column={2}
          style={{ marginBottom: 12, borderLeft: `3px solid ${color}` }}
          title={<span style={{ fontSize: 13 }}>{p.fullName}</span>}
          items={[
            { key: 'age', label: 'Age', children: p.age ?? '—' },
            { key: 'gender', label: 'Gender', children: p.gender ?? '—' },
            {
              key: 'birthdate',
              label: 'Birthdate',
              children: p.birthdate ? dayjs(p.birthdate).format('MMM D, YYYY') : '—',
            },
            { key: 'civilStatus', label: 'Civil Status', children: p.civilStatus ?? '—' },
            { key: 'address', label: 'Address', span: 2, children: p.address ?? '—' },
          ]}
        />
      ))}
    </div>
  )
}

function IncidentTable({ incidents = [], crimeTypes = [], zones = [], users = [], personsByIncident = {}, onEdit, onArchive, onRestore, archivedView = false, loading = false }) {
  const [search, setSearch] = useState('')

  const officerName = id => users.find(u => u.userID === id)?.name ?? '—'
  const personsOf = (incidentID, role) =>
    (personsByIncident[incidentID] ?? []).filter(p => p.role === role)

  const filtered = incidents.filter(i => {
    if (!search) return true
    const term = search.toLowerCase()
    const typeName = crimeTypes.find(c => c.crimeTypeID === i.crimeTypeID)?.typeName ?? ''
    return (
      i.incidentID.toLowerCase().includes(term) ||
      i.description.toLowerCase().includes(term) ||
      typeName.toLowerCase().includes(term) ||
      i.incidentStatus.toLowerCase().includes(term) ||
      officerName(i.reportingOfficer).toLowerCase().includes(term) ||
      (personsByIncident[i.incidentID] ?? []).some(p => p.fullName.toLowerCase().includes(term))
    )
  })

  const columns = [
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
      title: 'Victims',
      key: 'victims',
      width: 160,
      render: (_, record) => (
        <PersonNames persons={personsOf(record.incidentID, 'victim')} color={VICTIM_COLOR} />
      ),
    },
    {
      title: 'Suspects',
      key: 'suspects',
      width: 160,
      render: (_, record) => (
        <PersonNames persons={personsOf(record.incidentID, 'suspect')} color={SUSPECT_COLOR} />
      ),
    },
    {
      title: 'Reported By',
      dataIndex: 'reportingOfficer',
      key: 'reportingOfficer',
      width: 160,
      render: officerName,
      filters: users.map(u => ({ text: u.name, value: u.userID })),
      onFilter: (value, record) => record.reportingOfficer === value,
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
        placeholder="Search by description, type, status, or person…"
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
        expandable={{
          rowExpandable: record => (personsByIncident[record.incidentID] ?? []).length > 0,
          expandedRowRender: record => (
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <PersonDetails title="Victims" persons={personsOf(record.incidentID, 'victim')} color={VICTIM_COLOR} />
              </Col>
              <Col xs={24} md={12}>
                <PersonDetails title="Suspects" persons={personsOf(record.incidentID, 'suspect')} color={SUSPECT_COLOR} />
              </Col>
            </Row>
          ),
        }}
        pagination={{ pageSize: 10, showSizeChanger: true, showTotal: total => `${total} records` }}
        scroll={{ x: 1220 }}
        size="middle"
        bordered
      />
    </div>
  )
}

export default IncidentTable
