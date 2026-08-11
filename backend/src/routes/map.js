const express = require('express')
const router = express.Router()
const MapPlot = require('../models/MapPlot')
const InteractiveMap = require('../models/InteractiveMap')

// GET all maps
router.get('/maps', async (req, res) => {
  try {
    const maps = await InteractiveMap.find().sort({ isDefault: -1, createdAt: 1 })
    res.json({ success: true, data: maps })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// POST create map
router.post('/maps', async (req, res) => {
  try {
    const map = new InteractiveMap(req.body)
    await map.save()
    res.status(201).json({ success: true, data: map })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// PUT update map
router.put('/maps/:id', async (req, res) => {
  try {
    const map = await InteractiveMap.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!map) return res.status(404).json({ success: false, message: 'Map not found' })
    res.json({ success: true, data: map })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// DELETE map
router.delete('/maps/:id', async (req, res) => {
  try {
    const map = await InteractiveMap.findByIdAndDelete(req.params.id)
    if (!map) return res.status(404).json({ success: false, message: 'Map not found' })
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
      return res.json({ success: true, data: cottageData })
    }

    const mongoose = require('mongoose')
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const plot = await MapPlot.findOne({ $or: [{ _id: id }, { title: new RegExp(id.replace(/-/g, ' '), 'i') }] })
      if (plot) return res.json({ success: true, data: plot })
      return res.status(404).json({ success: false, message: 'Plot not found' })
    }

    const plot = await MapPlot.findById(id)
    if (!plot) return res.status(404).json({ success: false, message: 'Plot not found' })
    res.json({ success: true, data: plot })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// POST create plot
router.post('/plots', async (req, res) => {
  try {
    const payload = { ...req.body }
    delete payload._id
    const plot = new MapPlot(payload)
    await plot.save()
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

    if (!mongoose.Types.ObjectId.isValid(id)) {
      let plot = await MapPlot.findOne({ $or: [{ _id: id }, { title: req.body.title }] })
      if (plot) {
        plot = await MapPlot.findByIdAndUpdate(plot._id, req.body, { new: true })
        return res.json({ success: true, data: plot })
      }
      const payload = { ...req.body }
      delete payload._id
      const newPlot = new MapPlot(payload)
      await newPlot.save()
      return res.json({ success: true, data: newPlot })
    }

    const plot = await MapPlot.findByIdAndUpdate(id, req.body, { new: true, runValidators: false })
    if (!plot) {
      const payload = { ...req.body }
      delete payload._id
      const newPlot = new MapPlot(payload)
      await newPlot.save()
      return res.json({ success: true, data: newPlot })
    }
    res.json({ success: true, data: plot })
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
      await MapPlot.deleteMany({ $or: [{ _id: id }, { title: new RegExp(id.replace(/-/g, ' '), 'i') }] })
      return res.json({ success: true, message: 'Plot deleted' })
    }

    await MapPlot.findByIdAndDelete(id)
    res.json({ success: true, message: 'Plot deleted' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// POST seed database with landscape coordinates
router.post('/seed', async (req, res) => {
  try {
    const LANDSCAPE_DEFAULTS = [
      {
        title: 'Main Gate',
        price: 0,
        area: '200 sq ft',
        capacity: 500,
        description: 'Grand entrance to Barapita Picnic Utkal. Security cabin, welcome arch and directional signage.',
        facilities: ['Security', 'CCTV', 'Signage', 'Entry Pass'],
        status: 'available',
        coordinates: { x: 54, y: 74, width: 9, height: 7 },
        color: '#C9A84C',
        priority: 10,
        distanceFromGate: '0 m',
        distanceFromCanal: '180 m'
      },
      {
        title: 'Parking Zone',
        price: 50,
        area: '3200 sq ft',
        capacity: 80,
        description: 'Spacious secure parking with CCTV surveillance. Accommodates cars, buses and two-wheelers.',
        facilities: ['CCTV', 'Security Guard', 'Lighting', '24x7 Open'],
        status: 'available',
        coordinates: { x: 62, y: 61, width: 32, height: 18 },
        color: '#6B7280',
        priority: 9,
        distanceFromGate: '40 m',
        distanceFromCanal: '160 m'
      },
      {
        title: 'Biotech Park 1',
        price: 799,
        area: '6200 sq ft',
        capacity: 200,
        description: 'Premium open-air event space with manicured lawns, elegant lighting, and riverside ambience.',
        facilities: ['Parking', 'Water', 'Electricity', 'Garden', 'Restrooms', 'Stage'],
        status: 'available',
        coordinates: { x: 45, y: 28, width: 20, height: 15 },
        color: '#2D6A4F',
        priority: 8,
        distanceFromGate: '90 m',
        distanceFromCanal: '60 m'
      },
      {
        title: 'Biotech Park 2',
        price: 699,
        area: '5800 sq ft',
        capacity: 180,
        description: 'Versatile event ground ideal for cultural programs, corporate outings, and family gatherings.',
        facilities: ['Parking', 'Water', 'Electricity', 'Garden', 'Restrooms'],
        status: 'available',
        coordinates: { x: 27, y: 47, width: 25, height: 27 },
        color: '#1B4332',
        priority: 7,
        distanceFromGate: '110 m',
        distanceFromCanal: '40 m'
      },
      {
        title: 'Pandal — Upper Block',
        price: 499,
        area: '3500 sq ft',
        capacity: 120,
        description: 'Shaded pandal structure near the canal with cool breeze and scenic water views.',
        facilities: ['Shade', 'Seating', 'Lighting', 'Riverside View'],
        status: 'available',
        coordinates: { x: 46, y: 29, width: 18, height: 9 },
        color: '#52B788',
        priority: 6,
        distanceFromGate: '120 m',
        distanceFromCanal: '20 m'
      },
      {
        title: 'Pandal — Center Block',
        price: 499,
        area: '3200 sq ft',
        capacity: 100,
        description: 'Central pandal with easy access to both Biotech Parks and restroom facilities.',
        facilities: ['Shade', 'Seating', 'Lighting', 'DJ Point'],
        status: 'booked',
        coordinates: { x: 37, y: 48, width: 6, height: 10 },
        color: '#52B788',
        priority: 5,
        distanceFromGate: '85 m',
        distanceFromCanal: '70 m'
      },
      {
        title: 'Pandal — West Block',
        price: 399,
        area: '2800 sq ft',
        capacity: 90,
        description: 'Cozy west-side pandal nestled among trees, perfect for intimate family picnics.',
        facilities: ['Shade', 'Seating', 'BBQ Area', 'Garden View'],
        status: 'available',
        coordinates: { x: 30, y: 62, width: 9, height: 10 },
        color: '#52B788',
        priority: 4,
        distanceFromGate: '130 m',
        distanceFromCanal: '30 m'
      },
      {
        title: 'Pandal — East Block',
        price: 449,
        area: '3000 sq ft',
        capacity: 95,
        description: 'East-side pandal with direct parking access, ideal for large group events.',
        facilities: ['Shade', 'Seating', 'Parking Access', 'Electricity'],
        status: 'available',
        coordinates: { x: 68, y: 50, width: 13, height: 10 },
        color: '#52B788',
        priority: 3,
        distanceFromGate: '55 m',
        distanceFromCanal: '150 m'
      },
      {
        title: 'Stage / Stair Area',
        price: 299,
        area: '1200 sq ft',
        capacity: 50,
        description: 'Elevated stage area with stairs — perfect for performances, ceremonies and photo backdrops.',
        facilities: ['Stage Lighting', 'Sound System', 'Backdrop', 'Steps'],
        status: 'available',
        coordinates: { x: 25, y: 44, width: 5, height: 4 },
        color: '#C9A84C',
        priority: 2,
        distanceFromGate: '100 m',
        distanceFromCanal: '50 m'
      },
      {
        title: 'Old Bridge Viewpoint',
        price: 199,
        area: 'Viewpoint',
        capacity: 30,
        description: 'Historic old bridge over the canal — a stunning photography spot and serene viewpoint.',
        facilities: ['Scenic View', 'Photography Spot', 'Railing', 'Canal Access'],
        status: 'available',
        coordinates: { x: 3, y: 70, width: 20, height: 6 },
        color: '#A07830',
        priority: 1,
        distanceFromGate: '200 m',
        distanceFromCanal: '5 m'
      },
      {
        title: 'Canal / River Side',
        price: 149,
        area: 'Riverside Strip',
        capacity: 60,
        description: 'Beautiful canal-side sitting area with lush greenery, flowing water, and fresh air.',
        facilities: ['Riverside View', 'Seating', 'Nature Walk', 'Photo Zone'],
        status: 'available',
        coordinates: { x: 7, y: 2, width: 17, height: 70 },
        color: '#228BE6',
        priority: 0,
        distanceFromGate: '150 m',
        distanceFromCanal: '0 m'
      }
    ]

    await MapPlot.deleteMany({})
    const createdPlots = await MapPlot.insertMany(LANDSCAPE_DEFAULTS)
    res.json({ success: true, count: createdPlots.length, data: createdPlots })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

module.exports = router
