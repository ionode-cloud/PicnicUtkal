import { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import toast from 'react-hot-toast'

const SocketContext = createContext(null)

const getSocketUrl = () => {
  if (import.meta.env.VITE_SOCKET_URL) return import.meta.env.VITE_SOCKET_URL
  if (import.meta.env.VITE_BACKEND_URL) return import.meta.env.VITE_BACKEND_URL
  if (import.meta.env.VITE_API_URL) {
    try {
      const u = new URL(import.meta.env.VITE_API_URL)
      return u.origin
    } catch (e) {}
  }
  return 'http://localhost:5300'
}

const SOCKET_URL = getSocketUrl()

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [liveVisitors, setLiveVisitors] = useState(1)
  const [lastBooking, setLastBooking] = useState(null)

  useEffect(() => {
    // Create socket instance
    const socketIo = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000
    })

    socketIo.on('connect', () => {
      setIsConnected(true)
    })

    socketIo.on('disconnect', () => {
      setIsConnected(false)
    })

    // Listen to live visitors counter
    socketIo.on('live_visitors_update', (data) => {
      if (data && data.count) {
        setLiveVisitors(data.count)
      }
    })

    // Real-time booking alert across all connected users
    socketIo.on('booking_created', (data) => {
      setLastBooking(data)
      toast.success(
        `🎉 Live Booking: ${data.pandalName || 'Picnic Pandal'} reserved for ${data.visitDate || 'upcoming date'}!`, 
        { duration: 5000, icon: '⛺' }
      )
    })

    // Real-time admin announcements
    socketIo.on('live_announcement', (data) => {
      toast(data.message || 'Announcement from PicnicUtkal Admin!', {
        duration: 6000,
        icon: '📢',
        style: {
          background: 'var(--forest-dark)',
          color: '#fff',
          border: '1px solid var(--gold)'
        }
      })
    })

    setSocket(socketIo)

    return () => {
      socketIo.disconnect()
    }
  }, [])

  const joinRoom = (roomName) => {
    if (socket && isConnected) {
      socket.emit('join_room', roomName)
    }
  }

  const emitPlotStatusChange = (plotId, status) => {
    if (socket && isConnected) {
      socket.emit('plot_status_change', { plotId, status, timestamp: new Date() })
    }
  }

  const emitNewBooking = (bookingData) => {
    if (socket && isConnected) {
      socket.emit('new_booking', bookingData)
    }
  }

  const emitAdminAnnouncement = (message) => {
    if (socket && isConnected) {
      socket.emit('admin_announcement', { message, timestamp: new Date() })
    }
  }

  const emitHomeConfigUpdate = (homeConfig) => {
    if (socket && isConnected) {
      socket.emit('home_config_update', { config: homeConfig, timestamp: new Date() })
    }
  }

  const emitAboutConfigUpdate = (aboutConfig) => {
    if (socket && isConnected) {
      socket.emit('about_config_update', { config: aboutConfig, timestamp: new Date() })
    }
  }

  const emitGalleryConfigUpdate = (galleryConfig) => {
    if (socket && isConnected) {
      socket.emit('gallery_config_update', { config: galleryConfig, timestamp: new Date() })
    }
  }

  const emitContactConfigUpdate = (contactConfig) => {
    if (socket && isConnected) {
      socket.emit('contact_config_update', { config: contactConfig, timestamp: new Date() })
    }
  }

  const emitMapConfigUpdate = (mapsData) => {
    if (socket && isConnected) {
      socket.emit('map_config_update', { maps: mapsData, timestamp: new Date() })
    }
  }

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        liveVisitors,
        lastBooking,
        joinRoom,
        emitPlotStatusChange,
        emitNewBooking,
        emitAdminAnnouncement,
        emitHomeConfigUpdate,
        emitAboutConfigUpdate,
        emitGalleryConfigUpdate,
        emitContactConfigUpdate,
        emitMapConfigUpdate
      }}
    >
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  const context = useContext(SocketContext)
  if (!context) {
    // Graceful fallback if used outside SocketProvider
    return {
      socket: null,
      isConnected: false,
      liveVisitors: 1,
      lastBooking: null,
      joinRoom: () => {},
      emitPlotStatusChange: () => {},
      emitNewBooking: () => {},
      emitAdminAnnouncement: () => {},
      emitHomeConfigUpdate: () => {},
      emitAboutConfigUpdate: () => {},
      emitGalleryConfigUpdate: () => {},
      emitContactConfigUpdate: () => {},
      emitMapConfigUpdate: () => {}
    }
  }
  return context
}
