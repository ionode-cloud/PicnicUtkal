import { useState } from 'react'
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
  LuSparkles as Sparkles
} from 'react-icons/lu'
import toast from 'react-hot-toast'

const HISTORICAL_BOOKINGS = [
  {
    bookingId: 'BK-928341',
    plotTitle: 'Pandal — Upper Block (Riverside View)',
    name: 'Sunil Mohanty',
    email: 'sunil.mohanty@gmail.com',
    phone: '9876543210',
    bookingDate: '2026-08-08',
    visitDate: '2026-08-15',
    duration: '1 Day',
    persons: 8,
    totalPrice: 499,
    paymentMethod: 'UPI (PhonePe)',
    paymentStatus: 'Paid',
    bookingStatus: 'Confirmed'
  },
  {
    bookingId: 'BK-928342',
    plotTitle: 'Pandal — Road Block',
    name: 'Anjali Das',
    email: 'anjali.das@gmail.com',
    phone: '9123456789',
    bookingDate: '2026-08-08',
    visitDate: '2026-08-16',
    duration: '2 Days',
    persons: 5,
    totalPrice: 449,
    paymentMethod: 'Credit Card',
    paymentStatus: 'Paid',
    bookingStatus: 'Confirmed'
  },
  {
    bookingId: 'BK-928343',
    plotTitle: 'Barapita Deluxe Cottage & AC Suite Rooms',
    name: 'Rajesh Tripathy',
    email: 'rajesh.t@yahoo.com',
    phone: '9437123456',
    bookingDate: '2026-08-09',
    visitDate: '2026-08-20',
    duration: '3 Days',
    persons: 4,
    totalPrice: 999,
    paymentMethod: 'Net Banking',
    paymentStatus: 'Pending',
    bookingStatus: 'Pending'
  },
  {
    bookingId: 'BK-928344',
    plotTitle: 'Pandal — Middle Lawn',
    name: 'Smruti Ranjan',
    email: 'smruti.r@gmail.com',
    phone: '9937001122',
    bookingDate: '2026-08-05',
    visitDate: '2026-08-05',
    duration: '1 Day',
    persons: 12,
    totalPrice: 499,
    paymentMethod: 'UPI (GPay)',
    paymentStatus: 'Paid',
    bookingStatus: 'Completed'
  },
  {
    bookingId: 'BK-928345',
    plotTitle: 'Pandal — Garden Edge',
    name: 'Debashish Panda',
    email: 'deba.panda@outlook.com',
    phone: '9861098765',
    bookingDate: '2026-08-06',
    visitDate: '2026-08-10',
    duration: '1 Day',
    persons: 6,
    totalPrice: 449,
    paymentMethod: 'UPI',
    paymentStatus: 'Refunded',
    bookingStatus: 'Cancelled'
  },
  {
    bookingId: 'BK-928340',
    plotTitle: 'Pandal — Riverside Grove',
    name: 'Manoj Kumar Patnaik',
    email: 'manoj.patnaik@gmail.com',
    phone: '9777123456',
    bookingDate: '2026-08-01',
    visitDate: '2026-08-02',
    duration: '1 Day',
    persons: 15,
    totalPrice: 499,
    paymentMethod: 'UPI',
    paymentStatus: 'Paid',
    bookingStatus: 'Completed'
  },
  {
    bookingId: 'BK-928339',
    plotTitle: 'Pandal — Hill View',
    name: 'Biswajit Behera',
    email: 'biswajit.b@gmail.com',
    phone: '9439009988',
    bookingDate: '2026-08-02',
    visitDate: '2026-08-04',
    duration: '2 Days',
    persons: 10,
    totalPrice: 449,
    paymentMethod: 'Card',
    paymentStatus: 'Paid',
    bookingStatus: 'Completed'
  }
]

export default function BookingHistory() {
  const [history, setHistory] = useState(HISTORICAL_BOOKINGS)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  
  // Date Range Filters (default to current month)
  const [fromDate, setFromDate] = useState('2026-08-01')
  const [toDate, setToDate]     = useState('2026-08-31')

  const [selectedBill, setSelectedBill] = useState(null)

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

        <button className="btn btn-gold btn-lg flex items-center gap-2" onClick={handleExportExcel}>
          <Download size={18} /> Download Excel Report
        </button>
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
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                  No historical booking records found in the selected date range ({fromDate} to {toDate}).
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
                    <a 
                      href={`/admin/bookings/invoice/${bk.bookingId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline btn-sm flex items-center gap-1"
                      title="Open Official Bill in New Page"
                    >
                      <Eye size={13} /> View Bill
                    </a>
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
                  <Printer size={15} /> Print / Save PDF Bill
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
