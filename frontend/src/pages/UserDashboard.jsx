import { useState, useEffect } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import {
  LuUser as UserIcon, LuCalendar as Calendar, LuCreditCard as CreditCard,
  LuCircleHelp as HelpCircle, LuLogOut as LogOut, LuShieldCheck as ShieldCheck,
  LuCircleCheck as CheckCircle2, LuClock as Clock, LuMapPin as MapPin,
  LuSparkles as Sparkles, LuPhone as Phone, LuMail as Mail, LuSave as Save,
  LuCopy as Copy, LuTicket as Ticket, LuWallet as Wallet, LuCheck as Check,
  LuReceipt as Receipt, LuPrinter as Printer, LuX as X, LuExternalLink as ExternalLink, LuTrash2 as Trash2
} from 'react-icons/lu'
import { useAuthStore } from '../store'
import { useSocket } from '../context/SocketContext'
import { buildApiUrl } from '../services/api'
import toast from 'react-hot-toast'

export default function UserDashboard() {
  const { user, updateUser, logout } = useAuthStore()
  const { socket } = useSocket()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  const activeTab = searchParams.get('tab') || 'profile'
  const setActiveTab = (tab) => setSearchParams({ tab })

  const [copied, setCopied] = useState(false)
  const [bookingFilter, setBookingFilter] = useState('all')

  const [selectedTicketModal, setSelectedTicketModal] = useState(null)
  const [selectedBillModal, setSelectedBillModal] = useState(null)

  // Real bookings state
  const [bookings, setBookings] = useState([])
  const [bookingsLoading, setBookingsLoading] = useState(false)

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  })

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      })
    }
  }, [user])

  const fetchUserBookings = () => {
    setBookingsLoading(true)
    const userEmail = user?.email ? user.email.toLowerCase() : ''
    const endpoint = userEmail ? `/api/bookings?email=${encodeURIComponent(userEmail)}` : '/api/bookings'

    fetch(buildApiUrl(endpoint))
      .then(r => r.json())
      .then(d => {
        if (d.success && Array.isArray(d.data)) {
          if (d.data.length > 0) {
            setBookings(d.data)
          } else {
            try {
              const saved = localStorage.getItem('picnicutkal_my_bookings')
              if (saved) {
                const parsed = JSON.parse(saved)
                if (Array.isArray(parsed) && parsed.length > 0) {
                  setBookings(parsed)
                  return
                }
              }
            } catch (e) {}
            setBookings([])
          }
        }
      })
      .catch(() => {
        try {
          const saved = localStorage.getItem('picnicutkal_my_bookings')
          if (saved) {
            const parsed = JSON.parse(saved)
            if (Array.isArray(parsed)) setBookings(parsed)
          }
        } catch (e) {}
      })
      .finally(() => setBookingsLoading(false))
  }

  // Initial fetch
  useEffect(() => {
    fetchUserBookings()
  }, [user?.email])

  // Real-time socket listener: auto-refetch if admin deletes or plot status changes
  useEffect(() => {
    if (!socket) return
    const handleUpdate = () => fetchUserBookings()
    socket.on('plots_update', handleUpdate)
    return () => socket.off('plots_update', handleUpdate)
  }, [socket, user?.email])

  const triggerDirectBillDownload = (b) => {
    const params = new URLSearchParams({
      bookingId: b.bookingId || b._id || 'PK-1001',
      name: b.name || user?.name || '',
      phone: b.phone || user?.phone || '',
      aadhaar: b.aadhaar || '',
      spot: b.plotTitle || b.spotTitle || 'Picnic Spot',
      date: b.visitDate || '',
      duration: b.durationDays || b.duration || 1,
      guests: b.guests || 1,
      total: b.totalAmount || 0,
      autoprint: 'true'
    })

    let iframe = document.getElementById('udash-bill-iframe')
    if (!iframe) {
      iframe = document.createElement('iframe')
      iframe.id = 'udash-bill-iframe'
      iframe.style.position = 'fixed'
      iframe.style.right = '-9999px'
      iframe.style.bottom = '-9999px'
      iframe.style.width = '0'
      iframe.style.height = '0'
      iframe.style.border = '0'
      document.body.appendChild(iframe)
    }

    iframe.src = `/bill.html?${params.toString()}`
    iframe.onload = () => {
      setTimeout(() => {
        try {
          iframe.contentWindow.focus()
          iframe.contentWindow.print()
        } catch (e) {
          window.open(`/bill.html?${params.toString()}`, '_blank')
        }
      }, 300)
    }
  }

  const handleDeleteBooking = async (bookingId) => {
    const bk = bookings.find(b => b.bookingId === bookingId || b._id === bookingId)
    if (window.confirm(`Are you sure you want to cancel & delete booking #${bookingId}? This will remove it from your bookings, payment records, and free the spot.`)) {
      try {
        const res = await fetch(buildApiUrl(`/api/bookings/${bookingId}`), { method: 'DELETE' })
        const data = await res.json()
        if (data.success) {
          setBookings(prev => prev.filter(b => b.bookingId !== bookingId && b._id !== bookingId))
          toast.success(`Booking #${bookingId} deleted permanently!`)
        } else {
          toast.error(data.message || 'Failed to delete booking')
        }
      } catch (err) {
        toast.error('Error connecting to server to delete booking')
      }
    }
  }

  const handleProfileSave = (e) => {
    e.preventDefault()
    updateUser(profileForm)
    toast.success('Profile updated successfully!')
  }

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/')
  }

  const copyReferral = () => {
    const code = user?.referralCode || 'UTKAL2026'
    navigator.clipboard.writeText(code)
    setCopied(true)
    toast.success(`Referral code "${code}" copied to clipboard!`)
    setTimeout(() => setCopied(false), 2000)
  }

  // Derive filtered bookings & transactions from real data
  const filteredBookings = bookingFilter === 'all'
    ? bookings
    : bookings.filter(b => (b.status || '').toLowerCase() === bookingFilter.toLowerCase())

  const transactions = bookings.map(b => ({
    id: b.bookingId,
    date: new Date(b.visitDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    type: `Booking Payment — ${b.plotTitle}`,
    amount: b.totalAmount,
    status: b.paymentStatus === 'paid' ? 'Success' : (b.paymentStatus === 'failed' ? 'Failed' : 'Pending'),
    mode: (b.paymentMethod || 'upi').toUpperCase()
  }))

  const navItems = [
    { id: 'profile', label: 'Profile Settings', icon: UserIcon },
    { id: 'bookings', label: 'My Bookings', icon: Calendar, badge: bookings.length || null },
    { id: 'payments', label: 'Payments & Refunds', icon: CreditCard, badge: transactions.length || null },
    { id: 'help', label: 'Help & Support', icon: HelpCircle },
  ]

  const userInitial = (user?.name || user?.email || 'U')[0].toUpperCase()

  return (
    <>
      <Helmet>
        <title>User Dashboard — PicnicUtkal</title>
      </Helmet>

      <div className="container-fluid udash-container">
        {/* Top Hero Welcome Card */}
        <div className="udash-hero" style={{ padding: '24px 28px' }}>
          <div className="udash-user-badge">
            <div className="udash-avatar">{userInitial}</div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h1 className="heading-3" style={{ margin: 0, color: 'var(--cream)' }}>
                  {user?.name || (user?.email ? user.email.split('@')[0] : 'Valued Member')}
                </h1>
                <span className="badge badge-gold" style={{ fontSize: '11px' }}>
                  <Sparkles size={11} /> VERIFIED MEMBER
                </span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '4px 0 0' }}>
                {user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* 2-Column Responsive Dashboard Layout */}
        <div className="udash-layout">
          {/* Left Navigation Sidebar */}
          <div className="udash-sidebar">
            {navItems.map(item => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`udash-nav-btn ${isActive ? 'active' : ''}`}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Icon size={18} /> {item.label}
                  </span>
                  {item.badge !== undefined && (
                    <span className="badge badge-glass" style={{ fontSize: '11px', padding: '2px 8px', marginLeft: 'auto' }}>
                      {item.badge}
                    </span>
                  )}
                </button>
              )
            })}

            {user?.role === 'admin' && (
              <Link
                to="/admin/dashboard"
                className="udash-nav-btn"
                style={{ color: 'var(--gold)', borderColor: 'rgba(212, 175, 55, 0.3)', marginTop: '8px' }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <ShieldCheck size={18} /> Admin Console
                </span>
              </Link>
            )}
          </div>

          {/* Right Content Area */}
          <div className="udash-content-card">
            {activeTab === 'profile' && (
              <div style={{ width: '100%' }}>
                <h2 className="heading-4" style={{ marginBottom: '6px' }}>Personal Profile Details</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
                  Manage your personal account details, email address, and contact information.
                </p>

                <form onSubmit={handleProfileSave} style={{ display: 'flex', flexDirection: 'column', gap: '18px', width: '100%' }}>
                  <div className="input-wrapper" style={{ width: '100%' }}>
                    <label className="input-label">Full Name</label>
                    <input
                      type="text"
                      className="input"
                      style={{ width: '100%' }}
                      value={profileForm.name}
                      onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="input-wrapper" style={{ width: '100%' }}>
                    <label className="input-label">Email Address (Gmail)</label>
                    <input
                      type="email"
                      className="input"
                      style={{ width: '100%' }}
                      value={profileForm.email}
                      onChange={e => setProfileForm(f => ({ ...f, email: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="input-wrapper" style={{ width: '100%' }}>
                    <label className="input-label">Contact Phone Number</label>
                    <input
                      type="tel"
                      className="input"
                      style={{ width: '100%' }}
                      placeholder="10-digit mobile phone number"
                      maxLength={10}
                      value={profileForm.phone}
                      onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))}
                    />
                  </div>

                  <div style={{ marginTop: '12px' }}>
                    <button type="submit" className="btn btn-gold btn-lg" style={{ gap: '8px' }}>
                      <Save size={18} /> Save Profile Changes
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'bookings' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
                  <div>
                    <h2 className="heading-4" style={{ margin: 0 }}>My Spot Reservations</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '4px 0 0' }}>View active and past picnic spot bookings</p>
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    {['all', 'confirmed', 'completed'].map(f => (
                      <button
                        key={f}
                        onClick={() => setBookingFilter(f)}
                        className={`btn btn-sm ${bookingFilter === f ? 'btn-gold' : 'btn-ghost'}`}
                        style={{ textTransform: 'capitalize', fontSize: '12px' }}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {bookingsLoading ? (
                    <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)' }}>
                      <div style={{ fontSize: '28px', marginBottom: '10px' }}>⏳</div>
                      Loading your bookings…
                    </div>
                  ) : filteredBookings.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)', background: 'var(--bg-primary)', borderRadius: '16px', border: '1px dashed var(--border)' }}>
                      <div style={{ fontSize: '36px', marginBottom: '12px' }}>🎪</div>
                      <strong style={{ display: 'block', fontSize: '16px', color: 'var(--cream)', marginBottom: '6px' }}>No bookings yet</strong>
                      <p style={{ fontSize: '13px', margin: 0 }}>Book your first picnic spot to see it here.</p>
                    </div>
                  ) : (
                    filteredBookings.map(b => {
                      const visitDate = b.visitDate ? new Date(b.visitDate) : null
                      const dayName  = visitDate ? visitDate.toLocaleDateString('en-IN', { weekday: 'short' }) : ''
                      const dayNum   = visitDate ? visitDate.getDate() : ''
                      const monthName = visitDate ? visitDate.toLocaleDateString('en-IN', { month: 'short' }) : ''
                      const statusColor = b.status === 'confirmed' ? '#52b788' : b.status === 'cancelled' ? '#FA5252' : 'var(--text-muted)'
                      const statusLabel = b.status ? b.status.charAt(0).toUpperCase() + b.status.slice(1) : 'Pending'
                      return (
                        <div
                          key={b._id || b.bookingId}
                          className="udash-booking-card"
                          style={{
                            background: 'var(--bg-primary)',
                            border: '1px solid var(--border)',
                            borderRadius: '16px',
                            padding: '20px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '16px'
                          }}
                        >
                          {/* Calendar Badge */}
                          {visitDate && (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '12px', padding: '10px 14px', minWidth: '56px', textAlign: 'center', flexShrink: 0 }}>
                              <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{dayName}</span>
                              <span style={{ fontSize: '24px', fontWeight: 900, color: '#ffffff', lineHeight: 1.1 }}>{dayNum}</span>
                              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase' }}>{monthName}</span>
                            </div>
                          )}

                          <div style={{ flex: 1, minWidth: '220px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                              <span className="badge badge-gold" style={{ fontSize: '12px', fontWeight: 700 }}>
                                {b.bookingId}
                              </span>
                              <span
                                className="badge"
                                style={{
                                  background: `${statusColor}22`,
                                  color: statusColor,
                                  border: `1px solid ${statusColor}66`,
                                  fontSize: '11px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                <CheckCircle2 size={12} /> {statusLabel}
                              </span>
                            </div>

                            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--cream)', margin: '4px 0 6px' }}>
                              {b.plotTitle}
                            </h3>
                            <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'var(--gold)', flexWrap: 'wrap' }}>
                              <span>👥 <strong>{b.persons} Guest{b.persons > 1 ? 's' : ''}</strong></span>
                              <span>💳 via {(b.paymentMethod || 'UPI').toUpperCase()}</span>
                            </div>
                          </div>

                          <div className="udash-booking-right" style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                            <div>
                              <span style={{ fontSize: '22px', fontWeight: 800, color: 'var(--gold)' }}>
                                ₹{(b.totalAmount || 0).toLocaleString()}
                              </span>
                              <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>
                                {b.paymentStatus === 'paid' ? '✅ Paid' : b.paymentStatus === 'pending' ? '⏳ Pending' : '❌ Failed'}
                              </span>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', marginTop: '4px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                              <button
                                onClick={() => setSelectedTicketModal({
                                  id: b.bookingId,
                                  spotName: b.plotTitle,
                                  location: 'Barapita Master Plan Ground, Odisha',
                                  date: visitDate ? visitDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : '',
                                  guests: b.persons,
                                  paymentMethod: (b.paymentMethod || 'UPI').toUpperCase(),
                                  status: statusLabel,
                                  description: b.specialNote || 'Picnic ground spot reservation.',
                                  spotUrl: '/map'
                                })}
                                className="btn btn-gold btn-sm"
                                style={{ fontSize: '12px', gap: '6px' }}
                              >
                                <Ticket size={14} /> Ticket Details
                              </button>
                              <button
                                onClick={() => triggerDirectBillDownload(b)}
                                className="btn btn-outline btn-sm"
                                style={{ fontSize: '12px', gap: '6px' }}
                              >
                                <Receipt size={14} /> View Bill
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            )}

            {activeTab === 'payments' && (
              <div>
                <div style={{ marginBottom: '24px' }}>
                  <h2 className="heading-4" style={{ margin: 0 }}>Payments &amp; Refunds History</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '4px 0 0' }}>View past booking payments, receipts, and refund statuses</p>
                </div>

                {bookingsLoading ? (
                  <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)' }}>⏳ Loading transactions…</div>
                ) : transactions.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)', background: 'var(--bg-primary)', borderRadius: '16px', border: '1px dashed var(--border)' }}>
                    <div style={{ fontSize: '36px', marginBottom: '12px' }}>💳</div>
                    <strong style={{ display: 'block', fontSize: '16px', color: 'var(--cream)', marginBottom: '6px' }}>No transactions yet</strong>
                    <p style={{ fontSize: '13px', margin: 0 }}>Your payment history will appear here after your first booking.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {transactions.map(t => (
                      <div
                        key={t.id}
                        className="udash-txn-card"
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '18px 22px',
                          background: 'var(--bg-primary)',
                          borderRadius: '14px',
                          border: '1px solid var(--border)',
                          flexWrap: 'wrap',
                          gap: '12px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <div
                            style={{
                              width: '42px', height: '42px', borderRadius: '12px',
                              background: t.status === 'Refunded' ? 'rgba(59,130,246,0.15)' : 'rgba(82,183,136,0.15)',
                              color: t.status === 'Refunded' ? '#60a5fa' : '#52b788',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                            }}
                          >
                            <CreditCard size={20} />
                          </div>
                          <div>
                            <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--cream)', display: 'block' }}>{t.type}</span>
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px', display: 'block' }}>
                              Ref: <strong style={{ color: 'var(--gold)' }}>{t.id}</strong> · {t.date} · via {t.mode}
                            </span>
                          </div>
                        </div>

                        <div className="udash-txn-right" style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div>
                            <span style={{ fontWeight: 800, fontSize: '17px', color: t.status === 'Refunded' ? '#60a5fa' : 'var(--gold)', display: 'block' }}>
                              {t.status === 'Refunded' ? `+ ₹${(t.amount||0).toLocaleString()}` : `₹${(t.amount||0).toLocaleString()}`}
                            </span>
                            <span className="badge" style={{ background: t.status === 'Success' ? 'rgba(82,183,136,0.15)' : t.status === 'Refunded' ? 'rgba(59,130,246,0.15)' : 'rgba(255,165,0,0.15)', color: t.status === 'Success' ? '#52b788' : t.status === 'Refunded' ? '#60a5fa' : '#ffa500', border: '1px solid currentColor', fontSize: '11px', marginTop: '2px', display: 'inline-block' }}>
                              {t.status === 'Success' ? '✅ Paid' : t.status === 'Refunded' ? '🔄 Refunded' : '⏳ Pending'}
                            </span>
                          </div>
                          <button
                            onClick={() => setSelectedBillModal(t)}
                            className="btn btn-outline btn-sm"
                            style={{ fontSize: '12px', gap: '6px' }}
                          >
                            <Receipt size={14} /> View Bill
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'help' && (
              <div style={{ width: '100%' }}>
                <h2 className="heading-4" style={{ marginBottom: '6px' }}>Reservation Support &amp; Help Desk</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
                  Have questions about your booking or need custom ground arrangements? Contact our 24/7 Odisha support team.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: 'var(--bg-primary)', borderRadius: '14px', border: '1px solid var(--border)' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(212, 175, 55, 0.15)', color: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Phone size={24} />
                    </div>
                    <div>
                      <strong style={{ display: 'block', fontSize: '15px', color: 'var(--cream)' }}>Helpline Hotline</strong>
                      <span style={{ fontSize: '14px', color: 'var(--gold)', fontWeight: 700 }}>+91 98765 43210</span>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>Available 7 AM – 9 PM IST Daily</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: 'var(--bg-primary)', borderRadius: '14px', border: '1px solid var(--border)' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(82, 183, 136, 0.15)', color: '#52b788', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Mail size={24} />
                    </div>
                    <div>
                      <strong style={{ display: 'block', fontSize: '15px', color: 'var(--cream)' }}>Official Email Desk</strong>
                      <span style={{ fontSize: '14px', color: '#52b788', fontWeight: 700 }}>support@picnicutkal.com</span>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>Response within 2 hours</p>
                    </div>
                  </div>

                  <Link to="/contact" className="btn btn-gold btn-lg w-full" style={{ justifyContent: 'center', marginTop: '12px', gap: '8px' }}>
                    Open Contact &amp; Inquiry Page
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ticket Details Modal */}
      {selectedTicketModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#0d1f14', border: '1px solid rgba(212, 175, 55, 0.5)', borderRadius: '22px', width: '100%', maxWidth: '480px', padding: '24px', position: 'relative', boxShadow: '0 25px 60px rgba(0,0,0,0.75)', color: '#ffffff' }}>
            <button 
              onClick={() => setSelectedTicketModal(null)} 
              style={{ position: 'absolute', top: '14px', right: '14px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', cursor: 'pointer', zIndex: 10 }}
            >
              <X size={18} />
            </button>

            {/* Spot Image Preview Banner */}
            {selectedTicketModal.image && (
              <div style={{ width: '100%', height: '160px', borderRadius: '14px', overflow: 'hidden', marginBottom: '16px', position: 'relative', border: '1px solid rgba(255,255,255,0.1)' }}>
                <img src={selectedTicketModal.image} alt={selectedTicketModal.spotName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(13, 31, 20, 0.95), transparent)' }} />
                <span className="badge badge-gold" style={{ position: 'absolute', bottom: '12px', left: '12px', fontSize: '11px', padding: '4px 10px' }}>
                  E-TICKET ENTRY PASS
                </span>
              </div>
            )}

            <div style={{ textAlign: 'left', marginBottom: '16px' }}>
              <h3 style={{ margin: '0 0 6px', color: '#d4af37', fontSize: '20px', fontWeight: 700, lineHeight: 1.3 }}>
                {selectedTicketModal.spotName}
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={14} color="#d4af37" /> {selectedTicketModal.location}
              </p>
              {selectedTicketModal.description && (
                <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '13px', margin: 0, lineHeight: 1.5, background: 'rgba(255,255,255,0.06)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  {selectedTicketModal.description}
                </p>
              )}
            </div>

            <div style={{ background: 'rgba(0, 0, 0, 0.4)', borderRadius: '14px', padding: '16px', border: '1px solid rgba(255, 255, 255, 0.12)', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '13px' }}>
                <span style={{ color: 'rgba(255,255,255,0.65)' }}>Ticket Pass Ref ID:</span>
                <strong style={{ color: '#d4af37', fontFamily: 'monospace', fontSize: '14px' }}>#{selectedTicketModal.id}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '13px' }}>
                <span style={{ color: 'rgba(255,255,255,0.65)' }}>Visit Date:</span>
                <strong style={{ color: '#ffffff', fontWeight: 700 }}>{selectedTicketModal.date}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '13px' }}>
                <span style={{ color: 'rgba(255,255,255,0.65)' }}>Number of Guests:</span>
                <strong style={{ color: '#ffffff', fontWeight: 700 }}>{selectedTicketModal.guests} Visitors</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'rgba(255,255,255,0.65)' }}>Payment &amp; Status:</span>
                <strong style={{ color: '#52b788', fontWeight: 700 }}>{selectedTicketModal.paymentMethod} · {selectedTicketModal.status}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button 
                onClick={() => {
                  setSelectedTicketModal(null)
                  navigate(selectedTicketModal.spotUrl || '/spots')
                }}
                className="btn btn-gold w-full" 
                style={{ justifyContent: 'center', gap: '8px', padding: '12px', fontSize: '14px', fontWeight: 700 }} 
              >
                <ExternalLink size={16} /> View Full Spot Page &amp; Details
              </button>
              <button 
                onClick={() => {
                  if (selectedTicketModal.googleMapUrl) {
                    window.open(selectedTicketModal.googleMapUrl, '_blank')
                  } else {
                    setSelectedTicketModal(null)
                    navigate('/map')
                  }
                }}
                className="btn btn-outline w-full" 
                style={{ justifyContent: 'center', gap: '8px', padding: '11px', color: '#ffffff', borderColor: 'rgba(255,255,255,0.2)', fontSize: '13px' }} 
              >
                <MapPin size={15} color="#d4af37" /> Open Interactive Map Location
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bill Receipt Modal */}
      {selectedBillModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#0d1f14', border: '1px solid rgba(212, 175, 55, 0.5)', borderRadius: '22px', width: '100%', maxWidth: '480px', padding: '24px', position: 'relative', boxShadow: '0 25px 60px rgba(0,0,0,0.75)', color: '#ffffff' }}>
            <button 
              onClick={() => setSelectedBillModal(null)} 
              style={{ position: 'absolute', top: '14px', right: '14px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', cursor: 'pointer', zIndex: 10 }}
            >
              <X size={18} />
            </button>

            <div style={{ textAlign: 'center', borderBottom: '1px dashed rgba(255,255,255,0.15)', paddingBottom: '16px', marginBottom: '16px' }}>
              <span className="badge badge-gold" style={{ marginBottom: '8px', display: 'inline-block' }}>OFFICIAL BILL RECEIPT</span>
              <h3 style={{ margin: 0, color: '#ffffff', fontSize: '20px', fontWeight: 700 }}>PicnicUtkal Eco Tourism</h3>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', margin: '4px 0 0' }}>Bhubaneswar, Odisha · GSTIN: 21AAACP1234F1Z0</p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '10px' }}>
              <span style={{ color: 'rgba(255,255,255,0.65)' }}>Receipt Ref No:</span>
              <strong style={{ color: '#d4af37', fontFamily: 'monospace' }}>INV-{selectedBillModal.id}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '10px' }}>
              <span style={{ color: 'rgba(255,255,255,0.65)' }}>Billed To:</span>
              <strong style={{ color: '#ffffff' }}>{user?.name || user?.email}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '16px' }}>
              <span style={{ color: 'rgba(255,255,255,0.65)' }}>Date &amp; Time:</span>
              <strong style={{ color: '#ffffff' }}>{selectedBillModal.date}</strong>
            </div>

            <div style={{ background: 'rgba(0, 0, 0, 0.4)', borderRadius: '14px', padding: '16px', marginBottom: '20px', border: '1px solid rgba(255, 255, 255, 0.12)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px', fontWeight: 600 }}>
                <span style={{ color: '#ffffff' }}>{selectedBillModal.type}</span>
                <strong style={{ color: '#d4af37' }}>₹{selectedBillModal.amount.toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'rgba(255,255,255,0.65)', marginBottom: '8px' }}>
                <span>Payment Gateway ({selectedBillModal.mode})</span>
                <span>Included</span>
              </div>
              <hr style={{ borderColor: 'rgba(255,255,255,0.12)', margin: '10px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 800 }}>
                <span>Total Amount</span>
                <span style={{ color: selectedBillModal.status === 'Refunded' ? '#60a5fa' : '#52b788' }}>
                  {selectedBillModal.status === 'Refunded' ? `+ ₹${selectedBillModal.amount.toLocaleString()}` : `₹${selectedBillModal.amount.toLocaleString()}`}
                </span>
              </div>
            </div>

            <button onClick={() => window.print()} className="btn btn-gold w-full" style={{ justifyContent: 'center', gap: '8px', padding: '12px', fontSize: '14px', fontWeight: 700 }}>
              <Printer size={16} /> Print / Download Receipt
            </button>
          </div>
        </div>
      )}
    </>
  )
}
