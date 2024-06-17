import { verify } from 'jsonwebtoken'
import { env } from '~/config/env'
import { User } from '~/models/user.model'
import { ApiError } from '~/utils/ApiError'
import { catchAsync } from '~/utils/catchAsync'

export const protect = catchAsync(async (req, res, next) => {
  let token

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1]
  }

  if (!token) {
    throw new ApiError(401, 'You are unauthenticated (no accessToken)')
  }

  const decoded = verify(token, env.jwt.ACCESS_TOKEN_SECRET)

  const user = await User.findById(decoded.id)

  if (!user) {
    throw new ApiError(404, 'User not found')
  }

  req.user = user
  next()
})

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new ApiError(
        403,
        'You do not have permission to perform this action'
      )
    }

    next()
  }
}
