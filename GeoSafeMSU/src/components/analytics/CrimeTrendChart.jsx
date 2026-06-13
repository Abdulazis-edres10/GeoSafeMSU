import { useState } from 'react'
import { Card, Segmented } from 'antd'
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Brush,
} from 'recharts'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function TrendTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const value = payload[0].value
  return (
    <div style={{
      background: '#fff', border: '1px solid #e5e4e7', borderRadius: 8,
      padding: '8px 12px', boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
    }}>
      <div style={{ fontWeight: 700, color: '#2C3E6B', marginBottom: 2 }}>{label}</div>
      <div style={{ color: '#AE2448', fontWeight: 600 }}>
        {value} incident{value !== 1 ? 's' : ''}
      </div>
    </div>
  )
}

function CrimeTrendChart({ incidents = [] }) {
  const [mode, setMode] = useState('Area')

  const data = MONTHS.map((month, i) => ({
    month,
    incidents: incidents.filter(inc => new Date(inc.dateTime).getMonth() === i).length,
  }))

  return (
    <Card
      title="Crime Trend (Monthly)"
      extra={
        <Segmented
          size="small"
          options={['Area', 'Line']}
          value={mode}
          onChange={setMode}
        />
      }
      style={{ marginBottom: 24 }}
    >
      <ResponsiveContainer width="100%" height={320}>
        {mode === 'Area' ? (
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#AE2448" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#AE2448" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip content={<TrendTooltip />} cursor={{ stroke: '#AE2448', strokeDasharray: '4 4' }} />
            <Area
              type="monotone"
              dataKey="incidents"
              stroke="#AE2448"
              strokeWidth={2.5}
              fill="url(#trendFill)"
              dot={{ r: 3, fill: '#AE2448' }}
              activeDot={{ r: 6 }}
              animationDuration={800}
            />
            <Brush dataKey="month" height={26} stroke="#AE2448" travellerWidth={8} />
          </AreaChart>
        ) : (
          <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip content={<TrendTooltip />} cursor={{ stroke: '#AE2448', strokeDasharray: '4 4' }} />
            <Line
              type="monotone"
              dataKey="incidents"
              stroke="#AE2448"
              strokeWidth={2.5}
              dot={{ r: 4, fill: '#AE2448' }}
              activeDot={{ r: 6 }}
              animationDuration={800}
            />
            <Brush dataKey="month" height={26} stroke="#AE2448" travellerWidth={8} />
          </LineChart>
        )}
      </ResponsiveContainer>
    </Card>
  )
}

export default CrimeTrendChart
