import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { LuMail as Mail, LuLock as Lock, LuUser as User, LuPhone as Phone, LuArrowLeft as ArrowLeft, LuSquareCheck as CheckSquare, LuEye as Eye, LuEyeOff as EyeOff } from 'react-icons/lu'
import toast from 'react-hot-toast'

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
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

      <div className="auth-page-container">
        {/* Left Visual Banner */}
        <div className="auth-banner">
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
        <div className="auth-form-side">
          <div className="glass-card auth-form-card">
            <Link to="/" className="auth-mobile-back">
              <ArrowLeft size={14} /> Back to Home
            </Link>
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
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Min 8 characters"
                    className="input"
                    value={formData.password}
                    onChange={e => setFormData(d => ({ ...d, password: e.target.value }))}
                    style={{ paddingLeft: '36px', paddingRight: '38px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      padding: 0
                    }}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
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