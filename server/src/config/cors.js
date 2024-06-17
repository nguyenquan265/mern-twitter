import { ApiError } from '~/utils/ApiError.js'
import { WHITELIST_DOMAINS } from '../utils/constants.js'
import { env } from './env.js'

export const corsOptions = {
  origin: function (origin, callback) {
    if (env.BUILD_MODE === 'dev') {
      return callback(null, true)
    }

    if (WHITELIST_DOMAINS.includes(origin)) {
      return callback(null, true)
    }

    return callback(
      new ApiError(403, `${origin} not allowed by our CORS Policy.`)
    )
  },

  optionsSuccessStatus: 200,
  credentials: true
}
