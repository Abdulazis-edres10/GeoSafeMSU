import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export function generateReport(incidents, crimeTypes, zones) {
  const doc = new jsPDF()

  doc.setFillColor(174, 36, 72)
  doc.rect(0, 0, 210, 30, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('GeoSafe MSU — Incident Report', 14, 14)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Department of Security and Services | MSU Main Campus, Marawi City', 14, 22)

  doc.setTextColor(80, 80, 80)
  doc.setFontSize(10)
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 38)
  doc.text(`Total Records: ${incidents.length}`, 14, 44)

  const tableData = incidents.map(i => [
    i.incidentID,
    new Date(i.dateTime).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' }),
    crimeTypes.find(c => c.crimeTypeID === i.crimeTypeID)?.typeName ?? '—',
    zones.find(z => z.locationID === i.locationID)?.campusZoneName ?? '—',
    i.incidentStatus,
    i.description.length > 70 ? i.description.substring(0, 70) + '…' : i.description,
  ])

  autoTable(doc, {
    head: [['Incident ID', 'Date', 'Crime Type', 'Zone', 'Status', 'Description']],
    body: tableData,
    startY: 52,
    headStyles: { fillColor: [174, 36, 72], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [250, 245, 247] },
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 22 },
      2: { cellWidth: 28 },
      3: { cellWidth: 32 },
      4: { cellWidth: 28 },
      5: { cellWidth: 'auto' },
    },
    styles: { fontSize: 8, cellPadding: 3 },
    margin: { left: 14, right: 14 },
  })

  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150)
    doc.text(`Page ${i} of ${pageCount}`, 196, 290, { align: 'right' })
  }

  doc.save(`GeoSafe_MSU_Report_${new Date().toISOString().slice(0, 10)}.pdf`)
}
