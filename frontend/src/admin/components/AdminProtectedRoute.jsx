import { Navigate, Link } from 'react-router-dom'
import { useAuthStore } from '../../store'
import { LuShieldAlert as ShieldAlert, LuArrowLeft as ArrowLeft } from 'react-icons/lu'

export default function AdminProtectedRoute({ children }) {
  const { user, token, isAuthenticated } = useAuthStore()

  if (!token || !user || !isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (user.role !== 'admin' && user.role !== 'staff') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="card glass-card" style={{ maxWidth: '480px', padding: '40px', border: '1px solid rgba(27,67,50,0.15)' }}>
          <div style={{ display: 'inline-flex', padding: '16px', borderRadius: '50%', backgroundColor: 'rgba(250,82,82,0.1)', color: 'var(--error)', marginBottom: '24px' }}>
            <ShieldAlert size={48} />
          </div>
          <h1 className="heading-3" style={{ color: 'var(--error)', marginBottom: '12px' }}>403 Access Denied</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '15px', lineHeight: '1.6' }}>
            You do not have required administrator or staff permissions to view this admin panel. Please log in with an authorized admin/staff account.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Link to="/login" className="btn btn-gold w-full">
              Sign in to Portal
            </Link>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--forest)', fontWeight: '600', fontSize: '14px', marginTop: '8px' }}>
              <ArrowLeft size={16} /> Return to Homepage
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return children
}
