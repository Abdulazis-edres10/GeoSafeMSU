import { useState, useEffect, useCallback } from 'react'
import { Button, Modal, Typography, Space, message } from 'antd'
import { PlusOutlined, FileTextOutlined } from '@ant-design/icons'
import IncidentTable from '../components/incidents/IncidentTable'
import IncidentForm from '../components/incidents/IncidentForm'
import { getIncidents, deleteIncident } from '../services/api'

const { Title } = Typography

function IncidentPage() {
  const [incidents, setIncidents] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingIncident, setEditingIncident] = useState(null)

  const loadIncidents = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getIncidents()
      setIncidents(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadIncidents() }, [loadIncidents])

  const handleAdd = () => {
    setEditingIncident(null)
    setModalOpen(true)
  }

  const handleEdit = (incident) => {
    setEditingIncident(incident)
    setModalOpen(true)
  }

  const handleDelete = async (id) => {
    try {
      await deleteIncident(id)
      message.success('Incident deleted.')
      loadIncidents()
    } catch {
      message.error('Failed to delete incident.')
    }
  }

  const handleFormSuccess = () => {
    setModalOpen(false)
    loadIncidents()
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Title level={3} style={{ margin: 0, color: '#AE2448' }}>
          <FileTextOutlined style={{ marginRight: 8 }} />
          Incident Records
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          style={{ background: '#AE2448', border: 'none' }}
          onClick={handleAdd}
        >
          Record New Incident
        </Button>
      </div>

      <IncidentTable
        incidents={incidents}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <Modal
        title={editingIncident ? `Edit Incident — ${editingIncident.incidentID}` : 'Record New Incident'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={620}
        destroyOnClose
      >
        <IncidentForm
          initialValues={editingIncident}
          onSuccess={handleFormSuccess}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </div>
  )
}

export default IncidentPage
