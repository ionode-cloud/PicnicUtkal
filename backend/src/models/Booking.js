const mongoose = require('mongoose')

const bookingSchema = new mongoose.Schema({
  // Zone / Plot details
  plotId:        { type: String, required: true },
  plotTitle:     { type: String, required: true },
  plotPrice:     { type: Number, required: true },

  // Guest details
  name:          { type: String, required: true },
  email:         { type: String, required: true },
  phone:         { type: String, required: true },

  // Visit details
  visitDate:     { type: Date,   required: true },
  persons:       { type: Number, required: true, min: 1 },
  specialNote:   { type: String, default: '' },

  // Per-person visitor list
  visitors: [{
    name:    { type: String, default: '' },
    aadhaar: { type: String, default: '' }
  }],

  // Payment
  paymentMethod: { type: String, enum: ['upi', 'card', 'cash', 'razorpay'], default: 'upi' },
  totalAmount:   { type: Number, required: true },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },

  // Booking meta
  bookingId:     { type: String, unique: true },
  status:        { type: String, enum: ['confirmed', 'cancelled', 'pending'], default: 'confirmed' }
}, { timestamps: true })

// Auto-generate a human-readable booking ID before saving
bookingSchema.pre('save', function (next) {
  if (!this.bookingId) {
    const ts  = Date.now().toString(36).toUpperCase()
    const rnd = Math.random().toString(36).substring(2, 5).toUpperCase()
    this.bookingId = `BPU-${ts}-${rnd}`
  }
  if (typeof next === 'function') next()
})

module.exports = mongoose.model('Booking', bookingSchema)
