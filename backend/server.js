const http        = require('http')
const express     = require('express')
const cors        = require('cors')
const helmet      = require('helmet')
const morgan      = require('morgan')
const dotenv      = require('dotenv')
const compression = require('compression')
const { Server }  = require('socket.io')
const connectDB   = require('./src/config/db')

// Load environment variables
dotenv.config()

// Connect to Database
connectDB()

const app    = express()
const server = http.createServer(app)

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(url => url.trim())
  : ['https://picnicutkal.com', 'https://www.picnicutkal.com', 'http://localhost:5173', 'http://localhost:3000']

// Initialize Socket.io with CORS
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        callback(null, true)
      } else {
        callback(null, true)
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
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

  // Broadcast real-time home config & logo update across public site
  socket.on('home_config_update', (data) => {
    console.log(`[Socket.io] Home config updated`)
    io.emit('home_config_update', data)
  })

  socket.on('logo_config_update', (data) => {
    console.log(`[Socket.io] Logo config updated`)
    io.emit('logo_config_update', data)
  })

  socket.on('footer_config_update', (data) => {
    console.log(`[Socket.io] Footer config updated`)
    io.emit('footer_config_update', data)
  })

  socket.on('zones_config_update', (data) => {
    console.log(`[Socket.io] Zones config updated`)
    io.emit('zones_config_update', data)
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

// ── Middleware ──────────────────────────────────────────────────────────────

// Gzip / Brotli compression — MUST be first middleware.
// Reduces JSON response payloads by ~70-85%, and HTML/CSS by ~60-80%.
// Critical for mobile users on 3G/4G.
app.use(compression({
  // Only compress responses > 1KB (compressing tiny responses wastes CPU)
  threshold: 1024,
  // Use maximum gzip compression level for best mobile performance
  level: 6,
  filter: (req, res) => {
    // Always compress unless the client explicitly opts out
    if (req.headers['x-no-compression']) return false
    return compression.filter(req, res)
  }
}))

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      callback(null, true)
    } else {
      callback(null, true)
    }
  },
  credentials: true
}))

app.use(helmet({ contentSecurityPolicy: false }))

// Use 'combined' in production (shorter output in dev with 'dev')
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))

app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))

// ── Caching Strategy ────────────────────────────────────────────────────────
// Disable ETag and prevent stale caching on all API routes so refreshes always fetch latest data
app.use(['/api', '/spots', '/map', '/bookings', '/site-config', '/contact', '/auth'], (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  res.set('Pragma', 'no-cache')
  res.set('Expires', '0')
  res.removeHeader('ETag')
  next()
})

// Make socket instance available in express req
app.use((req, res, next) => {
  req.io = io
  next()
})

// ── Routes ───────────────────────────────────────────────────────────────────
const authRoutes    = require('./src/routes/auth')
const spotRoutes    = require('./src/routes/spots')
const mapRoutes     = require('./src/routes/map')
const bookingRoutes = require('./src/routes/bookings')
const contactRoutes = require('./src/routes/contact')
const configRoutes  = require('./src/routes/config')

// Mount routes (both /api and root paths supported for production domain routing)
app.use(['/api/auth',        '/auth'],        authRoutes)
app.use(['/api/spots',       '/spots'],       spotRoutes)
app.use(['/api/map',         '/map'],         mapRoutes)
app.use(['/api/bookings',    '/bookings'],    bookingRoutes)
app.use(['/api/contact',     '/contact'],     contactRoutes)
app.use(['/api/site-config', '/site-config'], configRoutes)

// Health Check
app.get(['/api/health', '/health'], (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date(),
    activeSockets: io.engine.clientsCount
  })
})

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
