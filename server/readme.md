- backend
  npm i cross-env express cors cookie-parser bcryptjs jsonwebtoken validator mongoose dotenv nodemailer cloudinary multer
  npm i --save-dev nodemon

- frontend
  // auto call refreshtoken
  axios.defaults.withCredentials = true

export const customAxios = axios.create({
baseURL: localURL
})

customAxios.interceptors.request.use(
(config) => {
const token = localStorage.getItem('token')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config

},
(error) => Promise.reject(error)
)

customAxios.interceptors.response.use(
(response) => response,
async (error) => {
const originalRequest = error.config

    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const res = await axios.post('http://localhost:8000/api/v1/users/refresh-token')
        const { token } = res.data

        localStorage.setItem('token', token)

        originalRequest.headers.Authorization = `Bearer ${token}`
        return axios(originalRequest)
      } catch (error) {
        await axios.post('http://localhost:8000/api/v1/users/logout')
        store.dispatch(logoutUser()) // clear redux state user
        toast.warn('Please log in to access this page.') // notify to user
        return
      }
    }

    return Promise.reject(error)

}
)

// loader in react-router-dom (no authenticate)
export const loader = async ({request}) => {
const params = Object.fromEntries([
...new URL(request.url).searchParams.entries(),
]);
const res = await customAxios('/your-endpoint', { params })

return {data: res.data}
}

// loader in react-router-dom (with authenticate)
export const loader =
(store) =>
async ({ request }) => {
const { user } = store.getState().user // get user from redux

    if (!user) {
      return redirect('/login')
    }

    const params = Object.fromEntries([
      ...new URL(request.url).searchParams.entries()
    ])

    try {
      const res = await customAxios('/orders', { params })

      return { orders: res.data.orders, meta: res.data.meta }
    } catch (error) {
      toast.error(
        error?.response?.data?.error?.message ||
          'There was an error placing your order'
      )

      if (error?.response?.status === 401 || error?.response?.status === 403) {
        return redirect('/login')
      }

      return null
    }

}

// action in react-router-dom (no authenticate - register)
async ({ request }) => {
const formData = await request.formData()
const data = Object.fromEntries(formData)

try {
await customAxios.post('/your-endpoint', data)
toast.success('account created successfully')
return redirect('/login')
} catch (error) {
toast.error(
error?.response?.data?.message || 'please double check your credentials'
)
return null
}
}

// action in react-router-dom (with authenticate - login)
export const action =
(store) =>
async ({ request }) => {
const formData = await request.formData()
const data = Object.fromEntries(formData)

    try {
      const res = await customAxios.post('/users/login', data)
      store.dispatch(loginUser(res.data))
      toast.success('Login successfully')
      return redirect('/')
    } catch (error) {
      toast.error(
        error?.response?.data?.message || 'please double check your credentials'
      )
      return null
    }

}

// pagination
