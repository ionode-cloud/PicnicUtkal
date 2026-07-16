const mongoose = require('mongoose')

const zoneSchema = new mongoose.Schema({
  spotId: { type: mongoose.Schema.Types.ObjectId, ref: 'PicnicSpot', required: true },
  name: { type: String, required: true },
  type: {
    type: String,
    enum: ['swimming', 'cooking', 'music', 'camping', 'adventure', 'family', 'photo', 'garden', 'riverside', 'parking', 'custom'],
    required: true
  },
  description: { type: String },
  images: [{ type: String }],
  videos: [{ type: String }],
  price: { type: Number, required: true },
  capacity: { type: Number, required: true },
  maxPeople: { type: Number },
  timings: {
    open: { type: String },
    close: { type: String }
  },
  rules: [{ type: String }],
  status: { type: String, enum: ['active', 'inactive', 'maintenance'], default: 'active' },
  bookingLimit: { type: Number },
  isActive: { type: Boolean, default: true }
}, { timestamps: true })

module.exports = mongoose.model('Zone', zoneSchema)
