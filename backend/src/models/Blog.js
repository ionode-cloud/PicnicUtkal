const mongoose = require('mongoose')

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  content: { type: String, required: true },
  excerpt: { type: String },
  category: {
    type: String,
    enum: ['travel', 'nature', 'camping', 'festival', 'tips', 'guide'],
    required: true
  },
  coverImage: { type: String },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tags: [{ type: String }],
  seoMeta: {
    title: { type: String },
    description: { type: String },
    keywords: { type: String }
  },
  isPublished: { type: Boolean, default: false },
  publishedAt: { type: Date },
  viewCount: { type: Number, default: 0 }
}, { timestamps: true })

module.exports = mongoose.model('Blog', blogSchema)
