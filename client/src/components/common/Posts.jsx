import Post from './Post'
import PostSkeleton from '../skeletons/PostSkeleton'
import { useQuery } from '@tanstack/react-query'
import customAxios from '../../utils/axios/customAxios'
import { useEffect } from 'react'

const Posts = ({ feedType }) => {
  const getPostEndpoint = () => {
    switch (feedType) {
      case 'forYou':
        return '/posts/all'
      case 'following':
        return '/posts/following'
      default:
        return '/posts/all'
    }
  }

  const POST_ENDPOINT = getPostEndpoint()

  const {
    data: posts,
    isLoading,
    refetch,
    isRefetching
  } = useQuery({
    queryKey: ['posts', feedType],
    queryFn: async () => {
      try {
        const res = await customAxios(POST_ENDPOINT)

        if (feedType === 'forYou') {
          return res.data.data
        }

        return res.data.posts
      } catch (error) {
        throw new Error(error)
      }
    }
  })

  // useEffect(() => {
  //   refetch()
  // }, [feedType, refetch])

  return (
    <>
      {(isLoading || isRefetching) && (
        <div className='flex flex-col justify-center'>
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </div>
      )}
      {!isLoading && posts?.length === 0 && (
        <p className='text-center my-4'>No posts in this tab. Switch 👻</p>
      )}
      {!isLoading && posts && (
        <div>
          {posts.map((post) => (
            <Post key={post._id} post={post} />
          ))}
        </div>
      )}
    </>
  )
}

export default Posts
