/* eslint-disable no-unused-vars */
import { Post } from '~/models/post.model'
import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne
} from './factory.handler'
import { catchAsync } from '~/utils/catchAsync'
import { User } from '~/models/user.model'
import { ApiError } from '~/utils/ApiError'
import { cloudinary } from '~/config/cloudinary'
import { Notification } from '~/models/notification.model'

// Protected post
export const createPostByUser = catchAsync(async (req, res, next) => {
  const { text } = req.body
  let { img } = req.body
  let img_publicId = null

  const user = await User.findById(req.user._id)

  if (!user) {
    throw new ApiError(404, 'User not found')
  }

  if (!text && !img) {
    throw new ApiError(400, 'Text or image is required')
  }

  if (img) {
    const result = await cloudinary.uploader.upload(img, {
      folder: 'file-upload'
    })

    img = result.secure_url
    img_publicId = result.public_id
  }

  const post = await Post.create({
    user: req.user._id,
    text,
    img,
    img_publicId
  })

  res.status(200).json({ status: 'success', post })
})

export const deletePostByUser = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id)

  if (!post) {
    throw new ApiError(404, 'Post not found')
  }

  if (post.user._id.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You are not authorized to delete this post')
  }

  if (post.img || post.img_publicId) {
    await Promise.all([
      cloudinary.uploader.destroy(
        post.img_publicId || post.img.split('/').pop().split('.')[0]
      ),
      Post.findByIdAndDelete(req.params.id)
    ])
  } else {
    await Post.findByIdAndDelete(req.params.id)
  }

  res.status(200).json({ status: 'success' })
})

export const commentOnPost = catchAsync(async (req, res, next) => {
  const { text } = req.body

  if (!text) {
    throw new ApiError(400, 'Text is required')
  }

  const post = await Post.findById(req.params.id)

  if (!post) {
    throw new ApiError(404, 'Post not found')
  }

  const comment = { user: req.user._id, text }

  post.comments.push(comment)

  await post.save()

  res.status(200).json({ status: 'success', post })
})

export const likeUnlikePost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id)

  if (!post) {
    throw new ApiError(404, 'Post not found')
  }

  const isLiked = post.likes.includes(req.user._id)

  if (isLiked) {
    post.likes.pull(req.user._id)

    await Promise.all([
      post.save(),
      User.findByIdAndUpdate(req.user._id, {
        $pull: { likedPosts: req.params.id }
      })
    ])
  } else {
    post.likes.push(req.user._id)

    await Promise.all([
      post.save(),
      User.findByIdAndUpdate(req.user._id, {
        $push: { likedPosts: req.params.id }
      }),
      Notification.create({
        from: req.user._id,
        to: post.user,
        type: 'like'
      })
    ])
  }

  res.status(200).json({ status: 'success', post })
})

export const getLikedPosts = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id)

  if (!user) {
    throw new ApiError(404, 'User not found')
  }

  const posts = await Post.find({ _id: { $in: user.likedPosts } })

  res.status(200).json({ status: 'success', posts })
})

export const getFollowingPosts = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id)

  if (!user) {
    throw new ApiError(404, 'User not found')
  }

  const followingList = user.following

  const posts = await Post.find({ user: { $in: followingList } }).sort({
    createdAt: -1
  })

  res.status(200).json({ status: 'success', posts })
})

export const getUserPosts = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ username: req.params.username })

  if (!user) {
    throw new ApiError(404, 'User not found')
  }

  const posts = await Post.find({ user: user._id })

  res.status(200).json({ status: 'success', posts })
})

// Admin
export const getAllPosts = getAll(Post)
export const getPost = getOne(Post)
export const createPost = createOne(Post)
export const updatePost = updateOne(Post)
export const deletePost = deleteOne(Post)
