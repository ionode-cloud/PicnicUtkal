import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { ArrowLeft, RefreshCw } from 'lucide-react'

export default function NotFound() {
  return (
    <>
      <Helmet>
        <title>404 - Page Not Found | PicnicUtkal</title>
      </Helmet>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: 'var(--space-6)', textAlign: 'center', background: 'var(--bg-primary)' }}>
        <h1 className="heading-hero text-gradient" style={{ marginBottom: 'var(--space-2)' }}>404</h1>
        <h2 className="heading-3" style={{ marginBottom: 'var(--space-4)' }}>Lost in the Woods?</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '460px', marginBottom: 'var(--space-8)' }}>The page you are looking for does not exist or has been moved to another trail.</p>
        <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
          <Link to="/" className="btn btn-primary" id="404-home-btn"><ArrowLeft size={16} /> Back to Home</Link>
          <button className="btn btn-outline" onClick={() => window.location.reload()} id="404-retry-btn"><RefreshCw size={16} /> Retry</button>
        </div>
      </div>
    </>
  )
}