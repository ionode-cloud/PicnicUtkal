const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  spotId: { type: mongoose.Schema.Types.ObjectId, ref: 'PicnicSpot', required: true },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String },
  comment: { type: String, required: true },
  images: [{ type: String }],
  videoUrl: { type: String },
  isVerified: { type: Boolean, default: false },
  helpfulVotes: { type: Number, default: 0 },
  adminReply: {
    text: { type: String },
    repliedAt: { type: Date }
  },
  isApproved: { type: Boolean, default: true }
}, { timestamps: true })

module.exports = mongoose.model('Review', reviewSchema)
