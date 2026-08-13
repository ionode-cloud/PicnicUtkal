import { useState, useEffect } from 'react'
import { 
  LuSearch as Search, 
  LuEye as Eye, 
  LuCalendar as Calendar,
  LuDownload as Download,
  LuFileSpreadsheet as FileSpreadsheet,
  LuFilter as Filter,
  LuPrinter as Printer,
  LuX as X,
  LuIndianRupee as IndianRupee,
  LuCircleCheck as CheckCircle,
  LuClock as Clock,
  LuCircleX as XCircle,
  LuMapPin as MapPin,
  LuUsers as Users,
  LuSparkles as Sparkles,
  LuRefreshCw as RefreshCw,
  LuTrash2 as Trash2
} from 'react-icons/lu'
import toast from 'react-hot-toast'
import { useSocket } from '../../context/SocketContext'

// Normalise a DB booking for this page
const normalise = (b) => ({
  ...b,
  bookingId:     b.bookingId || b._id,
  plotTitle:     b.plotTitle || 'Picnic Spot',
  bookingDate:   b.createdAt ? new Date(b.createdAt).toISOString().split('T')[0] : '',
  visitDate:     b.visitDate ? new Date(b.visitDate).toISOString().split('T')[0] : '',
  persons:       b.persons || 1,
  totalPrice:    b.totalAmount || b.totalPrice || 0,
  paymentMethod: (b.paymentMethod || 'UPI').toUpperCase(),
  paymentStatus: b.paymentStatus === 'paid' ? 'Paid' : b.paymentStatus === 'failed' ? 'Failed' : 'Pending',
  bookingStatus: b.status ? (b.status.charAt(0).toUpperCase() + b.status.slice(1)) : 'Confirmed',
  duration:      '1 Day',
})

export default function BookingHistory() {
  const { socket } = useSocket()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  
  // Date Range Filters
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate]     = useState('')

  const [selectedBill, setSelectedBill] = useState(null)

  const fetchHistory = () => {
    setLoading(true)
    fetch('/api/bookings')
      .then(r => r.json())
      .then(d => { if (d.success && Array.isArray(d.data)) setHistory(d.data.map(normalise)) })
      .catch(() => toast.error('Failed to load booking history'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchHistory() }, [])

  // Socket listener for real-time changes
  useEffect(() => {
    if (!socket) return
    const handleUpdate = () => fetchHistory()
    socket.on('plots_update', handleUpdate)
    return () => socket.off('plots_update', handleUpdate)
  }, [socket])

  const handleDeleteBooking = async (bookingId) => {
    const bk = history.find(b => b.bookingId === bookingId || b._id === bookingId)
    if (window.confirm(`Are you sure you want to permanently delete booking #${bookingId} for ${bk?.name || 'guest'}? This will remove it from all records and free the spot.`)) {
      try {
        const res = await fetch(`/api/bookings/${bookingId}`, { method: 'DELETE' })
        const data = await res.json()
        if (data.success) {
          setHistory(prev => prev.filter(b => b.bookingId !== bookingId && b._id !== bookingId))
          toast.success(`Booking #${bookingId} deleted permanently!`)
        } else {
          toast.error(data.message || 'Failed to delete booking')
        }
      } catch (err) {
        toast.error('Error connecting to server to delete booking')
      }
    }
  }



  // Filter historical records by date range, status, search query
  const filteredRecords = history.filter(bk => {
    const bkDate = bk.bookingDate || bk.visitDate
    const matchesDateRange = (!fromDate || bkDate >= fromDate) && (!toDate || bkDate <= toDate)
    
    const matchesSearch = 
      bk.bookingId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bk.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bk.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bk.plotTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bk.phone.includes(searchQuery)

    const matchesStatus = statusFilter === 'All' || bk.bookingStatus.toLowerCase() === statusFilter.toLowerCase()

    return matchesDateRange && matchesSearch && matchesStatus
  })

  // Calculate stats
  const totalRevenue = filteredRecords.reduce((acc, curr) => acc + (curr.paymentStatus === 'Paid' ? curr.totalPrice : 0), 0)
  const totalGuests = filteredRecords.reduce((acc, curr) => acc + (curr.persons || 0), 0)

  // Excel / CSV Export Handler
  const handleExportExcel = () => {
    if (filteredRecords.length === 0) {
      toast.error('No booking records to export for selected range.')
      return
    }

    // CSV Headers
    const headers = ['Booking ID', 'Customer Name', 'Email', 'Phone', 'Spot/Pandal Title', 'Booking Date', 'Visit Date', 'Duration', 'Persons', 'Payment Method', 'Payment Status', 'Booking Status', 'Total Amount (INR)']
    
    // CSV Rows
    const rows = filteredRecords.map(bk => [
      `"${bk.bookingId}"`,
      `"${bk.name}"`,
      `"${bk.email}"`,
      `"${bk.phone}"`,
      `"${bk.plotTitle}"`,
      `"${bk.bookingDate || ''}"`,
      `"${bk.visitDate}"`,
      `"${bk.duration || '1 Day'}"`,
      bk.persons || 1,
      `"${bk.paymentMethod}"`,
      `"${bk.paymentStatus}"`,
      `"${bk.bookingStatus}"`,
      bk.totalPrice || 0
    ])

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
    
    // Create Blob download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `PicnicUtkal_BookingHistory_${fromDate}_to_${toDate}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.success(`Successfully exported ${filteredRecords.length} booking records to Excel!`, {
      icon: '📊'
    })
  }

  const handlePrintBill = () => {
    window.print()
  }

  return (
    <div className="card glass-card" style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileSpreadsheet size={22} color="var(--gold)" />
            <h2 className="heading-4" style={{ margin: 0, color: 'var(--text-primary)' }}>Booking History & Excel Reports</h2>
          </div>
          <p className="text-muted text-sm" style={{ margin: '4px 0 0' }}>Filter historical booking archives by date range and export complete Excel (.csv) reports.</p>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button className="btn btn-outline btn-sm flex items-center gap-1" onClick={fetchHistory} disabled={loading}>
            <RefreshCw size={14} /> {loading ? 'Loading…' : 'Refresh'}
          </button>
          <button className="btn btn-gold btn-lg flex items-center gap-2" onClick={handleExportExcel}>
            <Download size={18} /> Download Excel Report
          </button>
        </div>
      </div>

      {/* Date Range Selector & Filters Box */}
      <div style={{
        backgroundColor: 'var(--bg-primary)', padding: '16px 20px', borderRadius: '16px',
        border: '1px solid var(--border)', marginBottom: '24px', display: 'flex',
        flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between'
      }}>
        {/* Date Inputs */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={16} color="var(--gold)" />
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>From Date:</span>
            <input 
              type="date" 
              className="input" 
              style={{ width: '150px', padding: '6px 10px', fontSize: '13px' }}
              value={fromDate}
              onChange={e => setFromDate(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>To Date:</span>
            <input 
              type="date" 
              className="input" 
              style={{ width: '150px', padding: '6px 10px', fontSize: '13px' }}
              value={toDate}
              onChange={e => setToDate(e.target.value)}
            />
          </div>

          <button 
            className="btn btn-outline btn-sm"
            onClick={() => { setFromDate('2026-08-01'); setToDate('2026-08-31'); setSearchQuery(''); setStatusFilter('All') }}
          >
            Reset Range
          </button>
        </div>

        {/* Stats metrics */}
        <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>
          <div>Filtered: <strong style={{ color: 'var(--text-primary)' }}>{filteredRecords.length} records</strong></div>
          <div>Total Revenue: <strong style={{ color: 'var(--gold)' }}>₹{totalRevenue.toLocaleString()}</strong></div>
          <div>Total Guests: <strong style={{ color: 'var(--text-primary)' }}>{totalGuests}</strong></div>
        </div>
      </div>

      {/* Search and Status Pills */}
      <div className="admin-table-filters" style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="input-with-icon" style={{ flex: 1, minWidth: '260px', maxWidth: '380px' }}>
          <Search size={16} />
          <input 
            type="text" 
            placeholder="Search by ID, name, email, or spot title..." 
            className="input" 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
          {['All', 'Confirmed', 'Completed', 'Pending', 'Cancelled'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`btn btn-sm ${statusFilter === st ? 'btn-gold' : 'btn-outline'}`}
              style={{ fontSize: '12px', padding: '4px 12px', borderRadius: '20px', whiteSpace: 'nowrap' }}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="admin-table-scroll-wrapper">
        <table className="admin-table-view">
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Customer Name</th>
              <th>Spot / Pandal</th>
              <th>Booking Date</th>
              <th>Visit Date & Duration</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                  ⏳ Loading booking history…
                </td>
              </tr>
            ) : filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>📚</div>
                  {history.length === 0 ? 'No booking history yet. Bookings will appear here in real time.' : 'No records found for the selected filters.'}
                </td>
              </tr>
            ) : (
              filteredRecords.map(bk => (
                <tr key={bk.bookingId}>
                  <td className="bold" style={{ color: 'var(--gold)', fontFamily: 'monospace', fontSize: '13px' }}>
                    #{bk.bookingId}
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>{bk.name}</span>
                      <small style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{bk.phone} • {bk.email}</small>
                    </div>
                  </td>
                  <td style={{ maxWidth: '200px', fontSize: '13px', color: 'var(--text-primary)', fontWeight: 600 }}>
                    {bk.plotTitle}
                  </td>
                  <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {bk.bookingDate || '2026-08-08'}
                  </td>
                  <td style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                    <div>{bk.visitDate}</div>
                    <small style={{ color: 'var(--gold)' }}>⏱ {bk.duration || '1 Day'}</small>
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--gold)' }}>
                    ₹{bk.totalPrice.toLocaleString()}
                  </td>
                  <td>
                    <span className={`badge ${bk.bookingStatus === 'Confirmed' ? 'badge-success' : bk.bookingStatus === 'Completed' ? 'badge-glass' : 'badge-gold'}`} style={{ fontSize: '11px' }}>
                      {bk.bookingStatus}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <button 
                        onClick={() => {
                          const params = new URLSearchParams({
                            bookingId: bk.bookingId || bk._id || 'PK-1001',
                            name: bk.name || '',
                            phone: bk.phone || '',
                            aadhaar: bk.aadhaar || '',
                            spot: bk.plotTitle || bk.spotTitle || 'Picnic Spot',
                            date: bk.visitDate || '',
                            duration: bk.duration || bk.durationDays || 1,
                            guests: bk.guests || 1,
                            total: bk.totalPrice || bk.totalAmount || 0,
                            autoprint: 'true'
                          })
                          window.open(`/bill.html?${params.toString()}`, '_blank')
                        }}
                        className="btn btn-outline btn-sm flex items-center gap-1"
                        title="Print / Save PDF Bill"
                      >
                        <Printer size={13} /> Print Bill
                      </button>
                      <button
                        onClick={() => handleDeleteBooking(bk.bookingId || bk._id)}
                        className="btn btn-outline btn-sm flex items-center gap-1"
                        style={{ color: '#FA5252', borderColor: 'rgba(250,82,82,0.3)', padding: '4px 8px' }}
                        title="Delete booking permanently"
                      >
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Bill & Invoice Modal */}
      {selectedBill && (
        <div className="modal-backdrop" style={{
          position: 'fixed', inset: 0, zIndex: 999,
          backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justify: 'center', padding: '16px'
        }}>
          <div className="card glass-card" style={{ width: '100%', maxWidth: '580px', padding: '28px', border: '1px solid var(--border-gold)', background: 'var(--bg-card)' }}>
            
            {/* Printable Invoice Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px dashed var(--border)', paddingBottom: '16px', marginBottom: '20px' }}>
              <div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--gold)', fontFamily: 'var(--font-heading)' }}>
                  PicnicUtkal Reserve
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Barapita Picnic Zone, Odisha • GSTIN: 21AAACP9012K1Z5</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Official Booking Tax Invoice & Pass</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className="badge badge-gold" style={{ fontSize: '12px' }}>#{selectedBill.bookingId}</span>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Date: {selectedBill.bookingDate || '08 Aug 2026'}</div>
              </div>
            </div>

            {/* Bill Details Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '13px' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', backgroundColor: 'var(--bg-primary)', padding: '14px', borderRadius: '12px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Billed To</span>
                  <strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{selectedBill.name}</strong>
                  <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Mobile: {selectedBill.phone}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Email: {selectedBill.email}</div>
                </div>

                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Reservation Details</span>
                  <strong style={{ fontSize: '13px', color: 'var(--gold)' }}>{selectedBill.plotTitle}</strong>
                  <div style={{ color: 'var(--text-primary)', fontSize: '12px' }}>Visit Date: {selectedBill.visitDate} ({selectedBill.duration || '1 Day'})</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Total Guests: {selectedBill.persons} Visitors</div>
                </div>
              </div>

              {/* Items Breakdown Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '8px 0' }}>Description</th>
                    <th style={{ padding: '8px 0', textAlign: 'center' }}>Rate Unit</th>
                    <th style={{ padding: '8px 0', textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px dashed var(--border)', color: 'var(--text-primary)' }}>
                    <td style={{ padding: '10px 0' }}>
                      <strong>{selectedBill.plotTitle}</strong>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Spot booking reservation for {selectedBill.duration || '1 Day'}</div>
                    </td>
                    <td style={{ padding: '10px 0', textAlign: 'center' }}>Flat / Pandal</td>
                    <td style={{ padding: '10px 0', textAlign: 'right', fontWeight: 700 }}>₹{selectedBill.totalPrice}</td>
                  </tr>
                </tbody>
              </table>

              {/* Bill Totals */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-primary)', padding: '12px 16px', borderRadius: '12px', marginTop: '8px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Payment Method: {selectedBill.paymentMethod}</span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--success)' }}>Payment Status: {selectedBill.paymentStatus}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Grand Total Paid</span>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--gold)' }}>₹{selectedBill.totalPrice.toLocaleString()}</div>
                </div>
              </div>

              {/* Modal Buttons */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button className="btn btn-gold btn-sm flex items-center gap-1" onClick={handlePrintBill}>
                  <Printer size={15} /> Print Bill
                </button>
                <button className="btn btn-outline btn-sm" onClick={() => setSelectedBill(null)}>
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}
