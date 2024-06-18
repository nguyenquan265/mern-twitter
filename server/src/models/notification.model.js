import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema(
  {
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      enum: ['follow', 'like', 'comment'],
      required: true
    },
    read: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
)

// populate user from
notificationSchema.pre(/^find/, function (next) {
  this.populate({ path: 'from', select: 'username profileImg' })

  next()
})

export const Notification = mongoose.model('Notification', notificationSchema)
