import multer from 'multer'
import cloudinaryModule from 'cloudinary'
import { ApiError } from './ApiError'
import { env } from '~/config/env'

const cloudinary = cloudinaryModule.v2

cloudinary.config({
  cloud_name: env.cloudinary.CLOUD_NAME,
  api_key: env.cloudinary.CLOUD_API_KEY,
  api_secret: env.cloudinary.CLOUD_API_SECRET
})

const storage = multer.memoryStorage()

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true)
  } else {
    cb(new ApiError(400, 'Not an image! Please upload only images'), false)
  }
}

const upload = multer({ storage, fileFilter: multerFilter })

export { cloudinary, upload }
