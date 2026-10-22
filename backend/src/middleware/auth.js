const jwt = require('jsonwebtoken')
const User = require('../models/User')

const protect = async (req, res, next) => {
  let token

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1]
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'jwt_secret_key_12345678')
      req.user = await User.findById(decoded.id).select('-password')
      if (!req.user) {
        return res.status(401).json({ message: 'User not found or deleted' })
      }
      return typeof next === 'function' ? next() : undefined
    } catch (error) {
      console.error(error)
      return res.status(401).json({ message: 'Not authorized, token failed' })
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' })
  }
}

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next()
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' })
  }
}

const adminOrStaff = (req, res, next) => {
  if (req.user && ['admin', 'manager', 'staff'].includes(req.user.role)) {
    next()
  } else {
    res.status(403).json({ message: 'Not authorized, staff or admin access required' })
  }
}

module.exports = { protect, adminOnly, adminOrStaff }
// End of file
