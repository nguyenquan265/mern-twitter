import { Router } from 'express'
import {
  forgotPassword,
  login,
  logout,
  refreshToken,
  register,
  resetPassword
} from '~/controllers/auth.controller'
import {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  getMe,
  updateMe,
  updatePassword
} from '~/controllers/user.controller'
import { protect, restrictTo } from '~/middlewares/auth.middleware'
import { upload } from '~/utils/cloudinary'

const router = Router()

// Auth routes
router.route('/register').post(register)
router.route('/login').post(login)
router.route('/logout').post(logout)
router.route('/refresh-token').post(refreshToken)
router.route('/forgotPassword').post(forgotPassword)
router.route('/resetPassword').patch(resetPassword)

// Current user routes
router.use(protect)
router.route('/me').get(getMe, getUser)
router.route('/updateMyPassword').patch(updatePassword)
router.route('/updateMe').patch(upload.single('photo'), updateMe)

// User routes
router.use(restrictTo('admin'))
router.route('/').get(getAllUsers).post(createUser)
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser)

export default router
