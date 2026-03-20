<template>
  <div style="background:#0A0A0A;min-height:100vh;padding:40px 24px;">
    <div style="max-width:600px;margin:0 auto;">

      <div style="margin-bottom:32px;">
        <h1 style="font-size:28px;font-weight:800;">My Profile</h1>
        <p style="color:#888;margin-top:6px;">Manage your account details</p>
      </div>

      <!-- Avatar -->
      <div class="d-flex align-center ga-4 mb-8">
        <v-avatar size="72" color="primary">
          <span style="font-size:28px;font-weight:700;color:#0A0A0A;">
            {{ auth.user?.username?.charAt(0).toUpperCase() }}
          </span>
        </v-avatar>
        <div>
          <div style="font-size:18px;font-weight:700;">
            {{ auth.user?.full_name || auth.user?.username }}
          </div>
          <div style="font-size:13px;color:#888;">{{ auth.user?.email }}</div>
          <v-chip size="x-small" color="primary" variant="tonal" class="mt-1">Member</v-chip>
        </div>
      </div>

      <!-- Form -->
      <v-card style="background:#111111;border:1px solid #2A2A2A;" class="pa-6">
        <div style="font-size:15px;font-weight:600;margin-bottom:20px;color:#F5C518;">
          Personal Information
        </div>

        <v-row dense>
          <v-col cols="6">
            <v-text-field
              v-model="form.first_name"
              label="First Name"
              hide-details density="compact" bg-color="#1A1A1A" class="mb-3"
            />
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model="form.last_name"
              label="Last Name"
              hide-details density="compact" bg-color="#1A1A1A" class="mb-3"
            />
          </v-col>
          <v-col cols="12">
            <v-text-field
              v-model="form.phone"
              label="Phone"
              hide-details density="compact" bg-color="#1A1A1A" class="mb-3"
            />
          </v-col>
          <v-col cols="12">
            <v-select
              v-model="form.favorite_branch"
              :items="branchNames"
              label="Favourite Branch"
              hide-details density="compact" bg-color="#1A1A1A" class="mb-3"
              clearable
            />
          </v-col>
          <v-col cols="12">
            <v-textarea
              v-model="form.bio"
              label="Bio"
              hide-details density="compact" bg-color="#1A1A1A"
              rows="3" class="mb-3"
            />
          </v-col>
        </v-row>

        <v-divider class="my-4" style="border-color:#2A2A2A;" />

        <div style="font-size:15px;font-weight:600;margin-bottom:16px;color:#F5C518;">
          Preferences
        </div>

        <v-switch
          v-model="form.notifications_enabled"
          label="Enable notifications"
          color="primary" hide-details density="compact" class="mb-2"
        />
        <v-switch
          v-model="form.marketing_emails"
          label="Receive marketing emails"
          color="primary" hide-details density="compact"
        />

        <v-alert v-if="success" type="success" variant="tonal" density="compact" class="mt-4">
          Profile updated successfully
        </v-alert>
        <v-alert v-if="error" type="error" variant="tonal" density="compact" class="mt-4">
          {{ error }}
        </v-alert>

        <v-btn
          color="primary"
          block
          size="large"
          :loading="saving"
          style="color:#0A0A0A;font-weight:700;margin-top:20px;"
          @click="saveProfile"
        >
          Save Changes
        </v-btn>
      </v-card>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import api from '@/services/api'

const auth    = useAuthStore()
const saving  = ref(false)
const success = ref(false)
const error   = ref(null)
const branches = ref([])

const form = ref({
  first_name: '', last_name: '', phone: '',
  favorite_branch: '', bio: '',
  notifications_enabled: true,
  marketing_emails: false
})

const branchNames = computed(() => branches.value.map(b => b.name))

async function saveProfile() {
  saving.value  = true
  success.value = false
  error.value   = null
  try {
    const res = await api.put('/members/profile', form.value)
    auth.user     = res.data.user
    success.value = true
    setTimeout(() => success.value = false, 3000)
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to update profile'
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  try {
    const [profileRes, branchRes] = await Promise.all([
      api.get('/members/profile'),
      api.get('/branches')
    ])
    const u        = profileRes.data.user
    branches.value = branchRes.data.branches
    form.value = {
      first_name:            u.first_name               || '',
      last_name:             u.last_name                || '',
      phone:                 u.phone                    || '',
      favorite_branch:       u.profile?.favorite_branch || '',
      bio:                   u.profile?.bio             || '',
      notifications_enabled: u.profile?.notifications_enabled ?? true,
      marketing_emails:      u.profile?.marketing_emails      ?? false
    }
  } catch {
    error.value = 'Failed to load profile'
  }
})
</script>