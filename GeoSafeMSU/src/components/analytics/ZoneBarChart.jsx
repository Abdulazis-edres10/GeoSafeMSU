import { useState } from 'react'
import { Card, Tag } from 'antd'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts'
function ZoneTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const { fullName, count } = payload[0].payload
  return (
    <div style={{
      background: '#fff', border: '1px solid #e5e4e7', borderRadius: 8,
      padding: '8px 12px', boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
    }}>
      <div style={{ fontWeight: 700, color: '#2C3E6B' }}>{fullName}</div>
      <div style={{ color: '#AE2448', fontWeight: 600 }}>
        {count} incident{count !== 1 ? 's' : ''}
      </div>
    </div>
  )
}

function ZoneBarChart({ incidents = [], zones = [] }) {
  const [selected, setSelected] = useState(null)

  const data = zones.map(z => ({
    zone: z.campusZoneName.replace('College of ', '').replace(' Area', '').replace(' Building', ''),
    fullName: z.campusZoneName,
    locationID: z.locationID,
    count: incidents.filter(i => i.locationID === z.locationID).length,
  })).sort((a, b) => b.count - a.count)

  const maxCount = Math.max(...data.map(d => d.count), 0)
  const selectedRow = data.find(d => d.locationID === selected)

  const handleClick = (entry) => {
    setSelected(prev => (prev === entry.locationID ? null : entry.locationID))
  }

  const barColor = (entry) => {
    if (selected) return entry.locationID === selected ? '#AE2448' : '#c9cfde'
    return entry.count === maxCount && maxCount > 0 ? '#AE2448' : '#2C3E6B'
  }

  return (
    <Card
      title="Incidents by Campus Zone"
      extra={
        selectedRow
          ? <Tag color="#AE2448">{selectedRow.fullName}: {selectedRow.count}</Tag>
          : <span style={{ fontSize: 12, color: '#aaa' }}>Click a bar to focus</span>
      }
      style={{ height: '100%' }}
    >
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="zone"
            tick={{ fontSize: 11 }}
            angle={-35}
            textAnchor="end"
            interval={0}
          />
          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
          <Tooltip content={<ZoneTooltip />} cursor={{ fill: 'rgba(174,36,72,0.06)' }} />
          <Bar
            dataKey="count"
            name="Incidents"
            radius={[4, 4, 0, 0]}
            animationDuration={700}
            onClick={handleClick}
            style={{ cursor: 'pointer' }}
          >
            {data.map((entry) => (
              <Cell key={entry.locationID} fill={barColor(entry)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}

export default ZoneBarChart
