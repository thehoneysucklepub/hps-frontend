import api from './api'

export const authService = {
  async login(credentials) {
    const { data } = await api.post('/auth/login', credentials)
    return data
  },

  async refresh(refreshToken) {
    const { data } = await api.post('/auth/refresh', { refresh_token: refreshToken })
    return data
  },

  async logout(refreshToken) {
    await api.delete('/auth/logout', { data: { refresh_token: refreshToken } })
  },

  async me() {
    const { data } = await api.get('/auth/me')
    return data
  }
}