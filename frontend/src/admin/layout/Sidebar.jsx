import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store'
import {
  LayoutDashboard, MapPin, Trees, Calendar, Users, CreditCard,
  Image, Tag, Star, BookOpen, Bell, Settings, User, LogOut,
  ChevronDown, ChevronRight, Leaf, Eye, PlusCircle, FolderHeart,
  Droplets, Flame, Music, Tent, Compass, Sparkles, Smile,
  Hourglass, CheckCircle2, XCircle, FileSpreadsheet, ListTodo, AlertTriangle, DollarSign,
  Map
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function Sidebar({ isOpen, toggleSidebar }) {
  const { logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const currentPath = location.pathname

  // Menu collapse states
  const [openMenus, setOpenMenus] = useState({
    spots: false,
    zones: false,
    bookings: false,
    users: false,
    payments: false,
    gallery: false
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
            <Link
              to="/admin/dashboard"
              className={`admin-nav-menu-item ${isActive('/admin/dashboard') ? 'active' : ''}`}
            >
              <LayoutDashboard size={18} /> <span>Dashboard</span>
            </Link>

            {/* Picnic Spots Submenu */}
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
                <Link to="/admin/spots/add" className="admin-submenu-item">
                  <PlusCircle size={14} /> <span>Add Spot</span>
                </Link>
                <Link to="/admin/spots/categories" className="admin-submenu-item">
                  <FolderHeart size={14} /> <span>Spot Categories</span>
                </Link>
              </div>
            </div>

            {/* Zones Submenu */}
            <div className="admin-nav-submenu-wrap">
              <button
                onClick={() => toggleSubmenu('zones')}
                className={`admin-nav-menu-item admin-nav-submenu-header ${openMenus.zones ? 'expanded' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <Trees size={18} /> <span>Zones</span>
                </div>
                {openMenus.zones ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
              <div className={`admin-nav-submenu-list ${openMenus.zones ? 'open' : ''}`}>
                <Link to="/admin/zones/swimming" className="admin-submenu-item">
                  <Droplets size={14} /> <span>Swimming Zone</span>
                </Link>
                <Link to="/admin/zones/cooking" className="admin-submenu-item">
                  <Flame size={14} /> <span>Cooking Zone</span>
                </Link>
                <Link to="/admin/zones/music" className="admin-submenu-item">
                  <Music size={14} /> <span>Music Zone</span>
                </Link>
                <Link to="/admin/zones/camping" className="admin-submenu-item">
                  <Tent size={14} /> <span>Camping Zone</span>
                </Link>
                <Link to="/admin/zones/adventure" className="admin-submenu-item">
                  <Compass size={14} /> <span>Adventure Zone</span>
                </Link>
                <Link to="/admin/zones/kids" className="admin-submenu-item">
                  <Smile size={14} /> <span>Kids Zone</span>
                </Link>
                <Link to="/admin/zones/garden" className="admin-submenu-item">
                  <Sparkles size={14} /> <span>Garden Zone</span>
                </Link>
              </div>
            </div>

            {/* Bookings Submenu */}
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
                <Link to="/admin/bookings/pending" className="admin-submenu-item">
                  <Hourglass size={14} /> <span>Pending</span>
                </Link>
                <Link to="/admin/bookings/confirmed" className="admin-submenu-item">
                  <CheckCircle2 size={14} /> <span>Confirmed</span>
                </Link>
                <Link to="/admin/bookings/cancelled" className="admin-submenu-item">
                  <XCircle size={14} /> <span>Cancelled</span>
                </Link>
                <Link to="/admin/bookings/completed" className="admin-submenu-item">
                  <ListTodo size={14} /> <span>Completed</span>
                </Link>
              </div>
            </div>

            {/* Users Submenu */}
            <div className="admin-nav-submenu-wrap">
              <button
                onClick={() => toggleSubmenu('users')}
                className={`admin-nav-menu-item admin-nav-submenu-header ${openMenus.users ? 'expanded' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <Users size={18} /> <span>Users</span>
                </div>
                {openMenus.users ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
              <div className={`admin-nav-submenu-list ${openMenus.users ? 'open' : ''}`}>
                <Link to="/admin/users" className={`admin-submenu-item ${isActive('/admin/users') ? 'active' : ''}`}>
                  <Users size={14} /> <span>All Users</span>
                </Link>
                <Link to="/admin/users/admins" className="admin-submenu-item">
                  <Sparkles size={14} /> <span>Admins</span>
                </Link>
                <Link to="/admin/users/staff" className="admin-submenu-item">
                  <User size={14} /> <span>Staff</span>
                </Link>
              </div>
            </div>

            {/* Payments Submenu */}
            <div className="admin-nav-submenu-wrap">
              <button
                onClick={() => toggleSubmenu('payments')}
                className={`admin-nav-menu-item admin-nav-submenu-header ${openMenus.payments ? 'expanded' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <CreditCard size={18} /> <span>Payments</span>
                </div>
                {openMenus.payments ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
              <div className={`admin-nav-submenu-list ${openMenus.payments ? 'open' : ''}`}>
                <Link to="/admin/payments" className={`admin-submenu-item ${isActive('/admin/payments') ? 'active' : ''}`}>
                  <CreditCard size={14} /> <span>Transactions</span>
                </Link>
                <Link to="/admin/payments/refunds" className="admin-submenu-item">
                  <XCircle size={14} /> <span>Refunds</span>
                </Link>
                <Link to="/admin/payments/revenue" className="admin-submenu-item">
                  <DollarSign size={14} /> <span>Revenue</span>
                </Link>
              </div>
            </div>

            {/* Gallery Submenu */}
            <div className="admin-nav-submenu-wrap">
              <button
                onClick={() => toggleSubmenu('gallery')}
                className={`admin-nav-menu-item admin-nav-submenu-header ${openMenus.gallery ? 'expanded' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <Image size={18} /> <span>Gallery</span>
                </div>
                {openMenus.gallery ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
              <div className={`admin-nav-submenu-list ${openMenus.gallery ? 'open' : ''}`}>
                <Link to="/admin/gallery" className={`admin-submenu-item ${isActive('/admin/gallery') ? 'active' : ''}`}>
                  <Image size={14} /> <span>Photos</span>
                </Link>
                <Link to="/admin/gallery/videos" className="admin-submenu-item">
                  <Eye size={14} /> <span>Videos</span>
                </Link>
              </div>
            </div>

            {/* Map Management Link */}
            <Link
              to="/admin/map"
              className={`admin-nav-menu-item ${isActive('/admin/map') ? 'active' : ''}`}
            >
              <Map size={18} /> <span>Map Management</span>
            </Link>

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
