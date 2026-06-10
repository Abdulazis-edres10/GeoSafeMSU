import { Form, Input, Select, DatePicker, Button, InputNumber, message } from 'antd'
import { useState, useEffect } from 'react'
import dayjs from 'dayjs'
import { useAuth } from '../../hooks/useAuth'
import { createIncident, updateIncident } from '../../services/api'
import { CRIME_TYPES, ZONES } from '../../data/mockData'

const STATUS_OPTIONS = [
  { value: 'Pending', label: 'Pending' },
  { value: 'Under Investigation', label: 'Under Investigation' },
  { value: 'Resolved', label: 'Resolved' },
]

function IncidentForm({ initialValues = null, onSuccess, onCancel }) {
  const { user } = useAuth()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const isEdit = !!initialValues?.incidentID

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        dateTime: initialValues.dateTime ? dayjs(initialValues.dateTime) : dayjs(),
      })
    } else {
      form.resetFields()
      form.setFieldsValue({ dateTime: dayjs(), incidentStatus: 'Pending' })
    }
  }, [initialValues, form])

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
      >
        <Select
          placeholder="Select campus zone"
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Form.Item
          label="Latitude"
          name="lat"
          rules={[{ required: true, message: 'Required.' }]}
        >
          <InputNumber
            placeholder="7.9986"
            precision={6}
            step={0.0001}
            style={{ width: '100%' }}
          />
        </Form.Item>
        <Form.Item
          label="Longitude"
          name="lng"
          rules={[{ required: true, message: 'Required.' }]}
        >
          <InputNumber
            placeholder="124.2928"
            precision={6}
            step={0.0001}
            style={{ width: '100%' }}
          />
        </Form.Item>
      </div>

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
