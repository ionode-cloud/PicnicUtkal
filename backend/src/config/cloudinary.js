const cloudinary = require('cloudinary').v2

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dwd0csmmf',
  api_key: process.env.CLOUDINARY_API_KEY || '314971122875434',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'OJxocOSAQZzwMPLHK_q0r3CyQH8',
  secure: true
})

module.exports = cloudinary
