import { ApiError } from '~/utils/ApiError'
import { ApiFeatures } from '~/utils/ApiFeatures'
import { catchAsync } from '~/utils/catchAsync'

export const getAll = (model) => {
  return catchAsync(async (req, res, next) => {
    const features = new ApiFeatures(model.find().lean(), req.query)

    const [docs, totalDocs] = await Promise.all([
      features.filter().sort().limitFields().paginate().query,
      model.countDocuments()
    ])

    res.status(200).json({
      status: 'success',
      totalDocs,
      maxDocs: 6,
      results: docs.length,
      data: docs
    })
  })
}

export const getOne = (model, populateOptions) => {
  return catchAsync(async (req, res, next) => {
    let query = model.findById(req.params.id)

    if (populateOptions) {
      query = query.populate(populateOptions)
    }

    const doc = await query

    if (!doc) {
      throw new ApiError(404, `No ${model} found with that ID`)
    }

    res.status(200).json({ status: 'success', data: doc })
  })
}

export const createOne = (model) => {
  return catchAsync(async (req, res, next) => {
    const doc = await model.create(req.body)

    res.status(201).json({ status: 'success', data: doc })
  })
}

export const updateOne = (model) => {
  return catchAsync(async (req, res, next) => {
    const doc = await model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })

    if (!doc) {
      throw new ApiError(404, `No ${model} found with that ID`)
    }

    res.status(200).json({ status: 'success', data: doc })
  })
}

export const deleteOne = (model) => {
  return catchAsync(async (req, res, next) => {
    const doc = await model.findByIdAndDelete(req.params.id)

    if (!doc) {
      throw new ApiError(404, `No ${model} found with that ID`)
    }

    res.status(204).json({ status: 'success', data: null })
  })
}
