import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button, Card, Col, Descriptions, Empty, Result, Row, Spin, Tag, Typography } from 'antd'
import { ArrowLeftOutlined, TeamOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import {
  getIncidentById,
  getIncidentPersons,
  getCrimeTypes,
  getZones,
} from '../services/api'

const { Title, Text } = Typography

const STATUS_COLORS = {
  'Resolved': 'success',
  'Under Investigation': 'warning',
  'Pending': 'error',
}

const VICTIM_COLOR = '#63B3ED'
const SUSPECT_COLOR = '#E86A8A'

function PersonCards({ title, persons, color }) {
  return (
    <Card
      title={<span style={{ color }}>{title} ({persons.length})</span>}
      style={{ borderTop: `3px solid ${color}`, height: '100%' }}
    >
      {persons.length === 0 && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="None recorded." />}
      {persons.map(p => (
        <Descriptions
          key={p.personID}
          size="small"
          bordered
          column={2}
          style={{ marginBottom: 16 }}
          title={<span style={{ fontSize: 14 }}>{p.fullName}</span>}
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
    </Card>
  )
}

// Full-page view of one incident's victims and suspects, opened from the
// incident table at /incidents/:id/persons.
function IncidentPersonsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [incident, setIncident] = useState(null)
  const [persons, setPersons] = useState([])
  const [crimeTypes, setCrimeTypes] = useState([])
  const [zones, setZones] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getIncidentById(id), getIncidentPersons(id)])
      .then(([inc, people]) => {
        setIncident(inc)
        setPersons(people)
      })
      .catch(err => {
        console.error('Failed to load incident persons:', err)
        setIncident(null)
      })
      .finally(() => setLoading(false))
    getCrimeTypes().then(setCrimeTypes).catch(() => {})
    getZones().then(setZones).catch(() => {})
  }, [id])

  const backButton = (
    <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/incidents')}>
      Back to Incident Records
    </Button>
  )

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
        <Spin size="large" />
      </div>
    )
  }

  if (!incident) {
    return <Result status="404" title="Incident not found" extra={backButton} />
  }

  const victims = persons.filter(p => p.role === 'victim')
  const suspects = persons.filter(p => p.role === 'suspect')
  const typeName = crimeTypes.find(c => c.crimeTypeID === incident.crimeTypeID)?.typeName ?? '—'
  const zoneName = zones.find(z => z.locationID === incident.locationID)?.campusZoneName ?? '—'

  return (
    <div>
      <div style={{ marginBottom: 16 }}>{backButton}</div>

      <Title level={3} style={{ marginTop: 0 }}>
        <TeamOutlined style={{ marginRight: 8 }} />
        Victims &amp; Suspects
      </Title>

      <Card size="small" style={{ marginBottom: 16 }}>
        <Descriptions
          size="small"
          column={{ xs: 1, md: 3 }}
          items={[
            { key: 'type', label: 'Crime Type', children: typeName },
            { key: 'zone', label: 'Zone', children: zoneName },
            {
              key: 'date',
              label: 'Date & Time',
              children: dayjs(incident.dateTime).format('MMM D, YYYY h:mm A'),
            },
            {
              key: 'status',
              label: 'Status',
              children: <Tag color={STATUS_COLORS[incident.incidentStatus]}>{incident.incidentStatus}</Tag>,
            },
            {
              key: 'archived',
              label: 'Record',
              children: incident.archived ? <Tag>Archived</Tag> : <Tag color="blue">Active</Tag>,
            },
            { key: 'desc', label: 'Description', span: 3, children: <Text>{incident.description}</Text> },
          ]}
        />
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <PersonCards title="Victims" persons={victims} color={VICTIM_COLOR} />
        </Col>
        <Col xs={24} lg={12}>
          <PersonCards title="Suspects" persons={suspects} color={SUSPECT_COLOR} />
        </Col>
      </Row>
    </div>
  )
}

export default IncidentPersonsPage
