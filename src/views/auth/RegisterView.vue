<template>
  <v-app theme="hpsTheme">
    <v-main style="background:#0A0A0A;">
      <div class="d-flex align-center justify-center" style="min-height:100vh;">
        <div style="width:100%;max-width:460px;" class="px-4">

          <!-- Logo -->
          <div class="text-center mb-8">
            <div style="width:64px;height:64px;background:#F5C518;border-radius:16px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
              <span style="color:#0A0A0A;font-weight:900;font-size:28px;">H</span>
            </div>
            <div style="color:#F5C518;font-weight:800;font-size:24px;letter-spacing:2px;">
              Join HPS
            </div>
            <div style="color:#888;font-size:13px;margin-top:4px;">
              Create your member account
            </div>
          </div>

          <v-card style="background:#111111;border:1px solid #2A2A2A;border-radius:16px;" class="pa-6">
            <v-alert v-if="error" type="error" variant="tonal" density="compact" class="mb-4" closable @click:close="error=null">
              {{ error }}
            </v-alert>

            <v-form @submit.prevent="handleRegister">
              <v-row dense>
                <v-col cols="6">
                  <div style="font-size:12px;color:#888;margin-bottom:6px;font-weight:500;">FIRST NAME</div>
                  <v-text-field v-model="form.first_name" placeholder="First name" hide-details density="compact" bg-color="#1A1A1A" class="mb-3" />
                </v-col>
                <v-col cols="6">
                  <div style="font-size:12px;color:#888;margin-bottom:6px;font-weight:500;">LAST NAME</div>
                  <v-text-field v-model="form.last_name" placeholder="Last name" hide-details density="compact" bg-color="#1A1A1A" class="mb-3" />
                </v-col>
              </v-row>

              <div style="font-size:12px;color:#888;margin-bottom:6px;font-weight:500;">USERNAME</div>
              <v-text-field v-model="form.username" placeholder="Choose a username" prepend-inner-icon="mdi-account-outline" hide-details density="compact" bg-color="#1A1A1A" class="mb-3" />

              <div style="font-size:12px;color:#888;margin-bottom:6px;font-weight:500;">EMAIL</div>
              <v-text-field v-model="form.email" placeholder="Your email address" prepend-inner-icon="mdi-email-outline" type="email" hide-details density="compact" bg-color="#1A1A1A" class="mb-3" />

              <div style="font-size:12px;color:#888;margin-bottom:6px;font-weight:500;">PHONE</div>
              <v-text-field v-model="form.phone" placeholder="Phone number" prepend-inner-icon="mdi-phone-outline" hide-details density="compact" bg-color="#1A1A1A" class="mb-3" />

              <div style="font-size:12px;color:#888;margin-bottom:6px;font-weight:500;">PASSWORD</div>
              <v-text-field
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Create a password"
                prepend-inner-icon="mdi-lock-outline"
                :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="showPassword = !showPassword"
                hide-details
                density="compact"
                bg-color="#1A1A1A"
                class="mb-4"
              />

              <v-btn
                type="submit"
                color="primary"
                block
                size="large"
                :loading="loading"
                style="font-weight:700;color:#0A0A0A;font-size:15px;"
              >
                Create Account
              </v-btn>
            </v-form>

            <div class="text-center mt-4" style="font-size:13px;color:#888;">
              Already have an account?
              <router-link to="/login" style="color:#F5C518;text-decoration:none;font-weight:600;">Sign in</router-link>
            </div>
          </v-card>

          <div class="text-center mt-6" style="color:#555;font-size:12px;">
            © {{ new Date().getFullYear() }} The Honeysuckle Pub
          </div>
        </div>
      </div>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import api from '@/services/api'

const auth   = useAuthStore()
const router = useRouter()

const form = ref({
  username: '', email: '', password: '',
  first_name: '', last_name: '', phone: ''
})
const loading      = ref(false)
const error        = ref(null)
const showPassword = ref(false)

async function handleRegister() {
  if (!form.value.username || !form.value.email || !form.value.password) {
    error.value = 'Username, email and password are required'
    return
  }
  loading.value = true
  error.value   = null
  try {
    const { data } = await api.post('/members/register', form.value)
    localStorage.setItem('hps_access_token',  data.access_token)
    localStorage.setItem('hps_refresh_token', data.refresh_token)
    auth.user         = data.user
    auth.accessToken  = data.access_token
    auth.refreshToken = data.refresh_token
    router.push('/member')
  } catch (err) {
    error.value = err.response?.data?.error || 'Registration failed'
  } finally {
    loading.value = false
  }
}
</script>