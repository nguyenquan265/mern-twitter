import { Router } from 'express'
const router = Router()

import userRouter from './user.routes'
import { ApiError } from '~/utils/ApiError'

router.use('/users', userRouter)
router.all('*', (req, res, next) =>
  next(new ApiError(404, `Can't find ${req.originalUrl} on this server!`))
)

export default router
