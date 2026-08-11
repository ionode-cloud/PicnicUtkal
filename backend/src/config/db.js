const mongoose = require('mongoose')
const User = require('../models/User')

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI)
    console.log(`MongoDB Connected: ${conn.connection.host}`)

    // Auto seed admin user if not exists
    const adminExists = await User.findOne({ email: 'admin@picnicutkal.com' })
    if (!adminExists) {
      await User.create({
        name: 'Super Admin',
        email: 'admin@picnicutkal.com',
        phone: '9876543210',
        password: 'admin123',
        role: 'admin',
        isVerified: true
      })
      console.log('Default Admin user created (admin@picnicutkal.com / admin123)')
    } else if (adminExists.role !== 'admin') {
      adminExists.role = 'admin'
      await adminExists.save()
      console.log('Admin user role verified.')
    }
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`)
    process.exit(1)
  }
}

module.exports = connectDB
