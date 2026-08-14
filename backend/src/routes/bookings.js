const express = require('express')
const router  = express.Router()
const mongoose = require('mongoose')
const Booking = require('../models/Booking')
const MapPlot = require('../models/MapPlot')

// Safe query helpers to prevent Mongoose CastError on invalid ObjectIds
const makeBookingQuery = (idOrRef) => {
  const conditions = [{ bookingId: idOrRef }]
  if (mongoose.Types.ObjectId.isValid(idOrRef)) {
    conditions.push({ _id: idOrRef })
  }
  return { $or: conditions }
}

const makePlotQuery = (idOrRef) => {
  const conditions = [{ id: idOrRef }]
  if (mongoose.Types.ObjectId.isValid(idOrRef)) {
    conditions.push({ _id: idOrRef })
  }
  return { $or: conditions }
}

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

    const parsedDate = new Date(visitDate)
    const validVisitDate = isNaN(parsedDate.getTime()) ? new Date(Date.now() + 86400000) : parsedDate
    const validPrice = Number(plotPrice) > 0 ? Number(plotPrice) : 499
    const validPersons = Number(persons) > 0 ? Number(persons) : 1
    // Spot booking price is a flat rate for the plot (or explicitly passed totalAmount)
    const totalAmount = Number(req.body.totalAmount) > 0 ? Number(req.body.totalAmount) : validPrice

    // Server-side Double Booking Validation Check for exact spot + date
    const formattedVisitDateStr = validVisitDate.toISOString().split('T')[0]
    const startOfDay = new Date(`${formattedVisitDateStr}T00:00:00.000Z`)
    const endOfDay   = new Date(`${formattedVisitDateStr}T23:59:59.999Z`)

    const existingBooking = await Booking.findOne({
      $or: [{ plotId }, { plotTitle }],
      status: { $ne: 'cancelled' },
      visitDate: { $gte: startOfDay, $lte: endOfDay }
    })

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: "This spot is already booked for this date. Please select another date."
      })
    }

    const booking = new Booking({
      plotId, plotTitle, plotPrice: validPrice,
      name, email, phone,
      visitDate: validVisitDate,
      persons: validPersons,
      specialNote: specialNote || '',
      visitors: visitors || [],
      paymentMethod: paymentMethod || 'upi',
      totalAmount,
      paymentStatus: paymentMethod === 'cash' ? 'pending' : 'paid',
      status: 'confirmed'
    })

    await booking.save()

    if (req.io) {
      req.io.emit('plot_updated', { plotId, visitDate: formattedVisitDateStr, status: 'booked' })
      req.io.emit('plots_update')
    }

    res.status(201).json({ success: true, data: booking })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// GET — bookings by email (user dashboard) or all bookings (admin)
router.get('/', async (req, res) => {
  try {
    const { email } = req.query
    const filter = email ? { email: new RegExp(`^${email.trim()}$`, 'i') } : {}
    const bookings = await Booking.find(filter).sort({ createdAt: -1 })
    
    // Auto-correct any existing legacy bookings where totalAmount was multiplied by persons
    for (const b of bookings) {
      if (b.persons > 1 && b.totalAmount === b.plotPrice * b.persons) {
        b.totalAmount = b.plotPrice
        await Booking.updateOne({ _id: b._id }, { totalAmount: b.plotPrice }).catch(() => {})
      }
    }

    res.json({ success: true, data: bookings })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// GET — spot availability date range from Booking collection
router.get('/availability', async (req, res) => {
  try {
    const { spotId, plotId } = req.query
    const targetId = spotId || plotId
    if (!targetId) {
      return res.status(400).json({ success: false, message: 'spotId or plotId query parameter required' })
    }

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

// GET — single booking by bookingId
router.get('/:bookingId', async (req, res) => {
  try {
    let booking = await Booking.findOne(makeBookingQuery(req.params.bookingId))
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' })

    // Auto-correct legacy inflated totalAmount if needed
    if (booking.persons > 1 && booking.totalAmount === booking.plotPrice * booking.persons) {
      booking.totalAmount = booking.plotPrice
      await Booking.updateOne({ _id: booking._id }, { totalAmount: booking.plotPrice }).catch(() => {})
    }

    res.json({ success: true, data: booking })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// DELETE — hard delete booking and release plot spot
router.delete('/:bookingId', async (req, res) => {
  try {
    const booking = await Booking.findOneAndDelete(makeBookingQuery(req.params.bookingId))
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' })

    // Release plot spot in database if plotId exists
    if (booking.plotId) {
      await MapPlot.findOneAndUpdate(
        makePlotQuery(booking.plotId),
        { status: 'available', isBooked: false }
      ).catch(() => {})
    }

    if (req.io) {
      if (booking.plotId) {
        req.io.emit('plot_updated', { plotId: booking.plotId, status: 'available', isBooked: false })
      }
      req.io.emit('plots_update')
    }

    res.json({ success: true, message: 'Booking deleted successfully', data: booking })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// PUT — update booking status (e.g. cancelled/completed/confirmed)
router.put('/:bookingId', async (req, res) => {
  try {
    const booking = await Booking.findOneAndUpdate(
      makeBookingQuery(req.params.bookingId),
      req.body,
      { new: true }
    )
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' })

    if (req.io) {
      if (booking.plotId) {
        req.io.emit('plot_updated', { plotId: booking.plotId, status: booking.status })
      }
      req.io.emit('plots_update')
    }

    res.json({ success: true, data: booking })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

module.exports = router
