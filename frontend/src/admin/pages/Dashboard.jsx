import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LuUsers as Users, LuTrees as Trees, LuCalendar as Calendar, LuShoppingBag as ShoppingBag, LuLandmark as Landmark, LuTimer as Timer, LuLayers as Layers, LuStar as Star,
  LuTrendingUp as TrendingUp, LuUsers as UsersIcon, LuCalendar as CalendarIcon, LuArrowUpRight as ArrowUpRight
} from 'react-icons/lu'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'

// Mock analytics data
const REVENUE_DATA = [
  { name: 'Jan', revenue: 45000 },
  { name: 'Feb', revenue: 52000 },
  { name: 'Mar', revenue: 61000 },
  { name: 'Apr', revenue: 58000 },
  { name: 'May', revenue: 72000 },
  { name: 'Jun', revenue: 98000 },
  { name: 'Jul', revenue: 184390 }
]

const BOOKINGS_DATA = [
  { name: 'Mon', bookings: 12 },
  { name: 'Tue', bookings: 19 },
  { name: 'Wed', bookings: 15 },
  { name: 'Thu', bookings: 22 },
  { name: 'Fri', bookings: 30 },
  { name: 'Sat', bookings: 48 },
  { name: 'Sun', bookings: 55 }
]

const USER_GROWTH_DATA = [
  { name: 'Week 1', users: 850 },
  { name: 'Week 2', users: 960 },
  { name: 'Week 3', users: 1100 },
  { name: 'Week 4', users: 1248 }
]

const POPULAR_SPOTS_DATA = [
  { name: 'Nandankanan', value: 45 },
  { name: 'Chilika Lake', value: 30 },
  { name: 'Barunei Hills', value: 15 },
  { name: 'Daringbadi', value: 10 }
]

const COLORS = ['#1B4332', '#C9A84C', '#52B788', '#2D6A4F']

import { useState } from 'react'
import { useSocket } from '../../context/SocketContext'
import toast from 'react-hot-toast'
import { LuRadio as Radio, LuSend as Send } from 'react-icons/lu'

export default function Dashboard() {
  const { isConnected, liveVisitors, emitAdminAnnouncement } = useSocket()
  const [broadcastMsg, setBroadcastMsg] = useState('')

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

  const kpis = [
    { label: 'Real-time Visitors', val: `${liveVisitors} Online`, change: isConnected ? 'Socket Live' : 'Offline', trend: 'success', icon: Radio, color: '#4ADE80' },
    { label: 'Total Users', val: '1,248', change: '+4.1%', trend: 'success', icon: Users, color: 'var(--info)' },
    { label: 'Total Spots', val: '52', change: '+2 new', trend: 'success', icon: Trees, color: 'var(--forest)' },
    { label: 'Total Bookings', val: '438', change: '+8.2%', trend: 'success', icon: Calendar, color: 'var(--gold)' },
    { label: 'Today\'s Bookings', val: '14', change: '+12%', trend: 'success', icon: ShoppingBag, color: '#e8590c' },
    { label: 'Monthly Revenue', val: '₹1,84,390', change: '+12.4%', trend: 'success', icon: Landmark, color: 'var(--success)' },
    { label: 'Pending Payments', val: '3', change: '-15%', trend: 'warning', icon: Timer, color: '#fcc419' },
    { label: 'Active Zones', val: '24', change: '100% capacity', trend: 'neutral', icon: Layers, color: '#748ffc' }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
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
              <span className="admin-kpi-sub">from last cycle</span>
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
              <AreaChart data={REVENUE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--forest)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--forest)" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <Tooltip formatter={(value) => [`₹${value}`, 'Revenue']} />
                <Area type="monotone" dataKey="revenue" stroke="var(--forest)" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bookings Bar Chart */}
        <div className="card glass-card admin-chart-box">
          <div className="chart-header">
            <h4>Weekly Booking Trends</h4>
            <span className="badge badge-glass">Current Week</span>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={BOOKINGS_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <Tooltip formatter={(value) => [value, 'Bookings']} />
                <Bar dataKey="bookings" fill="var(--gold)" radius={[4, 4, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Growth Line Chart */}
        <div className="card glass-card admin-chart-box">
          <div className="chart-header">
            <h4>User Account Growth</h4>
            <span className="badge badge-info"><UsersIcon size={12} /> Active accounts</span>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={USER_GROWTH_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <Tooltip formatter={(value) => [value, 'Users']} />
                <Line type="monotone" dataKey="users" stroke="var(--success)" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Popular Picnic Spots Pie Chart */}
        <div className="card glass-card admin-chart-box">
          <div className="chart-header">
            <h4>Popular Picnic Spots</h4>
            <span className="badge badge-glass">Booking share %</span>
          </div>
          <div className="chart-wrapper flex items-center justify-center">
            <div style={{ width: '100%', height: '80%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={POPULAR_SPOTS_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {POPULAR_SPOTS_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, 'Share']} />
                  <Legend verticalAlign="bottom" height={36} iconSize={10} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Activity grid */}
      <div className="admin-activity-grid mt-8">
        {/* Latest Bookings Table */}
        <div className="card glass-card admin-activity-box flex-2">
          <div className="chart-header flex justify-between items-center">
            <h4>Latest Bookings</h4>
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
                <tr>
                  <td className="bold">#BK-9283</td>
                  <td>Sunil Mohanty</td>
                  <td>14 Jul 2026</td>
                  <td>5 Guests</td>
                  <td><span className="badge badge-success">Confirmed</span></td>
                </tr>
                <tr>
                  <td className="bold">#BK-9281</td>
                  <td>Anjali Das</td>
                  <td>15 Jul 2026</td>
                  <td>8 Guests</td>
                  <td><span className="badge badge-warning">Pending</span></td>
                </tr>
                <tr>
                  <td className="bold">#BK-9278</td>
                  <td>Rajesh Nayak</td>
                  <td>12 Jul 2026</td>
                  <td>2 Guests</td>
                  <td><span className="badge badge-danger">Cancelled</span></td>
                </tr>
                <tr>
                  <td className="bold">#BK-9275</td>
                  <td>Pooja Mishra</td>
                  <td>10 Jul 2026</td>
                  <td>4 Guests</td>
                  <td><span className="badge badge-glass">Completed</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* System activity feed logs */}
        <div className="card glass-card admin-activity-box flex-1">
          <div className="chart-header">
            <h4>Live Security Activity Log</h4>
          </div>
          <div className="admin-activity-feed-logs">
            <div className="feed-log-item">
              <span className="feed-log-time">17:48 PM</span>
              <p>Admin <strong>Jyoti Ranjan</strong> successfully logged in from IP 192.168.1.1</p>
            </div>
            <div className="feed-log-item">
              <span className="feed-log-time">16:30 PM</span>
              <p>New registration: <strong>Siddharth Patnaik</strong> (siddharth@gmail.com)</p>
            </div>
            <div className="feed-log-item">
              <span className="feed-log-time">15:12 PM</span>
              <p>Payment of <strong>₹1,298</strong> verified for booking #BK-9281</p>
            </div>
            <div className="feed-log-item">
              <span className="feed-log-time">14:05 PM</span>
              <p>Coupon code <strong>MONSOON30</strong> created by manager</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
