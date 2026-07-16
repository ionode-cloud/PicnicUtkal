const User = require('../models/User')
const jwt = require('jsonwebtoken')

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'jwt_secret_key_12345678', {
    expiresIn: '30d'
  })
}

exports.register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body

    const userExists = await User.findOne({ email })
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' })
    }

    const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase()
    const user = await User.create({
      name,
      email,
      phone,
      password,
      referralCode,
      walletBalance: 0,
      rewardPoints: 0
    })

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      })
    } else {
      res.status(400).json({ message: 'Invalid user data' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })
    if (user && (await user.comparePassword(password))) {
      res.json({
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
