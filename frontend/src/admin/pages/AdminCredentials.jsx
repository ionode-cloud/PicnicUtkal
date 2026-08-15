import { useState, useEffect } from 'react'
import {
  LuKey as Key, LuUser as User, LuLock as Lock, LuMail as Mail, LuShieldCheck as ShieldCheck,
  LuUserCheck as UserCheck, LuPlus as Plus, LuTrash2 as Trash2, LuSquarePen as Edit3,
  LuCheck as Check, LuX as X, LuEye as Eye, LuEyeOff as EyeOff, LuSparkles as Sparkles,
  LuLayoutDashboard as LayoutDashboard, LuMapPin as MapPin, LuMap as MapIcon, LuTrees as Trees,
  LuCalendar as Calendar, LuUsers as UsersIcon, LuCreditCard as CreditCard,
  LuRefreshCw as RefreshCw, LuRotateCcw as RotateCcw, LuHeadphones as Headphones
} from 'react-icons/lu'
import toast from 'react-hot-toast'
import { useAuthStore } from '../../store'

// List of all manageable admin tabs
export const ADMIN_TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
  { id: 'spots', label: 'Picnic Spots', icon: MapPin, path: '/admin/spots' },
  { id: 'map', label: 'Map Management', icon: MapIcon, path: '/admin/map' },
  { id: 'zones', label: 'Zones', icon: Trees, path: '/admin/zones' },
  { id: 'bookings', label: 'Bookings', icon: Calendar, path: '/admin/bookings' },
  { id: 'users', label: 'Users', icon: UsersIcon, path: '/admin/users' },
  { id: 'payments', label: 'Payments', icon: CreditCard, path: '/admin/payments' },
  { id: 'credentials', label: 'Admin Credentials', icon: Key, path: '/admin/credentials' },
  { id: 'support-contact', label: 'Support Contact', icon: Headphones, path: '/admin/support-contact' },
  { id: 'userview', label: 'User View', icon: Eye, path: '/admin/user-view/home' },
]

const DEFAULT_STAFF = [
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

export default function AdminCredentials() {
  const { user, updateUser, setAuth } = useAuthStore()

  // Master Admin state
  const [adminEmail, setAdminEmail] = useState(user?.email || 'admin@picnicutkal.com')
  const [adminPassword, setAdminPassword] = useState(() => {
    return localStorage.getItem('picnicutkal_admin_pass') || 'admin123'
  })

  // Password visibility toggle for table rows & form
  const [visiblePasswords, setVisiblePasswords] = useState({})
  const toggleShowPassword = (id) => {
    setVisiblePasswords(prev => ({ ...prev, [id]: !prev[id] }))
  }

  // Staff accounts list stored in localStorage
  const [staffList, setStaffList] = useState(() => {
    try {
      const saved = localStorage.getItem('picnicutkal_staff_accounts')
      return saved ? JSON.parse(saved) : DEFAULT_STAFF
    } catch (e) {
      return DEFAULT_STAFF
    }
  })

  // Inline Form state for Create / Edit Account
  const [editingStaffId, setEditingStaffId] = useState(null)
  const [staffName, setStaffName] = useState('')
  const [staffEmail, setStaffEmail] = useState('')
  const [staffPass, setStaffPass] = useState('')
  const [staffRole, setStaffRole] = useState('staff')
  const [selectedTabs, setSelectedTabs] = useState(['dashboard', 'spots', 'bookings'])
  const [showFormPass, setShowFormPass] = useState(false)

  // Sync staff list to localStorage safely
  useEffect(() => {
    try {
      localStorage.setItem('picnicutkal_staff_accounts', JSON.stringify(staffList))
    } catch (e) {}
  }, [staffList])

  // Reset Inline Form to default state
  const handleResetForm = () => {
    setEditingStaffId(null)
    setStaffName('')
    setStaffEmail('')
    setStaffPass('')
    setStaffRole('staff')
    setSelectedTabs(['dashboard', 'spots', 'bookings'])
    setShowFormPass(false)
  }

  // Populate form for Editing a Staff Account
  const handleEditAccount = (st) => {
    setEditingStaffId(st.id)
    setStaffName(st.name)
    setStaffEmail(st.email)
    setStaffPass(st.password || '')
    setStaffRole(st.role || 'staff')
    setSelectedTabs(st.allowedTabs || ADMIN_TABS.map(t => t.id))
  }

  // Populate form for Editing Master Admin Account
  const handleEditMasterAdmin = () => {
    setEditingStaffId('master-admin')
    setStaffName(user?.name || 'Master Admin (Primary)')
    setStaffEmail(adminEmail)
    setStaffPass(adminPassword)
    setStaffRole('admin')
    setSelectedTabs(ADMIN_TABS.map(t => t.id))
  }

  // Toggle tab checkbox selection
  const handleToggleTab = (tabId) => {
    if (selectedTabs.includes(tabId)) {
      if (selectedTabs.length === 1) {
        toast.error('Staff must have at least one permitted tab!')
        return
      }
      setSelectedTabs(prev => prev.filter(t => t !== tabId))
    } else {
      setSelectedTabs(prev => [...prev, tabId])
    }
  }

  const handleSelectAllTabs = () => {
    setSelectedTabs(ADMIN_TABS.map(t => t.id))
  }

  const handleClearAllTabs = () => {
    setSelectedTabs(['dashboard'])
  }

  // Save Account (Create or Update)
  const handleSaveAccount = (e) => {
    e.preventDefault()

    if (!staffName.trim()) {
      toast.error('Account Name is required')
      return
    }
    if (!staffEmail.trim()) {
      toast.error('Login Email / ID is required')
      return
    }
    if (!staffPass.trim()) {
      toast.error('Password is required')
      return
    }

    if (editingStaffId === 'master-admin') {
      // Update Master Admin credentials
      setAdminEmail(staffEmail)
      setAdminPassword(staffPass)
      localStorage.setItem('picnicutkal_admin_email', staffEmail)
      localStorage.setItem('picnicutkal_admin_pass', staffPass)
      updateUser({
        email: staffEmail,
        name: staffName
      })
      toast.success('Master Admin credentials updated successfully!')
      handleResetForm()
      return
    }

    if (editingStaffId) {
      // Edit existing staff
      setStaffList(prev => prev.map(st => {
        if (st.id === editingStaffId) {
          const updated = {
            ...st,
            name: staffName,
            email: staffEmail,
            password: staffPass,
            role: staffRole,
            allowedTabs: staffRole === 'admin' ? ADMIN_TABS.map(t => t.id) : selectedTabs
          }

          if (user?.id === st.id || user?.email === st.email) {
            updateUser({
              role: staffRole,
              allowedTabs: updated.allowedTabs,
              name: staffName,
              email: staffEmail
            })
          }
          return updated
        }
        return st
      }))
      toast.success(`Updated account for ${staffName}!`)
    } else {
      // Create new staff
      const newStaff = {
        id: `staff-${Date.now()}`,
        name: staffName,
        email: staffEmail,
        password: staffPass,
        role: staffRole,
        allowedTabs: staffRole === 'admin' ? ADMIN_TABS.map(t => t.id) : selectedTabs
      }
      setStaffList(prev => [...prev, newStaff])
      toast.success(`Account created for ${staffName}!`)
    }

    handleResetForm()
  }

  // Delete Staff member
  const handleDeleteStaff = (id, name) => {
    if (window.confirm(`Are you sure you want to delete account: ${name}?`)) {
      setStaffList(prev => prev.filter(s => s.id !== id))
      if (editingStaffId === id) {
        handleResetForm()
      }
      toast.success(`Deleted staff account ${name}`)
    }
  }

  // Quick switch session to test staff role
  const handleSwitchSession = (st) => {
    setAuth({
      _id: st.id,
      name: st.name,
      email: st.email,
      role: st.role,
      allowedTabs: st.allowedTabs || ['dashboard']
    }, 'mock-staff-jwt-token')

    toast.success(`Switched active session to ${st.name} (${st.role.toUpperCase()})`)
  }

  // Switch back to Master Admin
  const handleSwitchBackToAdmin = () => {
    setAuth({
      _id: 'dev-admin-id',
      name: 'Master Admin',
      email: adminEmail || 'admin@picnicutkal.com',
      role: 'admin',
      allowedTabs: ADMIN_TABS.map(t => t.id)
    }, 'mock-admin-jwt-token')
    toast.success('Switched back to Master Admin!')
  }

  const isCurrentMasterAdmin = user?.role === 'admin'

  return (
    <div className="admin-dashboard-container animate-fade-in" style={{ padding: '0px 24px 48px' }}>
      {/* Header Banner */}
      <div className="admin-header-flex glass-card" style={{ marginTop: '15px', padding: '14px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', borderRadius: 'var(--radius-xl)' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0px', padding: '4px 4px', borderRadius: '20px', background: 'rgba(201,168,76,0.15)', color: 'var(--gold)', fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>
            <Key size={14} /> Security & Access Control
          </div>
          <h1 className="heading-2" style={{ fontSize: '26px' }}>Admin Credentials & Staff Permissions</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
            Manage staff accounts and set tab-level checkbox permissions for staff users.
          </p>
        </div>

        {!isCurrentMasterAdmin && (
          <div>
            <button onClick={handleSwitchBackToAdmin} className="btn btn-gold btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <RefreshCw size={14} /> Switch to Master Admin
            </button>
          </div>
        )}
      </div>

      {/* Main 2-Column Grid: Form on Left Side, Table on Right Side */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 420px) 1fr', gap: '28px', alignItems: 'start'}}>
        
        {/* LEFT SIDE: Inline Form for Create / Edit Account */}
        <div className="card glass-card" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(201,168,76,0.15)', color: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Key size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700 }}>
                  {editingStaffId ? 'Edit Account' : 'Create New Account'}
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {editingStaffId ? 'Update user credentials & permissions' : 'Add new staff user and set tab checkboxes'}
                </p>
              </div>
            </div>

            {editingStaffId && (
              <button
                type="button"
                onClick={handleResetForm}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '12px', color: 'var(--text-muted)' }}
                title="Cancel Edit and reset form to Create mode"
              >
                <RotateCcw size={14} /> New
              </button>
            )}
          </div>

          <form onSubmit={handleSaveAccount} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Account Name */}
            <div className="input-wrapper">
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={14} /> Account Name / Member
              </label>
              <input
                type="text"
                className="input"
                value={staffName}
                onChange={(e) => setStaffName(e.target.value)}
                placeholder="e.g. Ramesh Kumar"
                required
              />
            </div>

            {/* Email / Login ID */}
            <div className="input-wrapper">
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Mail size={14} /> Login Email / ID
              </label>
              <input
                type="email"
                className="input"
                value={staffEmail}
                onChange={(e) => setStaffEmail(e.target.value)}
                placeholder="e.g. ramesh@picnicutkal.com"
                required
              />
            </div>

            {/* Password with Eye icon toggle */}
            <div className="input-wrapper">
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Lock size={14} /> Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showFormPass ? 'text' : 'password'}
                  className="input"
                  value={staffPass}
                  onChange={(e) => setStaffPass(e.target.value)}
                  placeholder="Enter login password"
                  style={{ paddingRight: '40px' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowFormPass(v => !v)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                  title={showFormPass ? 'Hide password' : 'Show password'}
                >
                  {showFormPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Role Selection */}
            <div className="input-wrapper">
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={14} /> Account Role
              </label>
              <select
                className="input"
                value={staffRole}
                onChange={(e) => setStaffRole(e.target.value)}
              >
                <option value="staff">Staff ("Stap") - Custom Tab Checkboxes</option>
                <option value="admin">Admin - Full Access (All Tabs)</option>
              </select>
            </div>

            {/* Tab Checkboxes (Shown for Staff Role) */}
            {staffRole === 'staff' && (
              <div style={{ padding: '16px', borderRadius: 'var(--radius-lg)', background: 'var(--bg-primary)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <label className="input-label" style={{ margin: 0, fontWeight: 700, fontSize: '13px', color: 'var(--gold)' }}>
                    Select Permitted Tabs (Checkboxes):
                  </label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button type="button" onClick={handleSelectAllTabs} className="btn btn-ghost btn-xs" style={{ fontSize: '10px', padding: '2px 6px' }}>
                      Check All
                    </button>
                    <button type="button" onClick={handleClearAllTabs} className="btn btn-ghost btn-xs" style={{ fontSize: '10px', padding: '2px 6px' }}>
                      Clear
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px' }}>
                  {ADMIN_TABS.map((tab) => {
                    const IconComp = tab.icon
                    const isChecked = selectedTabs.includes(tab.id)
                    return (
                      <label
                        key={tab.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 10px',
                          borderRadius: 'var(--radius-md)',
                          background: isChecked ? 'rgba(74,222,128,0.1)' : 'var(--bg-card)',
                          border: `1px solid ${isChecked ? 'rgba(74,222,128,0.4)' : 'var(--border)'}`,
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: isChecked ? 600 : 400,
                          color: isChecked ? 'var(--text-primary)' : 'var(--text-muted)',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleTab(tab.id)}
                          style={{ accentColor: 'var(--light-green)', width: '15px', height: '15px', cursor: 'pointer' }}
                        />
                        <IconComp size={14} style={{ color: isChecked ? 'var(--light-green)' : 'var(--text-muted)' }} />
                        <span>{tab.label}</span>
                      </label>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <button type="submit" className="btn btn-gold" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Check size={18} /> {editingStaffId ? 'Update Account' : 'Save Account'}
              </button>
              {editingStaffId && (
                <button type="button" onClick={handleResetForm} className="btn btn-outline">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* RIGHT SIDE: Table List of All Accounts */}
        <div className="card glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 className="heading-4" style={{ fontSize: '18px' }}>Accounts & Staff List</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '2px' }}>
                Click edit icon to modify account credentials or tab permissions on the left form.
              </p>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Total: <strong>{staffList.length + 1}</strong> accounts</span>
          </div>

          <div className="admin-table-wrapper" style={{ overflowX: 'auto' }}>
            <table className="admin-table-view" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '10px 12px' }}>Member Name</th>
                  <th style={{ padding: '10px 12px' }}>Login Email / ID</th>
                  <th style={{ padding: '10px 12px' }}>Password</th>
                  <th style={{ padding: '10px 12px' }}>Role</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {/* Master Admin Row */}
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(201,168,76,0.04)' }}>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>
                      <ShieldCheck size={16} style={{ color: 'var(--gold)' }} />
                      {user?.name || 'Master Admin (Primary)'}
                    </div>
                  </td>
                  <td style={{ padding: '12px', fontSize: '12px', color: 'var(--text-secondary)' }}>{adminEmail}</td>
                  <td style={{ padding: '12px', fontSize: '12px', color: 'var(--text-primary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontFamily: 'monospace' }}>
                        {visiblePasswords['master-admin'] ? adminPassword : '••••••••'}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleShowPassword('master-admin')}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        title={visiblePasswords['master-admin'] ? 'Hide password' : 'Show password'}
                      >
                        {visiblePasswords['master-admin'] ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span className="badge badge-gold" style={{ fontSize: '10px' }}>ADMIN</span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                      <button
                        onClick={handleEditMasterAdmin}
                        className="btn btn-ghost btn-sm"
                        style={{ padding: '4px 6px' }}
                        title="Edit Master Admin Email & Password"
                      >
                        <Edit3 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>

                {/* Staff Rows */}
                {staffList.map((st) => (
                  <tr key={st.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>
                        <UserCheck size={16} style={{ color: 'var(--light-green)' }} />
                        {st.name}
                      </div>
                    </td>
                    <td style={{ padding: '12px', fontSize: '12px', color: 'var(--text-secondary)' }}>{st.email}</td>
                    <td style={{ padding: '12px', fontSize: '12px', color: 'var(--text-primary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontFamily: 'monospace' }}>
                          {visiblePasswords[st.id] ? st.password : '••••••••'}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleShowPassword(st.id)}
                          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                          title={visiblePasswords[st.id] ? 'Hide password' : 'Show password'}
                        >
                          {visiblePasswords[st.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span className={`badge ${st.role === 'admin' ? 'badge-gold' : 'badge-green'}`} style={{ fontSize: '10px' }}>
                        {st.role.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                        <button
                          onClick={() => handleSwitchSession(st)}
                          className="btn btn-ghost btn-sm"
                          style={{ padding: '4px 8px', fontSize: '11px', color: 'var(--gold-dark)', border: '1px solid rgba(201,168,76,0.3)' }}
                          title="Login / Test as this Staff user"
                        >
                          <RefreshCw size={12} /> Test
                        </button>
                        <button
                          onClick={() => handleEditAccount(st)}
                          className="btn btn-ghost btn-sm"
                          style={{ padding: '4px 6px' }}
                          title="Edit Account & Tab Checkboxes"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteStaff(st.id, st.name)}
                          className="btn btn-ghost btn-sm"
                          style={{ padding: '4px 6px', color: 'var(--error)' }}
                          title="Delete Account"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}
