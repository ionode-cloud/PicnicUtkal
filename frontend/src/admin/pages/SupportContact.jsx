import { useState, useEffect } from 'react'
import {
  LuMail as Mail,
  LuPhone as Phone,
  LuSearch as Search,
  LuClock as Clock,
  LuCircleCheck as CheckCircle,
  LuTrash2 as Trash2,
  LuSend as Send,
  LuRefreshCw as RefreshCw,
  LuInbox as Inbox
} from 'react-icons/lu'
import toast from 'react-hot-toast'
import { useSocket } from '../../context/SocketContext'

const DEFAULT_MESSAGES = [
  {
    _id: 'msg-101',
    name: 'Siddharth Patnaik',
    email: 'siddharth.p@gmail.com',
    phone: '+91 94370 99887',
    subject: 'Corporate Group Reservation Query',
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
    subject: 'Swimming Zone Facilities',
    message: 'Is swimming gear available for rent at the venue or should we bring our own life jackets?',
    status: 'Resolved',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString()
  }
]

export default function SupportContact() {
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('picnicutkal_admin_support_messages')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch (e) {}
    return DEFAULT_MESSAGES
  })

  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const { socket } = useSocket()

  // Fetch real messages from backend API on mount
  const fetchMessages = async () => {
    setLoading(true)
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5300'
      const res = await fetch(`${backendUrl}/api/contact`)
      const data = await res.json()
      if (res.ok && data.success && Array.isArray(data.data)) {
        setMessages(data.data)
      }
    } catch (err) {
      console.warn('Backend API connection offline, using cached messages.', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMessages()
  }, [])

  // Sync state to LocalStorage as safety fallback
  useEffect(() => {
    try {
      localStorage.setItem('picnicutkal_admin_support_messages', JSON.stringify(messages))
    } catch (e) {}
  }, [messages])

  // Real-time Socket.io listener for new user contact form submissions
  useEffect(() => {
    if (!socket) return

    const handleNewMessage = (newMsg) => {
      setMessages(prev => [newMsg, ...prev])
      toast.success(
        `📩 New Message from ${newMsg.name}: "${newMsg.message.substring(0, 35)}..."`,
        { duration: 6000, icon: '💬' }
      )
    }

    const handleStatusChanged = (updatedMsg) => {
      setMessages(prev => prev.map(m => m._id === updatedMsg._id ? updatedMsg : m))
    }

    socket.on('new_contact_message', handleNewMessage)
    socket.on('contact_message_status_changed', handleStatusChanged)

    return () => {
      socket.off('new_contact_message', handleNewMessage)
      socket.off('contact_message_status_changed', handleStatusChanged)
    }
  }, [socket])

  // Update status (Pending, Replied, Resolved)
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5300'
      await fetch(`${backendUrl}/api/contact/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
    } catch (e) {}

    setMessages(prev => prev.map(m => m._id === id ? { ...m, status: newStatus } : m))
    toast.success(`Message status updated to ${newStatus}`)
  }

  // Delete message
  const handleDeleteMessage = async (id, name) => {
    if (!window.confirm(`Delete inquiry message from "${name}"?`)) return
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5300'
      await fetch(`${backendUrl}/api/contact/${id}`, { method: 'DELETE' })
    } catch (e) {}

    setMessages(prev => prev.filter(m => m._id !== id))
    toast.success('Message deleted')
  }

  // Filter messages
  const filteredMessages = messages.filter(m => {
    const matchesSearch =
      m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.subject?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'All' || m.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return <span className="badge" style={{ background: 'rgba(245,159,0,0.15)', color: '#F59F00', border: '1px solid rgba(245,159,0,0.3)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> Pending</span>
      case 'Replied':
        return <span className="badge" style={{ background: 'rgba(34,139,230,0.15)', color: '#228BE6', border: '1px solid rgba(34,139,230,0.3)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Send size={12} /> Replied</span>
      case 'Resolved':
        return <span className="badge" style={{ background: 'rgba(47,158,68,0.15)', color: '#2F9E44', border: '1px solid rgba(47,158,68,0.3)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={12} /> Resolved</span>
      default:
        return <span className="badge badge-ghost">{status}</span>
    }
  }

  return (
    <div className="admin-dashboard-container animate-fade-in" style={{ padding: '0px 24px 48px' }}>
      
      {/* Top Banner */}
      <div className="admin-header-flex glass-card" style={{ marginTop: '15px', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', borderRadius: 'var(--radius-xl)' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '20px', background: 'rgba(201,168,76,0.15)', color: 'var(--gold)', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
            <Inbox size={14} /> Customer Support Desk
          </div>
          <h1 className="heading-2" style={{ fontSize: '26px' }}>Support & Contact Messages</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '2px' }}>
            Manage user inquiries submitted through the website Contact form in real-time.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={fetchMessages} className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
      </div>

      {/* Controls Bar: Search & Status Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', padding: '16px 20px', borderRadius: 'var(--radius-lg)', background: 'var(--bg-primary)', border: '1px solid var(--border)' }}>
        {/* Search */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '360px' }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="input"
            style={{ paddingLeft: '40px' }}
            placeholder="Search by name, email, message..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Status Filter Tabs */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto' }}>
          {['All', 'Pending', 'Replied', 'Resolved'].map(tab => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`btn btn-xs ${statusFilter === tab ? 'btn-gold' : 'btn-ghost'}`}
              style={{ padding: '6px 14px', fontSize: '12px', borderRadius: '20px' }}
            >
              {tab} {tab !== 'All' && `(${messages.filter(m => m.status === tab).length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Grid / Table */}
      <div>
        {filteredMessages.length === 0 ? (
          <div className="card glass-card" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Inbox size={40} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
            <h3 style={{ fontSize: '16px', fontWeight: 600 }}>No Messages Found</h3>
            <p style={{ fontSize: '13px', marginTop: '4px' }}>There are no contact messages matching your current filter criteria.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredMessages.map(msg => (
              <div
                key={msg._id}
                className="card glass-card"
                style={{
                  padding: '20px 24px',
                  borderLeft: `4px solid ${msg.status === 'Pending' ? '#F59F00' : msg.status === 'Replied' ? '#228BE6' : '#2F9E44'}`,
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(201,168,76,0.15)', color: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '16px' }}>
                      {msg.name ? msg.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>{msg.name}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px', flexWrap: 'wrap' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Mail size={13} /> {msg.email}</span>
                        {msg.phone && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Phone size={13} /> {msg.phone}</span>}
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Clock size={13} /> {new Date(msg.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {getStatusBadge(msg.status)}

                    {/* Status Dropdown */}
                    <select
                      value={msg.status}
                      onChange={e => handleUpdateStatus(msg._id, e.target.value)}
                      className="input"
                      style={{ padding: '4px 10px', fontSize: '12px', width: 'auto', borderRadius: 'var(--radius-md)' }}
                    >
                      <option value="Pending">Set Pending</option>
                      <option value="Replied">Set Replied</option>
                      <option value="Resolved">Set Resolved</option>
                    </select>

                    {/* Mailto button */}
                    <a
                      href={`mailto:${msg.email}?subject=Re: PicnicUtkal Inquiry — ${msg.subject || 'Support Request'}&body=Hi ${msg.name},%0D%0A%0D%0AThank you for reaching out to PicnicUtkal.%0D%0A%0D%0AIn response to your inquiry:%0D%0A> "${msg.message}"%0D%0A%0D%0A`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline btn-xs"
                      title="Reply via Email"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Send size={12} /> Reply Email
                    </a>

                    {/* Delete */}
                    <button
                      onClick={() => handleDeleteMessage(msg._id, msg.name)}
                      className="btn btn-ghost btn-xs"
                      style={{ color: 'var(--error)' }}
                      title="Delete Message"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Message Box */}
                <div style={{ padding: '14px 16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border)', fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  {msg.subject && (
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px', fontSize: '13px' }}>
                      Subject: {msg.subject}
                    </div>
                  )}
                  <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{msg.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
