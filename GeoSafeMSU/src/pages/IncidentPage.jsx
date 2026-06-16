import { useState, useEffect, useCallback } from 'react'
import { Button, Modal, Typography, Segmented, message } from 'antd'
import { PlusOutlined, FileTextOutlined, InboxOutlined, UnorderedListOutlined } from '@ant-design/icons'
import IncidentTable from '../components/incidents/IncidentTable'
import IncidentForm from '../components/incidents/IncidentForm'
import { getIncidents, archiveIncident, unarchiveIncident } from '../services/api'

const { Title } = Typography

function IncidentPage() {
  const [incidents, setIncidents] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingIncident, setEditingIncident] = useState(null)
  const [view, setView] = useState('active') // 'active' | 'archived'

  const loadIncidents = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getIncidents(view === 'archived' ? { archivedOnly: true } : {})
      setIncidents(data)
    } finally {
      setLoading(false)
    }
  }, [view])

  useEffect(() => { loadIncidents() }, [loadIncidents])

  const handleAdd = () => {
    setEditingIncident(null)
    setModalOpen(true)
  }

  const handleEdit = (incident) => {
    setEditingIncident(incident)
    setModalOpen(true)
  }

  const handleArchive = async (id) => {
    try {
      await archiveIncident(id)
      message.success('Incident archived. View it under "Archived".')
      loadIncidents()
    } catch {
      message.error('Failed to archive incident.')
    }
  }

  const handleRestore = async (id) => {
    try {
      await unarchiveIncident(id)
      message.success('Incident restored to active records.')
      loadIncidents()
    } catch {
      message.error('Failed to restore incident.')
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

      <Segmented
        value={view}
        onChange={setView}
        style={{ marginBottom: 16 }}
        options={[
          { label: 'Active', value: 'active', icon: <UnorderedListOutlined /> },
          { label: 'Archived', value: 'archived', icon: <InboxOutlined /> },
        ]}
      />

      <IncidentTable
        incidents={incidents}
        loading={loading}
        archivedView={view === 'archived'}
        onEdit={handleEdit}
        onArchive={handleArchive}
        onRestore={handleRestore}
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
