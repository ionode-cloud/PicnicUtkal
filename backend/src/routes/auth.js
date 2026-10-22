const express = require('express')
const router = express.Router()
const { register, login, getMe, getUsers, updateProfile } = require('../controllers/authController')
const { protect, adminOnly, adminOrStaff } = require('../middleware/auth')

router.post('/register', register)
router.post('/login', login)
router.get('/me', protect, getMe)
router.put('/profile', protect, updateProfile)
router.get('/users', protect, adminOrStaff, getUsers)

module.exports = router
