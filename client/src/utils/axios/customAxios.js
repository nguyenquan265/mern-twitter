import axios from 'axios'

const url = 'http://localhost:8000/api/v1'

axios.defaults.withCredentials = true

const customAxios = axios.create({
  baseURL: url
})

customAxios.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken')

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
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
        const res = await axios.post(`${url}/auth/refresh-token`)
        const { accessToken } = res.data

        localStorage.setItem('accessToken', accessToken)

        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return axios(originalRequest)
      } catch (error) {
        await axios.post(`${url}/auth/logout`)
        localStorage.removeItem('accessToken')
        throw error
      }
    }

    return Promise.reject(error)
  }
)

export default customAxios
