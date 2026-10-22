const express = require('express')
const router = express.Router()
const Booking = require('../models/Booking')
const { getSpots, getSpotById, createSpot } = require('../controllers/spotController')
const { protect, adminOrStaff } = require('../middleware/auth')

// GET /api/spots/:spotId/availability
router.get('/:spotId/availability', async (req, res) => {
  try {
    const targetId = req.params.spotId
    const targetTitle = String(targetId).replace(/-/g, ' ')
    const bookings = await Booking.find({
      $or: [
        { plotId: targetId },
        { spotId: targetId },
        { bookingId: targetId },
        { plotTitle: new RegExp(targetTitle, 'i') }
      ],
      status: { $ne: 'cancelled' }
    })

    const bookedDatesSet = new Set()
    bookings.forEach(b => {
      if (!b.visitDate) return
      const start = new Date(b.visitDate)
      if (isNaN(start.getTime())) return
      
      const daysCount = Math.max(1, Number(b.durationDays) || Number(b.duration) || 1)
      for (let i = 0; i < daysCount; i++) {
        const d = new Date(start)
        d.setDate(d.getDate() + i)
        bookedDatesSet.add(d.toISOString().split('T')[0])
      }
    })
    const bookedDates = Array.from(bookedDatesSet)

    const availabilityMap = {}
    bookedDates.forEach(d => {
      availabilityMap[d] = { status: 'booked', available: false }
    })

    res.json({
      success: true,
      spotId: targetId,
      bookedDates,
      data: availabilityMap
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

router.get('/', getSpots)
router.get('/:id', getSpotById)
router.post('/', protect, adminOrStaff, createSpot)

module.exports = router
