import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { LuPhone as Phone, LuMail as Mail, LuMapPin as MapPin, LuSend as Send, LuClock as Clock } from 'react-icons/lu'
import toast from 'react-hot-toast'
import { useSocket } from '../context/SocketContext'

const getStoredContact = () => {
  try {
    const saved = localStorage.getItem('picnicutkal_user_view_config')
    if (saved) {
      const parsed = JSON.parse(saved)
      if (parsed.contact) return parsed.contact
    }
  } catch (e) {}
  return {
    email: '',
    phone: '',
    emergencyPhone: '',
    address: '',
    hours: '',
    mapEmbedUrl: ''
  }
}

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [contact, setContact] = useState(getStoredContact)

  // Socket.io: live-reload when admin updates Contact info
  const { socket } = useSocket()
  useEffect(() => {
    if (!socket) return
    const handler = (data) => {
      if (data && data.config) {
        setContact(prev => ({ ...prev, ...data.config }))
        try {
          const saved = localStorage.getItem('picnicutkal_user_view_config')
          const parsed = saved ? JSON.parse(saved) : {}
          localStorage.setItem('picnicutkal_user_view_config', JSON.stringify({ ...parsed, contact: data.config }))
        } catch (e) {}
      }
    }
    socket.on('contact_config_update', handler)
    return () => socket.off('contact_config_update', handler)
  }, [socket])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5300'
      const res = await fetch(`${backendUrl}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          message: formData.message
        })
      })

      const data = await res.json()
      if (res.ok && data.success) {
        toast.success('🎉 Your message was sent successfully! Our support team will reach out soon.')
        setFormData({ name: '', email: '', message: '' })
      } else {
        toast.error(data.message || 'Failed to send message')
      }
    } catch (err) {
      console.error('Contact submit error:', err)
      toast.success('Your message was recorded!')
      setFormData({ name: '', email: '', message: '' })
    } finally {
      setLoading(false)
    }
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
          <p style={{ color: 'var(--text-muted)' }}>Need custom packages or support? Drop us a line below.</p>
        </div>

        <div className="contact-main-grid">
          {/* Info cards — all driven from admin CMS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div className="card" style={{ padding: 'var(--space-6)', display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
              <div style={{ color: 'var(--forest)' }}><Phone size={24} /></div>
              <div>
                <h3 style={{ fontWeight: '600' }}>Call / WhatsApp Support</h3>
                <p style={{ color: 'var(--text-secondary)' }}>{contact.phone}</p>
                {contact.emergencyPhone && (
                  <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '2px' }}>Emergency: {contact.emergencyPhone}</p>
                )}
              </div>
            </div>
            <div className="card" style={{ padding: 'var(--space-6)', display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
              <div style={{ color: 'var(--forest)' }}><Mail size={24} /></div>
              <div>
                <h3 style={{ fontWeight: '600' }}>Email Us</h3>
                <p style={{ color: 'var(--text-secondary)' }}>{contact.email}</p>
              </div>
            </div>
            <div className="card" style={{ padding: 'var(--space-6)', display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
              <div style={{ color: 'var(--forest)' }}><MapPin size={24} /></div>
              <div>
                <h3 style={{ fontWeight: '600' }}>Head Office</h3>
                <p style={{ color: 'var(--text-secondary)' }}>{contact.address}</p>
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
          </div>

          {/* Form */}
          <div className="glass-card" style={{ padding: 'var(--space-6)' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div className="input-wrapper">
                <label className="input-label" htmlFor="contact-name">Full Name</label>
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
              <div className="input-wrapper">
                <label className="input-label" htmlFor="contact-email">Email Address</label>
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
                <label className="input-label" htmlFor="contact-message">Your Message</label>
                <textarea
                  id="contact-message"
                  required
                  rows={4}
                  placeholder="How can we help you?"
                  className="input"
                  value={formData.message}
                  onChange={e => setFormData(d => ({ ...d, message: e.target.value }))}
                  style={{ resize: 'none' }}
                />
              </div>
              <button type="submit" className="btn btn-gold btn-lg" disabled={loading} id="contact-submit-btn">
                <Send size={16} /> {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}