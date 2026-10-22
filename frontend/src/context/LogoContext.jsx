import { createContext, useContext, useState, useEffect } from 'react'
import { useSocket } from './SocketContext'
import { buildApiUrl } from '../services/api'

const DEFAULT_LOGO_CONFIG = {
  type: 'image', // 'icon' | 'image'
  url: '/logo.png',
  height: 52,
  textMain: 'Picnic',
  textAccent: 'Utkal'
}

const LogoContext = createContext()

export function LogoProvider({ children }) {
  const [logoConfig, setLogoConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('picnicutkal_site_logo')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed && typeof parsed === 'object') return parsed
      }
    } catch (e) {}
    return DEFAULT_LOGO_CONFIG
  })

  const { socket } = useSocket()

  // Fetch logo config from MongoDB database on mount
  useEffect(() => {
    fetch(buildApiUrl('/api/site-config/logo_config'))
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d && d.success && d.data) {
          setLogoConfig(prev => ({ ...prev, ...d.data }))
          try {
            localStorage.setItem('picnicutkal_site_logo', JSON.stringify(d.data))
          } catch (e) {}
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!socket) return
    const handleLogoUpdate = (data) => {
      if (data && typeof data === 'object') {
        const newLogo = data.logo || data
        if (newLogo.type !== undefined || newLogo.url !== undefined || newLogo.textMain !== undefined) {
          setLogoConfig(prev => {
            const updated = { ...prev, ...newLogo }
            try {
              localStorage.setItem('picnicutkal_site_logo', JSON.stringify(updated))
            } catch (e) {}
            return updated
          })
        }
      }
    }
    socket.on('logo_config_update', handleLogoUpdate)
    socket.on('home_config_update', handleLogoUpdate)
    return () => {
      socket.off('logo_config_update', handleLogoUpdate)
      socket.off('home_config_update', handleLogoUpdate)
    }
  }, [socket])

  const updateLogo = (newConfig) => {
    const updated = { ...logoConfig, ...newConfig }
    setLogoConfig(updated)
    try {
      localStorage.setItem('picnicutkal_site_logo', JSON.stringify(updated))
    } catch (e) {}
    try {
      fetch(buildApiUrl('/api/site-config/logo_config'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: updated })
      })
    } catch (e) {}
    if (socket) {
      socket.emit('logo_config_update', updated)
    }
  }

  return (
    <LogoContext.Provider value={{ logoConfig, setLogoConfig, updateLogo }}>
      {children}
    </LogoContext.Provider>
  )
}

export function useLogo() {
  const context = useContext(LogoContext)
  if (!context) {
    return {
      logoConfig: DEFAULT_LOGO_CONFIG,
      setLogoConfig: () => {},
      updateLogo: () => {}
    }
  }
  return context
}
