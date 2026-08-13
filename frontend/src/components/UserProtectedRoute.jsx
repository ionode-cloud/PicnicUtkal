import { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store'
import toast from 'react-hot-toast'

export default function UserProtectedRoute({ children }) {
  const { user, token, isAuthenticated } = useAuthStore()
  const location = useLocation()

  useEffect(() => {
    if (!token || !user || !isAuthenticated) {
      toast.error('🔒 Please log in first to access bookings & reservation features.', { id: 'auth-required-toast' })
    }
  }, [token, user, isAuthenticated])

  if (!token || !user || !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}
