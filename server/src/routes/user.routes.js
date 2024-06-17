import { Router } from 'express'
import {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  getMe,
  getUserProfile,
  followUnfollowUser,
  getSuggestedUser,
  updateUserProfile
} from '~/controllers/user.controller'
import { protect, restrictTo } from '~/middlewares/auth.middleware'

const router = Router()

router.use(protect)

// Protected user routes
router.get('/me', getMe, getUser)
router.get('/profile/:username', getUserProfile)
router.get('/suggested', getSuggestedUser)
router.patch('/follow/:id', followUnfollowUser)
router.patch('/updateMe', updateUserProfile)

// Admin routes
router.use(restrictTo('admin'))
router.route('/').get(getAllUsers).post(createUser)
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser)

export default router
