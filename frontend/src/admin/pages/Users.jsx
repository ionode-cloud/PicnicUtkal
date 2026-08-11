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

const INITIAL_USERS = [
  {
    id: 'USR-101',
    name: 'Jyoti Ranjan',
    email: 'jyoti@picnicutkal.com',
    phone: '9876543210',
    joinedDate: '2026-01-15',
    role: 'Admin',
    bookingsCount: 14,
    totalSpent: 6986,
    status: 'Active'
  },
  {
    id: 'USR-102',
    name: 'Sunil Mohanty',
    email: 'sunil.mohanty@gmail.com',
    phone: '9876543210',
    joinedDate: '2026-03-22',
    role: 'User',
    bookingsCount: 3,
    totalSpent: 1497,
    status: 'Active'
  },
  {
    id: 'USR-103',
    name: 'Anjali Das',
    email: 'anjali.das@gmail.com',
    phone: '9123456789',
    joinedDate: '2026-04-10',
    role: 'User',
    bookingsCount: 2,
    totalSpent: 898,
    status: 'Active'
  },
  {
    id: 'USR-104',
    name: 'Rajesh Tripathy',
    email: 'rajesh.t@yahoo.com',
    phone: '9437123456',
    joinedDate: '2026-05-18',
    role: 'User',
    bookingsCount: 1,
    totalSpent: 999,
    status: 'Active'
  },
  {
    id: 'USR-105',
    name: 'Smruti Ranjan',
    email: 'smruti.r@gmail.com',
    phone: '9937001122',
    joinedDate: '2026-06-02',
    role: 'User',
    bookingsCount: 4,
    totalSpent: 1996,
    status: 'Active'
  },
  {
    id: 'USR-106',
    name: 'Debashish Panda',
    email: 'deba.panda@outlook.com',
    phone: '9861098765',
    joinedDate: '2026-06-25',
    role: 'User',
    bookingsCount: 1,
    totalSpent: 449,
    status: 'Suspended'
  },
  {
    id: 'USR-107',
    name: 'Manoj Kumar Patnaik',
    email: 'manoj.patnaik@gmail.com',
    phone: '9777123456',
    joinedDate: '2026-07-04',
    role: 'User',
    bookingsCount: 2,
    totalSpent: 998,
    status: 'Active'
  },
  {
    id: 'USR-108',
    name: 'Biswajit Behera',
    email: 'biswajit.b@gmail.com',
    phone: '9439009988',
    joinedDate: '2026-07-19',
    role: 'User',
    bookingsCount: 1,
    totalSpent: 449,
    status: 'Active'
  }
]

export default function Users() {
  const [usersList, setUsersList] = useState(INITIAL_USERS)
  const [searchQuery, setSearchQuery] = useState('')

  // Filter users
  const filteredUsers = usersList.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.phone.includes(searchQuery) ||
    u.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
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
                    <span className={`badge ${u.role === 'Admin' ? 'badge-gold' : 'badge-glass'}`} style={{ fontSize: '11px' }}>
                      {u.role}
                    </span>
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
