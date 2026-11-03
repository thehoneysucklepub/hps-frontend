import axios from 'axios'

export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://api.honeysucklepub.com/api/v1'

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000
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
          `${API_BASE}/auth/refresh`,
          { refresh_token: refresh }
        )

        localStorage.setItem('hps_access_token', data.access_token)
        localStorage.setItem('hps_refresh_token', data.refresh_token)

        original.headers.Authorization = `Bearer ${data.access_token}`
        return api(original)
      } catch {
        localStorage.removeItem('hps_access_token')
        localStorage.removeItem('hps_refresh_token')
        // Public visitors are never sent to the login page; only admin screens require it
        if (window.location.pathname.startsWith('/admin')) window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

/**
 * Send a file (multipart). `fields` are extra form fields.
 * The multipart header stops axios from turning the form into JSON;
 * the browser then adds the correct boundary itself.
 */
export function uploadFile(url, file, fields = {}, method = 'post') {
  const form = new FormData()
  form.append('file', file)
  Object.entries(fields).forEach(([k, v]) => {
    if (v !== undefined && v !== null) form.append(k, typeof v === 'boolean' ? String(v) : v)
  })
  return api.request({ url, method, data: form, headers: { 'Content-Type': 'multipart/form-data' }, timeout: 120000 })
}

/** Readable message from an API error */
export function errorText(err, fallback = 'Something went wrong') {
  const e = err?.response?.data?.error
  if (Array.isArray(e)) return e.join(', ')
  if (typeof e === 'string' && e) return e
  if (err?.code === 'ECONNABORTED') return 'The server took too long to answer'
  if (!err?.response) return 'Could not reach the server'
  return fallback
}

export default api