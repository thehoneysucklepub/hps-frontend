import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/services/auth.service'

export const useAuthStore = defineStore('auth', () => {
  const user         = ref(null)
  const accessToken  = ref(localStorage.getItem('hps_access_token'))
  const refreshToken = ref(localStorage.getItem('hps_refresh_token'))
  const loading      = ref(false)
  const error        = ref(null)

  const isAuthenticated = computed(() => !!accessToken.value && !!user.value)
  const isAdmin         = computed(() => ['super_admin', 'admin'].includes(user.value?.role))
  const isSuperAdmin    = computed(() => user.value?.role === 'super_admin')
  const isStaff         = computed(() => user.value?.role === 'staff')
  const isMember        = computed(() => user.value?.role === 'member')
  const canManage       = computed(() => ['super_admin', 'admin', 'staff'].includes(user.value?.role))

  async function login(credentials) {
    loading.value = true
    error.value   = null
    try {
      const data = await authService.login(credentials)
      accessToken.value  = data.access_token
      refreshToken.value = data.refresh_token
      user.value         = data.user
      localStorage.setItem('hps_access_token',  data.access_token)
      localStorage.setItem('hps_refresh_token', data.refresh_token)
      return data
    } catch (err) {
      error.value = err.response?.data?.error || 'Login failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchMe() {
    try {
      const data = await authService.me()
      user.value = data.user
    } catch {
      logout()
    }
  }

  async function logout() {
    try {
      if (refreshToken.value) {
        await authService.logout(refreshToken.value)
      }
    } catch { /* silent */ } finally {
      user.value         = null
      accessToken.value  = null
      refreshToken.value = null
      localStorage.removeItem('hps_access_token')
      localStorage.removeItem('hps_refresh_token')
    }
  }

  return {
    user, accessToken, refreshToken, loading, error,
    isAuthenticated, isAdmin, isSuperAdmin, isStaff, isMember, canManage,
    login, logout, fetchMe
  }
})