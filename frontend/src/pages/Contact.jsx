import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Phone, Mail, MapPin, Send } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      toast.success('Your message was sent successfully!')
      setFormData({ name: '', email: '', message: '' })
    }, 1200)
  }

  return (
    <>
      <Helmet>
        <title>Contact & Customer Support | PicnicUtkal</title>
        <meta name="description" content="Get in touch with us for booking issues, support tickets, group reservations, or corporate picnics in Odisha." />
      </Helmet>

      <div className="contact-page container section" style={{ paddingTop: 'calc(var(--nav-height) + var(--space-8))' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-10)' }}>
          <span className="section-eyebrow">Get in Touch</span>
          <h1 className="heading-2">Support & Group Bookings</h1>
          <p style={{ color: 'var(--text-muted)' }}>Need custom packages or support? Drop us a line below.</p>
        </div>

        <div className="contact-main-grid">
          {/* Info cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div className="card" style={{ padding: 'var(--space-6)', display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
              <div style={{ color: 'var(--forest)' }}><Phone size={24} /></div>
              <div>
                <h3 style={{ fontWeight: '600' }}>Call/WhatsApp Support</h3>
                <p style={{ color: 'var(--text-secondary)' }}>+91 98765 43210 (Mon-Sat, 9AM - 6PM)</p>
              </div>
            </div>
            <div className="card" style={{ padding: 'var(--space-6)', display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
              <div style={{ color: 'var(--forest)' }}><Mail size={24} /></div>
              <div>
                <h3 style={{ fontWeight: '600' }}>Email Us</h3>
                <p style={{ color: 'var(--text-secondary)' }}>hello@picnicutkal.com</p>
              </div>
            </div>
            <div className="card" style={{ padding: 'var(--space-6)', display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
              <div style={{ color: 'var(--forest)' }}><MapPin size={24} /></div>
              <div>
                <h3 style={{ fontWeight: '600' }}>Head Office</h3>
                <p style={{ color: 'var(--text-secondary)' }}>Forestry Lane, Bhubaneswar, Odisha 751001</p>
              </div>
            </div>
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