import { Router } from 'express'
import {
  forgotPassword,
  login,
  logout,
  refreshToken,
  register,
  resetPassword
} from '~/controllers/auth.controller'

const router = Router()

router.post('/register', register)
router.post('/login', login)
router.post('/logout', logout)
router.post('/refresh-token', refreshToken)
router.post('/forgotPassword', forgotPassword)
router.patch('/resetPassword', resetPassword)

export default router
