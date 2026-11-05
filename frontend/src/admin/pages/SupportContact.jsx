import { useState, useEffect, useMemo } from 'react'
import {
  LuMail as Mail,
  LuPhone as Phone,
  LuSearch as Search,
  LuClock as Clock,
  LuCircleCheck as CheckCircle,
  LuTrash2 as Trash2,
  LuSend as Send,
  LuRefreshCw as RefreshCw,
  LuInbox as Inbox,
  LuUsers as Users,
  LuMessageCircle as MessageCircle,
  LuEye as Eye,
  LuX as X,
  LuCheck as Check,
  LuArrowUpDown as ArrowUpDown
} from 'react-icons/lu'
import toast from 'react-hot-toast'
import { useSocket } from '../../context/SocketContext'
import api from '../../services/api'

const DEFAULT_MESSAGES = [
  {
    _id: 'msg-101',
    name: 'Siddharth Patnaik',
    email: 'siddharth.p@gmail.com',
    phone: '+91 94370 99887',
    subject: 'Corporate & Group Reservation Query',
    message: 'Hello, we are planning a corporate retreat for 45 employees next weekend at Barapita Picnic Ground. Do you offer custom catering packages and DJ equipment setups?',
    status: 'Pending',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    _id: 'msg-102',
    name: 'Manami Ray',
    email: 'manami.ray@outlook.com',
    phone: '+91 98612 34567',
    subject: 'Booking Reschedule Request',
    message: 'I have booked Cottage Rooms for Aug 20th under reference BK-928342. Can I reschedule it to Aug 22nd due to weather conditions?',
    status: 'Replied',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    _id: 'msg-103',
    name: 'Pradeep Jena',
    email: 'pradeep.jena@yahoo.com',
    phone: '+91 99380 11223',
    subject: 'Spot / Zone Availability Question',
    message: 'Is swimming gear available for rent at the venue or should we bring our own life jackets?',
    status: 'Resolved',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString()
  }
]

export default function SupportContact() {
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('picnicutkal_admin_support_messages')
      if (saved !== null) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch (e) {}
    return DEFAULT_MESSAGES
  })

  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10
  const { socket } = useSocket()

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setSelectedMessage(null)
    }
    if (selectedMessage) {
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedMessage])

  // Fetch real messages from backend API
  const fetchMessages = async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const res = await api.get('/contact')
      if (res.data && res.data.success && Array.isArray(res.data.data)) {
        const serverMsgs = res.data.data
        setMessages(prev => {
          if (serverMsgs.length > 0) {
            const serverIds = new Set(serverMsgs.map(m => m._id || m.id))
            const localOnly = prev.filter(m => {
              const id = m._id || m.id
              return id && !serverIds.has(id) && !id.startsWith('msg-10')
            })
            return [...localOnly, ...serverMsgs]
          }
          return prev.length > 0 ? prev : DEFAULT_MESSAGES
        })
      }
    } catch (err) {
      console.warn('Backend API connection offline, utilizing locally cached messages.', err?.message)
    } finally {
      if (!silent) setLoading(false)
    }
  }

  useEffect(() => {
    fetchMessages()
  }, [])

  // Sync state to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('picnicutkal_admin_support_messages', JSON.stringify(messages))
    } catch (e) {}
  }, [messages])

  // Real-time Listeners: Socket.io + Cross-tab window storage + Custom events
  useEffect(() => {
    const handleNewMessage = (newMsg) => {
      if (!newMsg) return
      const msgId = newMsg._id || newMsg.id || `msg-${Date.now()}`
      const normalizedMsg = { ...newMsg, _id: msgId }

      setMessages(prev => {
        if (prev.some(m => (m._id || m.id) === msgId)) return prev
        return [normalizedMsg, ...prev]
      })

      toast.success(
        `📩 New Contact Inquiry from ${normalizedMsg.name}: "${(normalizedMsg.message || '').substring(0, 35)}..."`,
        { duration: 7000, icon: '💬' }
      )
    }

    const handleStatusChanged = (updatedMsg) => {
      if (!updatedMsg) return
      const id = updatedMsg._id || updatedMsg.id
      setMessages(prev => prev.map(m => (m._id || m.id) === id ? { ...m, ...updatedMsg } : m))
      if (selectedMessage && (selectedMessage._id === id || selectedMessage.id === id)) {
        setSelectedMessage(prev => ({ ...prev, ...updatedMsg }))
      }
    }

    const handleDeleted = (data) => {
      const id = data?.id || data?._id
      if (id) {
        setMessages(prev => prev.filter(m => (m._id || m.id) !== id))
        if (selectedMessage && (selectedMessage._id === id || selectedMessage.id === id)) {
          setSelectedMessage(null)
        }
      }
    }

    const handleStorage = (e) => {
      if (!e.key || e.key === 'picnicutkal_admin_support_messages') {
        try {
          const fresh = JSON.parse(localStorage.getItem('picnicutkal_admin_support_messages') || '[]')
          if (Array.isArray(fresh) && fresh.length > 0) {
            setMessages(fresh)
          }
        } catch (err) {}
      }
    }

    const handleCustomSubmission = (e) => {
      if (e.detail) {
        handleNewMessage(e.detail)
      }
    }

    if (socket) {
      socket.on('new_contact_message', handleNewMessage)
      socket.on('contact_message_status_changed', handleStatusChanged)
      socket.on('contact_message_deleted', handleDeleted)
    }

    window.addEventListener('storage', handleStorage)
    window.addEventListener('picnic_contact_submission', handleCustomSubmission)

    return () => {
      if (socket) {
        socket.off('new_contact_message', handleNewMessage)
        socket.off('contact_message_status_changed', handleStatusChanged)
        socket.off('contact_message_deleted', handleDeleted)
      }
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('picnic_contact_submission', handleCustomSubmission)
    }
  }, [socket, selectedMessage])

  // Update status (Pending, Replied, Resolved)
  const handleUpdateStatus = async (id, newStatus) => {
    setMessages(prev => prev.map(m => (m._id || m.id) === id ? { ...m, status: newStatus } : m))
    if (selectedMessage && (selectedMessage._id === id || selectedMessage.id === id)) {
      setSelectedMessage(prev => ({ ...prev, status: newStatus }))
    }
    toast.success(`Message status updated to ${newStatus}`)

    try {
      await api.put(`/contact/${id}`, { status: newStatus })
    } catch (e) {
      console.warn('Backend update error, kept in local state:', e?.response?.data?.message || e.message)
    }
  }

  // Delete message
  const handleDeleteMessage = async (id, name, e) => {
    if (e) e.stopPropagation()
    if (!window.confirm(`Delete inquiry message from "${name || 'User'}"?`)) return

    setMessages(prev => prev.filter(m => (m._id || m.id) !== id))
    if (selectedMessage && (selectedMessage._id === id || selectedMessage.id === id)) {
      setSelectedMessage(null)
    }
    toast.success('Message deleted')

    try {
      await api.delete(`/contact/${id}`)
    } catch (e) {
      console.warn('Backend delete error, kept locally removed:', e?.response?.data?.message || e.message)
    }
  }

  // Filter messages
  const filteredMessages = useMemo(() => {
    return messages.filter(m => {
      const q = searchTerm.toLowerCase()
      const matchesSearch =
        !searchTerm ||
        m.name?.toLowerCase().includes(q) ||
        m.email?.toLowerCase().includes(q) ||
        m.phone?.toLowerCase().includes(q) ||
        m.message?.toLowerCase().includes(q) ||
        m.subject?.toLowerCase().includes(q)

      let matchesStatus = true
      if (statusFilter === 'Group Bookings') {
        matchesStatus =
          (m.subject && /group|corporate|event|retreat|pandal|catering/i.test(m.subject)) ||
          (m.message && /group|corporate|members|employees|people|guests|catering|pandal/i.test(m.message))
      } else if (statusFilter !== 'All') {
        matchesStatus = m.status === statusFilter
      }

      return matchesSearch && matchesStatus
    })
  }, [messages, searchTerm, statusFilter])

  // Reset page when filter or search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter])

  const totalPages = Math.ceil(filteredMessages.length / pageSize) || 1
  const paginatedMessages = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredMessages.slice(start, start + pageSize)
  }, [filteredMessages, currentPage, pageSize])

  const counts = useMemo(() => {
    const pending = messages.filter(m => m.status === 'Pending').length
    const replied = messages.filter(m => m.status === 'Replied').length
    const resolved = messages.filter(m => m.status === 'Resolved').length
    const groups = messages.filter(m =>
      (m.subject && /group|corporate|event|retreat|pandal|catering/i.test(m.subject)) ||
      (m.message && /group|corporate|members|employees|people|guests|catering|pandal/i.test(m.message))
    ).length
    return { all: messages.length, pending, replied, resolved, groups }
  }, [messages])

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return <span className="badge" style={{ background: 'rgba(245,159,0,0.15)', color: '#F59F00', border: '1px solid rgba(245,159,0,0.3)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Clock size={11} /> Pending</span>
      case 'Replied':
        return <span className="badge" style={{ background: 'rgba(34,139,230,0.15)', color: '#228BE6', border: '1px solid rgba(34,139,230,0.3)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Send size={11} /> Replied</span>
      case 'Resolved':
        return <span className="badge" style={{ background: 'rgba(47,158,68,0.15)', color: '#2F9E44', border: '1px solid rgba(47,158,68,0.3)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={11} /> Resolved</span>
      default:
        return <span className="badge badge-ghost">{status}</span>
    }
  }

  const isGroupInquiry = (msg) => {
    return (
      (msg.subject && /group|corporate|event|retreat|pandal|catering/i.test(msg.subject)) ||
      (msg.message && /group|corporate|members|employees|people|guests|catering|pandal/i.test(msg.message))
    )
  }

  return (
    <div className="admin-dashboard-container animate-fade-in" style={{ padding: '0px 24px 48px' }}>
      
      {/* Top Banner */}
      <div className="admin-header-flex glass-card" style={{ marginTop: '15px', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', borderRadius: 'var(--radius-xl)' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '20px', background: 'rgba(201,168,76,0.15)', color: 'var(--gold)', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
            <Inbox size={14} /> Customer Support & Group Bookings Desk
          </div>
          <h1 className="heading-2" style={{ fontSize: '26px' }}>Support & Contact Inquiries</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '2px' }}>
            View, filter, and reply to all user inquiries and corporate group reservation queries in table format.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => fetchMessages(false)} className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> {loading ? 'Syncing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Controls Bar: Search & Status Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', padding: '16px 20px', borderRadius: 'var(--radius-lg)', background: 'var(--bg-primary)', border: '1px solid var(--border)', marginTop: '20px' }}>
        
        {/* Search */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '360px' }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="input"
            style={{ paddingLeft: '40px' }}
            placeholder="Search by name, email, phone, message..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Status Filter Tabs */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', flexWrap: 'wrap' }}>
          {[
            { id: 'All', label: `All (${counts.all})` },
            { id: 'Pending', label: `Pending (${counts.pending})` },
            { id: 'Group Bookings', label: `⭐ Group Bookings (${counts.groups})` },
            { id: 'Replied', label: `Replied (${counts.replied})` },
            { id: 'Resolved', label: `Resolved (${counts.resolved})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`btn btn-xs ${statusFilter === tab.id ? 'btn-gold' : 'btn-ghost'}`}
              style={{ padding: '6px 14px', fontSize: '12px', borderRadius: '20px' }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Inquiries Table */}
      <div className="admin-table-scroll-wrapper" style={{ marginTop: '20px' }}>
        <table className="admin-table-view">
          <thead>
            <tr>
              <th style={{ width: '180px' }}>Customer / Sender</th>
              <th style={{ width: '160px' }}>Phone / WhatsApp</th>
              <th style={{ width: '220px' }}>Inquiry Type / Subject</th>
              <th>Message Snippet</th>
              <th style={{ width: '140px' }}>Date & Time</th>
              <th style={{ width: '150px' }}>Status</th>
              <th style={{ width: '160px', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                  ⏳ Loading inquiries from server…
                </td>
              </tr>
            ) : paginatedMessages.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                  <Inbox size={36} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
                  <div style={{ fontWeight: 600, fontSize: '15px' }}>No inquiries found</div>
                  <div style={{ fontSize: '13px', marginTop: '4px' }}>
                    {searchTerm || statusFilter !== 'All' ? 'Try adjusting your search query or status filter.' : 'Inquiries submitted by visitors will show up here.'}
                  </div>
                  {(searchTerm || statusFilter !== 'All') && (
                    <button
                      onClick={() => { setSearchTerm(''); setStatusFilter('All'); }}
                      className="btn btn-outline btn-xs"
                      style={{ marginTop: '12px' }}
                    >
                      Reset Filters
                    </button>
                  )}
                </td>
              </tr>
            ) : (
              paginatedMessages.map(msg => {
                const msgId = msg._id || msg.id
                const isGroup = isGroupInquiry(msg)
                const cleanPhone = msg.phone ? msg.phone.replace(/[^0-9]/g, '') : ''
                const snippet = msg.message?.length > 70 ? `${msg.message.substring(0, 70)}...` : msg.message

                return (
                  <tr
                    key={msgId}
                    onClick={() => setSelectedMessage(msg)}
                    className="table-row-clickable"
                    style={{
                      cursor: 'pointer',
                      background: isGroup ? 'rgba(201,168,76,0.03)' : 'transparent',
                      borderLeft: `4px solid ${msg.status === 'Pending' ? '#F59F00' : msg.status === 'Replied' ? '#228BE6' : '#2F9E44'}`
                    }}
                  >
                    {/* Customer */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: isGroup ? 'rgba(201,168,76,0.25)' : 'rgba(201,168,76,0.12)', color: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px', flexShrink: 0 }}>
                          {msg.name ? msg.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                          <span style={{ fontWeight: 700, fontSize: '13.5px', color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                            {msg.name || 'Anonymous User'}
                          </span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '11.5px', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                            {msg.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Phone / WhatsApp */}
                    <td>
                      {msg.phone ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '12.5px', color: 'var(--text-primary)', fontWeight: 500 }}>
                            {msg.phone}
                          </span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>—</span>
                      )}
                    </td>

                    {/* Inquiry Type / Subject */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {msg.subject || 'Support & Group Inquiry'}
                        </span>
                        {isGroup && (
                          <span className="badge" style={{ background: 'rgba(201,168,76,0.18)', color: 'var(--gold-dark)', border: '1px solid rgba(201,168,76,0.35)', fontSize: '10.5px', padding: '1px 6px', width: 'fit-content', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            <Users size={10} /> Group Booking
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Message Snippet */}
                    <td style={{ maxWidth: '320px' }}>
                      <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.4' }}>
                        {snippet}
                      </span>
                    </td>

                    {/* Date */}
                    <td>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={11} /> {msg.createdAt ? new Date(msg.createdAt).toLocaleDateString() : 'Today'}
                      </div>
                      <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                        {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </div>
                    </td>

                    {/* Status with quick selector */}
                    <td onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {getStatusBadge(msg.status)}
                        <select
                          value={msg.status}
                          onChange={e => handleUpdateStatus(msgId, e.target.value)}
                          className="input"
                          style={{ padding: '2px 6px', fontSize: '11px', height: '24px', borderRadius: '4px', background: 'var(--bg-card)' }}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Replied">Replied</option>
                          <option value="Resolved">Resolved</option>
                        </select>
                      </div>
                    </td>

                    {/* Actions */}
                    <td onClick={e => e.stopPropagation()} style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', alignItems: 'center' }}>
                        
                        {/* View full message */}
                        <button
                          onClick={() => setSelectedMessage(msg)}
                          className="btn btn-ghost btn-xs"
                          title="View Full Details"
                          style={{ padding: '4px 6px' }}
                        >
                          <Eye size={14} />
                        </button>

                        {/* WhatsApp direct link */}
                        {cleanPhone && (
                          <a
                            href={`https://wa.me/${cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`}?text=Hello%20${encodeURIComponent(msg.name)},%20thank%20you%20for%20contacting%20PicnicUtkal!%20Regarding%20your%20inquiry:`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline btn-xs"
                            title="Chat on WhatsApp"
                            style={{ padding: '4px 6px', borderColor: '#25D366', color: '#25D366' }}
                          >
                            <MessageCircle size={14} />
                          </a>
                        )}

                        {/* Mailto button */}
                        <a
                          href={`mailto:${msg.email}?subject=Re: PicnicUtkal Inquiry — ${encodeURIComponent(msg.subject || 'Support Request')}&body=Hi ${encodeURIComponent(msg.name)},%0D%0A%0D%0AThank you for reaching out to PicnicUtkal.%0D%0A%0D%0AIn response to your inquiry:%0D%0A> "${encodeURIComponent(msg.message)}"%0D%0A%0D%0A`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline btn-xs"
                          title="Reply via Email"
                          style={{ padding: '4px 6px' }}
                        >
                          <Send size={13} />
                        </a>

                        {/* Delete button */}
                        <button
                          onClick={(e) => handleDeleteMessage(msgId, msg.name, e)}
                          className="btn btn-ghost btn-xs"
                          style={{ color: 'var(--error)', padding: '4px 6px' }}
                          title="Delete Inquiry"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      {filteredMessages.length > pageSize && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredMessages.length)} of {filteredMessages.length} inquiries
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="btn btn-outline btn-xs"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`btn btn-xs ${currentPage === i + 1 ? 'btn-gold' : 'btn-ghost'}`}
                style={{ minWidth: '28px' }}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="btn btn-outline btn-xs"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Detail Modal: Full Inquiry View */}
      {selectedMessage && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            backdropFilter: 'blur(4px)'
          }}
          onClick={() => setSelectedMessage(null)}
        >
          <div
            className="glass-card animate-fade-in"
            style={{
              width: '100%',
              maxWidth: '640px',
              maxHeight: '90vh',
              overflowY: 'auto',
              borderRadius: 'var(--radius-xl)',
              padding: '28px',
              position: 'relative',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span className="badge badge-gold" style={{ fontSize: '11px' }}>Inquiry Details</span>
                  {isGroupInquiry(selectedMessage) && (
                    <span className="badge" style={{ background: 'rgba(201,168,76,0.2)', color: 'var(--gold-dark)', border: '1px solid rgba(201,168,76,0.4)', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Users size={11} /> Group / Corporate
                    </span>
                  )}
                  {getStatusBadge(selectedMessage.status)}
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  {selectedMessage.subject || 'Customer Support Request'}
                </h2>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Submitted on {selectedMessage.createdAt ? new Date(selectedMessage.createdAt).toLocaleString() : 'Recent'}
                </div>
              </div>

              <button
                onClick={() => setSelectedMessage(null)}
                className="btn btn-ghost btn-sm"
                style={{ borderRadius: '50%', padding: '6px' }}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Sender Info Card */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', padding: '16px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', marginBottom: '20px', border: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Customer Name</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>{selectedMessage.name}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Email Address</div>
                <div style={{ fontSize: '13px', color: 'var(--text-primary)', marginTop: '2px', wordBreak: 'break-all' }}>{selectedMessage.email}</div>
              </div>
              {selectedMessage.phone && (
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Phone / WhatsApp</div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>{selectedMessage.phone}</div>
                </div>
              )}
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Status</div>
                <div style={{ marginTop: '4px' }}>
                  <select
                    value={selectedMessage.status}
                    onChange={e => handleUpdateStatus(selectedMessage._id || selectedMessage.id, e.target.value)}
                    className="input"
                    style={{ padding: '4px 8px', fontSize: '12px', height: '28px', borderRadius: '4px' }}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Replied">Replied</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Full Message Body */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '8px' }}>
                Full Message Content
              </div>
              <div style={{ padding: '16px 20px', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border)', fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>
                {selectedMessage.message}
              </div>
            </div>

            {/* Quick Actions Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
              <button
                onClick={(e) => handleDeleteMessage(selectedMessage._id || selectedMessage.id, selectedMessage.name, e)}
                className="btn btn-ghost btn-sm"
                style={{ color: 'var(--error)', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Trash2 size={14} /> Delete
              </button>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {selectedMessage.phone && (
                  <a
                    href={`https://wa.me/${selectedMessage.phone.replace(/[^0-9]/g, '').startsWith('91') ? selectedMessage.phone.replace(/[^0-9]/g, '') : `91${selectedMessage.phone.replace(/[^0-9]/g, '')}`}?text=Hello%20${encodeURIComponent(selectedMessage.name)},%20thank%20you%20for%20contacting%20PicnicUtkal!%20Regarding%20your%20inquiry:`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline btn-sm"
                    style={{ borderColor: '#25D366', color: '#25D366', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <MessageCircle size={14} /> Chat on WhatsApp
                  </a>
                )}

                <a
                  href={`mailto:${selectedMessage.email}?subject=Re: PicnicUtkal Inquiry — ${encodeURIComponent(selectedMessage.subject || 'Support Request')}&body=Hi ${encodeURIComponent(selectedMessage.name)},%0D%0A%0D%0AThank you for reaching out to PicnicUtkal.%0D%0A%0D%0AIn response to your inquiry:%0D%0A> "${encodeURIComponent(selectedMessage.message)}"%0D%0A%0D%0A`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-gold btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Send size={14} /> Reply via Email
                </a>

                <button
                  onClick={() => setSelectedMessage(null)}
                  className="btn btn-outline btn-sm"
                >
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
