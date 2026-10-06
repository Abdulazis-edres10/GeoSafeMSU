import { Form, Input, InputNumber, Select, DatePicker, Button, Card, Row, Col } from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'

const GENDER_OPTIONS = ['Male', 'Female', 'Other'].map(v => ({ value: v, label: v }))

const CIVIL_STATUS_OPTIONS = ['Single', 'Married', 'Widowed', 'Separated', 'Annulled']
  .map(v => ({ value: v, label: v }))

function ageFromBirthdate(birthdate) {
  return dayjs().diff(birthdate, 'year')
}

// One half of the "Persons Involved" section: a growable list of victims OR
// suspects. `listName` is the form field the list is stored under
// ('victims' | 'suspects').
function PersonListSection({ form, listName, title, accentColor }) {
  return (
    <div>
      <div style={{ fontWeight: 600, color: accentColor, marginBottom: 8 }}>{title}</div>

      <Form.List name={listName}>
        {(fields, { add, remove }) => (
          <>
            {fields.length === 0 && (
              <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>
                None added.
              </div>
            )}

            {fields.map(({ key, name }, index) => (
              <Card
                key={key}
                size="small"
                style={{ marginBottom: 12, borderLeft: `3px solid ${accentColor}` }}
                title={`${title.replace(/s$/, '')} #${index + 1}`}
                extra={
                  <Button
                    type="text"
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => remove(name)}
                  />
                }
              >
                <Form.Item
                  label="Full Name"
                  name={[name, 'fullName']}
                  rules={[{ required: true, whitespace: true, message: 'Please enter the name.' }]}
                >
                  <Input placeholder={listName === 'suspects' ? 'Name or alias, or "Unknown"' : 'Full name'} />
                </Form.Item>

                <Row gutter={8}>
                  <Col span={14}>
                    <Form.Item label="Birthdate" name={[name, 'birthdate']}>
                      <DatePicker
                        style={{ width: '100%' }}
                        disabledDate={d => d && d.isAfter(dayjs(), 'day')}
                        onChange={d => {
                          if (d) form.setFieldValue([listName, name, 'age'], ageFromBirthdate(d))
                        }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={10}>
                    <Form.Item
                      label="Age"
                      name={[name, 'age']}
                      tooltip="Auto-filled from the birthdate. Enter an estimate if the birthdate is unknown."
                    >
                      <InputNumber min={0} max={150} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={8}>
                  <Col span={12}>
                    <Form.Item label="Gender" name={[name, 'gender']}>
                      <Select placeholder="Select" options={GENDER_OPTIONS} allowClear />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Civil Status" name={[name, 'civilStatus']}>
                      <Select placeholder="Select" options={CIVIL_STATUS_OPTIONS} allowClear />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item label="Address" name={[name, 'address']} style={{ marginBottom: 0 }}>
                  <Input.TextArea rows={2} placeholder="Home address" />
                </Form.Item>
              </Card>
            ))}

            <Button type="dashed" block icon={<PlusOutlined />} onClick={() => add()}>
              Add {title.replace(/s$/, '')}
            </Button>
          </>
        )}
      </Form.List>
    </div>
  )
}

export default PersonListSection
