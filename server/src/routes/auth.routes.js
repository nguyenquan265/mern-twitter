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

router.route('/register').post(register)
router.route('/login').post(login)
router.route('/logout').post(logout)
router.route('/refresh-token').post(refreshToken)
router.route('/forgotPassword').post(forgotPassword)
router.route('/resetPassword').patch(resetPassword)

export default router
