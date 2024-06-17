import { Router } from 'express'
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

router.use(protect)

// Current user routes
router.route('/me').get(getMe, getUser)
router.route('/updateMyPassword').patch(updatePassword)
router.route('/updateMe').patch(upload.single('photo'), updateMe)

// User routes
router.use(restrictTo('admin'))
router.route('/').get(getAllUsers).post(createUser)
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser)

export default router
