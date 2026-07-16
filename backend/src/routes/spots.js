const express = require('express')
const router = express.Router()
const { getSpots, getSpotById, createSpot } = require('../controllers/spotController')
const { protect, adminOnly } = require('../middleware/auth')

router.get('/', getSpots)
router.get('/:id', getSpotById)
router.post('/', protect, adminOnly, createSpot)

module.exports = router
