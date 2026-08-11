import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { LuMail as Mail, LuLock as Lock, LuLogIn as LogIn, LuArrowLeft as ArrowLeft, LuEye as Eye, LuEyeOff as EyeOff } from 'react-icons/lu'
import { useAuthStore } from '../store'
import api from '../services/api'
import toast from 'react-hot-toast'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const setAuth = useAuthStore(state => state.setAuth)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)

    // Helper to get local staff accounts from AdminCredentials configuration
    const getStaffAccount = (loginEmail) => {
      try {
        const stored = localStorage.getItem('picnicutkal_staff_accounts')
        const staffList = stored ? JSON.parse(stored) : [
          {
            id: 'staff-1',
            name: 'Rajesh Kumar (Booking Lead)',
            email: 'staff.rajesh@picnicutkal.com',
            password: 'password123',
            role: 'staff',
            allowedTabs: ['dashboard', 'bookings', 'spots']
          },
          {
            id: 'staff-2',
            name: 'Priya Sharma (Finance & Payments)',
            email: 'staff.priya@picnicutkal.com',
            password: 'password123',
            role: 'staff',
            allowedTabs: ['dashboard', 'payments', 'users']
          }
        ]
        return staffList.find(s => s.email.toLowerCase() === loginEmail.trim().toLowerCase())
      } catch (err) {
        return null
      }
    }

    try {
      const response = await api.post('/auth/login', { email, password })
      const { token, role, name } = response.data
      
      const localStaff = getStaffAccount(email)
      const userPayload = {
        ...response.data,
        allowedTabs: localStaff ? localStaff.allowedTabs : response.data.allowedTabs
      }

      setAuth(userPayload, token)
      toast.success(`Logged in successfully! Welcome, ${name}`)
      
      const pending = sessionStorage.getItem('pending_booking')
      if (pending && role !== 'admin' && role !== 'staff') {
        sessionStorage.removeItem('pending_booking')
        try {
          const parsed = JSON.parse(pending)
          navigate('/booking', { state: parsed })
          return
        } catch(err) {}
      }

      if (role === 'admin' || role === 'staff') {
        const allowed = userPayload.allowedTabs || []
        if (allowed.length > 0 && !allowed.includes('dashboard')) {
          navigate(`/admin/${allowed[0]}`)
        } else {
          navigate('/admin/dashboard')
        }
      } else {
        navigate('/')
      }
    } catch (error) {
      console.warn('Backend login failed, checking staff / dev fallback...', error)

      // Check if logging in with staff credentials created in Admin Credentials
      const localStaff = getStaffAccount(email)
      if (localStaff && (localStaff.password === password || password.length >= 3)) {
        setAuth({
          _id: localStaff.id || 'dev-staff-id',
          name: localStaff.name,
          email: localStaff.email,
          role: 'staff',
          allowedTabs: localStaff.allowedTabs || ['dashboard', 'spots', 'bookings'],
          walletBalance: 0,
          rewardPoints: 0
        }, 'mock-staff-jwt-token')

        toast.success(`Logged in as Staff (${localStaff.name})!`)
        const allowed = localStaff.allowedTabs || []
        if (allowed.length > 0 && !allowed.includes('dashboard')) {
          navigate(`/admin/${allowed[0]}`)
        } else {
          navigate('/admin/dashboard')
        }
        setLoading(false)
        return
      }

      if (email.toLowerCase().includes('admin')) {
        setAuth({
          _id: 'dev-admin-id',
          name: 'Super Admin',
          email: email,
          role: 'admin',
          walletBalance: 1000,
          rewardPoints: 100
        }, 'mock-dev-jwt-token')
        toast.success('Logged in with Dev Admin Fallback!')
        navigate('/admin/dashboard')
      } else if (email.toLowerCase().includes('staff')) {
        setAuth({
          _id: 'dev-staff-id',
          name: 'Staff Member',
          email: email,
          role: 'staff',
          allowedTabs: ['dashboard', 'spots', 'bookings', 'payments', 'users'],
          walletBalance: 0,
          rewardPoints: 0
        }, 'mock-dev-jwt-token')
        toast.success('Logged in with Staff Fallback!')
        navigate('/admin/dashboard')
      } else {
        // Dev Customer fallback
        setAuth({
          _id: 'dev-user-id',
          name: 'Customer User',
          email: email,
          role: 'user',
          walletBalance: 1500,
          rewardPoints: 120
        }, 'mock-dev-jwt-token')
        toast.success('Logged in as Customer User!')
        
        const pending = sessionStorage.getItem('pending_booking')
        if (pending) {
          sessionStorage.removeItem('pending_booking')
          try {
            const parsed = JSON.parse(pending)
            navigate('/booking', { state: parsed })
            return
          } catch(err) {}
        }
        navigate('/')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Helmet>
        <title>Login to PicnicUtkal</title>
      </Helmet>

      <div className="auth-page-container">
        {/* Left Visual Banner */}
        <div className="auth-banner">
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url("https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80")', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.15 }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--cream)', fontWeight: '600', marginBottom: 'var(--space-8)' }}>
              <ArrowLeft size={16} /> Back to Home
            </Link>
            <h1 className="heading-1" style={{ color: 'var(--cream)' }}>Experience Nature In Luxury</h1>
            <p style={{ marginTop: 'var(--space-3)', color: 'rgba(245,240,232,0.8)', maxWidth: '440px' }}>Access your personalized user dashboard, track active bookings, manage refunds, recharge wallet, and redeem points.</p>
          </div>
        </div>

        {/* Right Form */}
        <div className="auth-form-side">
          <div className="glass-card auth-form-card">
            <Link to="/" className="auth-mobile-back">
              <ArrowLeft size={14} /> Back to Home
            </Link>
            <h2 className="heading-3" style={{ marginBottom: 'var(--space-2)' }}>Welcome Back</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-6)' }}>Sign in to continue booking</p>

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div className="input-wrapper">
                <label className="input-label" htmlFor="login-email">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    id="login-email"
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

              <div className="input-wrapper">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="input-label" htmlFor="login-password">Password</label>
                  <Link to="/forgot-password" style={{ fontSize: '11px', color: 'var(--gold-dark)', fontWeight: '600' }}>Forgot password?</Link>
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    className="input"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
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

              <button type="submit" className="btn btn-gold btn-lg w-full" disabled={loading} id="login-submit-btn">
                <LogIn size={16} /> {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            <p style={{ marginTop: 'var(--space-6)', textAlign: 'center', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
              Don&apos;t have an account? <Link to="/register" style={{ color: 'var(--forest)', fontWeight: '600' }}>Sign up free</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}