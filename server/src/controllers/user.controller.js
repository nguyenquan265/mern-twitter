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
import fs from 'fs'
import util from 'util'
import path from 'path'
import { cloudinary } from '~/utils/cloudinary'
import { filterObj } from '~/utils/filterObject'

const writeFile = util.promisify(fs.writeFile)

// Unprotected user

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

export const followUnfollowedUser = catchAsync(async (req, res, next) => {
  const [user, currentUser] = await Promise.all([
    User.findById(req.params.id),
    User.findById(req.user.id)
  ])

  if (!user || !currentUser) {
    throw new ApiError(404, 'User not found')
  }

  if (currentUser._id.equals(user._id)) {
    throw new ApiError(400, 'You cannot follow/unfollow yourself')
  }

  if (currentUser.following.includes(user._id)) {
    currentUser.following.pull(user._id)
    user.followers.pull(currentUser._id)

    await Promise.all([user.save(), currentUser.save()])
    // await Promise.all([
    //   User.findByIdAndUpdate(user._id, {
    //     $pull: { followers: currentUser._id }
    //   }),
    //   User.findByIdAndUpdate(currentUser._id, {
    //     $pull: { following: user._id }
    //   })
    // ])
  } else {
    currentUser.following.push(user._id)
    user.followers.push(currentUser._id)

    // await Promise.all([
    //   User.findByIdAndUpdate(user._id, {
    //     $push: { followers: currentUser._id }
    //   }),
    //   User.findByIdAndUpdate(currentUser._id, {
    //     $push: { following: user._id }
    //   })
    // ])
  }

  await Promise.all([user.save(), currentUser.save()])

  res.status(200).json({ status: 'success' })
})

export const updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password')

  if (!(await user.correctPassword(req.body.currentPassword))) {
    throw new ApiError(401, 'Your current password is wrong')
  }

  user.password = req.body.password
  user.passwordConfirm = req.body.passwordConfirm
  await user.save()

  const { password: pass, ...rest } = user._doc

  res.status(200).json({ status: 'success', user: rest })
})

export const updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    throw new ApiError(400, 'This route is not for password updates')
  }

  const filteredBody = filterObj(req.body, 'name', 'email')

  if (req.file) {
    const tempFilePath = path.join(__dirname, req.file.originalname)
    await writeFile(tempFilePath, req.file.buffer)

    const result = await cloudinary.uploader.upload(tempFilePath, {
      folder: 'file-upload'
    })

    fs.unlinkSync(tempFilePath)
    filteredBody.photo = result.secure_url
    filteredBody.photo_publicId = result.public_id
  }

  const user = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  })

  res.status(200).json({ status: 'success', data: { user } })
})

// Admin
export const getAllUsers = getAll(User)
export const getUser = getOne(User)
export const createUser = createOne(User)
export const updateUser = updateOne(User)
export const deleteUser = deleteOne(User)
