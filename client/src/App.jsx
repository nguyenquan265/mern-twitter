import { Navigate, Route, Routes } from 'react-router-dom'
import HomePage from './pages/home/HomePage'
import SignUpPage from './pages/auth/signup/SignUpPage'
import LoginPage from './pages/auth/login/LoginPage'
import Sidebar from './components/common/Sidebar'
import RightPanel from './components/common/RightPanel'
import NotificationPage from './pages/notification/NotificationPage'
import ProfilePage from './pages/profile/ProfilePage'

import { Toaster } from 'react-hot-toast'
import { useQuery } from '@tanstack/react-query'
import customAxios from './utils/axios/customAxios'
import LoadingSpinner from './components/common/LoadingSpinner'

const App = () => {
  const { data: authUser, isLoading } = useQuery({
    queryKey: ['authUser'],
    queryFn: async () => {
      try {
        const res = await customAxios('/users/me')

        return res.data.data
      } catch (error) {
        console.log('error: ', error)
        return null
      }
    },
    retry: false
  })

  if (isLoading) {
    return (
      <div className='h-screen flex justify-center items-center'>
        <LoadingSpinner size='lg' />
      </div>
    )
  }

  console.log('authUser: ', authUser)

  return (
    <div className='flex max-w-6xl mx-auto'>
      {authUser && <Sidebar />}
      <Routes>
        <Route
          index
          path='/'
          element={authUser ? <HomePage /> : <Navigate to='/login' />}
        />
        <Route
          path='/signup'
          element={!authUser ? <SignUpPage /> : <Navigate to='/' />}
        />
        <Route
          path='/login'
          element={!authUser ? <LoginPage /> : <Navigate to='/' />}
        />
        <Route
          path='/notifications'
          element={authUser ? <NotificationPage /> : <Navigate to='/login' />}
        />
        <Route
          path='/profile/:username'
          element={authUser ? <ProfilePage /> : <Navigate to='/login' />}
        />
      </Routes>
      {authUser && <RightPanel />}
      <Toaster />
    </div>
  )
}

export default App
