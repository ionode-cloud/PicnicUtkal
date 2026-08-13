const http = require('http')
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const dotenv = require('dotenv')
const { Server } = require('socket.io')
const connectDB = require('./src/config/db')

// Load environment variables
dotenv.config()

// Connect to Database
connectDB()

const app = express()
const server = http.createServer(app)

// Initialize Socket.io with CORS
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
})

// Active connections counter
let activeVisitors = 0

// Socket.io Connection & Real-time Event Handlers
io.on('connection', (socket) => {
  activeVisitors++
  console.log(`[Socket.io] Client connected: ${socket.id} (Total: ${activeVisitors})`)

  // Broadcast updated live visitor count to all connected clients
  io.emit('live_visitors_update', { count: activeVisitors, timestamp: new Date() })

  // Client joins specific room (e.g. 'admin', 'spot_detail', 'map_view')
  socket.on('join_room', (room) => {
    socket.join(room)
    console.log(`[Socket.io] Client ${socket.id} joined room: ${room}`)
  })

  // Broadcast real-time plot status change across Map & Spots
  socket.on('plot_status_change', (data) => {
    console.log(`[Socket.io] Plot status changed:`, data)
    io.emit('plot_updated', data)
  })

  // Broadcast real-time plots update across public Spots and Home pages
  socket.on('plots_update', (data) => {
    console.log(`[Socket.io] Plots updated`)
    io.emit('plots_update', data)
  })

  // Broadcast real-time interactive map config update
  socket.on('map_config_update', (data) => {
    console.log(`[Socket.io] Map config updated`)
    io.emit('map_config_update', data)
  })

  // Broadcast real-time booking created
  socket.on('new_booking', (bookingData) => {
    console.log(`[Socket.io] New booking created:`, bookingData.pandalName)
    io.emit('booking_created', bookingData)
    io.to('admin').emit('admin_new_booking_alert', bookingData)
  })

  // Admin Broadcast Announcement
  socket.on('admin_announcement', (announcement) => {
    console.log(`[Socket.io] Admin announcement:`, announcement)
    io.emit('live_announcement', announcement)
  })

  socket.on('disconnect', () => {
    activeVisitors = Math.max(0, activeVisitors - 1)
    console.log(`[Socket.io] Client disconnected: ${socket.id} (Total: ${activeVisitors})`)
    io.emit('live_visitors_update', { count: activeVisitors, timestamp: new Date() })
  })
})

// Middleware
app.use(cors())
app.use(helmet({ contentSecurityPolicy: false }))
app.use(morgan('dev'))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))

// Make socket instance available in express req
app.use((req, res, next) => {
  req.io = io
  next()
})

// Import routes
const authRoutes    = require('./src/routes/auth')
const spotRoutes    = require('./src/routes/spots')
const mapRoutes     = require('./src/routes/map')
const bookingRoutes = require('./src/routes/bookings')
const contactRoutes = require('./src/routes/contact')

// Mount routes
app.use('/api/auth',     authRoutes)
app.use('/api/spots',    spotRoutes)
app.use('/api/map',      mapRoutes)
app.use('/api/bookings', bookingRoutes)
app.use('/api/contact',  contactRoutes)

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date(),
    activeSockets: io.engine.clientsCount
  })
})

// Serve static frontend in production if dist directory exists
const path = require('path')
const fs = require('fs')
const frontendDistPath = path.join(__dirname, '../frontend/dist')
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath))
  app.use((req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) return next()
    res.sendFile(path.join(frontendDistPath, 'index.html'))
  })
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    message: err.message || 'Something went wrong on the server',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  })
})

const PORT = process.env.PORT || 5300
server.listen(PORT, () => {
  console.log(`Server & Socket.io running on port ${PORT}`)
})
