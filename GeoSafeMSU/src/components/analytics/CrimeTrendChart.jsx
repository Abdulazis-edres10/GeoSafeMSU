import { Card } from 'antd'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function CrimeTrendChart({ incidents = [] }) {
  const data = MONTHS.map((month, i) => ({
    month,
    incidents: incidents.filter(inc => new Date(inc.dateTime).getMonth() === i).length,
  }))

  return (
    <Card title="Crime Trend (Monthly)" style={{ marginBottom: 24 }}>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{ border: '1px solid #e5e4e7', borderRadius: 8 }}
            formatter={(value) => [value, 'Incidents']}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="incidents"
            stroke="#AE2448"
            strokeWidth={2.5}
            dot={{ r: 4, fill: '#AE2448' }}
            activeDot={{ r: 6 }}
            name="Incidents"
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  )
}

export default CrimeTrendChart
