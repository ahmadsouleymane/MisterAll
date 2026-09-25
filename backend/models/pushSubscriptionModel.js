import mongoose from 'mongoose'

const pushSubscriptionSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  endpoint: {
    type: String,
    required: true,
    unique: true
  },
  keys: {
    p256dh: {
      type: String,
      required: true
    },
    auth: {
      type: String,
      required: true
    }
  },
  device: {
    type: String,
    default: 'unknown'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

// Index pour rechercher par user
pushSubscriptionSchema.index({ user_id: 1 })

export default mongoose.model('PushSubscription', pushSubscriptionSchema)
