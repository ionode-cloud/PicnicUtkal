import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LuUsers as Users, LuTrees as Trees, LuCalendar as Calendar, LuShoppingBag as ShoppingBag, LuLandmark as Landmark, LuTimer as Timer, LuLayers as Layers,
  LuTrendingUp as TrendingUp, LuUsers as UsersIcon, LuArrowUpRight as ArrowUpRight,
  LuRadio as Radio, LuRefreshCw as RefreshCw
} from 'react-icons/lu'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { useSocket } from '../../context/SocketContext'
import { buildApiUrl } from '../../services/api'
import toast from 'react-hot-toast'

const COLORS = ['#1B4332', '#C9A84C', '#52B788', '#2D6A4F', '#38BDF8', '#F59E0B']

export default function Dashboard() {
  const { socket, isConnected, liveVisitors, emitAdminAnnouncement } = useSocket()
  const [broadcastMsg, setBroadcastMsg] = useState('')
  const [loading, setLoading] = useState(true)

  // Real backend data states
  const [bookings, setBookings] = useState([])
  const [plots, setPlots] = useState([])
  const [users, setUsers] = useState([])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const [bookingsRes, plotsRes, usersRes] = await Promise.allSettled([
        fetch(buildApiUrl('/api/bookings')).then(r => r.json()),
        fetch(buildApiUrl('/api/map/plots')).then(r => r.json()),
        fetch(buildApiUrl('/api/auth/users')).then(r => r.json())
      ])

      if (bookingsRes.status === 'fulfilled' && bookingsRes.value?.success && Array.isArray(bookingsRes.value.data)) {
        setBookings(bookingsRes.value.data)
      }
      if (plotsRes.status === 'fulfilled' && plotsRes.value?.success && Array.isArray(plotsRes.value.data)) {
        setPlots(plotsRes.value.data)
      }
      if (usersRes.status === 'fulfilled' && usersRes.value?.success && Array.isArray(usersRes.value.data)) {
        setUsers(usersRes.value.data)
      }
    } catch (err) {
      console.error('Failed to load dashboard live data:', err)
    } finally {
      setLoading(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchDashboardData()
  }, [])

  // Real-time Socket Listener: auto-refresh stats live on any booking/plot/user event
  useEffect(() => {
    if (!socket) return
    const handleUpdate = () => fetchDashboardData()

    socket.on('plots_update', handleUpdate)
    socket.on('plot_updated', handleUpdate)
    socket.on('new_booking', handleUpdate)
    socket.on('booking_created', handleUpdate)
    socket.on('booking_updated', handleUpdate)
    socket.on('payment_success', handleUpdate)
    socket.on('user_registered', handleUpdate)

    return () => {
      socket.off('plots_update', handleUpdate)
      socket.off('plot_updated', handleUpdate)
      socket.off('new_booking', handleUpdate)
      socket.off('booking_created', handleUpdate)
      socket.off('booking_updated', handleUpdate)
      socket.off('payment_success', handleUpdate)
      socket.off('user_registered', handleUpdate)
    }
  }, [socket])

  const handleSendBroadcast = (e) => {
    e.preventDefault()
    if (!broadcastMsg.trim()) {
      toast.error('Announcement message cannot be empty.')
      return
    }
    emitAdminAnnouncement(broadcastMsg)
    toast.success('Live announcement broadcasted to all connected visitors!')
    setBroadcastMsg('')
  }

  // Calculate 100% real live stats from MongoDB
  const activeBookings = bookings.filter(b => b.status !== 'cancelled')
  const totalRevenue = activeBookings.reduce((sum, b) => sum + (Number(b.totalAmount || b.totalPrice || b.plotPrice) || 0), 0)
  
  const todayStr = new Date().toISOString().split('T')[0]
  const todayBookingsCount = bookings.filter(b => {
    const bDate = b.createdAt ? new Date(b.createdAt).toISOString().split('T')[0] : (b.visitDate ? new Date(b.visitDate).toISOString().split('T')[0] : '')
    return bDate === todayStr
  }).length

  const pendingPaymentsCount = bookings.filter(b => b.paymentStatus === 'pending' || b.status === 'pending').length
  const activeSpotsCount = plots.filter(p => p.status !== 'maintenance').length

  const kpis = [
    { label: 'Real-time Visitors', val: `${liveVisitors} Online`, change: isConnected ? 'Socket Live' : 'Offline', trend: 'success', icon: Radio, color: '#4ADE80' },
    { label: 'Total Users', val: users.length.toLocaleString(), change: 'MongoDB Live', trend: 'success', icon: Users, color: 'var(--info)' },
    { label: 'Total Spots', val: plots.length.toString(), change: 'MongoDB Live', trend: 'success', icon: Trees, color: 'var(--forest)' },
    { label: 'Total Bookings', val: activeBookings.length.toLocaleString(), change: 'MongoDB Live', trend: 'success', icon: Calendar, color: 'var(--gold)' },
    { label: 'Today\'s Bookings', val: todayBookingsCount.toString(), change: 'Live Today', trend: 'success', icon: ShoppingBag, color: '#e8590c' },
    { label: 'Total Revenue', val: `₹${totalRevenue.toLocaleString()}`, change: 'Real Revenue', trend: 'success', icon: Landmark, color: 'var(--success)' },
    { label: 'Pending Payments', val: pendingPaymentsCount.toString(), change: 'Live Pending', trend: 'warning', icon: Timer, color: '#fcc419' },
    { label: 'Active Zones', val: activeSpotsCount.toString(), change: 'Operational', trend: 'neutral', icon: Layers, color: '#748ffc' }
  ]

  // Dynamic Real Data Chart Calculations
  // 1. Revenue Performance (Monthly)
  const revenueChartData = (() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const revMap = {}
    months.forEach(m => { revMap[m] = 0 })

    activeBookings.forEach(b => {
      const dateVal = b.createdAt || b.visitDate || b.bookingDate
      if (dateVal) {
        const d = new Date(dateVal)
        if (!isNaN(d.getTime())) {
          const monthName = months[d.getMonth()]
          revMap[monthName] += (Number(b.totalAmount || b.totalPrice || b.plotPrice) || 0)
        }
      }
    })

    const currMonthIdx = new Date().getMonth()
    const startIdx = Math.max(0, currMonthIdx - 5)
    return months.slice(startIdx, currMonthIdx + 1).map(m => ({
      name: m,
      revenue: revMap[m]
    }))
  })()

  // 2. Weekly Booking Trends
  const weeklyBookingsData = (() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const counts = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 }

    activeBookings.forEach(b => {
      const dateVal = b.visitDate || b.createdAt || b.bookingDate
      if (dateVal) {
        const d = new Date(dateVal)
        if (!isNaN(d.getTime())) {
          const dayName = days[d.getDay()]
          counts[dayName] = (counts[dayName] || 0) + 1
        }
      }
    })

    return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => ({
      name: d,
      bookings: counts[d]
    }))
  })()

  // 3. User Account Growth
  const userGrowthData = (() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const userMap = {}
    months.forEach(m => { userMap[m] = 0 })

    users.forEach(u => {
      const dateVal = u.joinedDate || u.createdAt
      if (dateVal) {
        const d = new Date(dateVal)
        if (!isNaN(d.getTime())) {
          const monthName = months[d.getMonth()]
          userMap[monthName] += 1
        }
      }
    })

    const currMonthIdx = new Date().getMonth()
    const startIdx = Math.max(0, currMonthIdx - 5)
    let cumulative = 0
    return months.slice(startIdx, currMonthIdx + 1).map(m => {
      cumulative += userMap[m]
      return {
        name: m,
        users: cumulative
      }
    })
  })()

  // 4. Popular Picnic Spots Pie Chart
  const popularSpotsData = (() => {
    const spotMap = {}
    let totalBookingsCount = 0

    activeBookings.forEach(b => {
      const title = b.plotTitle || b.spotName || b.spotTitle || 'Picnic Spot'
      spotMap[title] = (spotMap[title] || 0) + 1
      totalBookingsCount++
    })

    if (totalBookingsCount === 0) {
      if (plots.length > 0) {
        return plots.slice(0, 5).map(p => ({
          name: p.title?.length > 18 ? p.title.slice(0, 16) + '...' : (p.title || 'Spot'),
          value: 0
        }))
      }
      return [{ name: 'No Bookings Yet', value: 100 }]
    }

    return Object.keys(spotMap).map(title => ({
      name: title.length > 18 ? title.slice(0, 16) + '...' : title,
      value: Math.round((spotMap[title] / totalBookingsCount) * 100)
    }))
  })()

  const getStatusBadgeClass = (status) => {
    switch (String(status).toLowerCase()) {
      case 'confirmed': return 'badge-success'
      case 'completed': return 'badge-glass'
      case 'pending':   return 'badge-gold'
      case 'cancelled': return 'badge-danger'
      default:          return 'badge-glass'
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <div className="admin-dashboard-container">

      {/* KPI Cards Grid */}
      <motion.div
        className="admin-kpis-grid"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {kpis.map((kpi, idx) => (
          <motion.div key={idx} className="admin-kpi-card card glass-card" variants={itemVariants}>
            <div className="admin-kpi-top">
              <div>
                <span className="admin-kpi-label">{kpi.label}</span>
                <h3 className="admin-kpi-value">{kpi.val}</h3>
              </div>
              <div className="admin-kpi-icon-wrap" style={{ backgroundColor: `${kpi.color}15`, color: kpi.color }}>
                <kpi.icon size={22} />
              </div>
            </div>
            <div className="admin-kpi-bottom">
              <span className={`admin-kpi-trend ${kpi.trend}`}>{kpi.change}</span>
              <span className="admin-kpi-sub">MongoDB Live</span>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Grid */}
      <div className="admin-charts-grid mt-8">
        {/* Revenue Area Chart */}
        <div className="card glass-card admin-chart-box">
          <div className="chart-header">
            <h4>Revenue Performance (INR)</h4>
            <span className="badge badge-success"><TrendingUp size={12} /> Live tracking</span>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--forest)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--forest)" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Revenue']} />
                <Area type="monotone" dataKey="revenue" stroke="var(--forest)" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bookings Bar Chart */}
        <div className="card glass-card admin-chart-box">
          <div className="chart-header">
            <h4>Weekly Booking Trends</h4>
            <span className="badge badge-glass">Live Week</span>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyBookingsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <Tooltip formatter={(value) => [value, 'Bookings']} />
                <Bar dataKey="bookings" fill="var(--gold)" radius={[4, 4, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Activity grid */}
      <div className="admin-activity-grid mt-8">
        {/* Latest Bookings Table (Real Data) */}
        <div className="card glass-card admin-activity-box flex-2">
          <div className="chart-header flex justify-between items-center">
            <h4>Latest Real-time Bookings</h4>
            <Link to="/admin/bookings" className="text-gold text-sm flex items-center gap-1 hover-link">
              View All <ArrowUpRight size={14} />
            </Link>
          </div>
          <div className="admin-table-scroll-wrapper">
            <table className="admin-table-view">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Customer</th>
                  <th>Visit Date</th>
                  <th>Guests</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                      No active bookings in database yet.
                    </td>
                  </tr>
                ) : (
                  bookings.slice(0, 6).map(bk => (
                    <tr key={bk._id || bk.bookingId}>
                      <td className="bold" style={{ color: 'var(--gold)', fontFamily: 'monospace' }}>
                        #{bk.bookingId || String(bk._id).slice(-8)}
                      </td>
                      <td>{bk.name}</td>
                      <td>{bk.visitDate ? new Date(bk.visitDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</td>
                      <td>{bk.persons || 1} Guest(s)</td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(bk.status || bk.bookingStatus)}`}>
                          {bk.status ? (bk.status.charAt(0).toUpperCase() + bk.status.slice(1)) : 'Confirmed'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* System activity feed logs */}
        <div className="card glass-card admin-activity-box flex-1">
          <div className="chart-header">
            <h4>Live Activity Feed</h4>
          </div>
          <div className="admin-activity-feed-logs">
            {bookings.slice(0, 4).map((bk, i) => (
              <div key={i} className="feed-log-item">
                <span className="feed-log-time">
                  {bk.createdAt ? new Date(bk.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                </span>
                <p>
                  Booking <strong>#{bk.bookingId || String(bk._id).slice(-6)}</strong> for <strong>{bk.plotTitle || 'Spot'}</strong> by <strong>{bk.name}</strong>
                </p>
              </div>
            ))}
            <div className="feed-log-item">
              <span className="feed-log-time">Live</span>
              <p>Socket server connected: <strong>{liveVisitors} visitors online</strong></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
