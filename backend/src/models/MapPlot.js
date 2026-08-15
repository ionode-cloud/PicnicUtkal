const mongoose = require('mongoose')

const mapPlotSchema = new mongoose.Schema({
  title: { type: String, required: true },
  price: { type: Number, required: true },
  area: { type: String, required: true },        // e.g. "4500 sq ft"
  capacity: { type: Number, required: true },
  description: { type: String, required: true },
  facilities: [{ type: String }],
  status: {
    type: String,
    enum: ['available', 'booked', 'maintenance'],
    default: 'available'
  },
  coordinates: {
    x: { type: Number, required: true },         // % from left
    y: { type: Number, required: true },         // % from top
    width: { type: Number, required: true },     // % width
    height: { type: Number, required: true }     // % height
  },
  mapLocation: {
    latitude:  { type: Number, default: 20.311450 },
    longitude: { type: Number, default: 85.690644 }
  },
  color: { type: String, default: '#C9A84C' },
  mapId: { type: String, default: 'default-map' },
  image: { type: String },
  images: [{ type: String }],
  distanceFromGate: { type: String },
  distanceFromCanal: { type: String },
  customId: { type: String, index: true },
  isLandmark: { type: Boolean, default: false },
  isFree: { type: Boolean, default: false },
  isCottage: { type: Boolean, default: false }
}, { timestamps: true })

module.exports = mongoose.model('MapPlot', mapPlotSchema)
