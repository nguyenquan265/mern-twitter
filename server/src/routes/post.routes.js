import { Router } from 'express'
import {
  commentOnPost,
  createPost,
  createPostByUser,
  deletePost,
  deletePostByUser,
  getAllPosts,
  getPost,
  likeUnlikePost,
  updatePost
} from '~/controllers/post.controller'
import { protect, restrictTo } from '~/middlewares/auth.middleware'

const router = Router()

router.use(protect)

// Protected post routes
router.post('/create', createPostByUser)
router.patch('/like/:id', likeUnlikePost)
router.post('/comment/:id', commentOnPost)
router.delete('/delete/:id', deletePostByUser)

// Admin routes
router.use(restrictTo('admin'))
router.route('/').get(getAllPosts).post(createPost)
router.route('/:id').get(getPost).patch(updatePost).delete(deletePost)

export default router
