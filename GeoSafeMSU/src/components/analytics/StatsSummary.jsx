import { Row, Col, Card, Statistic } from 'antd'
import { AlertOutlined, CalendarOutlined, TagOutlined, EnvironmentOutlined } from '@ant-design/icons'
import { CRIME_TYPES, ZONES } from '../../data/mockData'

function StatsSummary({ incidents = [] }) {
  const now = new Date()
  const thisMonth = incidents.filter(i => {
    const d = new Date(i.dateTime)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length

  const typeCounts = CRIME_TYPES.map(ct => ({
    name: ct.typeName,
    count: incidents.filter(i => i.crimeTypeID === ct.crimeTypeID).length,
  }))
  const topType = typeCounts.reduce((a, b) => (b.count > a.count ? b : a), { name: '—', count: 0 })

  const zoneCounts = ZONES.map(z => ({
    name: z.campusZoneName,
    count: incidents.filter(i => i.locationID === z.locationID).length,
  }))
  const topZone = zoneCounts.reduce((a, b) => (b.count > a.count ? b : a), { name: '—', count: 0 })

  const stats = [
    {
      title: 'Total Incidents',
      value: incidents.length,
      icon: <AlertOutlined style={{ color: '#AE2448' }} />,
      color: '#AE2448',
    },
    {
      title: 'This Month',
      value: thisMonth,
      icon: <CalendarOutlined style={{ color: '#2C3E6B' }} />,
      color: '#2C3E6B',
    },
    {
      title: 'Most Common Type',
      value: topType.name,
      icon: <TagOutlined style={{ color: '#F39C12' }} />,
      color: '#F39C12',
      suffix: topType.count > 0 ? `(${topType.count})` : '',
    },
    {
      title: 'Hotspot Zone',
      value: topZone.name.split(' ').slice(0, 3).join(' '),
      icon: <EnvironmentOutlined style={{ color: '#27AE60' }} />,
      color: '#27AE60',
      suffix: topZone.count > 0 ? `(${topZone.count})` : '',
    },
  ]

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      {stats.map(({ title, value, icon, color, suffix }) => (
        <Col xs={24} sm={12} lg={6} key={title}>
          <Card bordered style={{ borderTop: `3px solid ${color}` }}>
            <Statistic
              title={
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {icon} {title}
                </span>
              }
              value={value}
              suffix={suffix}
              valueStyle={{ color, fontSize: typeof value === 'string' ? 16 : 28, fontWeight: 700 }}
            />
          </Card>
        </Col>
      ))}
    </Row>
  )
}

export default StatsSummary
