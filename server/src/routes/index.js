import { Router } from 'express'
const router = Router()

import authRouter from './auth.routes'
import userRouter from './user.routes'
import postRouter from './post.routes'
import { ApiError } from '~/utils/ApiError'

router.use('/auth', authRouter)
router.use('/users', userRouter)
router.use('/posts', postRouter)
router.all('*', (req, res, next) =>
  next(new ApiError(404, `Can't find ${req.originalUrl} on this server!`))
)

export default router
