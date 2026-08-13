import { useState } from 'react'
import { 
  LuSearch as Search, 
  LuUserCheck as UserCheck, 
  LuShieldAlert as ShieldAlert,
  LuUsers as UsersIcon,
  LuUserPlus as UserPlus,
  LuTrash2 as Trash2,
  LuMail as Mail,
  LuPhone as Phone,
  LuCalendar as Calendar,
  LuShoppingBag as ShoppingBag,
  LuCircleCheck as CheckCircle,
  LuCircleX as XCircle,
  LuUserX as UserX
} from 'react-icons/lu'
import toast from 'react-hot-toast'

import { useSocket } from '../../context/SocketContext'
import { useEffect } from 'react'

export default function Users() {
  const [usersList, setUsersList] = useState(() => {
    try {
      const stored = localStorage.getItem('picnicutkal_registered_users')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) return parsed
      }
    } catch (e) {}
    return []
  })
  const [searchQuery, setSearchQuery] = useState('')

  const fetchUsers = () => {
    fetch('/api/auth/users')
      .then(r => r.json())
      .then(d => {
        if (d.success && Array.isArray(d.data)) {
          const apiUsers = d.data
          // Merge API users with localStorage users
          try {
            const stored = localStorage.getItem('picnicutkal_registered_users')
            const localUsers = stored ? JSON.parse(stored) : []
            const combinedMap = new Map()
            apiUsers.forEach(u => combinedMap.set(u.email, u))
            localUsers.forEach(u => combinedMap.set(u.email, u))
            setUsersList(Array.from(combinedMap.values()))
          } catch (e) {
            setUsersList(apiUsers)
          }
        }
      })
      .catch(() => {})
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  // Socket.io real-time listener for new user registration
  const { socket } = useSocket()
  useEffect(() => {
    if (!socket) return
    const handleNewUser = (newUser) => {
      if (newUser && newUser.email) {
        setUsersList(prev => {
          const exists = prev.some(u => u.email === newUser.email)
          if (exists) return prev
          return [newUser, ...prev]
        })
        toast.success(`👤 New user registered: ${newUser.name || newUser.email}`)
      }
    }
    socket.on('user_registered', handleNewUser)
    return () => socket.off('user_registered', handleNewUser)
  }, [socket])

  // Filter out any admin/super admin accounts and search query
  const filteredUsers = usersList.filter(u => {
    const roleLower = (u.role || '').toLowerCase()
    const emailLower = (u.email || '').toLowerCase()

    if (roleLower.includes('admin') || emailLower.includes('admin')) {
      return false
    }

    return (
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phone.includes(searchQuery) ||
      u.id.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  // Toggle user account status
  const handleToggleStatus = (userId) => {
    setUsersList(prev => prev.map(u => {
      if (u.id === userId) {
        const newStatus = u.status === 'Active' ? 'Suspended' : 'Active'
        toast.success(`User #${userId} status updated to ${newStatus}`)
        return { ...u, status: newStatus }
      }
      return u
    }))
  }

  // Delete user account
  const handleDeleteUser = (userId, name) => {
    if (window.confirm(`Are you sure you want to delete user account "${name}"?`)) {
      setUsersList(prev => prev.filter(u => u.id !== userId))
      toast.success(`User "${name}" removed successfully.`)
    }
  }

  return (
    <div className="card glass-card" style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UsersIcon size={20} color="var(--gold)" />
            <h2 className="heading-4" style={{ margin: 0, color: 'var(--text-primary)' }}>Registered Users Directory</h2>
          </div>
          <p className="text-muted text-sm" style={{ margin: '4px 0 0' }}>Overview of registered customer accounts, bookings history, and status management.</p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span className="badge badge-gold" style={{ padding: '6px 14px', fontSize: '12px' }}>
            Total Registered Users: {usersList.length}
          </span>
        </div>
      </div>

      {/* Search Bar without Dropdowns */}
      <div className="admin-table-filters" style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="input-with-icon" style={{ flex: 1, minWidth: '260px', maxWidth: '420px' }}>
          <Search size={16} />
          <input 
            type="text" 
            placeholder="Search by registered user name, email, or phone..." 
            className="input" 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Registered Users Table */}
      <div className="admin-table-scroll-wrapper">
        <table className="admin-table-view">
          <thead>
            <tr>
              <th>User ID</th>
              <th>Registered User</th>
              <th>Contact Phone</th>
              <th>Joined Date</th>
              <th>Bookings</th>
              <th>Total Spent</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                  No registered users found matching your search.
                </td>
              </tr>
            ) : (
              filteredUsers.map(u => (
                <tr key={u.id}>
                  <td className="bold" style={{ color: 'var(--gold)', fontFamily: 'monospace', fontSize: '13px' }}>
                    #{u.id}
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>{u.name}</span>
                      <small style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{u.email}</small>
                    </div>
                  </td>
                  <td style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                    {u.phone}
                  </td>
                  <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {u.joinedDate}
                  </td>
                  <td style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {u.bookingsCount} Reservations
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--gold)' }}>
                    ₹{u.totalSpent.toLocaleString()}
                  </td>
                  <td>
                    <span className={`badge ${u.status === 'Active' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '11px' }}>
                      {u.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <button 
                        className="btn btn-outline btn-sm"
                        style={{ padding: '4px 8px', fontSize: '11px', color: u.status === 'Active' ? 'var(--warning)' : 'var(--success)' }}
                        onClick={() => handleToggleStatus(u.id)}
                        title={u.status === 'Active' ? 'Suspend Account' : 'Activate Account'}
                      >
                        {u.status === 'Active' ? 'Suspend' : 'Activate'}
                      </button>

                      <button 
                        className="btn btn-outline btn-sm"
                        style={{ padding: '4px 8px', color: 'var(--error)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                        onClick={() => handleDeleteUser(u.id, u.name)}
                        title="Delete User"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
