import { Card, Empty } from 'antd'
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { CRIME_TYPES } from '../../data/mockData'

const COLORS = ['#AE2448', '#2C3E6B', '#27AE60', '#F39C12', '#E74C3C', '#aa3bff']

function CrimeTypeChart({ incidents = [] }) {
  const data = CRIME_TYPES.map((ct, i) => ({
    name: ct.typeName,
    value: incidents.filter(inc => inc.crimeTypeID === ct.crimeTypeID).length,
    color: COLORS[i % COLORS.length],
  })).filter(d => d.value > 0)

  return (
    <Card title="Incidents by Crime Type" style={{ height: '100%' }}>
      {data.length === 0 ? (
        <Empty description="No data" />
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={100}
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value, name) => [value, name]} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </Card>
  )
}

export default CrimeTypeChart
