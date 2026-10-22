const User = require('../models/User')
const jwt = require('jsonwebtoken')

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'jwt_secret_key_12345678', {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d'
  })
}

exports.register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body
    const normalizedEmail = email ? email.trim().toLowerCase() : ''

    const userExists = await User.findOne({ email: normalizedEmail })
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Email already registered!' })
    }

    const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase()
    const user = await User.create({
      name,
      email: normalizedEmail,
      phone,
      password,
      referralCode,
      walletBalance: 0,
      rewardPoints: 0
    })

    if (user) {
      const userData = {
        _id: user._id,
        id: `USR-${user._id.toString().slice(-4).toUpperCase()}`,
        name: user.name,
        email: user.email,
        phone: user.phone || 'Not Provided',
        role: user.role || 'User',
        joinedDate: new Date(user.createdAt || Date.now()).toISOString().split('T')[0],
        bookingsCount: 0,
        totalSpent: 0,
        status: 'Active'
      }

      if (req.io) {
        req.io.emit('user_registered', userData)
      }

      res.status(201).json({
        success: true,
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        token: generateToken(user._id)
      })
    } else {
      res.status(400).json({ success: false, message: 'Invalid user data' })
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } }).select('-password').sort({ createdAt: -1 })
    const formatted = users.map(u => ({
      _id: u._id,
      id: `USR-${u._id.toString().slice(-4).toUpperCase()}`,
      name: u.name,
      email: u.email,
      phone: u.phone || 'Not Provided',
      role: u.role || 'User',
      joinedDate: new Date(u.createdAt || Date.now()).toISOString().split('T')[0],
      bookingsCount: 0,
      totalSpent: 0,
      status: 'Active'
    }))
    res.json({ success: true, data: formatted })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body
    const normalizedLoginEmail = email ? email.trim().toLowerCase() : ''
    const user = await User.findOne({ email: normalizedLoginEmail })
    if (user && (await user.comparePassword(password))) {
      res.json({
        success: true,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        walletBalance: user.walletBalance,
        rewardPoints: user.rewardPoints,
        token: generateToken(user._id)
      })
    } else {
      res.status(401).json({ message: 'Invalid email or password' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password')
    if (user) {
      res.json(user)
    } else {
      res.status(404).json({ message: 'User not found' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body
    const updateData = {}
    if (name) updateData.name = name.trim()
    if (phone) updateData.phone = phone.trim()

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true }
    ).select('-password')

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user,
      user
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
