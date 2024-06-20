/* eslint-disable no-unused-vars */
import { User } from '~/models/user.model'
import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne
} from './factory.handler'
import { catchAsync } from '~/utils/catchAsync'
import { ApiError } from '~/utils/ApiError'
import { cloudinary } from '~/config/cloudinary'
import { Notification } from '~/models/notification.model'

// Protected user
export const getMe = (req, res, next) => {
  req.params.id = req.user.id

  next()
}

export const getUserProfile = catchAsync(async (req, res, next) => {
  const { username } = req.params

  const user = await User.findOne({ username })

  if (!user) {
    throw new ApiError(404, 'User not found')
  }

  res.status(200).json({ status: 'success', user })
})

export const getSuggestedUser = catchAsync(async (req, res, next) => {
  const users = await User.find({
    _id: { $ne: req.user._id, $nin: req.user.following }
  }).limit(4)

  res.status(200).json({ status: 'success', users })
})

export const followUnfollowUser = catchAsync(async (req, res, next) => {
  const userToFollow = await User.findById(req.params.id)
  const currentUser = req.user

  if (!userToFollow || !currentUser) {
    throw new ApiError(404, 'User not found')
  }

  if (currentUser._id.equals(userToFollow._id)) {
    throw new ApiError(400, 'You cannot follow/unfollow yourself')
  }

  if (currentUser.following.includes(userToFollow._id)) {
    currentUser.following.pull(userToFollow._id)
    userToFollow.followers.pull(currentUser._id)

    await Promise.all([userToFollow.save(), currentUser.save()])
    // await Promise.all([
    //   User.findByIdAndUpdate(userToFollow._id, {
    //     $pull: { followers: currentUser._id }
    //   }),
    //   User.findByIdAndUpdate(currentUser._id, {
    //     $pull: { following: userToFollow._id }
    //   })
    // ])
  } else {
    currentUser.following.push(userToFollow._id)
    userToFollow.followers.push(currentUser._id)

    await Promise.all([userToFollow.save(), currentUser.save()])

    await Notification.create({
      from: currentUser._id,
      to: userToFollow._id,
      type: 'follow'
    })
    // await Promise.all([
    //   User.findByIdAndUpdate(userToFollow._id, {
    //     $push: { followers: currentUser._id }
    //   }),
    //   User.findByIdAndUpdate(currentUser._id, {
    //     $push: { following: userToFollow._id }
    //   })
    // ])
  }

  res.status(200).json({ status: 'success' })
})

export const updateUserProfile = catchAsync(async (req, res, next) => {
  const { username, fullname, email, currentPassword, newPassword, bio, link } =
    req.body
  let { profileImg, coverImg } = req.body
  const userId = req.user._id

  // check if user exists
  const user = await User.findById(userId).select('+password')

  if (!user) {
    throw new ApiError(404, 'User not found')
  }

  const isEmailExist = await User.findOne({ email })

  if (isEmailExist && isEmailExist._id.toString() !== userId.toString()) {
    throw new ApiError(400, 'Email already exists')
  }

  // change password
  if ((!currentPassword && newPassword) || (currentPassword && !newPassword)) {
    throw new ApiError(400, 'Please provide both current and new password')
  }

  if (currentPassword && newPassword) {
    if (!(await user.correctPassword(currentPassword))) {
      throw new ApiError(401, 'Your current password is wrong')
    }

    user.password = newPassword
  }

  // change profileImg and coverImg
  if (profileImg) {
    if (user.profileImg) {
      await cloudinary.uploader.destroy(
        user.profileImg_publicId ||
          user.profileImg.split('/').pop().split('.')[0]
      )
    }

    const result = await cloudinary.uploader.upload(profileImg, {
      folder: 'file-upload'
    })

    user.profileImg = result.secure_url
    user.profileImg_publicId = result.public_id
  }

  if (coverImg) {
    if (user.coverImg) {
      await cloudinary.uploader.destroy(
        user.coverImg_publicId || user.coverImg.split('/').pop().split('.')[0]
      )
    }

    const result = await cloudinary.uploader.upload(coverImg, {
      folder: 'file-upload'
    })

    user.coverImg = result.secure_url
    user.coverImg_publicId = result.public_id
  }

  // update other fields
  user.username = username || user.username
  user.fullname = fullname || user.fullname
  user.email = email || user.email
  user.bio = bio || user.bio
  user.link = link || user.link

  // save user
  await user.save()

  const { password, ...rest } = user._doc

  res.status(200).json({ status: 'success', user: rest })
})

// Admin
export const getAllUsers = getAll(User)
export const getUser = getOne(User)
export const createUser = createOne(User)
export const updateUser = updateOne(User)
export const deleteUser = deleteOne(User)
