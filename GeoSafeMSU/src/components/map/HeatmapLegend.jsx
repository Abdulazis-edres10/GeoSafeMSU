// Floating legend that explains the heatmap gradient + status weighting.
// Rendered as an absolutely-positioned overlay on top of the Leaflet map.
function HeatmapLegend() {
  return (
    <div style={{
      position: 'absolute',
      bottom: 18,
      right: 18,
      zIndex: 500,
      background: 'rgba(255,255,255,0.95)',
      backdropFilter: 'blur(4px)',
      border: '1px solid #e5e4e7',
      borderRadius: 10,
      padding: '10px 12px',
      boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
      width: 168,
      fontSize: 11,
    }}>
      <div style={{ fontWeight: 700, color: '#2C3E6B', marginBottom: 6 }}>
        Incident Density
      </div>
      <div style={{
        height: 10,
        borderRadius: 5,
        background: 'linear-gradient(90deg, #2C3E6B, #AE2448, #f39c12, #e74c3c)',
      }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888', marginTop: 3 }}>
        <span>Low</span>
        <span>High</span>
      </div>
      <div style={{ borderTop: '1px solid #eee', margin: '8px 0 6px' }} />
      <div style={{ color: '#666', lineHeight: 1.5 }}>
        Active incidents (Pending / Under Investigation) are weighted higher than resolved ones.
      </div>
    </div>
  )
}

export default HeatmapLegend
