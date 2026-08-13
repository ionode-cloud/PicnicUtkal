import { useState, useEffect } from 'react'
import { 
  LuSearch as Search, 
  LuCreditCard as CreditCard,
  LuIndianRupee as IndianRupee,
  LuTrendingUp as TrendingUp,
  LuRotateCcw as RotateCcw,
  LuCircleCheck as CheckCircle,
  LuClock as Clock,
  LuCircleX as XCircle,
  LuFileText as FileText,
  LuDownload as Download,
  LuArrowDownLeft as ArrowDownLeft,
  LuArrowUpRight as ArrowUpRight,
  LuRefreshCw as RefreshCw,
  LuTrash2 as Trash2
} from 'react-icons/lu'
import toast from 'react-hot-toast'
import { useSocket } from '../../context/SocketContext'

// Derive a payment row from a DB booking document
const toPayment = (b, idx) => ({
  txnId:         b.bookingId || `TXN-${idx + 1}`,
  bookingId:     b.bookingId || b._id,
  customerName:  b.name || 'Unknown',
  customerEmail: b.email || '',
  spotTitle:     b.plotTitle || 'Picnic Spot',
  amount:        b.totalAmount || b.totalPrice || 0,
  method:        (b.paymentMethod || 'UPI').toUpperCase(),
  status:        b.paymentStatus === 'paid' ? 'Paid' : b.paymentStatus === 'failed' ? 'Failed' : 'Pending',
  type:          'Payment',
  date:          b.createdAt ? new Date(b.createdAt).toLocaleString('en-IN') : ''
})

export default function Payments() {
  const { socket } = useSocket()
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  const fetchPayments = () => {
    setLoading(true)
    fetch('/api/bookings')
      .then(r => r.json())
      .then(d => { if (d.success && Array.isArray(d.data)) setPayments(d.data.map(toPayment)) })
      .catch(() => toast.error('Failed to load payments'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchPayments() }, [])

  // Socket listener for real-time changes
  useEffect(() => {
    if (!socket) return
    const handleUpdate = () => fetchPayments()
    socket.on('plots_update', handleUpdate)
    return () => socket.off('plots_update', handleUpdate)
  }, [socket])

  const handleDeletePayment = async (bookingId) => {
    const item = payments.find(p => p.bookingId === bookingId || p.txnId === bookingId)
    if (window.confirm(`Are you sure you want to permanently delete payment & booking #${bookingId}? This will remove it from all records and free the spot.`)) {
      try {
        const res = await fetch(`/api/bookings/${bookingId}`, { method: 'DELETE' })
        const data = await res.json()
        if (data.success) {
          setPayments(prev => prev.filter(p => p.bookingId !== bookingId && p.txnId !== bookingId))
          toast.success(`Payment & booking #${bookingId} deleted permanently!`)
        } else {
          toast.error(data.message || 'Failed to delete payment record')
        }
      } catch (err) {
        toast.error('Error connecting to server to delete payment')
      }
    }
  }

  // Calculated Stats Summary
  const totalRevenue = payments
    .filter(p => p.status === 'Paid')
    .reduce((sum, p) => sum + p.amount, 0)

  const paidCount = payments.filter(p => p.status === 'Paid').length
  const pendingCount = payments.filter(p => p.status === 'Pending').length
  const refundedTotal = payments
    .filter(p => p.status === 'Refunded')
    .reduce((sum, p) => sum + p.amount, 0)

  // Filter payments
  const filteredPayments = payments.filter(p => {
    const matchesSearch = 
      p.txnId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.bookingId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.spotTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.method.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === 'All' || p.status.toLowerCase() === statusFilter.toLowerCase()

    return matchesSearch && matchesStatus
  })

  // Issue / Process Refund
  const handleProcessRefund = (txnId, amount, customerName) => {
    if (window.confirm(`Are you sure you want to process refund of ₹${amount} for ${customerName} (#${txnId})?`)) {
      setPayments(prev => prev.map(p => p.txnId === txnId ? { ...p, status: 'Refunded', type: 'Refund' } : p))
      toast.success(`Refund of ₹${amount} processed successfully for ${customerName}.`, {
        icon: '💸'
      })
    }
  }

  // Mark Pending as Paid
  const handleMarkPaid = (txnId) => {
    setPayments(prev => prev.map(p => p.txnId === txnId ? { ...p, status: 'Paid', type: 'Payment' } : p))
    toast.success(`Payment #${txnId} marked as PAID.`)
  }

  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case 'paid':     return 'badge-success'
      case 'pending':  return 'badge-gold'
      case 'refunded': return 'badge-danger'
      default:         return 'badge-glass'
    }
  }

  return (
    <div className="card glass-card" style={{ padding: '24px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CreditCard size={20} color="var(--gold)" />
            <h2 className="heading-4" style={{ margin: 0, color: 'var(--text-primary)' }}>Payments & Refunds Ledger</h2>
          </div>
          <p className="text-muted text-sm" style={{ margin: '4px 0 0' }}>Monitor all customer payments, online UPI/Card transactions, and issue refunds.</p>
        </div>

        <span className="badge badge-glass" style={{ padding: '6px 12px', fontSize: '12px' }}>
          Total Transactions: {payments.length}
        </span>
      </div>

      {/* KPI Stats Cards Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        
        <div style={{ backgroundColor: 'var(--bg-primary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block' }}>Total Paid Revenue</span>
          <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--gold)', marginTop: '4px' }}>
            ₹{totalRevenue.toLocaleString()}
          </div>
          <small style={{ color: 'var(--success)', fontSize: '11px' }}>{paidCount} Successful Transactions</small>
        </div>

        <div style={{ backgroundColor: 'var(--bg-primary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block' }}>Pending Payments</span>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#D97706', marginTop: '4px' }}>
            {pendingCount} Pending
          </div>
          <small style={{ color: 'var(--text-muted)', fontSize: '11px' }}>Awaiting Net Banking clearance</small>
        </div>

        <div style={{ backgroundColor: 'var(--bg-primary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block' }}>Total Refunds Issued</span>
          <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--error)', marginTop: '4px' }}>
            ₹{refundedTotal.toLocaleString()}
          </div>
          <small style={{ color: 'var(--error)', fontSize: '11px' }}>1 Refund Transaction</small>
        </div>

      </div>

      {/* Filters & Search */}
      <div className="admin-table-filters" style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="input-with-icon" style={{ flex: 1, minWidth: '240px', maxWidth: '380px' }}>
          <Search size={16} />
          <input 
            type="text" 
            placeholder="Search by Txn ID, customer name, spot, or method..." 
            className="input" 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {['All', 'Paid', 'Pending', 'Refunded'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`btn btn-sm ${statusFilter === st ? 'btn-gold' : 'btn-outline'}`}
              style={{ fontSize: '12px', padding: '4px 12px', borderRadius: '20px' }}
            >
              {st}
            </button>
          ))}
          <button className="btn btn-outline btn-sm" onClick={fetchPayments} disabled={loading} style={{ marginLeft: '8px', gap: '6px', display: 'flex', alignItems: 'center' }}>
            <RefreshCw size={14} /> {loading ? 'Loading…' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Payments Table */}
      <div className="admin-table-scroll-wrapper">
        <table className="admin-table-view">
          <thead>
            <tr>
              <th>Txn ID</th>
              <th>Booking ID</th>
              <th>Customer</th>
              <th>Spot Details</th>
              <th>Amount</th>
              <th>Payment Method</th>
              <th>Date & Time</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                  ⏳ Loading payment transactions…
                </td>
              </tr>
            ) : filteredPayments.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>💳</div>
                  {payments.length === 0 ? 'No payments yet. Transactions will appear here after a user books a spot.' : 'No transactions match the current filter.'}
                </td>
              </tr>
            ) : (
              filteredPayments.map(p => (
                <tr key={p.txnId}>
                  <td className="bold" style={{ color: 'var(--gold)', fontFamily: 'monospace', fontSize: '13px' }}>
                    #{p.txnId}
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--text-muted)' }}>
                    #{p.bookingId}
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>{p.customerName}</span>
                      <small style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{p.customerEmail}</small>
                    </div>
                  </td>
                  <td style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 600, maxWidth: '180px' }}>
                    {p.spotTitle}
                  </td>
                  <td style={{ fontWeight: 800, color: p.status === 'Refunded' ? 'var(--error)' : 'var(--gold)', fontSize: '14px' }}>
                    {p.status === 'Refunded' ? '-' : ''}₹{p.amount.toLocaleString()}
                  </td>
                  <td style={{ fontSize: '12px', color: 'var(--text-primary)' }}>
                    {p.method}
                  </td>
                  <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {p.date}
                  </td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(p.status)}`} style={{ fontSize: '11px' }}>
                      {p.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      {p.status === 'Paid' && (
                        <button 
                          className="btn btn-outline btn-sm"
                          style={{ padding: '4px 8px', fontSize: '11px', color: 'var(--error)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                          onClick={() => handleProcessRefund(p.txnId, p.amount, p.customerName)}
                          title="Process Refund"
                        >
                          Issue Refund
                        </button>
                      )}

                      {p.status === 'Pending' && (
                        <button 
                          className="btn btn-gold btn-sm"
                          style={{ padding: '4px 8px', fontSize: '11px' }}
                          onClick={() => handleMarkPaid(p.txnId)}
                          title="Mark as Paid"
                        >
                          Mark Paid
                        </button>
                      )}

                      <button 
                        className="btn btn-outline btn-sm"
                        style={{ padding: '4px 8px', fontSize: '11px', color: '#FA5252', borderColor: 'rgba(250, 82, 82, 0.3)', gap: '4px', display: 'inline-flex', alignItems: 'center' }}
                        onClick={() => handleDeletePayment(p.bookingId || p.txnId)}
                        title="Delete payment & booking record"
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
