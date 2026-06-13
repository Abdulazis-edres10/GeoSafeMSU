import { Form, Input, Select, DatePicker, Button, Alert, message } from 'antd'
import { useState, useEffect } from 'react'
import dayjs from 'dayjs'
import { useAuth } from '../../hooks/useAuth'
import { createIncident, updateIncident } from '../../services/api'
import { CRIME_TYPES, ZONES } from '../../data/mockData'
import LocationPicker from '../map/LocationPicker'
import { findZoneForPoint, pointInPolygon } from '../../utils/geo'

const STATUS_OPTIONS = [
  { value: 'Pending', label: 'Pending' },
  { value: 'Under Investigation', label: 'Under Investigation' },
  { value: 'Resolved', label: 'Resolved' },
]

// Campus center — sensible default pin for a new incident.
const MSU_CENTER = { lat: 7.99688, lng: 124.26149 }

function IncidentForm({ initialValues = null, onSuccess, onCancel }) {
  const { user } = useAuth()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [recenterKey, setRecenterKey] = useState(0)
  const isEdit = !!initialValues?.incidentID

  // Keep the picker in sync with the form's lat/lng fields.
  const lat = Form.useWatch('lat', form)
  const lng = Form.useWatch('lng', form)
  const center = {
    lat: Number.isFinite(lat) ? lat : MSU_CENTER.lat,
    lng: Number.isFinite(lng) ? lng : MSU_CENTER.lng,
  }
  const hasPin = Number.isFinite(lat) && Number.isFinite(lng)
  const detectedZone = hasPin ? findZoneForPoint(lat, lng, ZONES) : null

  // Flag when the manually-selected zone doesn't actually contain the map pin.
  const selectedZoneId = Form.useWatch('locationID', form)
  const selectedZone = ZONES.find(z => z.locationID === selectedZoneId) ?? null
  const zoneMismatch =
    hasPin && selectedZone && !pointInPolygon(lat, lng, selectedZone.boundaryCoordinates)

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        dateTime: initialValues.dateTime ? dayjs(initialValues.dateTime) : dayjs(),
      })
    } else {
      form.resetFields()
      const defaultZone = findZoneForPoint(MSU_CENTER.lat, MSU_CENTER.lng, ZONES)
      form.setFieldsValue({
        dateTime: dayjs(),
        incidentStatus: 'Pending',
        lat: MSU_CENTER.lat,
        lng: MSU_CENTER.lng,
        ...(defaultZone ? { locationID: defaultZone.locationID } : {}),
      })
    }
    setRecenterKey(k => k + 1)
  }, [initialValues, form])

  // Pop a transient toast the moment a mismatch appears (in addition to the
  // persistent inline warning).
  useEffect(() => {
    if (zoneMismatch) {
      message.warning("The map pin and the selected campus zone don't match.")
    }
  }, [zoneMismatch])

  const handlePick = (pickedLat, pickedLng) => {
    const updates = { lat: pickedLat, lng: pickedLng }
    // Auto-select the zone the pin falls inside (still manually overridable).
    const zone = findZoneForPoint(pickedLat, pickedLng, ZONES)
    if (zone) updates.locationID = zone.locationID
    form.setFieldsValue(updates)
  }

  const onFinish = async (values) => {
    setLoading(true)
    try {
      const data = {
        ...values,
        dateTime: values.dateTime.toISOString(),
        reportingOfficer: user.userID,
      }
      if (isEdit) {
        await updateIncident(initialValues.incidentID, data)
        message.success('Incident updated successfully.')
      } else {
        await createIncident(data)
        message.success('Incident recorded successfully.')
      }
      onSuccess?.()
    } catch {
      message.error('Failed to save incident. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      style={{ paddingTop: 8 }}
    >
      <Form.Item
        label="Date & Time"
        name="dateTime"
        rules={[{ required: true, message: 'Please select date and time.' }]}
      >
        <DatePicker showTime style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item
        label="Crime Type"
        name="crimeTypeID"
        rules={[{ required: true, message: 'Please select a crime type.' }]}
      >
        <Select
          placeholder="Select crime type"
          options={CRIME_TYPES.map(c => ({ value: c.crimeTypeID, label: c.typeName }))}
        />
      </Form.Item>

      <Form.Item
        label="Campus Zone"
        name="locationID"
        rules={[{ required: true, message: 'Please select a campus zone.' }]}
        tooltip="Auto-filled from the map pin below — you can still override it."
      >
        <Select
          placeholder="Auto-fills from the map pin, or select manually"
          options={ZONES.map(z => ({ value: z.locationID, label: z.campusZoneName }))}
        />
      </Form.Item>

      <Form.Item
        label="Incident Status"
        name="incidentStatus"
        rules={[{ required: true }]}
      >
        <Select options={STATUS_OPTIONS} />
      </Form.Item>

      {/* Map pinpoint — click to set the incident location */}
      <Form.Item
        label="Incident Location"
        required
        style={{ marginBottom: 8 }}
        tooltip="Click on the map to mark where the incident happened."
      >
        <LocationPicker
          center={center}
          recenterKey={recenterKey}
          onPick={handlePick}
          height={240}
        />
        <div style={{ fontSize: 12, color: '#888', marginTop: 6 }}>
          {hasPin ? (
            <>
              📍 Pinned at <strong>{center.lat.toFixed(6)}, {center.lng.toFixed(6)}</strong>
              {detectedZone
                ? <> · Zone auto-detected: <strong style={{ color: '#AE2448' }}>{detectedZone.campusZoneName}</strong></>
                : <> · <span style={{ color: '#d48806' }}>outside mapped zones — select a zone manually</span></>}
            </>
          ) : 'Click on the map to mark the incident location.'}
        </div>
      </Form.Item>

      {zoneMismatch && (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 12 }}
          message="Location and zone don't match"
          description={
            detectedZone
              ? <>The map pin is located inside <strong>{detectedZone.campusZoneName}</strong>, but you selected <strong>{selectedZone.campusZoneName}</strong>. Please confirm the correct zone or move the pin.</>
              : <>The map pin is outside the selected zone (<strong>{selectedZone.campusZoneName}</strong>). Please confirm the location or zone.</>
          }
        />
      )}

      {/* lat/lng are set via the map; kept as hidden fields for validation + submit */}
      <Form.Item
        name="lat"
        rules={[{ required: true, message: 'Please mark the location on the map.' }]}
        noStyle
      >
        <Input type="hidden" />
      </Form.Item>
      <Form.Item
        name="lng"
        rules={[{ required: true, message: 'Please mark the location on the map.' }]}
        noStyle
      >
        <Input type="hidden" />
      </Form.Item>

      <Form.Item
        label="Description"
        name="description"
        rules={[{ required: true, message: 'Please provide a description.' }]}
      >
        <Input.TextArea rows={4} placeholder="Describe the incident in detail…" />
      </Form.Item>

      <Form.Item label="Reporting Officer" name="reportingOfficer">
        <Input disabled defaultValue={user?.name} placeholder={user?.name} />
      </Form.Item>

      <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
        <Button onClick={onCancel} style={{ marginRight: 8 }}>Cancel</Button>
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          style={{ background: '#AE2448', border: 'none' }}
        >
          {isEdit ? 'Update Incident' : 'Record Incident'}
        </Button>
      </Form.Item>
    </Form>
  )
}

export default IncidentForm
