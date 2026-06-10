import { Card } from 'antd'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, Cell,
} from 'recharts'
import { ZONES } from '../../data/mockData'

function ZoneBarChart({ incidents = [] }) {
  const data = ZONES.map(z => ({
    zone: z.campusZoneName.replace('College of ', '').replace(' Area', '').replace(' Building', ''),
    fullName: z.campusZoneName,
    count: incidents.filter(i => i.locationID === z.locationID).length,
  }))

  return (
    <Card title="Incidents by Campus Zone" style={{ height: '100%' }}>
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
          <Tooltip
            formatter={(value, _name, props) => [value, props.payload.fullName]}
            contentStyle={{ borderRadius: 8 }}
          />
          <Legend formatter={() => 'Incidents'} />
          <Bar dataKey="count" name="Incidents" radius={[4, 4, 0, 0]}>
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.count === Math.max(...data.map(d => d.count)) ? '#AE2448' : '#2C3E6B'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}

export default ZoneBarChart
