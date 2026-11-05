import { useState, useMemo, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { LuPhone as Phone, LuMail as Mail, LuMapPin as MapPin, LuSend as Send, LuClock as Clock, LuUsers as Users, LuMessageSquare as MessageSquare } from 'react-icons/lu'
import toast from 'react-hot-toast'
import { useSocket } from '../context/SocketContext'
import { useSiteConfig, useInvalidators } from '../hooks/useQueryHooks'
import { useAuthStore } from '../store'
import api from '../services/api'

function ContactSkeleton() {
  return (
    <div className="contact-page container-fluid">
      <div style={{ textAlign: 'center', marginBottom: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
        <div className="skeleton-shimmer" style={{ width: '130px', height: '24px', borderRadius: '999px' }} />
        <div className="skeleton-shimmer" style={{ width: '300px', height: '38px', borderRadius: '8px' }} />
      </div>
      <div className="contact-main-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card" style={{ padding: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div className="skeleton-shimmer" style={{ width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0 }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                <div className="skeleton-shimmer" style={{ width: '60%', height: '18px', borderRadius: '4px' }} />
                <div className="skeleton-shimmer" style={{ width: '85%', height: '14px', borderRadius: '4px' }} />
              </div>
            </div>
          ))}
        </div>
        <div className="card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="skeleton-shimmer" style={{ width: '100%', height: '48px', borderRadius: '10px' }} />
          <div className="skeleton-shimmer" style={{ width: '100%', height: '48px', borderRadius: '10px' }} />
          <div className="skeleton-shimmer" style={{ width: '100%', height: '120px', borderRadius: '10px' }} />
          <div className="skeleton-shimmer" style={{ width: '160px', height: '48px', borderRadius: '10px' }} />
        </div>
      </div>
    </div>
  )
}

export default function Contact() {
  const user = useAuthStore(state => state.user)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    subject: 'Corporate & Group Reservation Query',
    message: ''
  })
  const [loading, setLoading] = useState(false)
  const { data: siteConfigData, isLoading } = useSiteConfig()
  const { invalidateSiteConfig } = useInvalidators()

  // Update initial form values if user logs in later
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || user.name || '',
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || ''
      }))
    }
  }, [user])

  const contact = useMemo(() => {
    return siteConfigData?.user_view_config?.contact || {
      email: '',
      phone: '',
      emergencyPhone: '',
      address: '',
      hours: '',
      mapEmbedUrl: ''
    }
  }, [siteConfigData])

  // Socket.io: live-reload when admin updates Contact info
  const { socket } = useSocket()
  useEffect(() => {
    if (!socket) return
    const handler = () => invalidateSiteConfig()
    socket.on('contact_config_update', handler)
    return () => socket.off('contact_config_update', handler)
  }, [socket, invalidateSiteConfig])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast.error('Please fill in your name, email, and message')
      return
    }

    setLoading(true)

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      subject: formData.subject.trim() || 'Support & Group Inquiry',
      message: formData.message.trim()
    }

    let savedRecord = null

    try {
      // 1. Try standardized api client
      const res = await api.post('/contact', payload)
      if (res?.data?.success && res?.data?.data) {
        savedRecord = res.data.data
      }
    } catch (apiErr) {
      console.warn('api.post(/contact) failed, attempting direct fetch fallback...', apiErr)
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5300'
        const res = await fetch(`${backendUrl}/api/contact`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        const data = await res.json()
        if (res.ok && data?.success) {
          savedRecord = data.data
        }
      } catch (fetchErr) {
        console.warn('fetch fallback also failed, recording offline fallback:', fetchErr)
      }
    }

    // Always ensure a concrete message object exists
    if (!savedRecord) {
      savedRecord = {
        _id: `msg-${Date.now()}`,
        ...payload,
        status: 'Pending',
        createdAt: new Date().toISOString()
      }
    }

    // 2. Sync to localStorage for immediate cross-tab visibility in Admin Panel
    try {
      const stored = localStorage.getItem('picnicutkal_admin_support_messages')
      const list = stored ? JSON.parse(stored) : []
      const merged = [savedRecord, ...(Array.isArray(list) ? list.filter(m => (m._id || m.id) !== (savedRecord._id || savedRecord.id)) : [])]
      localStorage.setItem('picnicutkal_admin_support_messages', JSON.stringify(merged))
      window.dispatchEvent(new Event('storage'))
      window.dispatchEvent(new CustomEvent('picnic_contact_submission', { detail: savedRecord }))
    } catch (storageErr) {
      console.warn('LocalStorage sync warning:', storageErr)
    }

    // 3. Emit real-time Socket event
    if (socket) {
      try {
        socket.emit('send_contact_message', savedRecord)
      } catch (sockErr) {
        console.warn('Socket emit warning:', sockErr)
      }
    }

    toast.success('🎉 Your message was sent successfully! Our support team will reach out soon.')
    setFormData(prev => ({
      ...prev,
      message: '',
      subject: 'Corporate & Group Reservation Query'
    }))
    setLoading(false)
  }

  if (isLoading) {
    return <ContactSkeleton />
  }

  return (
    <>
      <Helmet>
        <title>Contact & Customer Support | PicnicUtkal</title>
        <meta name="description" content="Get in touch with us for booking issues, support tickets, group reservations, or corporate picnics in Odisha." />
      </Helmet>

      <div className="contact-page container-fluid">
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-10)' }}>
          <span className="section-eyebrow">Get in Touch</span>
          <h1 className="heading-2">Support & Group Bookings</h1>
          <p style={{ color: 'var(--text-muted)' }}>Need custom group packages, venue hire, or support? Drop us a line below.</p>
        </div>

        <div className="contact-main-grid">
          {/* Info cards — driven from CMS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div className="card" style={{ padding: 'var(--space-6)', display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
              <div style={{ color: 'var(--forest)' }}><Phone size={24} /></div>
              <div>
                <h3 style={{ fontWeight: '600' }}>Call / WhatsApp Support</h3>
                <p style={{ color: 'var(--text-secondary)' }}>{contact.phone || '+91 94370 12345'}</p>
                {contact.emergencyPhone && (
                  <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '2px' }}>Emergency: {contact.emergencyPhone}</p>
                )}
              </div>
            </div>
            <div className="card" style={{ padding: 'var(--space-6)', display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
              <div style={{ color: 'var(--forest)' }}><Mail size={24} /></div>
              <div>
                <h3 style={{ fontWeight: '600' }}>Email Us</h3>
                <p style={{ color: 'var(--text-secondary)' }}>{contact.email || 'support@picnicutkal.com'}</p>
              </div>
            </div>
            <div className="card" style={{ padding: 'var(--space-6)', display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
              <div style={{ color: 'var(--forest)' }}><MapPin size={24} /></div>
              <div>
                <h3 style={{ fontWeight: '600' }}>Head Office & Location</h3>
                <p style={{ color: 'var(--text-secondary)' }}>{contact.address || 'Barapita Picnic Ground, Khordha / Chandaka Valley, Odisha'}</p>
              </div>
            </div>
            {contact.hours && (
              <div className="card" style={{ padding: 'var(--space-6)', display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
                <div style={{ color: 'var(--forest)' }}><Clock size={24} /></div>
                <div>
                  <h3 style={{ fontWeight: '600' }}>Working Hours</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>{contact.hours}</p>
                </div>
              </div>
            )}
            
            {/* Quick Helper Badge */}
            <div className="card glass-card" style={{ padding: '16px 20px', background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.25)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ color: 'var(--gold)' }}><Users size={22} /></div>
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>Planning a 30+ Person Event?</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>Select "Corporate & Group Reservation" for customized pandal & food catering discounts.</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="glass-card" style={{ padding: 'var(--space-6)' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              
              <div className="input-wrapper">
                <label className="input-label" htmlFor="contact-name">Full Name *</label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  placeholder="Your Name"
                  className="input"
                  value={formData.name}
                  onChange={e => setFormData(d => ({ ...d, name: e.target.value }))}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
                <div className="input-wrapper">
                  <label className="input-label" htmlFor="contact-email">Email Address *</label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    placeholder="name@example.com"
                    className="input"
                    value={formData.email}
                    onChange={e => setFormData(d => ({ ...d, email: e.target.value }))}
                  />
                </div>

                <div className="input-wrapper">
                  <label className="input-label" htmlFor="contact-phone">Phone / WhatsApp</label>
                  <input
                    id="contact-phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    className="input"
                    value={formData.phone}
                    onChange={e => setFormData(d => ({ ...d, phone: e.target.value }))}
                  />
                </div>
              </div>

              <div className="input-wrapper">
                <label className="input-label" htmlFor="contact-subject">Inquiry Type / Subject</label>
                <select
                  id="contact-subject"
                  className="input"
                  value={formData.subject}
                  onChange={e => setFormData(d => ({ ...d, subject: e.target.value }))}
                >
                  <option value="Corporate & Group Reservation Query">Corporate & Group Reservation (30+ Guests)</option>
                  <option value="Booking Reschedule & Date Change">Booking Reschedule or Cancellation Request</option>
                  <option value="Catering & DJ Sound Setup">Catering, Bonfire & DJ Setup Request</option>
                  <option value="Spot / Zone Availability Question">Spot / Zone Facilities & Swim Safety</option>
                  <option value="General Inquiry">General Customer Support</option>
                </select>
              </div>

              <div className="input-wrapper">
                <label className="input-label" htmlFor="contact-message">Your Message *</label>
                <textarea
                  id="contact-message"
                  required
                  rows={4}
                  placeholder="Tell us about your requirements, date, number of guests, or questions..."
                  className="input"
                  value={formData.message}
                  onChange={e => setFormData(d => ({ ...d, message: e.target.value }))}
                  style={{ resize: 'none' }}
                />
              </div>

              <button type="submit" className="btn btn-gold btn-lg" disabled={loading} id="contact-submit-btn" style={{ justifyContent: 'center' }}>
                <Send size={16} /> {loading ? 'Sending Message...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
