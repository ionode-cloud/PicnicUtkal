import { useState } from 'react'
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
  LuRefreshCw as RefreshCw
} from 'react-icons/lu'
import toast from 'react-hot-toast'

const INITIAL_PAYMENTS = [
  {
    txnId: 'TXN-88091',
    bookingId: 'BK-928341',
    customerName: 'Sunil Mohanty',
    customerEmail: 'sunil.mohanty@gmail.com',
    spotTitle: 'Pandal — Upper Block (Riverside View)',
    amount: 499,
    method: 'UPI (PhonePe)',
    status: 'Paid',
    type: 'Payment',
    date: '2026-08-08 10:30 AM'
  },
  {
    txnId: 'TXN-88092',
    bookingId: 'BK-928342',
    customerName: 'Anjali Das',
    customerEmail: 'anjali.das@gmail.com',
    spotTitle: 'Pandal — Road Block',
    amount: 449,
    method: 'Credit Card',
    status: 'Paid',
    type: 'Payment',
    date: '2026-08-08 02:20 PM'
  },
  {
    txnId: 'TXN-88093',
    bookingId: 'BK-928343',
    customerName: 'Rajesh Tripathy',
    customerEmail: 'rajesh.t@yahoo.com',
    spotTitle: 'Barapita Deluxe Cottage & AC Suite Rooms',
    amount: 999,
    method: 'Net Banking',
    status: 'Pending',
    type: 'Payment',
    date: '2026-08-09 09:15 AM'
  },
  {
    txnId: 'TXN-88094',
    bookingId: 'BK-928344',
    customerName: 'Smruti Ranjan',
    customerEmail: 'smruti.r@gmail.com',
    spotTitle: 'Pandal — Middle Lawn',
    amount: 499,
    method: 'UPI (GPay)',
    status: 'Paid',
    type: 'Payment',
    date: '2026-08-05 04:00 PM'
  },
  {
    txnId: 'TXN-88095',
    bookingId: 'BK-928345',
    customerName: 'Debashish Panda',
    customerEmail: 'deba.panda@outlook.com',
    spotTitle: 'Pandal — Garden Edge',
    amount: 449,
    method: 'UPI (Paytm)',
    status: 'Refunded',
    type: 'Refund',
    date: '2026-08-06 11:45 AM'
  },
  {
    txnId: 'TXN-88096',
    bookingId: 'BK-928346',
    customerName: 'Manoj Kumar Patnaik',
    customerEmail: 'manoj.patnaik@gmail.com',
    spotTitle: 'Pandal — Riverside Grove',
    amount: 499,
    method: 'UPI',
    status: 'Paid',
    type: 'Payment',
    date: '2026-08-07 12:00 PM'
  },
  {
    txnId: 'TXN-88097',
    bookingId: 'BK-928347',
    customerName: 'Biswajit Behera',
    customerEmail: 'biswajit.b@gmail.com',
    spotTitle: 'Pandal — Hillside View',
    amount: 449,
    method: 'Debit Card',
    status: 'Paid',
    type: 'Payment',
    date: '2026-08-06 03:30 PM'
  },
  {
    txnId: 'TXN-88098',
    bookingId: 'BK-928348',
    customerName: 'Priyabrata Mishra',
    customerEmail: 'priyabrata.m@gmail.com',
    spotTitle: 'Pandal — Upper Block',
    amount: 499,
    method: 'UPI (PhonePe)',
    status: 'Paid',
    type: 'Payment',
    date: '2026-08-07 06:00 PM'
  }
]

export default function Payments() {
  const [payments, setPayments] = useState(INITIAL_PAYMENTS)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

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

        <div style={{ display: 'flex', gap: '6px' }}>
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
            {filteredPayments.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                  No payment transactions found.
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

                      {p.status === 'Refunded' && (
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', italic: true }}>
                          Refund Settled
                        </span>
                      )}
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
