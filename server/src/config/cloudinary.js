import cloudinaryModule from 'cloudinary'
import { env } from './env'

const cloudinary = cloudinaryModule.v2

cloudinary.config({
  cloud_name: env.cloudinary.CLOUD_NAME,
  api_key: env.cloudinary.CLOUD_API_KEY,
  api_secret: env.cloudinary.CLOUD_API_SECRET
})

export { cloudinary }
