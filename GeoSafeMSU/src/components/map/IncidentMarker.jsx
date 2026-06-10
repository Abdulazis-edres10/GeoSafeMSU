import { Marker, Popup } from 'react-leaflet'
import { Tag, Divider } from 'antd'
import { CRIME_TYPES, ZONES } from '../../data/mockData'

const STATUS_COLORS = {
  'Resolved': 'success',
  'Under Investigation': 'warning',
  'Pending': 'error',
}

function IncidentMarker({ incident, onClick }) {
  const crimeType = CRIME_TYPES.find(c => c.crimeTypeID === incident.crimeTypeID)
  const zone = ZONES.find(z => z.locationID === incident.locationID)

  return (
    <Marker
      position={[incident.lat, incident.lng]}
      eventHandlers={{ click: () => onClick?.(incident) }}
    >
      <Popup minWidth={220}>
        <div style={{ fontSize: 13 }}>
          <div style={{ fontWeight: 700, color: '#AE2448', marginBottom: 4 }}>
            {incident.incidentID}
          </div>
          <div style={{ color: '#666', fontSize: 12, marginBottom: 8 }}>
            {new Date(incident.dateTime).toLocaleString('en-PH', {
              year: 'numeric', month: 'short', day: 'numeric',
              hour: '2-digit', minute: '2-digit',
            })}
          </div>
          <Divider style={{ margin: '6px 0' }} />
          <div style={{ marginBottom: 4 }}>
            <span style={{ color: '#888', fontSize: 11 }}>CRIME TYPE</span><br />
            <strong>{crimeType?.typeName ?? 'Unknown'}</strong>
          </div>
          <div style={{ marginBottom: 4 }}>
            <span style={{ color: '#888', fontSize: 11 }}>ZONE</span><br />
            <strong>{zone?.campusZoneName ?? 'Unknown'}</strong>
          </div>
          <div style={{ marginBottom: 8 }}>
            <span style={{ color: '#888', fontSize: 11 }}>STATUS</span><br />
            <Tag color={STATUS_COLORS[incident.incidentStatus]} style={{ marginTop: 2 }}>
              {incident.incidentStatus}
            </Tag>
          </div>
          <Divider style={{ margin: '6px 0' }} />
          <div style={{ fontSize: 12, color: '#555', lineHeight: 1.5 }}>
            {incident.description}
          </div>
        </div>
      </Popup>
    </Marker>
  )
}

export default IncidentMarker
