import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Row, Col, Card, Tag, Typography, Alert, Button, Modal, Form, Input, InputNumber, Popconfirm, message,
} from 'antd'
import {
  ApartmentOutlined, SafetyOutlined, ToolOutlined, ExperimentOutlined,
  BankOutlined, HomeOutlined, TrophyOutlined, AlertOutlined, PlusOutlined,
  AimOutlined, DeleteOutlined,
} from '@ant-design/icons'
import MapView from '../components/map/MapView'
import LocationPicker from '../components/map/LocationPicker'
import { getIncidents, getZones, createZone, deleteZone } from '../services/api'

const { Title, Paragraph, Text } = Typography

const MSU_CENTER = { lat: 7.99688, lng: 124.26149 }

// Icon + accent colour per zone (cycles for any newly added zone).
const META_PALETTE = [
  { icon: <SafetyOutlined />, color: '#AE2448' },
  { icon: <ToolOutlined />, color: '#2C3E6B' },
  { icon: <ExperimentOutlined />, color: '#27AE60' },
  { icon: <BankOutlined />, color: '#F39C12' },
  { icon: <HomeOutlined />, color: '#E74C3C' },
  { icon: <TrophyOutlined />, color: '#aa3bff' },
]
const metaFor = (index) => META_PALETTE[index % META_PALETTE.length]

// Build a square polygon (4 corners) around a center point, given a half-extent
// in metres. ~111,320 m per degree of latitude; longitude scales by cos(lat).
function squareAround(lat, lng, meters) {
  const dLat = meters / 111320
  const dLng = meters / (111320 * Math.cos((lat * Math.PI) / 180))
  return [
    [lat + dLat, lng - dLng],
    [lat + dLat, lng + dLng],
    [lat - dLat, lng + dLng],
    [lat - dLat, lng - dLng],
  ]
}

function CampusZonesPage() {
  const [zones, setZones] = useState([])
  const [incidents, setIncidents] = useState([])
  const [selectedZoneId, setSelectedZoneId] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form] = Form.useForm()
  const mapCardRef = useRef(null)

  // Add-zone map picker state.
  const [pickCenter, setPickCenter] = useState(MSU_CENTER)
  const [pickSize, setPickSize] = useState(60)
  const [recenterKey, setRecenterKey] = useState(0)

  const previewBounds =
    Number.isFinite(pickCenter.lat) && Number.isFinite(pickCenter.lng) && pickSize
      ? squareAround(pickCenter.lat, pickCenter.lng, pickSize)
      : null

  const loadZones = useCallback(async () => {
    const data = await getZones()
    setZones(data)
  }, [])

  useEffect(() => {
    loadZones()
    getIncidents().then(setIncidents)
  }, [loadZones])

  const countFor = (id) => incidents.filter(i => i.locationID === id).length
  const selectedZone = zones.find(z => z.locationID === selectedZoneId) ?? null

  // Focus the selected zone, or fit all zones when nothing is selected.
  const allBounds = zones.flatMap(z => z.boundaryCoordinates)
  const focusBounds = selectedZone ? selectedZone.boundaryCoordinates : allBounds
  const focusKey = selectedZoneId ?? `all-${zones.length}`

  const handleSelect = (id) => {
    setSelectedZoneId(prev => (prev === id ? null : id))
    mapCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleAdd = () => {
    form.resetFields()
    setPickCenter(MSU_CENTER)
    setPickSize(60)
    setRecenterKey(k => k + 1)
    setModalOpen(true)
  }

  const handleDelete = async (id) => {
    try {
      const { archivedCount } = await deleteZone(id)
      message.success(archivedCount > 0
        ? `Zone removed. ${archivedCount} incident${archivedCount !== 1 ? 's' : ''} moved to the archive.`
        : 'Zone removed.')
      if (selectedZoneId === id) setSelectedZoneId(null)
      await loadZones()
      getIncidents().then(setIncidents)
    } catch {
      message.error('Failed to remove zone.')
    }
  }

  const handleSubmit = async (values) => {
    setSaving(true)
    try {
      const boundaryCoordinates = squareAround(pickCenter.lat, pickCenter.lng, pickSize)
      const created = await createZone({
        campusZoneName: values.campusZoneName,
        description: values.description,
        boundaryCoordinates,
      })
      message.success(`Zone "${created.campusZoneName}" added.`)
      setModalOpen(false)
      await loadZones()
      setSelectedZoneId(created.locationID) // focus the new zone on the map
      mapCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } catch {
      message.error('Failed to add zone.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <Title level={3} style={{ margin: 0, color: '#AE2448' }}>
          <ApartmentOutlined style={{ marginRight: 8 }} />
          Campus Zones — MSU Main Campus
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          style={{ background: '#AE2448', border: 'none' }}
          onClick={handleAdd}
        >
          Add Zone
        </Button>
      </div>

      <Paragraph type="secondary" style={{ maxWidth: 760, marginTop: 8 }}>
        The campus is divided into <strong>{zones.length} monitored zones</strong>. Every recorded
        incident is tagged to one of these zones, which powers the crime map overlays, filtering,
        and the hotspot analytics. Click a zone below to focus it on the map.
      </Paragraph>

      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 20 }}
        message="How zones are used"
        description="Zone boundaries are drawn on the Crime Map as shaded areas. When an officer records an incident, it is assigned to a zone — letting the system identify hotspots and trends per area."
      />

      {/* Map overview — all zones + incident markers */}
      <div ref={mapCardRef}>
      <Card
        size="small"
        style={{ marginBottom: 24 }}
        title={
          <span>
            Zone Map Overview
            {selectedZone && (
              <Tag color="#AE2448" style={{ marginLeft: 10 }}>{selectedZone.campusZoneName}</Tag>
            )}
          </span>
        }
        extra={
          selectedZone
            ? <Button size="small" icon={<AimOutlined />} onClick={() => setSelectedZoneId(null)}>Show all zones</Button>
            : <Text type="secondary" style={{ fontSize: 12 }}>Click a zone or card to focus</Text>
        }
      >
        <MapView
          incidents={incidents}
          className="map-container-mini"
          highlightZoneId={selectedZoneId}
          focusBounds={focusBounds}
          focusKey={focusKey}
          onZoneClick={handleSelect}
        />
      </Card>
      </div>

      {/* Per-zone explanatory cards */}
      <Row gutter={[16, 16]}>
        {zones.map((zone, i) => {
          const meta = metaFor(i)
          const count = countFor(zone.locationID)
          const active = zone.locationID === selectedZoneId
          return (
            <Col xs={24} sm={12} lg={8} key={zone.locationID}>
              <Card
                hoverable
                onClick={() => handleSelect(zone.locationID)}
                style={{
                  height: '100%',
                  borderTop: `3px solid ${meta.color}`,
                  cursor: 'pointer',
                  outline: active ? `2px solid ${meta.color}` : 'none',
                  boxShadow: active ? `0 4px 16px ${meta.color}40` : undefined,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <span style={{
                    fontSize: 22, color: meta.color,
                    background: `${meta.color}15`,
                    width: 44, height: 44, borderRadius: 10,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {meta.icon}
                  </span>
                  <Tag style={{ marginInlineEnd: 0 }}>{zone.locationID}</Tag>
                </div>

                <Title level={5} style={{ marginBottom: 6 }}>{zone.campusZoneName}</Title>
                <Paragraph type="secondary" style={{ fontSize: 13, marginBottom: 12, minHeight: 60 }}>
                  {zone.description}
                </Paragraph>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                    <AlertOutlined style={{ color: meta.color }} />
                    <Text strong style={{ color: meta.color }}>{count}</Text>
                    <Text type="secondary">recorded incident{count !== 1 ? 's' : ''}</Text>
                  </div>
                  <Popconfirm
                    title="Remove this zone?"
                    description={count > 0
                      ? `Its ${count} incident${count !== 1 ? 's' : ''} will be moved to the archive.`
                      : 'This action cannot be undone.'}
                    onConfirm={() => handleDelete(zone.locationID)}
                    okText="Remove"
                    okButtonProps={{ danger: true }}
                  >
                    <Button
                      type="text"
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      title="Remove zone"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </Popconfirm>
                </div>
              </Card>
            </Col>
          )
        })}
      </Row>

      {/* Add Zone modal */}
      <Modal
        title="Add New Campus Zone"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ paddingTop: 8 }}>
          <Form.Item
            label="Zone Name"
            name="campusZoneName"
            rules={[
              { required: true, message: 'Please enter a zone name.' },
              { min: 3, message: 'Minimum 3 characters.' },
              {
                validator: (_, value) =>
                  value && zones.some(z => z.campusZoneName.toLowerCase() === value.trim().toLowerCase())
                    ? Promise.reject(new Error('A zone with this name already exists.'))
                    : Promise.resolve(),
              },
            ]}
          >
            <Input placeholder="e.g. Library Building" />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: 'Please provide a short description.' }]}
          >
            <Input.TextArea rows={3} placeholder="What is located in this zone…" />
          </Form.Item>

          <div style={{ marginBottom: 6, fontWeight: 500 }}>
            Pinpoint location <span style={{ color: '#ff4d4f' }}>*</span>
          </div>
          <Alert
            type="info"
            showIcon
            style={{ marginBottom: 12 }}
            message="Click on the map to drop the zone's center pin — no need to know the coordinates. The shaded square previews the zone area; adjust the size below."
          />

          <LocationPicker
            center={pickCenter}
            previewBounds={previewBounds}
            recenterKey={recenterKey}
            onPick={(lat, lng) => setPickCenter({ lat, lng })}
            height={240}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginTop: 12, marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 12, color: '#888', marginBottom: 2 }}>Latitude</div>
              <InputNumber
                value={pickCenter.lat}
                precision={6}
                step={0.0001}
                style={{ width: '100%' }}
                onChange={(v) => { if (v != null) { setPickCenter(c => ({ ...c, lat: v })); setRecenterKey(k => k + 1) } }}
              />
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#888', marginBottom: 2 }}>Longitude</div>
              <InputNumber
                value={pickCenter.lng}
                precision={6}
                step={0.0001}
                style={{ width: '100%' }}
                onChange={(v) => { if (v != null) { setPickCenter(c => ({ ...c, lng: v })); setRecenterKey(k => k + 1) } }}
              />
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#888', marginBottom: 2 }}>Size (m)</div>
              <InputNumber
                value={pickSize}
                min={20}
                max={500}
                step={10}
                style={{ width: '100%' }}
                onChange={(v) => setPickSize(v ?? 60)}
              />
            </div>
          </div>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Button onClick={() => setModalOpen(false)} style={{ marginRight: 8 }}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={saving}
              style={{ background: '#AE2448', border: 'none' }}
            >
              Add Zone
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default CampusZonesPage
