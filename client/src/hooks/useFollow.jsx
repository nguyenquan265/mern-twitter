import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import customAxios from '../utils/axios/customAxios'

const useFollow = () => {
  const queryClient = useQueryClient()

  const { mutate: follow, isPending } = useMutation({
    mutationFn: async (userId) => {
      try {
        const res = await customAxios.patch(`/users/follow/${userId}`)

        return res.data
      } catch (error) {
        throw new Error(error)
      }
    },
    onSuccess: async () => {
      toast.success('User followed successfully')
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['suggestedUsers'] }),
        queryClient.invalidateQueries({ queryKey: ['authUser'] })
      ])
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || error.message)
    }
  })

  return { follow, isPending }
}

export default useFollow
