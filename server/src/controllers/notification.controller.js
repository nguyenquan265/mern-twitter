import { Notification } from '~/models/notification.model'
import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne
} from './factory.handler'
import { catchAsync } from '~/utils/catchAsync'
import { ApiError } from '~/utils/ApiError'

// Protected notification
export const getNotificationsFromUser = catchAsync(async (req, res, next) => {
  const notifications = await Notification.find({ to: req.user._id }).sort({
    createdAt: -1
  })

  await Notification.updateMany({ to: req.user._id }, { read: true })

  res.status(200).json({ status: 'success', notifications })
})

export const deleteAllNotificationsFromUser = catchAsync(
  async (req, res, next) => {
    await Notification.deleteMany({ to: req.user._id })

    res.status(204).json({ status: 'success' })
  }
)

export const deleteOneNotificationFromUser = catchAsync(
  async (req, res, next) => {
    const notification = await Notification.findById(req.params.id)

    if (!notification) {
      throw new ApiError(404, 'No notification found with that ID')
    }

    if (notification.to.toString() !== req.user._id.toString()) {
      throw new ApiError(403, 'You are not allowed to delete this notification')
    }

    await Notification.findByIdAndDelete(req.params.id)

    res.status(200).json({ status: 'success' })
  }
)

// Admin
export const getAllNotifications = getAll(Notification)
export const getNotification = getOne(Notification)
export const createNotification = createOne(Notification)
export const updateNotification = updateOne(Notification)
export const deleteNotification = deleteOne(Notification)
