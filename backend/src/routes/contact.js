const express = require('express')
const router = express.Router()
const ContactMessage = require('../models/ContactMessage')
const { protect, adminOrStaff } = require('../middleware/auth')

// POST /api/contact - Submit new user contact form message
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body

    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Name, Email, and Message are required' })
    }

    const newMessage = await ContactMessage.create({
      name: name.trim(),
      email: email.trim(),
      phone: phone ? phone.trim() : '',
      subject: subject ? subject.trim() : 'General Inquiry',
      message: message.trim(),
      status: 'Pending'
    })

    // Emit real-time Socket.io event for Admin Panel notification
    if (req.io) {
      req.io.emit('new_contact_message', newMessage)
    }

    res.status(201).json({
      success: true,
      message: 'Your message has been sent successfully!',
      data: newMessage
    })
  } catch (error) {
    console.error('Error saving contact message:', error)
    res.status(500).json({ message: 'Server error saving contact message' })
  }
})

// GET /api/contact - Retrieve all contact messages for admin
router.get('/', protect, adminOrStaff, async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 })
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

    const updated = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )

    if (!updated) {
      return res.status(404).json({ message: 'Contact message not found' })
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
    const deleted = await ContactMessage.findByIdAndDelete(req.params.id)
    if (!deleted) {
      return res.status(404).json({ message: 'Contact message not found' })
    }
    res.json({ success: true, message: 'Message deleted successfully' })
  } catch (error) {
    console.error('Error deleting contact message:', error)
    res.status(500).json({ message: 'Server error deleting message' })
  }
})

module.exports = router
