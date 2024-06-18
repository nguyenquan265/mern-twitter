import mongoose from 'mongoose'

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: String,
    img: String,
    img_publicId: String,
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    comments: [
      {
        text: {
          type: String,
          required: true
        },
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true
        }
      }
    ]
  },
  { timestamps: true }
)

// populate user
postSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'username fullname img'
  }).populate({
    path: 'comments.user',
    select: 'username fullname img'
  })

  next()
})

export const Post = mongoose.model('Post', postSchema)
