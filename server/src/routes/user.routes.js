import { Router } from 'express'
import {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  getMe,
  updateMe,
  updatePassword,
  getUserProfile,
  followUnfollowUser
} from '~/controllers/user.controller'
import { protect, restrictTo } from '~/middlewares/auth.middleware'
import { upload } from '~/utils/cloudinary'

const router = Router()

// Unprotected user routes

router.use(protect)

// Protected user routes
router.route('/me').get(getMe, getUser)
router.route('/profile/:username').get(getUserProfile)
// router.route('/suggested').get(getUserProfile)
router.route('/follow/:id').post(followUnfollowUser)
// router.post('/update').post(updateUserProfile)
// router.route('/updateMyPassword').patch(updatePassword)
// router.route('/updateMe').patch(upload.single('photo'), updateMe)

// Admin routes
router.use(restrictTo('admin'))
router.route('/').get(getAllUsers).post(createUser)
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser)

export default router
