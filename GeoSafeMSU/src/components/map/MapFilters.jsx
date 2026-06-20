import { Card, Select, DatePicker, Space, Button } from 'antd'
import { FilterOutlined, ClearOutlined } from '@ant-design/icons'

function MapFilters({ filters, onChange, crimeTypes = [], zones = [] }) {
  const crimeTypeOptions = crimeTypes.map(c => ({ value: c.crimeTypeID, label: c.typeName }))
  const zoneOptions = zones.map(z => ({ value: z.locationID, label: z.campusZoneName }))

  const handleClear = () => {
    onChange({ crimeTypeID: null, locationID: null, dateRange: null })
  }

  return (
    <Card
      size="small"
      title={
        <span>
          <FilterOutlined style={{ marginRight: 6, color: '#AE2448' }} />
          Filter Incidents
        </span>
      }
      style={{ marginBottom: 16 }}
    >
      <Space wrap>
        <DatePicker.RangePicker
          placeholder={['From Date', 'To Date']}
          onChange={dates =>
            onChange({
              ...filters,
              dateRange: dates ? [dates[0].toISOString(), dates[1].toISOString()] : null,
            })
          }
        />
        <Select
          allowClear
          placeholder="All Crime Types"
          options={crimeTypeOptions}
          style={{ minWidth: 160 }}
          value={filters.crimeTypeID ?? undefined}
          onChange={val => onChange({ ...filters, crimeTypeID: val ?? null })}
        />
        <Select
          allowClear
          placeholder="All Campus Zones"
          options={zoneOptions}
          style={{ minWidth: 200 }}
          value={filters.locationID ?? undefined}
          onChange={val => onChange({ ...filters, locationID: val ?? null })}
        />
        <Button icon={<ClearOutlined />} onClick={handleClear}>
          Clear
        </Button>
      </Space>
    </Card>
  )
}

export default MapFilters
