const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const dotenv = require('dotenv')
const connectDB = require('./src/config/db')

// Load environment variables
dotenv.config()

// Connect to Database
connectDB()

const app = express()

// Middleware
app.use(cors())
app.use(helmet())
app.use(morgan('dev'))
app.use(express.json())

// Import routes
const authRoutes    = require('./src/routes/auth')
const spotRoutes    = require('./src/routes/spots')
const mapRoutes     = require('./src/routes/map')
const bookingRoutes = require('./src/routes/bookings')

// Mount routes
app.use('/api/auth',     authRoutes)
app.use('/api/spots',    spotRoutes)
app.use('/api/map',      mapRoutes)
app.use('/api/bookings', bookingRoutes)

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    message: err.message || 'Something went wrong on the server',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
