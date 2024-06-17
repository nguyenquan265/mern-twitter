/* eslint-disable no-unused-vars */
import { sign, verify } from 'jsonwebtoken'
import { env } from '~/config/env'
import { User } from '~/models/user.model'
import { ApiError } from '~/utils/ApiError'
import Email from '~/utils/Email'
import { catchAsync } from '~/utils/catchAsync'
import crypto from 'crypto'

const signAccessToken = (id) => {
  return sign({ id }, env.jwt.ACCESS_TOKEN_SECRET, {
    expiresIn: env.jwt.ACCESS_TOKEN_EXPIRY
  })
}

const signRefreshToken = (id) => {
  return sign({ id }, env.jwt.REFRESH_TOKEN_SECRET, {
    expiresIn: env.jwt.REFRESH_TOKEN_EXPIRY
  })
}

export const register = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm } = req.body

  if (!name || !email || !password || !passwordConfirm) {
    throw new ApiError(400, 'Please provide all fields')
  }

  const user = await User.create({ name, email, password, passwordConfirm })

  const { password: pass, ...rest } = user._doc

  res.status(200).json({ status: 'success', user: rest })
})

export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body

  if (!email || !password) {
    throw new ApiError(400, 'Please provide email and password')
  }

  const user = await User.findOne({ email }).select('+password')

  if (!user || !(await user.correctPassword(password))) {
    throw new ApiError(400, 'Incorrect email or password or user is inactive')
  }

  const { password: pass, ...rest } = user._doc

  const accessToken = signAccessToken(user._id)
  const refreshToken = signRefreshToken(user._id)

  res
    .status(200)
    .cookie('refreshToken', refreshToken, {
      expires: new Date(
        Date.now() + env.jwt.COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
      secure: true,
      sameSite: 'none'
    })
    .json({ status: 'success', accessToken, user: rest })
})

export const logout = catchAsync(async (req, res, next) => {
  res.clearCookie('refreshToken')

  res.status(200).json({ status: 'success' })
})

export const refreshToken = catchAsync(async (req, res, next) => {
  const refreshToken = req.cookies?.refreshToken

  if (!refreshToken) {
    throw new ApiError(401, 'RefreshToken not found')
  }

  const decoded = verify(refreshToken, env.jwt.REFRESH_TOKEN_SECRET)

  const user = await User.findById(decoded.id)

  if (!user) {
    throw new ApiError(404, 'User not found')
  }

  const { password: pass, ...rest } = user._doc

  const accessToken = signAccessToken(user.id)

  res.status(200).json({ status: 'success', accessToken, user: rest })
})

export const forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body

  const user = await User.findOne({ email })

  if (!user) {
    throw new ApiError(404, 'There is no user with that email address')
  }

  const resetToken = user.createPasswordResetToken()
  await user.save({ validateBeforeSave: false })

  await new Email().sendPasswordReset(
    user.name,
    email,
    resetToken,
    req.headers.origin
  )

  res.status(200).json({ status: 'success', resetToken })
})

export const resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.body.token)
    .digest('hex')

  const user = await User.findOne({
    email: req.body.email,
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  })

  if (!user) {
    throw new ApiError(400, 'Token is invalid or has expired')
  }

  user.password = req.body.password
  user.passwordConfirm = req.body.passwordConfirm
  user.passwordResetToken = undefined
  user.passwordResetExpires = undefined
  await user.save()

  const { password: pass, ...rest } = user._doc

  res.status(200).json({ status: 'success', data: { user: rest } })
})
