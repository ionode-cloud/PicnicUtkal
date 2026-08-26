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
import { useBookings, useInvalidators } from '../../hooks/useQueryHooks'
import { buildApiUrl } from '../../services/api'

// Normalise a raw DB booking doc into the shape the component expects
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
  visitors:      b.visitors || [],
  durationDays:  1
})

export default function Bookings() {
  const { socket } = useSocket()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  // Left Slide-in Panel State for View Bill
  const [selectedBillDrawer, setSelectedBillDrawer] = useState(null)

  // Pagination State - DEFAULT TO 15 BOOKINGS PER SECTION/PAGE
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(15)

  // ── Shared cached query (no re-fetch on tab switch) ──
  const { data: rawBookings = [], isLoading: loading, refetch: refetchBookings } = useBookings()
  const { invalidateBookings } = useInvalidators()

  // Apply normalise transform on top of cached data
  const bookings = rawBookings.map(normalise)

  // Real-time: invalidate cache when a new booking is created
  useEffect(() => {
    if (!socket) return
    const handleNew = () => invalidateBookings()
    socket.on('plots_update',    handleNew)
    socket.on('new_booking',     handleNew)
    socket.on('booking_created', handleNew)
    socket.on('booking_updated', handleNew)
    return () => {
      socket.off('plots_update',    handleNew)
      socket.off('new_booking',     handleNew)
      socket.off('booking_created', handleNew)
      socket.off('booking_updated', handleNew)
    }
  }, [socket])

  // Esc Key Listener for Closing Left Slide-in Panel
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setSelectedBillDrawer(null)
    }
    if (selectedBillDrawer) window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedBillDrawer])

  // Reset page when filters change
  useEffect(() => { setCurrentPage(1) }, [searchQuery, statusFilter, itemsPerPage])

  // Filter bookings: All Bookings tab shows active bookings (excludes cancelled/reset bookings)
  const filteredBookings = bookings.filter(bk => {
    const isCancelled = bk.status === 'cancelled' || bk.bookingStatus?.toLowerCase() === 'cancelled'
    if (isCancelled) return false

    const q = searchQuery.trim().toLowerCase()
    const matchesSearch = !q ||
      (bk.name && bk.name.toLowerCase().includes(q)) ||
      (bk.bookingId && String(bk.bookingId).toLowerCase().includes(q)) ||
      (bk.email && bk.email.toLowerCase().includes(q)) ||
      (bk.plotTitle && bk.plotTitle.toLowerCase().includes(q)) ||
      (bk.phone && String(bk.phone).includes(q))

    const matchesStatus = statusFilter === 'All' || bk.bookingStatus?.toLowerCase() === statusFilter.toLowerCase()

    return matchesSearch && matchesStatus
  })

  // Pagination slicing
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage)
  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Status Change
  const handleStatusChange = async (bookingId, newStatus) => {
    const bk = bookings.find(b => b.bookingId === bookingId || b._id === bookingId)
    const id = bk?._id || bookingId
    const apiStatus = newStatus.toLowerCase()
    try {
      await fetch(buildApiUrl(`/api/bookings/${id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: apiStatus })
      })
      if (socket) socket.emit('plots_update')
    } catch (e) {}

    if (apiStatus === 'cancelled') {
      setBookings(prev => prev.filter(b => b.bookingId !== bookingId && b._id !== bookingId))
    } else {
      setBookings(prev => prev.map(b => (b.bookingId === bookingId || b._id === bookingId) ? { ...b, bookingStatus: newStatus, status: apiStatus } : b))
    }
    toast.success(`Booking ${bookingId} status updated to ${newStatus}`)
    if (selectedBillDrawer && (selectedBillDrawer.bookingId === bookingId || selectedBillDrawer._id === bookingId)) {
      setSelectedBillDrawer(prev => ({ ...prev, bookingStatus: newStatus, status: apiStatus }))
    }
  }

  // Delete Booking permanently (removes from All Bookings tab and updates history)
  const handleDeleteBooking = async (bookingId) => {
    const bk = bookings.find(b => b.bookingId === bookingId || b._id === bookingId)
    if (window.confirm(`Are you sure you want to permanently delete booking #${bookingId} for ${bk?.name || 'guest'}? This will remove it from All Bookings and free the spot date.`)) {
      try {
        const res = await fetch(buildApiUrl(`/api/bookings/${bookingId}`), { method: 'DELETE' })
        const data = await res.json()
        if (data.success) {
          setBookings(prev => prev.filter(b => b.bookingId !== bookingId && b._id !== bookingId))
          if (socket) socket.emit('plots_update')
          toast.success(`Booking #${bookingId} deleted from All Bookings! Date freed on calendar.`)
        } else {
          toast.error(data.message || 'Failed to delete booking')
        }
      } catch (err) {
        toast.error('Error deleting booking from server')
      }
    }
  }

  // Reset Spot Availability button click
  const handleResetSpot = async (booking) => {
    const id = booking._id || booking.bookingId
    try {
      const res = await fetch(buildApiUrl(`/api/bookings/${id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' })
      })
      const data = await res.json()
      if (data.success) {
        setBookings(prev => prev.filter(b => b.bookingId !== id && b._id !== id))
        if (socket) socket.emit('plots_update')
        toast.success(`Spot "${booking.plotTitle}" reset! Removed from All Bookings and saved in Booking History.`, {
          icon: '🔄',
          style: { background: 'var(--forest-dark)', color: '#fff', border: '1px solid var(--gold)' }
        })
      } else {
        toast.error(data.message || 'Failed to reset spot')
      }
    } catch (err) {
      toast.error('Failed to communicate with server')
    }
  }

  // Auto Reset All Completed / Expired Spots
  const handleResetAllExpired = async () => {
    let count = 0
    for (const bk of bookings) {
      if (bk.isExpired || bk.bookingStatus === 'Completed' || bk.status === 'confirmed') {
        count++
        const id = bk._id || bk.bookingId
        await fetch(buildApiUrl(`/api/bookings/${id}`), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'cancelled' })
        }).catch(() => {})
      }
    }
    if (socket) socket.emit('plots_update')
    setBookings([])
    toast.success(`Reset complete! ${count || 'All'} spots updated & moved to Booking History.`, { icon: '✨' })
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
          <button className="btn btn-outline btn-sm flex items-center gap-1" onClick={() => refetchBookings()} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'spin' : ''} /> {loading ? 'Loading…' : 'Refresh'}
          </button>
          <span className="badge badge-glass" style={{ padding: '6px 12px', fontSize: '12px' }}>
            Total: {bookings.length} Bookings
          </span>
        </div>
      </div>

      {/* Filters, Search, Items Per Page */}
      <div className="admin-table-filters" style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="input-with-icon" style={{ flex: 1, minWidth: '260px', maxWidth: '420px' }}>
          <Search size={16} />
          <input 
            type="text" 
            placeholder="Search by customer name, booking ID, or phone..." 
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
            {loading ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                  ⏳ Loading bookings from server…
                </td>
              </tr>
            ) : paginatedBookings.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>🎪</div>
                  {bookings.length === 0 ? 'No bookings yet. Bookings will appear here in real time.' : 'No bookings match the current filter.'}
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
                      {/* View / Print PDF Bill Button */}
                      <button 
                        className="btn btn-outline btn-sm flex items-center gap-1"
                        style={{ padding: '4px 8px' }}
                        onClick={(e) => { 
                          e.stopPropagation(); 
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
                        title="Print / Save PDF Bill"
                      >
                        <Printer size={13} /> Print Bill
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
                <Printer size={14} /> Print Bill
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
