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
      visitDate, persons, durationDays, specialNote,
      paymentMethod, transactionRef, visitors, selectedAddons
    } = req.body

    if (!plotId || !name || !email || !phone || !visitDate || !persons) {
      return res.status(400).json({ success: false, message: 'All required fields must be provided.' })
    }

    // 1. Authoritative MongoDB Plot Lookup
    let plotDoc = null
    if (mongoose.Types.ObjectId.isValid(plotId)) {
      plotDoc = await MapPlot.findById(plotId)
    }
    if (!plotDoc) {
      const cleanTitle = String(plotTitle || plotId).replace(/^(plot|pandal|zone)-/i, '').replace(/[-_]/g, ' ').trim()
      plotDoc = await MapPlot.findOne({
        $or: [
          { customId: plotId },
          { title: new RegExp(cleanTitle, 'i') }
        ]
      })
    }

    // Check special cottage-rooms virtual fallback or error if plot does not exist
    if (!plotDoc && plotId !== 'cottage-rooms') {
      return res.status(404).json({ success: false, message: 'Picnic plot / zone not found in database.' })
    }

    const authoritativePlotId = plotDoc ? String(plotDoc._id) : plotId
    const authoritativePlotTitle = plotDoc ? plotDoc.title : (plotTitle || 'Cottage Rooms')
    const authoritativeBasePrice = plotDoc ? Number(plotDoc.price) : (Number(plotPrice) || 999)

    // 2. Validate Duration & Persons
    const validDuration = Math.max(1, Number(durationDays) || 1)
    const validPersons = Math.max(1, Number(persons) || 1)

    // 3. Authoritative Pricing Calculation on Backend
    const baseTotal = authoritativeBasePrice * validDuration
    let addonsTotal = 0
    if (Array.isArray(selectedAddons) && selectedAddons.length > 0) {
      addonsTotal = selectedAddons.reduce((sum, a) => sum + (Number(a.priceAddon) || Number(a.price) || 0), 0)
    }
    const authoritativeTotalAmount = baseTotal + addonsTotal

    // 4. Validate Visit Date & Range Availability
    const parsedDate = new Date(visitDate)
    const validVisitDate = isNaN(parsedDate.getTime()) ? new Date(Date.now() + 86400000) : parsedDate
    const formattedVisitDateStr = validVisitDate.toISOString().split('T')[0]

    const startOfRange = new Date(`${formattedVisitDateStr}T00:00:00.000Z`)
    const endOfRange = new Date(startOfRange)
    endOfRange.setDate(endOfRange.getDate() + validDuration - 1)
    endOfRange.setHours(23, 59, 59, 999)

    // Authoritative multi-day conflict check: inspect all active bookings ending on/after requested start
    const existingCandidates = await Booking.find({
      $or: [
        { plotId: authoritativePlotId },
        { plotId: String(plotId) },
        { plotTitle: authoritativePlotTitle }
      ],
      status: { $ne: 'cancelled' },
      visitDate: { $lte: endOfRange }
    })

    const hasConflict = existingCandidates.some(b => {
      if (!b.visitDate) return false
      const bStart = new Date(b.visitDate)
      if (isNaN(bStart.getTime())) return false
      const bDays = Math.max(1, Number(b.durationDays) || 1)
      const bEnd = new Date(bStart)
      bEnd.setDate(bEnd.getDate() + bDays - 1)
      bEnd.setHours(23, 59, 59, 999)
      return bStart <= endOfRange && bEnd >= startOfRange
    })

    if (hasConflict) {
      return res.status(409).json({
        success: false,
        message: 'This spot is already booked for the selected date range. Please select another date.'
      })
    }

    // 5. Create and Save Authoritative Booking Record
    const booking = new Booking({
      plotId: authoritativePlotId,
      plotTitle: authoritativePlotTitle,
      plotPrice: authoritativeBasePrice,
      durationDays: validDuration,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      visitDate: validVisitDate,
      persons: validPersons,
      specialNote: specialNote || '',
      visitors: visitors || [],
      selectedAddons: selectedAddons || [],
      paymentMethod: paymentMethod || 'upi',
      transactionRef: transactionRef ? String(transactionRef).trim() : '',
      totalAmount: authoritativeTotalAmount,
      paymentStatus: paymentMethod === 'cash' ? 'pending' : 'paid',
      status: 'confirmed'
    })

    await booking.save()

    if (req.io) {
      req.io.emit('plot_updated', { plotId: authoritativePlotId, visitDate: formattedVisitDateStr, status: 'booked' })
      req.io.emit('plots_update')
    }

    res.status(201).json({
      success: true,
      data: booking,
      booking,
      referenceCode: booking.bookingId || booking._id
    })
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
    res.status(200).json({ success: true, data: bookings })
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

    const targetConditions = [
      { plotId: String(targetId) },
      { spotId: String(targetId) }
    ]
    if (mongoose.Types.ObjectId.isValid(targetId)) {
      targetConditions.push({ plotId: new mongoose.Types.ObjectId(targetId) })
    }

    const bookings = await Booking.find({
      $or: targetConditions,
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

    res.status(200).json({
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
    const booking = await Booking.findOne(makeBookingQuery(req.params.bookingId))
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' })

    res.status(200).json({ success: true, data: booking })
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

    res.status(200).json({ success: true, message: 'Booking deleted successfully', data: booking })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// PUT — update booking status (e.g. cancelled/completed/confirmed)
router.put('/:bookingId', async (req, res) => {
  try {
    // Whitelist safe fields to prevent mass-assignment attacks
    const ALLOWED_FIELDS = ['status', 'specialNote', 'paymentStatus', 'paymentMethod', 'transactionRef']
    const safeUpdate = {}
    ALLOWED_FIELDS.forEach(f => { if (req.body[f] !== undefined) safeUpdate[f] = req.body[f] })

    const booking = await Booking.findOneAndUpdate(
      makeBookingQuery(req.params.bookingId),
      safeUpdate,
      { new: true }
    )
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' })

    if (req.io) {
      if (booking.plotId) {
        req.io.emit('plot_updated', { plotId: booking.plotId, status: booking.status })
      }
      req.io.emit('plots_update')
    }

    res.status(200).json({ success: true, data: booking })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

module.exports = router
