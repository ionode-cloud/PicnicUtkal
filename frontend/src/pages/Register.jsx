import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Mail, Lock, User, Phone, ArrowLeft, CheckSquare } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '' })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleRegister = (e) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      toast.success('Registration successful! Please login.')
      navigate('/login')
    }, 1000)
  }

  return (
    <>
      <Helmet>
        <title>Create Your PicnicUtkal Account</title>
      </Helmet>

      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
        {/* Left Visual Banner */}
        <div style={{ flex: 1.2, position: 'relative', background: 'linear-gradient(135deg, var(--dark-green), var(--forest))', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 'var(--space-12)', color: 'var(--cream)' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url("https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80")', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.15 }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--cream)', fontWeight: '600', marginBottom: 'var(--space-8)' }}>
              <ArrowLeft size={16} /> Back to Home
            </Link>
            <h1 className="heading-1" style={{ color: 'var(--cream)' }}>Start Your Eco Adventure</h1>
            <p style={{ marginTop: 'var(--space-3)', color: 'rgba(245,240,232,0.8)', maxWidth: '440px' }}>Join over 15,000 nature lovers booking clean, premium, and sustainable zones across Odisha.</p>
          </div>
        </div>

        {/* Right Form */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-6)', background: 'var(--bg-secondary)' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '420px', padding: 'var(--space-8)' }}>
            <h2 className="heading-3" style={{ marginBottom: 'var(--space-2)' }}>Join PicnicUtkal</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-6)' }}>Create a free account in seconds</p>

            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div className="input-wrapper">
                <label className="input-label" htmlFor="reg-name">Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    id="reg-name"
                    type="text"
                    required
                    placeholder="Your Name"
                    className="input"
                    value={formData.name}
                    onChange={e => setFormData(d => ({ ...d, name: e.target.value }))}
                    style={{ paddingLeft: '36px' }}
                  />
                </div>
              </div>

              <div className="input-wrapper">
                <label className="input-label" htmlFor="reg-email">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    id="reg-email"
                    type="email"
                    required
                    placeholder="name@example.com"
                    className="input"
                    value={formData.email}
                    onChange={e => setFormData(d => ({ ...d, email: e.target.value }))}
                    style={{ paddingLeft: '36px' }}
                  />
                </div>
              </div>

              <div className="input-wrapper">
                <label className="input-label" htmlFor="reg-phone">Phone Number</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    id="reg-phone"
                    type="tel"
                    required
                    placeholder="+91 XXXXX XXXXX"
                    className="input"
                    value={formData.phone}
                    onChange={e => setFormData(d => ({ ...d, phone: e.target.value }))}
                    style={{ paddingLeft: '36px' }}
                  />
                </div>
              </div>

              <div className="input-wrapper">
                <label className="input-label" htmlFor="reg-password">Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    id="reg-password"
                    type="password"
                    required
                    placeholder="Min 8 characters"
                    className="input"
                    value={formData.password}
                    onChange={e => setFormData(d => ({ ...d, password: e.target.value }))}
                    style={{ paddingLeft: '36px' }}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-gold btn-lg w-full" disabled={loading} id="register-submit-btn">
                <CheckSquare size={16} /> {loading ? 'Registering...' : 'Register'}
              </button>
            </form>

            <p style={{ marginTop: 'var(--space-6)', textAlign: 'center', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
              Already have an account? <Link to="/login" style={{ color: 'var(--forest)', fontWeight: '600' }}>Login here</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}