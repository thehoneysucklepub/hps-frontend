import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://api.honeysucklepub.com/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000
})

// Attach token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('hps_access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 globally
api.interceptors.response.use(
  response => response,
  async error => {
    const original = error.config

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true

      try {
        const refresh = localStorage.getItem('hps_refresh_token')
        if (!refresh) throw new Error('No refresh token')

        const { data } = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/auth/refresh`,
          { refresh_token: refresh }
        )

        localStorage.setItem('hps_access_token', data.access_token)
        localStorage.setItem('hps_refresh_token', data.refresh_token)

        original.headers.Authorization = `Bearer ${data.access_token}`
        return api(original)
      } catch {
        localStorage.removeItem('hps_access_token')
        localStorage.removeItem('hps_refresh_token')
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

export default api