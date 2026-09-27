import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jobtrack_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const path = window.location.pathname
    if ((status === 401 || status === 403) && !path.startsWith('/login') && !path.startsWith('/register')) {
      localStorage.removeItem('jobtrack_token')
      localStorage.removeItem('jobtrack_user')
      window.location.assign('/login')
    }
    return Promise.reject(error)
  },
)

export default api
