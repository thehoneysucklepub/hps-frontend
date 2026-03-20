<template>
  <v-app theme="hpsTheme">
    <v-main style="background:#0A0A0A;">
      <div class="d-flex align-center justify-center" style="min-height:100vh;">

        <div style="width:100%;max-width:420px;" class="px-4">

          <!-- Logo -->
          <div class="text-center mb-8">
            <div
              style="width:64px;height:64px;background:#F5C518;border-radius:16px;
                     display:inline-flex;align-items:center;justify-content:center;
                     margin-bottom:16px;"
            >
              <span style="color:#0A0A0A;font-weight:900;font-size:28px;">H</span>
            </div>
            <div style="color:#F5C518;font-weight:800;font-size:24px;letter-spacing:2px;">
              HPS
            </div>
            <div style="color:#888;font-size:13px;margin-top:4px;">
              The Honeysuckle Pub
            </div>
          </div>

          <!-- Card -->
          <v-card
            style="background:#111111;border:1px solid #2A2A2A;border-radius:16px;"
            class="pa-6"
          >
            <div style="font-size:20px;font-weight:700;margin-bottom:4px;">
              Welcome back
            </div>
            <div style="color:#888;font-size:13px;margin-bottom:28px;">
              Sign in to your account
            </div>

            <!-- Error -->
            <v-alert
              v-if="error"
              type="error"
              variant="tonal"
              density="compact"
              class="mb-4"
              closable
              @click:close="error = null"
            >
              {{ error }}
            </v-alert>

            <!-- Form -->
            <v-form @submit.prevent="handleLogin">

              <div style="margin-bottom:16px;">
                <div style="font-size:12px;color:#888;margin-bottom:6px;font-weight:500;">
                  USERNAME OR EMAIL
                </div>
                <v-text-field
                  v-model="form.username_or_email"
                  placeholder="Enter username or email"
                  prepend-inner-icon="mdi-account-outline"
                  hide-details
                  :disabled="loading"
                  style="background:#1A1A1A;"
                  bg-color="#1A1A1A"
                />
              </div>

              <div style="margin-bottom:24px;">
                <div style="font-size:12px;color:#888;margin-bottom:6px;font-weight:500;">
                  PASSWORD
                </div>
                <v-text-field
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Enter password"
                  prepend-inner-icon="mdi-lock-outline"
                  :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                  @click:append-inner="showPassword = !showPassword"
                  hide-details
                  :disabled="loading"
                  bg-color="#1A1A1A"
                />
              </div>

              <v-btn
                type="submit"
                color="primary"
                block
                size="large"
                :loading="loading"
                style="font-weight:700;color:#0A0A0A;font-size:15px;"
              >
                Sign In
              </v-btn>
            
            </v-form>
            <div class="text-center mt-4" style="font-size:13px;color:#888;">
  Don't have an account?
  <router-link to="/register" style="color:#F5C518;text-decoration:none;font-weight:600;">Create one</router-link>
</div>
          </v-card>

          <!-- Footer -->
          <div class="text-center mt-6" style="color:#555;font-size:12px;">
            © {{ new Date().getFullYear() }} The Honeysuckle Pub. All rights reserved.
          </div>

        </div>
      </div>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

const auth   = useAuthStore()
const router = useRouter()
const route  = useRoute()

const form = ref({
  username_or_email: '',
  password: ''
})

const loading      = ref(false)
const error        = ref(null)
const showPassword = ref(false)

async function handleLogin() {
  if (!form.value.username_or_email || !form.value.password) {
    error.value = 'Please fill in all fields'
    return
  }

  loading.value = true
  error.value   = null

  try {
    await auth.login(form.value)
    const redirect = route.query.redirect || (auth.isAdmin ? '/admin' : '/')
    router.push(redirect)
  } catch (err) {
    error.value = err.response?.data?.error || 'Invalid credentials'
  } finally {
    loading.value = false
  }
}
</script>