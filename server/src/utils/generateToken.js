import { sign, verify } from 'jsonwebtoken'
import { env } from '~/config/env'

export const signAccessToken = (id) => {
  return sign({ id }, env.jwt.ACCESS_TOKEN_SECRET, {
    expiresIn: env.jwt.ACCESS_TOKEN_EXPIRY
  })
}

export const signRefreshToken = (id) => {
  return sign({ id }, env.jwt.REFRESH_TOKEN_SECRET, {
    expiresIn: env.jwt.REFRESH_TOKEN_EXPIRY
  })
}

export const verifyToken = (token, secret) => {
  return verify(token, secret)
}
