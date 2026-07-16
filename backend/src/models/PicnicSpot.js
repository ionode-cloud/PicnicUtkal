const mongoose = require('mongoose')

const picnicSpotSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  shortDescription: { type: String },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], index: '2dsphere' }, // [longitude, latitude]
    address: { type: String },
    city: { type: String },
    district: { type: String },
    pincode: { type: String }
  },
  images: [{ type: String }],
  videos: [{ type: String }],
  image360: { type: String },
  zones: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Zone' }],
  basePrice: { type: Number, required: true },
  dynamicPricing: {
    weekendMultiplier: { type: Number, default: 1.25 },
    holidayMultiplier: { type: Number, default: 1.5 },
    festivalMultiplier: { type: Number, default: 1.4 },
    peakSeasonMultiplier: { type: Number, default: 1.3 },
    offSeasonMultiplier: { type: Number, default: 0.85 },
    highCrowdMultiplier: { type: Number, default: 1.2 }
  },
  capacity: { type: Number, required: true },
  openingTime: { type: String },
  closingTime: { type: String },
  amenities: [{ type: String }],
  rules: [{ type: String }],
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  isFeatured: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  seoMeta: {
    title: { type: String },
    description: { type: String },
    keywords: { type: String }
  }
}, { timestamps: true })

module.exports = mongoose.model('PicnicSpot', picnicSpotSchema)
