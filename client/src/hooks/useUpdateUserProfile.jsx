import { useMutation, useQueryClient } from '@tanstack/react-query'
import customAxios from '../utils/axios/customAxios'
import toast from 'react-hot-toast'

const useUpdateUserProfile = () => {
  const queryClient = useQueryClient()

  const { mutate: updateProfile, isPending: isUpdatingProfile } = useMutation({
    mutationFn: async (formData) => {
      try {
        const res = await customAxios.patch('/users/updateMe', formData)

        return res.data.user
      } catch (error) {
        throw new Error(error)
      }
    },
    onSuccess: () => {
      toast.success('Profile updated successfully')
      Promise.all([
        queryClient.invalidateQueries(['authUser']),
        queryClient.invalidateQueries(['userProfile'])
      ])
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || error.message)
    }
  })

  return { updateProfile, isUpdatingProfile }
}

export default useUpdateUserProfile
