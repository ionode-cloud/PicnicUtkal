const express = require('express')
const router  = express.Router()
const Booking = require('../models/Booking')

// POST — create a new booking
router.post('/', async (req, res) => {
  try {
    const {
      plotId, plotTitle, plotPrice,
      name, email, phone,
      visitDate, persons, specialNote,
      paymentMethod, visitors
    } = req.body

    if (!plotId || !plotTitle || !name || !email || !phone || !visitDate || !persons) {
      return res.status(400).json({ success: false, message: 'All required fields must be provided.' })
    }

    const totalAmount = plotPrice * persons

    const booking = new Booking({
      plotId, plotTitle, plotPrice,
      name, email, phone,
      visitDate: new Date(visitDate),
      persons: Number(persons),
      specialNote: specialNote || '',
      visitors: visitors || [],
      paymentMethod: paymentMethod || 'upi',
      totalAmount,
      paymentStatus: 'paid',
      status: 'confirmed'
    })

    await booking.save()

    res.status(201).json({ success: true, data: booking })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// GET — all bookings (admin)
router.get('/', async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 })
    res.json({ success: true, data: bookings })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// GET — single booking by bookingId
router.get('/:bookingId', async (req, res) => {
  try {
    const booking = await Booking.findOne({ bookingId: req.params.bookingId })
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' })
    res.json({ success: true, data: booking })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// DELETE — cancel booking
router.delete('/:bookingId', async (req, res) => {
  try {
    const booking = await Booking.findOneAndUpdate(
      { bookingId: req.params.bookingId },
      { status: 'cancelled' },
      { new: true }
    )
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' })
    res.json({ success: true, data: booking })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

module.exports = router
