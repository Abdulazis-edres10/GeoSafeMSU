import { useState, useEffect } from 'react'
import { Row, Col, Button, Typography, Spin, message } from 'antd'
import { BarChartOutlined, FilePdfOutlined } from '@ant-design/icons'
import StatsSummary from '../components/analytics/StatsSummary'
import CrimeTrendChart from '../components/analytics/CrimeTrendChart'
import CrimeTypeChart from '../components/analytics/CrimeTypeChart'
import ZoneBarChart from '../components/analytics/ZoneBarChart'
import { getIncidents } from '../services/api'
import { generateReport } from '../services/reportService'
import { CRIME_TYPES, ZONES } from '../data/mockData'

const { Title } = Typography

function Analytics() {
  const [incidents, setIncidents] = useState([])
  const [loading, setLoading] = useState(true)
  const [reportLoading, setReportLoading] = useState(false)

  useEffect(() => {
    getIncidents().then(data => {
      setIncidents(data)
      setLoading(false)
    })
  }, [])

  const handleGenerateReport = async () => {
    setReportLoading(true)
    try {
      generateReport(incidents, CRIME_TYPES, ZONES)
      message.success('Report generated and downloaded.')
    } catch {
      message.error('Failed to generate report.')
    } finally {
      setReportLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Title level={3} style={{ margin: 0, color: '#AE2448' }}>
          <BarChartOutlined style={{ marginRight: 8 }} />
          Analytics Dashboard
        </Title>
        <Button
          type="primary"
          icon={<FilePdfOutlined />}
          onClick={handleGenerateReport}
          loading={reportLoading}
          style={{ background: '#2C3E6B', border: 'none' }}
        >
          Generate Report (PDF)
        </Button>
      </div>

      <StatsSummary incidents={incidents} />
      <CrimeTrendChart incidents={incidents} />

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <CrimeTypeChart incidents={incidents} />
        </Col>
        <Col xs={24} lg={12}>
          <ZoneBarChart incidents={incidents} />
        </Col>
      </Row>
    </div>
  )
}

export default Analytics
