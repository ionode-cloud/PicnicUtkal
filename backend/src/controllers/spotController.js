const PicnicSpot = require('../models/PicnicSpot')
const Zone = require('../models/Zone')
const { processObjectForCloudinary } = require('../utils/cloudinaryHelper')

exports.getSpots = async (req, res) => {
  try {
    const { district, zone, search } = req.query
    let query = { isActive: true }

    if (district && district !== 'All') {
      query['location.district'] = district
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'location.address': { $regex: search, $options: 'i' } }
      ]
    }

    let spots = await PicnicSpot.find(query).populate('zones')

    if (zone) {
      spots = spots.filter(s => s.zones.some(z => z.type.toLowerCase() === zone.toLowerCase()))
    }

    res.json(spots)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.getSpotById = async (req, res) => {
  try {
    const spot = await PicnicSpot.findById(req.params.id).populate('zones')
    if (spot) {
      res.json(spot)
    } else {
      res.status(404).json({ message: 'Picnic spot not found' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.createSpot = async (req, res) => {
  try {
    const processedBody = await processObjectForCloudinary(req.body, 'picnicutkal/spots')
    const spot = new PicnicSpot(processedBody)
    const createdSpot = await spot.save()
    res.status(201).json(createdSpot)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}
