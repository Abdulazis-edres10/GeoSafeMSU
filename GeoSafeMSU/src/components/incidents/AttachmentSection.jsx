import { useState, useEffect, useCallback } from 'react'
import { Button, Empty, Image, List, Popconfirm, Spin, Typography, Upload, message } from 'antd'
import {
  DeleteOutlined,
  DownloadOutlined,
  FileOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  PaperClipOutlined,
  UploadOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import {
  getIncidentAttachments,
  uploadIncidentAttachment,
  deleteIncidentAttachment,
} from '../../services/api'

const { Text } = Typography

const MAX_FILE_MB = 20 // must match file_size_limit on the storage bucket

function formatSize(bytes) {
  if (bytes == null) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function fileIcon(name) {
  const ext = name.split('.').pop().toLowerCase()
  if (ext === 'pdf') return <FilePdfOutlined style={{ color: '#E53E3E' }} />
  if (['doc', 'docx'].includes(ext)) return <FileWordOutlined style={{ color: '#3182CE' }} />
  if (['xls', 'xlsx', 'csv'].includes(ext)) return <FileExcelOutlined style={{ color: '#38A169' }} />
  return <FileOutlined />
}

// Files (photos, documents, any type) attached to one side of an incident.
// `role` is 'victim' | 'suspect'; each side has its own folder in storage.
function AttachmentSection({ incidentID, role, accentColor }) {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(0) // files still uploading

  const load = useCallback(() => {
    return getIncidentAttachments(incidentID, role)
      .then(setFiles)
      .catch(err => {
        console.error('Failed to load attachments:', err)
        message.error('Failed to load attachments.')
      })
      .finally(() => setLoading(false))
  }, [incidentID, role])

  useEffect(() => { load() }, [load])

  // Upload ourselves instead of letting antd POST to an `action` URL.
  const handleUpload = async ({ file, onSuccess, onError }) => {
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      message.error(`"${file.name}" is larger than ${MAX_FILE_MB} MB.`)
      onError(new Error('File too large'))
      return
    }
    setUploading(n => n + 1)
    try {
      await uploadIncidentAttachment(incidentID, role, file)
      onSuccess()
      message.success(`"${file.name}" uploaded.`)
      await load()
    } catch (err) {
      console.error('Upload failed:', err)
      message.error(`Failed to upload "${file.name}".`)
      onError(err)
    } finally {
      setUploading(n => n - 1)
    }
  }

  const handleDelete = async (file) => {
    try {
      await deleteIncidentAttachment(file.path)
      setFiles(prev => prev.filter(f => f.path !== file.path))
      message.success(`"${file.name}" removed.`)
    } catch (err) {
      console.error('Delete failed:', err)
      message.error('Failed to remove attachment.')
    }
  }

  return (
    <div style={{ borderTop: '1px dashed #d9d9d9', paddingTop: 12, marginTop: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontWeight: 600, color: accentColor }}>
          <PaperClipOutlined style={{ marginRight: 6 }} />
          Attachments ({files.length})
        </span>
        <Upload multiple showUploadList={false} customRequest={handleUpload}>
          <Button size="small" icon={<UploadOutlined />} loading={uploading > 0}>
            Add Files
          </Button>
        </Upload>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 16 }}><Spin /></div>
      ) : files.length === 0 ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No files attached." />
      ) : (
        <Image.PreviewGroup>
          <List
            size="small"
            dataSource={files}
            renderItem={file => (
              <List.Item
                actions={[
                  <Button
                    key="open"
                    type="text"
                    size="small"
                    icon={<DownloadOutlined />}
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  />,
                  <Popconfirm
                    key="delete"
                    title="Remove this file?"
                    okText="Remove"
                    okButtonProps={{ danger: true }}
                    onConfirm={() => handleDelete(file)}
                  >
                    <Button type="text" danger size="small" icon={<DeleteOutlined />} />
                  </Popconfirm>,
                ]}
              >
                <List.Item.Meta
                  avatar={
                    file.mimeType.startsWith('image/')
                      ? <Image src={file.url} width={40} height={40} style={{ objectFit: 'cover', borderRadius: 4 }} />
                      : <span style={{ fontSize: 28 }}>{fileIcon(file.name)}</span>
                  }
                  title={
                    <a href={file.url} target="_blank" rel="noopener noreferrer" style={{ wordBreak: 'break-all' }}>
                      {file.name}
                    </a>
                  }
                  description={
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {formatSize(file.size)}
                      {file.uploadedAt && ` · ${dayjs(file.uploadedAt).format('MMM D, YYYY h:mm A')}`}
                    </Text>
                  }
                />
              </List.Item>
            )}
          />
        </Image.PreviewGroup>
      )}
    </div>
  )
}

export default AttachmentSection
