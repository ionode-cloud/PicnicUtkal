const mongoose = require('mongoose')

const interactiveMapSchema = new mongoose.Schema({
  title: { type: String, required: true },
  image: { type: String, required: true },
  description: { type: String, default: '' },
  spotId: { type: String, default: '' },
  isDefault: { type: Boolean, default: false }
}, { timestamps: true })

module.exports = mongoose.model('InteractiveMap', interactiveMapSchema)
