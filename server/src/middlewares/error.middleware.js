import { ApiError } from '~/utils/ApiError'

const sendProdError = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    })
  } else {
    console.error('err prod: ', err)

    res.status(500).json({
      status: 'error',
      message: 'Something went wrong'
    })
  }
}

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`

  return new ApiError(400, message)
}

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0]
  const message = `Duplicate field value: ${value}. Please use another value.`

  return new ApiError(400, message)
}

export const errorMiddleware = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500
  err.status = err.status || 'error'

  let error = { ...err }
  error.message = err.message

  if (err.name === 'CastError') error = handleCastErrorDB(error)
  if (err.code === 11000) error = handleDuplicateFieldsDB(error)
  if (err.name === 'ValidationError') error = new ApiError(400, err.message)
  if (err.name === 'JsonWebTokenError')
    error = new ApiError(401, 'You are unauthenticated (invalid token')
  if (err.name === 'TokenExpiredError')
    error = new ApiError(401, 'You are unauthenticated (token expired)')

  console.log('--------------------')
  console.log('error dev: ', error)
  console.log('--------------------')

  sendProdError(error, res)
}
