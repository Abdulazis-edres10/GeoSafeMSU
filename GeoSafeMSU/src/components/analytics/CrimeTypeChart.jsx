import { Card, Empty } from 'antd'
import {
  PieChart, Pie, Cell, Sector, Tooltip, ResponsiveContainer,
} from 'recharts'
import { CRIME_TYPES } from '../../data/mockData'

const COLORS = ['#AE2448', '#2C3E6B', '#27AE60', '#F39C12', '#E74C3C', '#aa3bff']
const CHART_HEIGHT = 260

const RADIAN = Math.PI / 180

// Always-visible percentage label centered on each slice's band.
function renderPercentLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }) {
  if (percent < 0.04) return null // skip tiny slices to avoid clutter
  const radius = innerRadius + (outerRadius - innerRadius) / 2
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  return (
    <text
      x={x}
      y={y}
      fill="#fff"
      fontSize={12}
      fontWeight={700}
      textAnchor="middle"
      dominantBaseline="central"
      style={{ pointerEvents: 'none', textShadow: '0 1px 2px rgba(0,0,0,0.35)' }}
    >
      {(percent * 100).toFixed(1)}%
    </text>
  )
}

// Expanded sector + outer ring drawn for the slice currently hovered.
function renderActiveShape(props) {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props
  return (
    <g>
      <Sector
        cx={cx} cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx} cy={cy}
        innerRadius={outerRadius + 11}
        outerRadius={outerRadius + 14}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    </g>
  )
}

function TypeTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const { name, value, pct } = payload[0].payload
  return (
    <div style={{
      background: '#fff', border: '1px solid #e5e4e7', borderRadius: 8,
      padding: '8px 12px', boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
    }}>
      <div style={{ fontWeight: 700, color: '#2C3E6B' }}>{name}</div>
      <div style={{ color: '#AE2448', fontWeight: 600 }}>
        {value} incident{value !== 1 ? 's' : ''} ({pct}%)
      </div>
    </div>
  )
}

function CrimeTypeChart({ incidents = [] }) {
  const rawData = CRIME_TYPES.map((ct, i) => ({
    name: ct.typeName,
    value: incidents.filter(inc => inc.crimeTypeID === ct.crimeTypeID).length,
    color: COLORS[i % COLORS.length],
  })).filter(d => d.value > 0)

  const total = rawData.reduce((sum, d) => sum + d.value, 0)

  // Attach each slice's share of the total (rounded to one decimal).
  // Named `pct` so it doesn't clash with Recharts' own `percent` (a 0–1 fraction).
  const data = rawData.map(d => ({
    ...d,
    pct: total ? Math.round((d.value / total) * 1000) / 10 : 0,
  }))

  return (
    <Card title="Incidents by Crime Type" style={{ height: '100%' }}>
      {data.length === 0 ? (
        <Empty description="No data" />
      ) : (
        <>
          <div style={{ position: 'relative', height: CHART_HEIGHT }}>
            <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={62}
                  outerRadius={98}
                  paddingAngle={2}
                  dataKey="value"
                  activeShape={renderActiveShape}
                  animationDuration={700}
                  label={renderPercentLabel}
                  labelLine={false}
                >
                  {data.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="#fff" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip content={<TypeTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            {/* Center total — sits over the donut hole */}
            <div style={{
              position: 'absolute', inset: 0, display: 'flex',
              flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              pointerEvents: 'none',
            }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: '#2C3E6B', lineHeight: 1 }}>
                {total}
              </div>
              <div style={{ fontSize: 11, color: '#888', letterSpacing: 0.5, marginTop: 2 }}>
                TOTAL
              </div>
            </div>
          </div>

          {/* Custom legend with per-type counts */}
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: '8px 16px',
            justifyContent: 'center', marginTop: 12,
          }}>
            {data.map(d => (
              <span key={d.name} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: d.color }} />
                <span style={{ color: '#555' }}>{d.name}</span>
                <strong style={{ color: '#2C3E6B' }}>{d.value}</strong>
                <span style={{ color: '#AE2448', fontWeight: 600 }}>({d.pct}%)</span>
              </span>
            ))}
          </div>
        </>
      )}
    </Card>
  )
}

export default CrimeTypeChart
