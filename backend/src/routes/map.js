const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const MapPlot = require('../models/MapPlot')
const InteractiveMap = require('../models/InteractiveMap')

const SEED_MAP = {
  title: 'Barapita Master Plan (Main Ground)',
  image: '/assets/master-plan.png',
  description: 'Central master plan containing Biotech parks, Riverside Pandals, and Main Gate.',
  spotId: '1',
  linkedSpot: 'Barapita Ground, Deras',
  googleMapUrl: 'https://maps.google.com/?q=20.311450,85.690644',
  isDefault: true
}

// GET all maps
router.get('/maps', async (req, res) => {
  try {
    let maps = await InteractiveMap.find().sort({ isDefault: -1, createdAt: 1 })
    if (maps.length === 0) {
      await InteractiveMap.create(SEED_MAP).catch(() => {})
      maps = await InteractiveMap.find().sort({ isDefault: -1, createdAt: 1 })
    }
    res.json({ success: true, data: maps })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// POST create map
router.post('/maps', async (req, res) => {
  try {
    const payload = {
      title: req.body.title,
      image: req.body.image,
      description: req.body.description || '',
      spotId: req.body.spotId || '',
      linkedSpot: req.body.linkedSpot || '',
      googleMapUrl: req.body.googleMapUrl || '',
      isDefault: Boolean(req.body.isDefault)
    }
    const map = new InteractiveMap(payload)
    const saved = await map.save()
    if (req.io) req.io.emit('map_config_update', { map: saved, action: 'created', timestamp: new Date() })
    res.status(201).json({ success: true, data: saved })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// PUT update map
router.put('/maps/:id', async (req, res) => {
  try {
    const id = req.params.id
    let map = null
    if (mongoose.Types.ObjectId.isValid(id)) {
      map = await InteractiveMap.findByIdAndUpdate(id, req.body, { new: true })
    }
    if (!map) {
      map = await InteractiveMap.findOneAndUpdate({ title: req.body.title }, req.body, { new: true })
    }
    if (!map) {
      return res.status(404).json({ success: false, message: 'Map not found' })
    }
    if (req.io) req.io.emit('map_config_update', { map, action: 'updated', timestamp: new Date() })
    res.json({ success: true, data: map })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// DELETE map
router.delete('/maps/:id', async (req, res) => {
  try {
    const id = req.params.id
    if (mongoose.Types.ObjectId.isValid(id)) {
      await InteractiveMap.findByIdAndDelete(id)
    } else {
      await InteractiveMap.deleteMany({ $or: [{ _id: id }, { title: new RegExp(id.replace(/-/g, ' '), 'i') }] })
    }
    if (req.io) req.io.emit('map_config_update', { mapId: id, action: 'deleted', timestamp: new Date() })
    res.json({ success: true, message: 'Map deleted' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// GET all plots (optional mapId filter)
router.get('/plots', async (req, res) => {
  try {
    const filter = {}
    if (req.query.mapId) {
      filter.mapId = req.query.mapId
    }
    const plots = await MapPlot.find(filter).sort({ priority: -1, createdAt: 1 })
    res.json({ success: true, data: plots })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// GET single plot
router.get('/plots/:id', async (req, res) => {
  try {
    const id = req.params.id

    if (id === 'cottage-rooms') {
      const cottageData = {
        _id: 'cottage-rooms',
        title: 'Cottage Rooms',
        price: 1500,
        area: '450 sq ft',
        capacity: 4,
        description: 'Premium air-conditioned cottage rooms with forest views and private sitouts.',
        facilities: ['AC', 'TV', 'Geyser', 'Double Bed', 'Room Service'],
        status: 'available',
        color: '#C9A84C'
      }
      return res.status(200).json({ success: true, data: cottageData })
    }

    const mongoose = require('mongoose')
    let plot = null

    if (mongoose.Types.ObjectId.isValid(id)) {
      plot = await MapPlot.findById(id)
    }

    if (!plot) {
      const cleanTitle = id.replace(/^(plot|pandal|zone)-/i, '').replace(/[-_]/g, ' ').trim()
      plot = await MapPlot.findOne({
        $or: [
          { customId: id },
          { title: new RegExp(cleanTitle, 'i') }
        ]
      })
    }

    // Fallback: Check in SiteConfig map_plots_config if present
    if (!plot) {
      try {
        const SiteConfig = require('../models/SiteConfig')
        const config = await SiteConfig.findOne({ key: 'map_plots_config' })
        if (config && Array.isArray(config.value)) {
          const found = config.value.find(p => p._id === id || p.id === id || p.customId === id)
          if (found) {
            return res.status(200).json({ success: true, data: found })
          }
        }
      } catch (e) {}
    }

    if (!plot) {
      return res.status(404).json({ success: false, message: 'Plot not found' })
    }

    res.status(200).json({ success: true, data: plot })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// GET /api/map/plots/:id/availability
router.get('/plots/:id/availability', async (req, res) => {
  try {
    const targetId = req.params.id
    const mongoose = require('mongoose')
    const Booking = require('../models/Booking')

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

// POST create plot
router.post('/plots', async (req, res) => {
  try {
    const payload = { ...req.body }
    if (payload.id && !payload.customId) {
      payload.customId = payload.id
    }
    delete payload._id
    const plot = new MapPlot(payload)
    await plot.save()
    if (req.io) req.io.emit('plots_update', { plot, action: 'created', timestamp: new Date() })
    res.status(201).json({ success: true, data: plot })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// PUT update plot
router.put('/plots/:id', async (req, res) => {
  try {
    const id = req.params.id
    const mongoose = require('mongoose')

    let updatedPlot = null
    if (!mongoose.Types.ObjectId.isValid(id)) {
      let plot = await MapPlot.findOne({ $or: [{ customId: id }, { title: req.body.title }] })
      if (plot) {
        updatedPlot = await MapPlot.findByIdAndUpdate(plot._id, req.body, { new: true })
      } else {
        const payload = { ...req.body }
        if (!payload.customId) payload.customId = id
        delete payload._id
        updatedPlot = new MapPlot(payload)
        await updatedPlot.save()
      }
    } else {
      updatedPlot = await MapPlot.findByIdAndUpdate(id, req.body, { new: true, runValidators: false })
      if (!updatedPlot) {
        const payload = { ...req.body }
        delete payload._id
        updatedPlot = new MapPlot(payload)
        await updatedPlot.save()
      }
    }

    if (req.io) req.io.emit('plots_update', { plot: updatedPlot, action: 'updated', timestamp: new Date() })
    res.json({ success: true, data: updatedPlot })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// DELETE plot
router.delete('/plots/:id', async (req, res) => {
  try {
    const id = req.params.id
    const mongoose = require('mongoose')

    if (!mongoose.Types.ObjectId.isValid(id)) {
      await MapPlot.deleteMany({ $or: [{ customId: id }, { title: new RegExp(id.replace(/[-_]/g, ' '), 'i') }] })
    } else {
      await MapPlot.findByIdAndDelete(id)
    }

    if (req.io) req.io.emit('plots_update', { plotId: id, action: 'deleted', timestamp: new Date() })
    res.json({ success: true, message: 'Plot deleted' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// POST seed/sync database with map management zones
router.post('/seed', async (req, res) => {
  try {
    const plotsToSeed = Array.isArray(req.body.plots) ? req.body.plots : []
    await MapPlot.deleteMany({})
    let createdPlots = []
    if (plotsToSeed.length > 0) {
      createdPlots = await MapPlot.insertMany(plotsToSeed)
    }
    if (req.io) req.io.emit('plots_update', { action: 'seeded', timestamp: new Date() })
    res.json({ success: true, count: createdPlots.length, data: createdPlots })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

module.exports = router
