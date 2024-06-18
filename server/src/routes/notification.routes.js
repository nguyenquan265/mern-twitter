import { Router } from 'express'
import {
  createNotification,
  deleteNotification,
  deleteAllNotificationsFromUser,
  getAllNotifications,
  getNotification,
  getNotificationsFromUser,
  updateNotification,
  deleteOneNotificationFromUser
} from '~/controllers/notification.controller'
import { protect, restrictTo } from '~/middlewares/auth.middleware'

const router = Router()

router.use(protect)

// Protected notification routes
router.get('/all', getNotificationsFromUser)
router.delete('/delete', deleteAllNotificationsFromUser)
router.delete('/delete/:id', deleteOneNotificationFromUser)

// Admin routes
router.use(restrictTo('admin'))
router.route('/').get(getAllNotifications).post(createNotification)
router
  .route('/:id')
  .get(getNotification)
  .patch(updateNotification)
  .delete(deleteNotification)

export default router
