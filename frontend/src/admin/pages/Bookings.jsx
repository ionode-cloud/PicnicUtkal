import { useState, useEffect } from 'react'
import { 
  LuSearch as Search, 
  LuEye as Eye, 
  LuFilter as Filter,
  LuCalendar as Calendar,
  LuUser as User,
  LuPhone as Phone,
  LuMail as Mail,
  LuCircleCheck as CheckCircle,
  LuClock as Clock,
  LuCircleX as XCircle,
  LuPartyPopper as PartyPopper,
  LuX as X,
  LuIndianRupee as IndianRupee,
  LuDownload as Download,
  LuPrinter as Printer,
  LuUsers as Users,
  LuMapPin as MapPin,
  LuTrash2 as Trash2,
  LuRotateCcw as RotateCcw,
  LuRefreshCw as RefreshCw,
  LuFileText as FileText,
  LuChevronLeft as ChevronLeft,
  LuChevronRight as ChevronRight,
  LuCheck as Check,
  LuBuilding2 as Building2,
  LuReceipt as Receipt
} from 'react-icons/lu'
import toast from 'react-hot-toast'
import { useSocket } from '../../context/SocketContext'

const INITIAL_BOOKINGS = [
  {
    bookingId: 'BK-928341',
    plotId: 'pandal-1',
    plotTitle: 'Pandal — Upper Block (Riverside View)',
    name: 'Sunil Mohanty',
    email: 'sunil.mohanty@gmail.com',
    phone: '9876543210',
    bookingDate: '2026-08-08',
    visitDate: '2026-08-15',
    duration: '1 Day',
    durationDays: 1,
    persons: 8,
    totalPrice: 499,
    paymentMethod: 'UPI (PhonePe)',
    paymentStatus: 'Paid',
    bookingStatus: 'Confirmed',
    createdAt: '2026-08-08T10:30:00Z',
    visitors: [{ name: 'Sunil Mohanty', phone: '9876543210' }]
  },
  {
    bookingId: 'BK-928342',
    plotId: 'pandal-5',
    plotTitle: 'Pandal — Road Block',
    name: 'Anjali Das',
    email: 'anjali.das@gmail.com',
    phone: '9123456789',
    bookingDate: '2026-08-08',
    visitDate: '2026-08-16',
    duration: '2 Days',
    durationDays: 2,
    persons: 5,
    totalPrice: 449,
    paymentMethod: 'Credit Card',
    paymentStatus: 'Paid',
    bookingStatus: 'Confirmed',
    createdAt: '2026-08-08T14:20:00Z',
    visitors: [{ name: 'Anjali Das', phone: '9123456789' }]
  },
  {
    bookingId: 'BK-928343',
    plotId: 'cottage-rooms',
    plotTitle: 'Barapita Deluxe Cottage & AC Suite Rooms',
    name: 'Rajesh Tripathy',
    email: 'rajesh.t@yahoo.com',
    phone: '9437123456',
    bookingDate: '2026-08-09',
    visitDate: '2026-08-20',
    duration: '3 Days',
    durationDays: 3,
    persons: 4,
    totalPrice: 999,
    paymentMethod: 'Net Banking',
    paymentStatus: 'Pending',
    bookingStatus: 'Pending',
    createdAt: '2026-08-09T09:15:00Z',
    visitors: [{ name: 'Rajesh Tripathy', phone: '9437123456' }]
  },
  {
    bookingId: 'BK-928344',
    plotId: 'pandal-3',
    plotTitle: 'Pandal — Middle Lawn',
    name: 'Smruti Ranjan',
    email: 'smruti.r@gmail.com',
    phone: '9937001122',
    bookingDate: '2026-08-05',
    visitDate: '2026-08-05',
    duration: '1 Day',
    durationDays: 1,
    persons: 12,
    totalPrice: 499,
    paymentMethod: 'UPI (GPay)',
    paymentStatus: 'Paid',
    bookingStatus: 'Completed',
    createdAt: '2026-08-05T16:00:00Z',
    visitors: [{ name: 'Smruti Ranjan', phone: '9937001122' }]
  },
  {
    bookingId: 'BK-928345',
    plotId: 'pandal-4',
    plotTitle: 'Pandal — Garden Edge',
    name: 'Debashish Panda',
    email: 'deba.panda@outlook.com',
    phone: '9861098765',
    bookingDate: '2026-08-06',
    visitDate: '2026-08-10',
    duration: '1 Day',
    durationDays: 1,
    persons: 6,
    totalPrice: 449,
    paymentMethod: 'UPI',
    paymentStatus: 'Refunded',
    bookingStatus: 'Cancelled',
    createdAt: '2026-08-06T11:45:00Z',
    visitors: [{ name: 'Debashish Panda', phone: '9861098765' }]
  },
  {
    bookingId: 'BK-928346',
    plotId: 'pandal-2',
    plotTitle: 'Pandal — Riverside Grove',
    name: 'Manoj Kumar Patnaik',
    email: 'manoj.patnaik@gmail.com',
    phone: '9777123456',
    bookingDate: '2026-08-07',
    visitDate: '2026-08-18',
    duration: '1 Day',
    durationDays: 1,
    persons: 10,
    totalPrice: 499,
    paymentMethod: 'UPI',
    paymentStatus: 'Paid',
    bookingStatus: 'Confirmed',
    createdAt: '2026-08-07T12:00:00Z',
    visitors: [{ name: 'Manoj Patnaik', phone: '9777123456' }]
  },
  {
    bookingId: 'BK-928347',
    plotId: 'pandal-6',
    plotTitle: 'Pandal — Hillside View',
    name: 'Biswajit Behera',
    email: 'biswajit.b@gmail.com',
    phone: '9439009988',
    bookingDate: '2026-08-06',
    visitDate: '2026-08-19',
    duration: '2 Days',
    durationDays: 2,
    persons: 7,
    totalPrice: 449,
    paymentMethod: 'Card',
    paymentStatus: 'Paid',
    bookingStatus: 'Confirmed',
    createdAt: '2026-08-06T15:30:00Z',
    visitors: [{ name: 'Biswajit Behera', phone: '9439009988' }]
  },
  {
    bookingId: 'BK-928348',
    plotId: 'pandal-1',
    plotTitle: 'Pandal — Upper Block (Riverside View)',
    name: 'Priyabrata Mishra',
    email: 'priyabrata.m@gmail.com',
    phone: '9861234567',
    bookingDate: '2026-08-07',
    visitDate: '2026-08-21',
    duration: '1 Day',
    durationDays: 1,
    persons: 6,
    totalPrice: 499,
    paymentMethod: 'UPI',
    paymentStatus: 'Paid',
    bookingStatus: 'Confirmed',
    createdAt: '2026-08-07T18:00:00Z',
    visitors: [{ name: 'Priyabrata Mishra', phone: '9861234567' }]
  },
  {
    bookingId: 'BK-928349',
    plotId: 'pandal-3',
    plotTitle: 'Pandal — Middle Lawn',
    name: 'Sourav Ganguly',
    email: 'sourav.g@outlook.com',
    phone: '9112233445',
    bookingDate: '2026-08-08',
    visitDate: '2026-08-22',
    duration: '2 Days',
    durationDays: 2,
    persons: 14,
    totalPrice: 499,
    paymentMethod: 'Card',
    paymentStatus: 'Paid',
    bookingStatus: 'Confirmed',
    createdAt: '2026-08-08T11:00:00Z',
    visitors: [{ name: 'Sourav Ganguly', phone: '9112233445' }]
  },
  {
    bookingId: 'BK-928350',
    plotId: 'pandal-5',
    plotTitle: 'Pandal — Road Block',
    name: 'Subhashree Sahoo',
    email: 'subhashree.s@yahoo.com',
    phone: '9988776655',
    bookingDate: '2026-08-09',
    visitDate: '2026-08-23',
    duration: '1 Day',
    durationDays: 1,
    persons: 9,
    totalPrice: 449,
    paymentMethod: 'UPI',
    paymentStatus: 'Paid',
    bookingStatus: 'Confirmed',
    createdAt: '2026-08-09T08:30:00Z',
    visitors: [{ name: 'Subhashree Sahoo', phone: '9988776655' }]
  },
  {
    bookingId: 'BK-928351',
    plotId: 'cottage-rooms',
    plotTitle: 'Barapita Deluxe Cottage & AC Suite Rooms',
    name: 'Deepak Rout',
    email: 'deepak.rout@gmail.com',
    phone: '9337112233',
    bookingDate: '2026-08-09',
    visitDate: '2026-08-24',
    duration: '3 Days',
    durationDays: 3,
    persons: 5,
    totalPrice: 999,
    paymentMethod: 'Net Banking',
    paymentStatus: 'Paid',
    bookingStatus: 'Confirmed',
    createdAt: '2026-08-09T14:15:00Z',
    visitors: [{ name: 'Deepak Rout', phone: '9337112233' }]
  },
  {
    bookingId: 'BK-928352',
    plotId: 'pandal-2',
    plotTitle: 'Pandal — Riverside Grove',
    name: 'Sushant Nayak',
    email: 'sushant.n@gmail.com',
    phone: '9448877665',
    bookingDate: '2026-08-08',
    visitDate: '2026-08-25',
    duration: '1 Day',
    durationDays: 1,
    persons: 11,
    totalPrice: 499,
    paymentMethod: 'UPI',
    paymentStatus: 'Paid',
    bookingStatus: 'Confirmed',
    createdAt: '2026-08-08T16:45:00Z',
    visitors: [{ name: 'Sushant Nayak', phone: '9448877665' }]
  },
  {
    bookingId: 'BK-928353',
    plotId: 'pandal-4',
    plotTitle: 'Pandal — Garden Edge',
    name: 'Ashok Swain',
    email: 'ashok.swain@gmail.com',
    phone: '9853001122',
    bookingDate: '2026-08-07',
    visitDate: '2026-08-26',
    duration: '2 Days',
    durationDays: 2,
    persons: 8,
    totalPrice: 449,
    paymentMethod: 'UPI',
    paymentStatus: 'Paid',
    bookingStatus: 'Confirmed',
    createdAt: '2026-08-07T09:10:00Z',
    visitors: [{ name: 'Ashok Swain', phone: '9853001122' }]
  },
  {
    bookingId: 'BK-928354',
    plotId: 'pandal-6',
    plotTitle: 'Pandal — Hillside View',
    name: 'Alok Ranjan Jena',
    email: 'alok.jena@outlook.com',
    phone: '9938887766',
    bookingDate: '2026-08-06',
    visitDate: '2026-08-27',
    duration: '1 Day',
    durationDays: 1,
    persons: 6,
    totalPrice: 449,
    paymentMethod: 'Card',
    paymentStatus: 'Paid',
    bookingStatus: 'Confirmed',
    createdAt: '2026-08-06T10:00:00Z',
    visitors: [{ name: 'Alok Jena', phone: '9938887766' }]
  },
  {
    bookingId: 'BK-928355',
    plotId: 'pandal-1',
    plotTitle: 'Pandal — Upper Block (Riverside View)',
    name: 'Niharika Mahapatra',
    email: 'niharika.m@gmail.com',
    phone: '9778009911',
    bookingDate: '2026-08-09',
    visitDate: '2026-08-28',
    duration: '1 Day',
    durationDays: 1,
    persons: 12,
    totalPrice: 499,
    paymentMethod: 'UPI',
    paymentStatus: 'Paid',
    bookingStatus: 'Confirmed',
    createdAt: '2026-08-09T17:20:00Z',
    visitors: [{ name: 'Niharika Mahapatra', phone: '9778009911' }]
  },
  {
    bookingId: 'BK-928356',
    plotId: 'pandal-3',
    plotTitle: 'Pandal — Middle Lawn',
    name: 'Pradeep Sethi',
    email: 'pradeep.sethi@gmail.com',
    phone: '9437998877',
    bookingDate: '2026-08-08',
    visitDate: '2026-08-29',
    duration: '2 Days',
    durationDays: 2,
    persons: 15,
    totalPrice: 499,
    paymentMethod: 'Net Banking',
    paymentStatus: 'Paid',
    bookingStatus: 'Confirmed',
    createdAt: '2026-08-08T19:00:00Z',
    visitors: [{ name: 'Pradeep Sethi', phone: '9437998877' }]
  }
]

export default function Bookings() {
  const { lastBooking, emitPlotStatusChange } = useSocket()
  const [bookings, setBookings] = useState(INITIAL_BOOKINGS)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  // Left Slide-in Panel State for View Bill
  const [selectedBillDrawer, setSelectedBillDrawer] = useState(null)

  // Pagination State - DEFAULT TO 15 BOOKINGS PER SECTION/PAGE
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(15)

  // Esc Key Listener for Closing Left Slide-in Panel
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedBillDrawer(null)
      }
    }
    if (selectedBillDrawer) {
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedBillDrawer])

  // Auto-check expired bookings on mount
  useEffect(() => {
    const today = new Date()
    setBookings(prev => prev.map(bk => {
      if (bk.bookingStatus === 'Confirmed' && bk.visitDate) {
        const vDate = new Date(bk.visitDate)
        const expiryDate = new Date(vDate)
        expiryDate.setDate(expiryDate.getDate() + (bk.durationDays || 1))
        if (today > expiryDate) {
          return { ...bk, isExpired: true }
        }
      }
      return bk
    }))
  }, [])

  // Reset page when search or status filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter, itemsPerPage])

  // Listen to real-time socket booking alerts
  useEffect(() => {
    if (lastBooking) {
      const todayStr = new Date().toISOString().split('T')[0]
      const newBk = {
        bookingId: `BK-${Math.floor(100000 + Math.random() * 900000)}`,
        plotId: lastBooking.plotId || 'pandal-new',
        plotTitle: lastBooking.pandalName || 'Picnic Pandal',
        name: lastBooking.customerName || 'Online Visitor',
        email: 'customer@picnicutkal.com',
        phone: '9876543210',
        bookingDate: todayStr,
        visitDate: lastBooking.visitDate || todayStr,
        duration: '1 Day',
        durationDays: 1,
        persons: 4,
        totalPrice: lastBooking.total || 499,
        paymentMethod: 'Online Payment',
        paymentStatus: 'Paid',
        bookingStatus: 'Confirmed',
        createdAt: new Date().toISOString()
      }
      setBookings(prev => [newBk, ...prev])
    }
  }, [lastBooking])

  // Filter bookings
  const filteredBookings = bookings.filter(bk => {
    const matchesSearch = 
      bk.bookingId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bk.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bk.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bk.plotTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bk.phone.includes(searchQuery)

    const matchesStatus = statusFilter === 'All' || bk.bookingStatus.toLowerCase() === statusFilter.toLowerCase()

    return matchesSearch && matchesStatus
  })

  // Pagination slicing
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage)
  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Status Change
  const handleStatusChange = (bookingId, newStatus) => {
    setBookings(prev => prev.map(bk => bk.bookingId === bookingId ? { ...bk, bookingStatus: newStatus } : bk))
    toast.success(`Booking ${bookingId} status updated to ${newStatus}`)
    if (selectedBillDrawer && selectedBillDrawer.bookingId === bookingId) {
      setSelectedBillDrawer(prev => ({ ...prev, bookingStatus: newStatus }))
    }
  }

  // Delete / Cancel Booking
  const handleDeleteBooking = (bookingId) => {
    const bk = bookings.find(b => b.bookingId === bookingId)
    if (window.confirm(`Are you sure you want to cancel & delete booking #${bookingId} for ${bk?.name || 'guest'}?`)) {
      setBookings(prev => prev.filter(b => b.bookingId !== bookingId))
      if (bk?.plotId) {
        emitPlotStatusChange(bk.plotId, 'available')
      }
      toast.success(`Booking #${bookingId} deleted & spot released on Spots section!`)
    }
  }

  // Reset Spot Availability button click
  const handleResetSpot = (booking) => {
    setBookings(prev => prev.map(b => b.bookingId === booking.bookingId ? { ...b, bookingStatus: 'Completed', isExpired: false } : b))
    emitPlotStatusChange(booking.plotId || 'pandal-1', 'available')
    toast.success(`Spot "${booking.plotTitle}" reset to AVAILABLE on Spots Section!`, {
      icon: '🔄',
      style: { background: 'var(--forest-dark)', color: '#fff', border: '1px solid var(--gold)' }
    })
  }

  // Auto Reset All Completed / Expired Spots
  const handleResetAllExpired = () => {
    let count = 0
    setBookings(prev => prev.map(bk => {
      if (bk.isExpired || bk.bookingStatus === 'Completed') {
        count++
        emitPlotStatusChange(bk.plotId, 'available')
        return { ...bk, bookingStatus: 'Completed', isExpired: false }
      }
      return bk
    }))
    toast.success(`Reset complete! ${count || 'All'} spots are now AVAILABLE on Spots & Map sections.`, {
      icon: '✨'
    })
  }

  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case 'confirmed': return 'badge-success'
      case 'completed': return 'badge-glass'
      case 'pending':   return 'badge-gold'
      case 'cancelled': return 'badge-danger'
      default:          return 'badge-glass'
    }
  }

  return (
    <div className="card glass-card" style={{ padding: '24px', position: 'relative' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={20} color="var(--gold)" />
            <h2 className="heading-4" style={{ margin: 0, color: 'var(--text-primary)' }}>All User Bookings Ledger</h2>
          </div>
          <p className="text-muted text-sm" style={{ margin: '4px 0 0' }}>Manage customer bookings, track reservation dates (1/2/3 days), and reset completed spots.</p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button className="btn btn-gold btn-sm flex items-center gap-1" onClick={handleResetAllExpired}>
            <RotateCcw size={14} /> Reset Completed Spots
          </button>
          <span className="badge badge-glass" style={{ padding: '6px 12px', fontSize: '12px' }}>
            Total: {bookings.length} Bookings
          </span>
        </div>
      </div>

      {/* Filters, Search, Items Per Page */}
      <div className="admin-table-filters" style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="input-with-icon" style={{ flex: 1, minWidth: '240px', maxWidth: '360px' }}>
          <Search size={16} />
          <input 
            type="text" 
            placeholder="Search by Booking ID, customer name, or phone..." 
            className="input" 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto' }}>
            {['All', 'Confirmed', 'Pending', 'Completed', 'Cancelled'].map(st => (
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

          <select 
            className="input"
            style={{ width: '140px', padding: '4px 8px', fontSize: '12px' }}
            value={itemsPerPage}
            onChange={e => setItemsPerPage(Number(e.target.value))}
          >
            <option value={15}>15 per section</option>
            <option value={25}>25 per section</option>
            <option value={50}>50 per section</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="admin-table-scroll-wrapper">
        <table className="admin-table-view">
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Customer Info</th>
              <th>Reserved Spot / Pandal</th>
              <th>Booking Date</th>
              <th>Visit Date & Duration</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedBookings.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                  No bookings found matching your search.
                </td>
              </tr>
            ) : (
              paginatedBookings.map(bk => (
                <tr 
                  key={bk.bookingId} 
                  onClick={() => setSelectedBillDrawer(bk)}
                  className="table-row-clickable"
                  style={{ 
                    cursor: 'pointer', 
                    backgroundColor: bk.isExpired ? 'rgba(234, 179, 8, 0.08)' : 'transparent',
                    transition: 'background-color 0.2s ease'
                  }}
                >
                  <td className="bold" style={{ color: 'var(--gold)', fontFamily: 'monospace', fontSize: '13px' }}>
                    #{bk.bookingId}
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>{bk.name}</span>
                      <small style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{bk.phone} • {bk.email}</small>
                    </div>
                  </td>
                  <td style={{ maxWidth: '200px', fontSize: '13px' }}>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{bk.plotTitle}</span>
                  </td>
                  <td style={{ fontSize: '12px', color: 'var(--text-muted)', minWidth: '95px' }}>
                    {bk.bookingDate || '2026-08-08'}
                  </td>
                  <td style={{ fontSize: '13px', color: 'var(--text-primary)', minWidth: '130px' }}>
                    <div style={{ fontWeight: 600 }}>{bk.visitDate}</div>
                    <span className="badge badge-glass" style={{ fontSize: '10px', marginTop: '2px', color: 'var(--gold)' }}>
                      ⏱ {bk.duration || '1 Day'}
                    </span>
                    {bk.isExpired && (
                      <span style={{ fontSize: '10px', color: '#D97706', display: 'block', fontWeight: 600, marginTop: '2px' }}>
                        ⚠️ Completed Date
                      </span>
                    )}
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--gold)', minWidth: '85px' }}>
                    ₹{bk.totalPrice.toLocaleString()}
                  </td>
                  <td onClick={e => e.stopPropagation()}>
                    <select
                      value={bk.bookingStatus}
                      onChange={e => handleStatusChange(bk.bookingId, e.target.value)}
                      className={`badge ${getStatusBadgeClass(bk.bookingStatus)}`}
                      style={{ cursor: 'pointer', border: 'none', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '11px', padding: '4px 8px' }}
                    >
                      <option value="Confirmed">Confirmed</option>
                      <option value="Pending">Pending</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td onClick={e => e.stopPropagation()}>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      {/* View Bill Button */}
                      <button 
                        className="btn btn-outline btn-sm flex items-center gap-1"
                        style={{ padding: '4px 8px' }}
                        onClick={(e) => { e.stopPropagation(); setSelectedBillDrawer(bk); }}
                        title="View Official Bill in Left Slide-in Panel"
                      >
                        <FileText size={13} /> View Bill
                      </button>

                      {/* Reset Spot Button */}
                      <button
                        className="btn btn-outline btn-sm"
                        style={{ padding: '4px 8px', color: 'var(--gold)', borderColor: 'var(--border-gold)' }}
                        onClick={(e) => { e.stopPropagation(); handleResetSpot(bk); }}
                        title="Reset Spot to Available on Spots Section"
                      >
                        <RotateCcw size={13} />
                      </button>

                      {/* Delete / Cancel Button */}
                      <button 
                        className="btn btn-outline btn-sm" 
                        style={{ padding: '4px 8px', color: 'var(--error)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                        onClick={(e) => { e.stopPropagation(); handleDeleteBooking(bk.bookingId); }}
                        title="Cancel & Delete Booking"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {filteredBookings.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', flexWrap: 'wrap', gap: '12px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Showing <strong>{Math.min((currentPage - 1) * itemsPerPage + 1, filteredBookings.length)}</strong> to <strong>{Math.min(currentPage * itemsPerPage, filteredBookings.length)}</strong> of <strong>{filteredBookings.length}</strong> bookings (Page {currentPage} of {totalPages || 1})
          </div>

          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <button 
              className="btn btn-outline btn-sm flex items-center gap-1"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={14} /> Previous
            </button>

            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i + 1}
                className={`btn btn-sm ${currentPage === i + 1 ? 'btn-gold' : 'btn-outline'}`}
                onClick={() => setCurrentPage(i + 1)}
                style={{ width: '32px', height: '32px', padding: 0 }}
              >
                {i + 1}
              </button>
            ))}

            <button 
              className="btn btn-outline btn-sm flex items-center gap-1"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* COMPACT LEFT SLIDE-IN BILL PANEL — NO SCROLLING / EXACT SCREEN HEIGHT FIT */}
      {selectedBillDrawer && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            display: 'flex'
          }}
          onClick={() => setSelectedBillDrawer(null)}
        >
          {/* Drawer Container Sliding In From Left */}
          <div 
            style={{
              width: '100%',
              maxWidth: '540px',
              height: '100vh',
              maxHeight: '100vh',
              backgroundColor: 'var(--bg-card)',
              color: 'var(--text-primary)',
              boxShadow: '10px 0 40px rgba(0,0,0,0.4)',
              display: 'flex',
              flexDirection: 'column',
              justify: 'space-between',
              position: 'relative',
              zIndex: 10000,
              animation: 'slideInLeft 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
              borderRight: '2px solid var(--border-gold)',
              overflow: 'hidden'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Drawer Top Bar */}
            <div style={{
              padding: '14px 20px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              justify: 'space-between',
              alignItems: 'center',
              backgroundColor: 'var(--bg-primary)',
              flexShrink: 0
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Receipt size={20} color="var(--gold)" />
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Tax Invoice & Booking Pass
                </h3>
              </div>
              
              {/* Close Button (X) */}
              <button
                onClick={() => setSelectedBillDrawer(null)}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                title="Close Panel (Esc)"
              >
                <X size={18} />
              </button>
            </div>

            {/* Bill Body — Compact Proportions for Screen Height */}
            <div style={{ flex: 1, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto' }}>
              
              {/* Brand Header */}
              <div style={{ borderBottom: '1.5px dashed var(--border)', paddingBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: 'var(--gold)', fontFamily: 'var(--font-heading)' }}>
                      PicnicUtkal Reserve
                    </h2>
                    <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Barapita Picnic Zone, Odisha • GSTIN: 21AAACP9012K1Z5
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="badge badge-gold" style={{ fontSize: '11px', padding: '3px 8px' }}>#{selectedBillDrawer.bookingId}</span>
                    <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Date: {selectedBillDrawer.bookingDate || '08 Aug 2026'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Billed To & Reservation Summary — 2-COLUMN GRID FIT */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                
                <div style={{ backgroundColor: 'var(--bg-primary)', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '10px', color: 'var(--gold)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '2px' }}>
                    Billed To (Customer)
                  </span>
                  <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{selectedBillDrawer.name}</strong>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>📞 {selectedBillDrawer.phone}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>✉️ {selectedBillDrawer.email}</div>
                </div>

                <div style={{ backgroundColor: 'var(--bg-primary)', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '10px', color: 'var(--gold)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '2px' }}>
                    Reservation Info
                  </span>
                  <strong style={{ fontSize: '12px', color: 'var(--gold)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedBillDrawer.plotTitle}</strong>
                  <div style={{ fontSize: '11px', color: 'var(--text-primary)', marginTop: '2px' }}>
                    📅 <strong>{selectedBillDrawer.visitDate}</strong> ({selectedBillDrawer.duration || '1 Day'})
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    👥 <strong>{selectedBillDrawer.persons} Visitors</strong>
                  </div>
                </div>

              </div>

              {/* Itemized Pricing Breakdown Table */}
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
                  Itemized Pricing Breakdown
                </span>
                <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-primary)', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                        <th style={{ padding: '6px 10px' }}>Description</th>
                        <th style={{ padding: '6px 10px', textAlign: 'center' }}>Unit Rate</th>
                        <th style={{ padding: '6px 10px', textAlign: 'right' }}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ color: 'var(--text-primary)' }}>
                        <td style={{ padding: '8px 10px' }}>
                          <strong style={{ display: 'block', color: 'var(--text-primary)' }}>{selectedBillDrawer.plotTitle}</strong>
                          <small style={{ color: 'var(--text-muted)', fontSize: '10px' }}>
                            Private pandal, lawn access & free parking
                          </small>
                        </td>
                        <td style={{ padding: '8px 10px', textAlign: 'center', color: 'var(--text-muted)' }}>
                          Flat ({selectedBillDrawer.duration || '1 Day'})
                        </td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: 'var(--gold)' }}>
                          ₹{selectedBillDrawer.totalPrice}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Payment Details & Total Box */}
              <div style={{ 
                backgroundColor: 'var(--bg-primary)', 
                padding: '10px 14px', 
                borderRadius: '10px', 
                border: '1px solid var(--border)',
                display: 'flex',
                justify: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>Payment: <strong style={{ color: 'var(--text-primary)' }}>{selectedBillDrawer.paymentMethod}</strong></div>
                  <div style={{ fontSize: '11px', color: 'var(--success)', fontWeight: 700, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Check size={13} /> Status: {selectedBillDrawer.paymentStatus}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Grand Total Paid</span>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--gold)', fontFamily: 'var(--font-heading)' }}>
                    ₹{selectedBillDrawer.totalPrice.toLocaleString()}
                  </div>
                </div>
              </div>

            </div>

            {/* Drawer Bottom Actions */}
            <div style={{
              padding: '12px 20px',
              borderTop: '1px solid var(--border)',
              backgroundColor: 'var(--bg-primary)',
              display: 'flex',
              gap: '10px',
              justify: 'flex-end',
              flexShrink: 0
            }}>
              <button className="btn btn-gold btn-sm flex items-center gap-1" onClick={() => window.print()}>
                <Printer size={14} /> Print / Save PDF Bill
              </button>
              <button className="btn btn-outline btn-sm" onClick={() => setSelectedBillDrawer(null)}>
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}
