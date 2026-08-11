 import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { LuMail as Mail, LuArrowLeft as ArrowLeft, LuKeyRound as KeyRound } from 'react-icons/lu'
import toast from 'react-hot-toast'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleReset = (e) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      toast.success('Password reset email sent! Check your inbox.')
      setEmail('')
    }, 1000)
  }

  return (
    <>
      <Helmet>
        <title>Forgot Password - PicnicUtkal</title>
      </Helmet>

      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
        {/* Left Visual Banner */}
        <div style={{ flex: 1.2, position: 'relative', background: 'linear-gradient(135deg, var(--dark-green), var(--forest))', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 'var(--space-12)', color: 'var(--cream)' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url("https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=800&q=80")', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.15 }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--cream)', fontWeight: '600', marginBottom: 'var(--space-8)' }}>
              <ArrowLeft size={16} /> Back to Sign In
            </Link>
            <h1 className="heading-1" style={{ color: 'var(--cream)' }}>Reset Your Password</h1>
            <p style={{ marginTop: 'var(--space-3)', color: 'rgba(245,240,232,0.8)', maxWidth: '440px' }}>Provide your email below and we will send you instructions to change your password securely.</p>
          </div>
        </div>

        {/* Right Form */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-6)', background: 'var(--bg-secondary)' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '420px', padding: 'var(--space-8)' }}>
            <h2 className="heading-3" style={{ marginBottom: 'var(--space-2)' }}>Recover Password</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-6)' }}>Provide your registered email address</p>

            <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div className="input-wrapper">
                <label className="input-label" htmlFor="reset-email">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    id="reset-email"
                    type="email"
                    required
                    placeholder="name@example.com"
                    className="input"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    style={{ paddingLeft: '36px' }}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-gold btn-lg w-full" disabled={loading} id="forgot-submit-btn">
                <KeyRound size={16} /> {loading ? 'Sending Instructions...' : 'Send Reset Link'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}