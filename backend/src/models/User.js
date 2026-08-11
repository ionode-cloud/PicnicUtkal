const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'staff', 'manager', 'admin'], default: 'user' },
  avatar: { type: String },
  isVerified: { type: Boolean, default: false },
  otp: { type: String },
  otpExpiry: { type: Date },
  walletBalance: { type: Number, default: 0 },
  rewardPoints: { type: Number, default: 0 },
  referralCode: { type: String },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PicnicSpot' }],
  fcmToken: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true })

userSchema.pre('save', async function() {
  if (!this.isModified('password')) return
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password)
}

module.exports = mongoose.model('User', userSchema)
