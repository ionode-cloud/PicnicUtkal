const express = require('express')
const router = express.Router()
const multer = require('multer')
const cloudinary = require('../config/cloudinary')

// Multer memory storage (50MB max)
const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only image files (JPEG, PNG, WEBP, GIF, SVG) are allowed'), false)
    }
  }
})

// Helper to upload buffer to Cloudinary via stream
const uploadBufferToCloudinary = (buffer, folder = 'picnicutkal') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto'
      },
      (error, result) => {
        if (error) return reject(error)
        resolve(result)
      }
    )
    uploadStream.end(buffer)
  })
}

// POST /api/upload - Supports both multipart form-data (file/image) and JSON base64 { image }
router.post('/', upload.single('image'), async (req, res) => {
  try {
    let result = null
    const folder = req.body.folder || 'picnicutkal'

    // 1. If uploaded as multipart file
    if (req.file) {
      result = await uploadBufferToCloudinary(req.file.buffer, folder)
    } 
    // 2. If uploaded as base64 string or image URL
    else if (req.body.image || req.body.file) {
      const payload = req.body.image || req.body.file
      result = await cloudinary.uploader.upload(payload, {
        folder,
        resource_type: 'auto'
      })
    } else {
      return res.status(400).json({
        success: false,
        message: 'No image file or base64 data provided'
      })
    }

    res.json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      bytes: result.bytes
    })
  } catch (error) {
    console.error('[Cloudinary Upload Error]:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload image to Cloudinary'
    })
  }
})

// DELETE /api/upload - Delete image by public_id
router.delete('/:publicId', async (req, res) => {
  try {
    const publicId = req.params.publicId || req.query.public_id || req.body.public_id
    if (!publicId) {
      return res.status(400).json({ success: false, message: 'public_id is required' })
    }
    const result = await cloudinary.uploader.destroy(publicId)
    res.json({ success: true, result })
  } catch (error) {
    console.error('[Cloudinary Delete Error]:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

router.delete('/', async (req, res) => {
  try {
    const publicId = req.query.public_id || req.body.public_id
    if (!publicId) {
      return res.status(400).json({ success: false, message: 'public_id is required' })
    }
    const result = await cloudinary.uploader.destroy(publicId)
    res.json({ success: true, result })
  } catch (error) {
    console.error('[Cloudinary Delete Error]:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

// POST /api/upload/migrate-base64 - Clean up any existing base64 images in database by uploading to Cloudinary
router.post('/migrate-base64', async (req, res) => {
  try {
    const SiteConfig = require('../models/SiteConfig')
    const MapPlot = require('../models/MapPlot')
    const InteractiveMap = require('../models/InteractiveMap')
    const { processObjectForCloudinary } = require('../utils/cloudinaryHelper')

    let migratedConfigs = 0
    let migratedPlots = 0
    let migratedMaps = 0

    // 1. Migrate SiteConfig
    const configs = await SiteConfig.find({})
    for (const doc of configs) {
      const dataStr = JSON.stringify(doc.data || doc.value || {})
      if (dataStr.includes('data:image/')) {
        const raw = doc.data !== undefined ? doc.data : doc.value
        const processed = await processObjectForCloudinary(raw, `picnicutkal/${doc.key}`)
        doc.data = processed
        doc.markModified('data')
        await doc.save()
        migratedConfigs++
      }
    }

    // 2. Migrate MapPlots
    const plots = await MapPlot.find({})
    for (const p of plots) {
      let changed = false
      if (p.image && typeof p.image === 'string' && p.image.startsWith('data:image/')) {
        p.image = await processObjectForCloudinary(p.image, 'picnicutkal/plots')
        changed = true
      }
      if (Array.isArray(p.images) && p.images.some(img => typeof img === 'string' && img.startsWith('data:image/'))) {
        p.images = await processObjectForCloudinary(p.images, 'picnicutkal/plots')
        changed = true
      }
      if (changed) {
        await p.save()
        migratedPlots++
      }
    }

    // 3. Migrate InteractiveMaps
    const maps = await InteractiveMap.find({})
    for (const m of maps) {
      if (m.image && typeof m.image === 'string' && m.image.startsWith('data:image/')) {
        m.image = await processObjectForCloudinary(m.image, 'picnicutkal/maps')
        await m.save()
        migratedMaps++
      }
    }

    res.json({
      success: true,
      message: 'Migration to Cloudinary complete',
      migrated: {
        siteConfigs: migratedConfigs,
        mapPlots: migratedPlots,
        interactiveMaps: migratedMaps
      }
    })
  } catch (err) {
    console.error('[Cloudinary Migration Error]:', err)
    res.status(500).json({ success: false, message: err.message })
  }
})

module.exports = router
