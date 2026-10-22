const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const MapPlot = require('../models/MapPlot')
const InteractiveMap = require('../models/InteractiveMap')
const { protect, adminOnly, adminOrStaff } = require('../middleware/auth')
const { processObjectForCloudinary } = require('../utils/cloudinaryHelper')

// GET all maps
router.get('/maps', async (req, res) => {
  try {
    const maps = await InteractiveMap.find().sort({ isDefault: -1, createdAt: 1 }).lean()
    res.json({ success: true, data: maps })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// POST create map
router.post('/maps', async (req, res) => {
  try {
    const processedBody = await processObjectForCloudinary(req.body, 'picnicutkal/maps')
    const payload = {
      title: processedBody.title,
      image: processedBody.image,
      description: processedBody.description || '',
      spotId: processedBody.spotId || '',
      linkedSpot: processedBody.linkedSpot || '',
      googleMapUrl: processedBody.googleMapUrl || '',
      isDefault: Boolean(processedBody.isDefault)
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
    const processedBody = await processObjectForCloudinary(req.body, 'picnicutkal/maps')
    let map = null
    if (mongoose.Types.ObjectId.isValid(id)) {
      map = await InteractiveMap.findByIdAndUpdate(id, processedBody, { new: true })
    }
    if (!map) {
      map = await InteractiveMap.findOneAndUpdate({ title: processedBody.title }, processedBody, { new: true })
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

const DEFAULT_PLOTS = [
  {
    customId: 'barapita-riverside-gazebo',
    title: 'Barapita Riverside Gazebo',
    price: 799,
    area: '3200 sq ft',
    capacity: 50,
    description: 'Scenic riverside gazebo spot situated along the Chandaka forest border with direct water canal breeze, private shade canopy, and BBQ grill facility.',
    facilities: ['Riverside View', 'Private Shade', 'Water Tap', 'BBQ Grill', 'Dustbins'],
    status: 'available',
    coordinates: { x: 22, y: 35, width: 14, height: 12 },
    color: '#228BE6',
    mapId: 'default-master-plan',
    image: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800&q=80',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80'
    ],
    distanceFromGate: '90 m',
    distanceFromCanal: '10 m'
  },
  {
    customId: 'forest-canopy-picnic-spot',
    title: 'Forest Canopy Picnic Spot',
    price: 649,
    area: '2800 sq ft',
    capacity: 40,
    description: 'Enchanting woodland clearing under dense Sal and Teak trees. Ideal for family gatherings and peaceful nature escapes with wooden dining benches.',
    facilities: ['Forest Shade', 'Wooden Benches', 'Handwash Counter', 'Lighting', 'Parking Nearby'],
    status: 'available',
    coordinates: { x: 42, y: 28, width: 14, height: 12 },
    color: '#2F9E44',
    mapId: 'default-master-plan',
    image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80'
    ],
    distanceFromGate: '130 m',
    distanceFromCanal: '40 m'
  },
  {
    customId: 'deras-adventure-ground',
    title: 'Deras Adventure Ground & Pandal',
    price: 1199,
    area: '5000 sq ft',
    capacity: 80,
    description: 'Expansive premium event pandal with concrete stage platform, multi-point power plugs, and spacious open lawn for team sports and group celebrations.',
    facilities: ['Stage Area', 'Power Supply', 'Drinking Water', 'Restrooms', 'Sports Ground'],
    status: 'available',
    coordinates: { x: 62, y: 40, width: 16, height: 14 },
    color: '#E8590C',
    mapId: 'default-master-plan',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
      'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80'
    ],
    distanceFromGate: '180 m',
    distanceFromCanal: '60 m'
  },
  {
    customId: 'sunset-lawn-family-zone',
    title: 'Sunset Lawn & Family Zone',
    price: 899,
    area: '4000 sq ft',
    capacity: 60,
    description: 'Manicured green lawn facing the sunset horizon. Features kid-safe open spaces, floral pergolas, and convenient proximity to fresh drinking water.',
    facilities: ['Lawn Grass', 'Play Area for Kids', 'Dustbins', 'Handwash Counter', 'Pergola Shade'],
    status: 'available',
    coordinates: { x: 38, y: 55, width: 15, height: 13 },
    color: '#C9A84C',
    mapId: 'default-master-plan',
    image: 'https://images.unsplash.com/photo-1502472584811-0a2f2feb8968?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1502472584811-0a2f2feb8968?w=800&q=80',
      'https://images.unsplash.com/photo-1539635278303-d4002c07eae3?w=800&q=80'
    ],
    distanceFromGate: '110 m',
    distanceFromCanal: '25 m'
  },
  {
    customId: 'cottage-rooms',
    title: 'Cottage Rooms & AC Suite',
    price: 1499,
    area: '4800 sq ft',
    capacity: 20,
    description: 'Air-conditioned luxury forest cottages with ensuite modern bathrooms, hot water geysers, TV, private sitouts, and 24/7 housekeeping support.',
    facilities: ['AC Rooms', 'Attached Bath', 'Geyser', 'TV', 'Private Sitout', 'Room Service'],
    status: 'available',
    coordinates: { x: 70, y: 18, width: 16, height: 15 },
    color: '#A07830',
    isCottage: true,
    mapId: 'default-master-plan',
    image: 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=800&q=80',
      'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800&q=80'
    ],
    distanceFromGate: '160 m',
    distanceFromCanal: '20 m'
  }
]

// GET all plots (optional mapId filter)
router.get('/plots', async (req, res) => {
  try {
    const filter = {}
    if (req.query.mapId) {
      filter.mapId = req.query.mapId
    }
    let plots = await MapPlot.find(filter).sort({ priority: -1, createdAt: 1 }).lean()
    if (!plots || plots.length === 0) {
      const count = await MapPlot.countDocuments()
      if (count === 0) {
        await MapPlot.insertMany(DEFAULT_PLOTS).catch(() => {})
        plots = await MapPlot.find(filter).sort({ priority: -1, createdAt: 1 }).lean()
      }
    }
    res.json({ success: true, data: plots || [] })
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
        if (config && Array.isArray(config.data)) {
          const found = config.data.find(p => p._id === id || p.id === id || p.customId === id)
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
    const processedBody = await processObjectForCloudinary(req.body, 'picnicutkal/plots')
    const payload = { ...processedBody }
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
    const processedBody = await processObjectForCloudinary(req.body, 'picnicutkal/plots')

    let updatedPlot = null
    if (!mongoose.Types.ObjectId.isValid(id)) {
      let plot = await MapPlot.findOne({ $or: [{ customId: id }, { title: processedBody.title }] })
      if (plot) {
        updatedPlot = await MapPlot.findByIdAndUpdate(plot._id, processedBody, { new: true })
      } else {
        const payload = { ...processedBody }
        if (!payload.customId) payload.customId = id
        delete payload._id
        updatedPlot = new MapPlot(payload)
        await updatedPlot.save()
      }
    } else {
      updatedPlot = await MapPlot.findByIdAndUpdate(id, processedBody, { new: true, runValidators: false })
      if (!updatedPlot) {
        const payload = { ...processedBody }
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

// POST seed/sync — admin only
router.post('/seed', protect, adminOnly, async (req, res) => {
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
