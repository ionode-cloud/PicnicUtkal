import { useState, useEffect } from 'react'
import { LuSearch as Search, LuSun as Sun, LuMoon as Moon, LuBell as Bell, LuMenu as Menu } from 'react-icons/lu'
import { useAuthStore } from '../../store'
import { useTheme } from '../../context/ThemeContext'

export default function Navbar({ toggleSidebar }) {
  const { user } = useAuthStore()
  const { theme, toggleTheme } = useTheme()
  const [time, setTime] = useState(new Date())

  // Ticking clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Format date and time
  const formattedDate = time.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })

  const formattedTime = time.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  })

  return (
    <header className="admin-navbar-sticky-header">
      {/* Left side - hamburger & search */}
      <div className="admin-navbar-left-block">
        <button className="admin-sidebar-mobile-toggler" onClick={toggleSidebar}>
          <Menu size={20} />
        </button>
        <div className="admin-navbar-search-box">
          <Search size={16} />
          <input type="text" placeholder="Search logs, bookings, spot IDs..." />
        </div>
      </div>

      {/* Right side - date, time, actions */}
      <div className="admin-navbar-right-block">
        {/* Date and Time Info */}
        <div className="admin-navbar-clock-indicator">
          <span className="admin-navbar-date-str">{formattedDate}</span>
          <span className="admin-navbar-divider-bar">|</span>
          <span className="admin-navbar-time-str">{formattedTime}</span>
        </div>

        {/* Action controls */}
        <div className="admin-navbar-action-icons">
          {/* Light/Dark Toggle */}
          <button onClick={toggleTheme} className="admin-navbar-icon-btn" title="Toggle Theme">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        {/* User Identity Info */}
        <div className="admin-navbar-profile-summary">
          <div className="admin-navbar-profile-meta text-right">
            <h4>{user?.name || 'Admin User'}</h4>
            <span>Administrator</span>
          </div>
          {user?.avatar ? (
            <img src={user.avatar} className="admin-navbar-avatar-img" alt={user.name} />
          ) : (
            <div className="admin-navbar-avatar-placeholder">
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
