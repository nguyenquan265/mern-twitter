import { Router } from 'express'
import {
  commentOnPost,
  createPost,
  createPostByUser,
  deletePost,
  deletePostByUser,
  getAllPosts,
  getFollowingPosts,
  getLikedPosts,
  getPost,
  getUserPosts,
  likeUnlikePost,
  updatePost
} from '~/controllers/post.controller'
import { protect, restrictTo } from '~/middlewares/auth.middleware'

const router = Router()

router.use(protect)

// Protected post routes
router.get('/all', getAllPosts)
router.get('/following', getFollowingPosts)
router.get('/liked/:id', getLikedPosts)
router.get('/user/:username', getUserPosts)
router.post('/create', createPostByUser)
router.patch('/like/:id', likeUnlikePost)
router.post('/comment/:id', commentOnPost)
router.delete('/delete/:id', deletePostByUser)

// Admin routes
router.use(restrictTo('admin'))
router.route('/').get(getAllPosts).post(createPost)
router.route('/:id').get(getPost).patch(updatePost).delete(deletePost)

export default router
