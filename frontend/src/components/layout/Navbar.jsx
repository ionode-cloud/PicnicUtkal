import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LuSun as Sun, LuMoon as Moon, LuMenu as Menu, LuX as X, LuUser as User,
  LuMapPin as MapPin, LuPhone as Phone, LuChevronDown as ChevronDown, LuLeaf as Leaf,
  LuCalendar as CalendarIcon, LuCreditCard as CreditCard, LuCircleHelp as HelpCircle, LuLogOut as LogOut, LuShieldCheck as ShieldCheck
} from 'react-icons/lu'
import { useTheme } from '../../context/ThemeContext'
import { useAuthStore, useUIStore } from '../../store'
import { useLogo } from '../../context/LogoContext'
import logoImg from '../../assets/logo.png'

const NAV_LINKS = [
  { label: 'Home',     href: '/' },
  { label: 'About',    href: '/about' },
  { label: 'Spots',    href: '/spots' },
  { label: 'Map',      href: '/map' },
  { label: 'Gallery',  href: '/gallery' },
  { label: 'Contact',  href: '/contact' },
]

export default function Navbar() {
  const { theme, toggleTheme } = useTheme()
  const { isAuthenticated, user, logout } = useAuthStore()
  const { isMobileMenuOpen, setMobileMenu } = useUIStore()
  const { logoConfig } = useLogo()
  const [scrolled, setScrolled] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleLogout = () => {
    logout()
    setUserMenuOpen(false)
    navigate('/')
  }

  return (
    <>
      <motion.header
        className={`navbar ${scrolled ? 'navbar--scrolled' : 'navbar--transparent'}`}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="navbar__inner container-fluid">
          {/* Logo */}
          <Link to="/" className="navbar__logo" style={{ display: 'flex', alignItems: 'center' }}>
            <img 
              src={logoConfig?.url || logoImg} 
              alt="PicnicUtkal Logo" 
              style={{ 
                height: `${logoConfig?.height ? Math.min(Math.max(logoConfig.height, 42), 65) : 52}px`, 
                width: 'auto', 
                maxWidth: '220px', 
                objectFit: 'contain'
              }}
              onError={(e) => {
                e.target.onerror = null
                e.target.src = '/logo.png'
              }}
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="navbar__links" aria-label="Main navigation">
            {NAV_LINKS.map(link => (
              <NavLink
                key={link.href}
                to={link.href}
                className={({ isActive }) =>
                  `navbar__link ${isActive ? 'navbar__link--active' : ''}`
                }
                end={link.href === '/'}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Actions */}
          <div className="navbar__actions">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="navbar__icon-btn"
              aria-label="Toggle theme"
              id="theme-toggle-btn"
            >
              <AnimatePresence mode="wait">
                <motion.span
                  key={theme}
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 90 }}
                  transition={{ duration: 0.2 }}
                >
                  {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                </motion.span>
              </AnimatePresence>
            </button>

            {/* Auth */}
            {isAuthenticated ? (
              <div className="navbar__user-menu">
                <button
                  className="navbar__user-btn"
                  onClick={() => setUserMenuOpen(v => !v)}
                  id="user-menu-btn"
                >
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="navbar__avatar" />
                  ) : (
                    <div className="navbar__avatar-placeholder">
                      {(user?.name || user?.email || 'U')[0]?.toUpperCase()}
                    </div>
                  )}
                  <span className="navbar__user-name">{user?.name || (user?.email ? user.email.split('@')[0] : 'User')}</span>
                  <ChevronDown size={14} className={userMenuOpen ? 'rotate-180' : ''} style={{ transition: 'transform 0.2s' }} />
                </button>
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      className="navbar__dropdown"
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.18 }}
                    >
                      {(user?.role === 'admin' || user?.role === 'superadmin' || user?.role === 'staff') ? (
                        <>
                          <Link to="/admin/dashboard" className="navbar__dropdown-item navbar__dropdown-item--admin" onClick={() => setUserMenuOpen(false)}>
                            <ShieldCheck size={15} /> Admin Console
                          </Link>
                          <Link to="/admin/spots" className="navbar__dropdown-item" onClick={() => setUserMenuOpen(false)}>
                            <MapPin size={15} /> Manage Spots
                          </Link>
                          <Link to="/admin/users" className="navbar__dropdown-item" onClick={() => setUserMenuOpen(false)}>
                            <User size={15} /> Registered Users
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link to="/user?tab=profile" className="navbar__dropdown-item" onClick={() => setUserMenuOpen(false)}>
                            <User size={15} /> Profile
                          </Link>
                          <Link to="/user?tab=bookings" className="navbar__dropdown-item" onClick={() => setUserMenuOpen(false)}>
                            <CalendarIcon size={15} /> Bookings
                          </Link>
                          <Link to="/user?tab=payments" className="navbar__dropdown-item" onClick={() => setUserMenuOpen(false)}>
                            <CreditCard size={15} /> Payments
                          </Link>
                          <Link to="/user?tab=help" className="navbar__dropdown-item" onClick={() => setUserMenuOpen(false)}>
                            <HelpCircle size={15} /> Help
                          </Link>
                        </>
                      )}
                      <hr className="navbar__dropdown-divider" />
                      <button className="navbar__dropdown-item navbar__dropdown-item--danger" onClick={handleLogout}>
                        <LogOut size={15} /> Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="navbar__auth-btns">
                <Link to="/login" className="btn btn-primary btn-sm" id="nav-login-btn">Login / Sign Up</Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              className="navbar__hamburger"
              onClick={() => setMobileMenu(!isMobileMenuOpen)}
              aria-label="Toggle menu"
              id="mobile-menu-btn"
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              className="navbar__mobile-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenu(false)}
            />
            <motion.div
              className="navbar__mobile-menu"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            >
              <div className="navbar__mobile-header">
                <span className="navbar__logo-text">Picnic<span className="text-gradient">Utkal</span></span>
                <button onClick={() => setMobileMenu(false)} className="navbar__icon-btn"><X size={22} /></button>
              </div>
              <nav className="navbar__mobile-links">
                {NAV_LINKS.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <NavLink
                      to={link.href}
                      className={({ isActive }) =>
                        `navbar__mobile-link ${isActive ? 'navbar__mobile-link--active' : ''}`
                      }
                      onClick={() => setMobileMenu(false)}
                      end={link.href === '/'}
                    >
                      {link.label}
                    </NavLink>
                  </motion.div>
                ))}
              </nav>
              <div className="navbar__mobile-actions">
                {!isAuthenticated && (
                  <Link to="/login" className="btn btn-primary w-full" onClick={() => setMobileMenu(false)} id="nav-login-btn-mobile">Login / Sign Up</Link>
                )}
                <div className="navbar__mobile-info">
                  <span><Phone size={14} /> +91 98765 43210</span>
                  <span><MapPin size={14} /> Bhubaneswar, Odisha</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}