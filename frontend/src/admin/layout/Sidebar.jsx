import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store'
import {
  LuLayoutDashboard as LayoutDashboard, LuMapPin as MapPin, LuTrees as Trees, LuCalendar as Calendar, LuUsers as Users, LuCreditCard as CreditCard,
  LuImage as Image, LuTag as Tag, LuStar as Star, LuBookOpen as BookOpen, LuBell as Bell, LuSettings as Settings, LuUser as User, LuLogOut as LogOut,
  LuChevronDown as ChevronDown, LuChevronRight as ChevronRight, LuLeaf as Leaf, LuEye as Eye, LuCirclePlus as PlusCircle, LuFolderHeart as FolderHeart,
  LuDroplets as Droplets, LuFlame as Flame, LuMusic as Music, LuTent as Tent, LuCompass as Compass, LuSparkles as Sparkles, LuSmile as Smile,
  LuHourglass as Hourglass, LuCircleCheck as CheckCircle2, LuCircleX as XCircle, LuFileSpreadsheet as FileSpreadsheet, LuListTodo as ListTodo, LuTriangleAlert as AlertTriangle, LuDollarSign as DollarSign,
  LuMap as Map, LuDownload as Download, LuKey as Key, LuMail as Mail, LuHeadphones as Headphones, LuFileText as FileText,
  LuQrCode as QrCode
} from 'react-icons/lu'
import toast from 'react-hot-toast'

export default function Sidebar({ isOpen, toggleSidebar }) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const currentPath = location.pathname

  // Check tab visibility based on User Role & Checkbox permissions
  const isTabAllowed = (tabId) => {
    if (!user || user.role === 'admin') return true
    if (user.role === 'staff') {
      if (!user.allowedTabs) return true
      return user.allowedTabs.includes(tabId)
    }
    return true
  }

  // Menu collapse states
  const [openMenus, setOpenMenus] = useState({
    spots: currentPath.startsWith('/admin/spots'),
    userview: currentPath.startsWith('/admin/user-view'),
    zones: false,
    bookings: false,
    users: false,
    payments: false,
    credentials: false
  })

  // Logout confirmation modal state
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const toggleSubmenu = (menu) => {
    setOpenMenus(prev => ({ ...prev, [menu]: !prev[menu] }))
  }

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true)
  }

  const confirmLogout = () => {
    logout()
    setShowLogoutConfirm(false)
    toast.success('Logged out successfully from Admin Panel.')
    navigate('/login')
  }

  const isActive = (path) => currentPath === path

  return (
    <>
      <aside className={`admin-sidebar-nav-container ${isOpen ? 'show-mobile' : ''}`}>
        {/* Brand */}
        <div className="admin-sidebar-brand-section">
          <div className="admin-sidebar-logo-box">
            <Leaf size={18} />
          </div>
          <span>Picnic<span className="text-gradient">Admin</span></span>
        </div>

        {/* Menu Items */}
        <div className="admin-sidebar-scroll-wrapper">
          <nav className="admin-sidebar-nav-menu">
            {/* Dashboard Link */}
            {isTabAllowed('dashboard') && (
              <Link
                to="/admin/dashboard"
                className={`admin-nav-menu-item ${isActive('/admin/dashboard') ? 'active' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <LayoutDashboard size={18} /> <span>Dashboard</span>
                </div>
              </Link>
            )}

            {/* Picnic Spots Submenu */}
            {isTabAllowed('spots') && (
              <div className="admin-nav-submenu-wrap">
                <button
                  onClick={() => toggleSubmenu('spots')}
                  className={`admin-nav-menu-item admin-nav-submenu-header ${openMenus.spots ? 'expanded' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <MapPin size={18} /> <span>Picnic Spots</span>
                  </div>
                  {openMenus.spots ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
                <div className={`admin-nav-submenu-list ${openMenus.spots ? 'open' : ''}`}>
                  <Link to="/admin/spots" className={`admin-submenu-item ${isActive('/admin/spots') ? 'active' : ''}`}>
                    <Eye size={14} /> <span>All Spots</span>
                  </Link>
                  <Link to="/admin/spots/addons" className={`admin-submenu-item ${isActive('/admin/spots/addons') ? 'active' : ''}`}>
                    <Sparkles size={14} /> <span>Custom Event Add-ons</span>
                  </Link>
                  <Link to="/admin/spots/guidelines" className={`admin-submenu-item ${isActive('/admin/spots/guidelines') ? 'active' : ''}`}>
                    <FileText size={14} /> <span>Guidelines & Rules</span>
                  </Link>
                </div>
              </div>
            )}

            {/* Map Management Link */}
            {isTabAllowed('map') && (
              <Link
                to="/admin/map"
                className={`admin-nav-menu-item ${isActive('/admin/map') ? 'active' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <Map size={18} /> <span>Map Management</span>
                </div>
              </Link>
            )}

            {/* Zones Link */}
            {isTabAllowed('zones') && (
              <Link
                to="/admin/zones"
                className={`admin-nav-menu-item ${isActive('/admin/zones') ? 'active' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <Trees size={18} /> <span>Zones</span>
                </div>
              </Link>
            )}

            {/* Bookings Submenu */}
            {isTabAllowed('bookings') && (
              <div className="admin-nav-submenu-wrap">
                <button
                  onClick={() => toggleSubmenu('bookings')}
                  className={`admin-nav-menu-item admin-nav-submenu-header ${openMenus.bookings ? 'expanded' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <Calendar size={18} /> <span>Bookings</span>
                  </div>
                  {openMenus.bookings ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
                <div className={`admin-nav-submenu-list ${openMenus.bookings ? 'open' : ''}`}>
                  <Link to="/admin/bookings" className={`admin-submenu-item ${isActive('/admin/bookings') ? 'active' : ''}`}>
                    <FileSpreadsheet size={14} /> <span>All Bookings</span>
                  </Link>
                  <Link to="/admin/bookings/history" className={`admin-submenu-item ${isActive('/admin/bookings/history') ? 'active' : ''}`}>
                    <Download size={14} /> <span>Booking History</span>
                  </Link>
                </div>
              </div>
            )}

            {/* Users Link */}
            {isTabAllowed('users') && (
              <Link
                to="/admin/users"
                onClick={() => isOpen && toggleSidebar()}
                className={`admin-nav-menu-item ${isActive('/admin/users') ? 'active' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <Users size={18} /> <span>Users</span>
                </div>
              </Link>
            )}

            {/* Payments Submenu */}
            {isTabAllowed('payments') && (
              <div className="admin-nav-submenu-wrap">
                <button
                  onClick={() => toggleSubmenu('payments')}
                  className={`admin-nav-menu-item admin-nav-submenu-header ${openMenus.payments || currentPath.startsWith('/admin/payments') ? 'expanded' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <CreditCard size={18} /> <span>Payments</span>
                  </div>
                  {openMenus.payments || currentPath.startsWith('/admin/payments') ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
                <div className={`admin-nav-submenu-list ${openMenus.payments || currentPath.startsWith('/admin/payments') ? 'open' : ''}`}>
                  <Link 
                    to="/admin/payments" 
                    onClick={() => isOpen && toggleSidebar()}
                    className={`admin-submenu-item ${isActive('/admin/payments') && !location.search.includes('tab=qr') ? 'active' : ''}`}
                  >
                    <FileSpreadsheet size={14} /> <span>Transactions &amp; Ledger</span>
                  </Link>
                  <Link 
                    to="/admin/payments?tab=qr" 
                    onClick={() => isOpen && toggleSidebar()}
                    className={`admin-submenu-item ${isActive('/admin/payments') && location.search.includes('tab=qr') ? 'active' : ''}`}
                  >
                    <QrCode size={14} /> <span>Pay via UPI QR Code</span>
                  </Link>
                </div>
              </div>
            )}

            {/* Admin Credentials Link */}
            {isTabAllowed('credentials') && (
              <Link
                to="/admin/credentials"
                onClick={() => isOpen && toggleSidebar()}
                className={`admin-nav-menu-item ${isActive('/admin/credentials') ? 'active' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <Key size={18} /> <span>Admin Credentials</span>
                </div>
              </Link>
            )}

            {/* Support Contact Link */}
            {isTabAllowed('support-contact') && (
              <Link
                to="/admin/support-contact"
                onClick={() => isOpen && toggleSidebar()}
                className={`admin-nav-menu-item ${isActive('/admin/support-contact') ? 'active' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <Headphones size={18} /> <span>Support Contact</span>
                </div>
              </Link>
            )}

            {/* User View Direct Link */}
            {isTabAllowed('userview') && (
              <Link
                to="/admin/user-view"
                onClick={() => isOpen && toggleSidebar()}
                className={`admin-nav-menu-item ${currentPath.startsWith('/admin/user-view') ? 'active' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <Eye size={18} /> <span>User View</span>
                </div>
              </Link>
            )}

          </nav>
        </div>

        {/* Fixed Logout Button at the bottom */}
        <div className="admin-sidebar-footer-action">
          <button onClick={handleLogoutClick} className="admin-sidebar-logout-trigger">
            <LogOut size={16} /> <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Overlay backdrop for mobile */}
      {isOpen && <div className="admin-sidebar-overlay-backdrop" onClick={toggleSidebar}></div>}

      {/* Custom Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="admin-modal-overlay">
          <div className="admin-confirm-modal card glass-card">
            <div className="admin-confirm-icon-box">
              <AlertTriangle size={32} />
            </div>
            <h3>Confirm Sign Out</h3>
            <p>Are you sure you want to end your administration session and log out from the Admin Portal?</p>
            <div className="admin-confirm-actions">
              <button className="btn btn-outline" onClick={() => setShowLogoutConfirm(false)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={confirmLogout}>
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
