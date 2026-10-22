const cloudinary = require('../config/cloudinary')

/**
 * Uploads a base64 data string to Cloudinary and returns its secure URL.
 * If the string is not a base64 data URI, returns it as-is.
 */
async function uploadBase64ToCloudinary(base64Str, folder = 'picnicutkal') {
  if (!base64Str || typeof base64Str !== 'string') return base64Str
  if (!base64Str.startsWith('data:image/') && !base64Str.startsWith('data:application/')) {
    return base64Str
  }
  try {
    const res = await cloudinary.uploader.upload(base64Str, {
      folder,
      resource_type: 'auto'
    })
    console.log(`[Cloudinary Auto-Upload] Uploaded base64 image -> ${res.secure_url}`)
    return res.secure_url
  } catch (err) {
    console.error('[Cloudinary Auto-Upload Error]:', err.message)
    return base64Str
  }
}

/**
 * Recursively scans any payload (object, array, or string) and replaces
 * any base64 image strings with Cloudinary CDN URLs before saving to MongoDB.
 */
async function processObjectForCloudinary(data, folder = 'picnicutkal') {
  if (!data) return data

  if (typeof data === 'string') {
    return await uploadBase64ToCloudinary(data, folder)
  }

  if (Array.isArray(data)) {
    const processed = []
    for (const item of data) {
      processed.push(await processObjectForCloudinary(item, folder))
    }
    return processed
  }

  if (typeof data === 'object') {
    const copy = { ...data }
    for (const key of Object.keys(copy)) {
      copy[key] = await processObjectForCloudinary(copy[key], folder)
    }
    return copy
  }

  return data
}

module.exports = {
  uploadBase64ToCloudinary,
  processObjectForCloudinary
}
