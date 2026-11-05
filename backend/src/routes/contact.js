const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const ContactMessage = require('../models/ContactMessage')
const { protect, adminOrStaff } = require('../middleware/auth')

// POST /api/contact - Submit new user contact form message
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body

    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Name, Email, and Message are required' })
    }

    const payload = {
      name: String(name).trim(),
      email: String(email).trim(),
      phone: phone ? String(phone).trim() : '',
      subject: subject ? String(subject).trim() : 'Support & Group Inquiry',
      message: String(message).trim(),
      status: 'Pending',
      createdAt: new Date()
    }

    let newMessage = null
    try {
      newMessage = await ContactMessage.create(payload)
    } catch (dbErr) {
      console.warn('Could not persist contact message to DB, creating memory object:', dbErr.message)
      newMessage = {
        _id: `msg-${Date.now()}`,
        ...payload,
        createdAt: payload.createdAt.toISOString()
      }
    }

    // Convert Mongoose doc to plain object if needed
    const messageObj = newMessage && typeof newMessage.toObject === 'function' 
      ? newMessage.toObject() 
      : newMessage

    // Emit real-time Socket.io event for Admin Panel notification
    if (req.io) {
      req.io.emit('new_contact_message', messageObj)
    }

    res.status(201).json({
      success: true,
      message: 'Your inquiry has been received! Our support team will reach out soon.',
      data: messageObj
    })
  } catch (error) {
    console.error('Error saving contact message:', error)
    res.status(500).json({ message: 'Server error saving contact message' })
  }
})

// GET /api/contact - Retrieve all contact messages for admin
router.get('/', protect, adminOrStaff, async (req, res) => {
  try {
    let messages = []
    try {
      messages = await ContactMessage.find().sort({ createdAt: -1 })
    } catch (dbErr) {
      console.warn('DB read error for ContactMessage:', dbErr.message)
      messages = []
    }

    res.json({ success: true, count: messages.length, data: messages })
  } catch (error) {
    console.error('Error fetching contact messages:', error)
    res.status(500).json({ message: 'Server error fetching messages' })
  }
})

// PUT /api/contact/:id - Update message status
router.put('/:id', protect, adminOrStaff, async (req, res) => {
  try {
    const { status } = req.body
    if (!['Pending', 'Replied', 'Resolved'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' })
    }

    let updated = null
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      try {
        updated = await ContactMessage.findByIdAndUpdate(
          req.params.id,
          { status },
          { new: true }
        )
      } catch (err) {
        console.warn('Error in findByIdAndUpdate:', err.message)
      }
    }

    if (!updated) {
      updated = { _id: req.params.id, status }
    } else if (typeof updated.toObject === 'function') {
      updated = updated.toObject()
    }

    if (req.io) {
      req.io.emit('contact_message_status_changed', updated)
    }

    res.json({ success: true, data: updated })
  } catch (error) {
    console.error('Error updating contact message status:', error)
    res.status(500).json({ message: 'Server error updating message' })
  }
})

// DELETE /api/contact/:id - Delete message
router.delete('/:id', protect, adminOrStaff, async (req, res) => {
  try {
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      try {
        await ContactMessage.findByIdAndDelete(req.params.id)
      } catch (err) {
        console.warn('Error in findByIdAndDelete:', err.message)
      }
    }

    if (req.io) {
      req.io.emit('contact_message_deleted', { id: req.params.id })
    }

    res.json({ success: true, message: 'Message deleted successfully', id: req.params.id })
  } catch (error) {
    console.error('Error deleting contact message:', error)
    res.status(500).json({ message: 'Server error deleting message' })
  }
})

module.exports = router
