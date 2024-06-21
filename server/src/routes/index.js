import { Router } from 'express'
const router = Router()

import authRouter from './auth.routes'
import userRouter from './user.routes'
import postRouter from './post.routes'
import notificationRouter from './notification.routes'
import { ApiError } from '~/utils/ApiError'

router.use('/check', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Server is running' })
})
router.use('/auth', authRouter)
router.use('/users', userRouter)
router.use('/posts', postRouter)
router.use('/notifications', notificationRouter)
router.all('*', (req, res, next) =>
  next(new ApiError(404, `Can't find ${req.originalUrl} on this server!`))
)

export default router
