<template>
  <div style="background:#0A0A0A;min-height:100vh;padding:40px 24px;">
    <div style="max-width:1000px;margin:0 auto;">

      <!-- Header -->
      <div style="margin-bottom:40px;">
        <div style="font-size:12px;color:#F5C518;letter-spacing:3px;text-transform:uppercase;margin-bottom:8px;">
          Member Portal
        </div>
        <h1 style="font-size:32px;font-weight:800;">
          Welcome back, {{ auth.user?.first_name || auth.user?.username }}
        </h1>
        <p style="color:#888;margin-top:6px;">Manage your bookings, reservations and account</p>
      </div>

      <!-- Stats -->
      <v-row class="mb-8">
        <v-col v-for="s in stats" :key="s.label" cols="6" sm="3">
          <v-card style="background:#111111;border:1px solid #2A2A2A;" class="pa-4">
            <div style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;">{{ s.label }}</div>
            <div style="font-size:28px;font-weight:800;margin-top:4px;" :style="{ color: s.color }">
              {{ s.value }}
            </div>
          </v-card>
        </v-col>
      </v-row>

      <v-row>
        <!-- Upcoming Bookings -->
        <v-col cols="12" md="6">
          <v-card style="background:#111111;border:1px solid #2A2A2A;" class="mb-4">
            <div class="d-flex align-center justify-space-between pa-4 pb-3" style="border-bottom:1px solid #2A2A2A;">
              <div style="font-size:15px;font-weight:600;">Event Bookings</div>
              <v-btn variant="text" color="primary" size="small" to="/member/bookings">View all</v-btn>
            </div>
            <div v-if="loading" class="pa-4">
              <v-skeleton-loader v-for="i in 3" :key="i" type="list-item-two-line" />
            </div>
            <div v-else-if="dashboard.upcoming_bookings?.length === 0" class="pa-6 text-center">
              <v-icon size="36" color="#333">mdi-calendar-check</v-icon>
              <div style="color:#555;font-size:13px;margin-top:8px;">No upcoming bookings</div>
              <v-btn color="primary" size="small" class="mt-3" to="/live-sports">Book an Event</v-btn>
            </div>
            <v-list v-else bg-color="transparent" density="compact">
              <v-list-item v-for="b in dashboard.upcoming_bookings" :key="b.id" class="px-4">
                <template #prepend>
                  <v-avatar size="36" :color="statusColor(b.status)" variant="tonal">
                    <v-icon size="18">mdi-calendar-star</v-icon>
                  </v-avatar>
                </template>
                <v-list-item-title style="font-size:13px;font-weight:600;">{{ b.event_title }}</v-list-item-title>
                <v-list-item-subtitle style="font-size:11px;">
                  {{ formatDate(b.event_date) }} · {{ b.event_time }} · {{ b.branch_name }}
                </v-list-item-subtitle>
                <template #append>
                  <v-chip :color="statusColor(b.status)" size="x-small" variant="tonal">{{ b.status }}</v-chip>
                </template>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>

        <!-- Upcoming Reservations -->
        <v-col cols="12" md="6">
          <v-card style="background:#111111;border:1px solid #2A2A2A;" class="mb-4">
            <div class="d-flex align-center justify-space-between pa-4 pb-3" style="border-bottom:1px solid #2A2A2A;">
              <div style="font-size:15px;font-weight:600;">Table Reservations</div>
              <v-btn variant="text" color="primary" size="small" to="/member/reservations">View all</v-btn>
            </div>
            <div v-if="loading" class="pa-4">
              <v-skeleton-loader v-for="i in 3" :key="i" type="list-item-two-line" />
            </div>
            <div v-else-if="dashboard.upcoming_reservations?.length === 0" class="pa-6 text-center">
              <v-icon size="36" color="#333">mdi-table-chair</v-icon>
              <div style="color:#555;font-size:13px;margin-top:8px;">No upcoming reservations</div>
              <v-btn color="primary" size="small" class="mt-3" to="/member/reservations">Reserve a Table</v-btn>
            </div>
            <v-list v-else bg-color="transparent" density="compact">
              <v-list-item v-for="r in dashboard.upcoming_reservations" :key="r.id" class="px-4">
                <template #prepend>
                  <v-avatar size="36" :color="statusColor(r.status)" variant="tonal">
                    <v-icon size="18">mdi-table-chair</v-icon>
                  </v-avatar>
                </template>
                <v-list-item-title style="font-size:13px;font-weight:600;">{{ r.branch_name }}</v-list-item-title>
                <v-list-item-subtitle style="font-size:11px;">
                  {{ formatDate(r.date) }} · {{ r.time }} · {{ r.guests }} guests
                </v-list-item-subtitle>
                <template #append>
                  <v-chip :color="statusColor(r.status)" size="x-small" variant="tonal">{{ r.status }}</v-chip>
                </template>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>
      </v-row>

      <!-- Quick Actions -->
      <v-card style="background:#111111;border:1px solid #2A2A2A;">
        <div class="pa-4 pb-3" style="border-bottom:1px solid #2A2A2A;font-size:15px;font-weight:600;">Quick Actions</div>
        <div class="pa-4 d-flex flex-wrap ga-3">
          <v-btn color="primary" prepend-icon="mdi-calendar-star" style="color:#0A0A0A;" to="/live-sports">
            Book an Event
          </v-btn>
          <v-btn variant="tonal" color="primary" prepend-icon="mdi-table-chair" to="/member/reservations">
            Reserve a Table
          </v-btn>
          <v-btn variant="tonal" color="primary" prepend-icon="mdi-account-edit" to="/member/profile">
            Edit Profile
          </v-btn>
          <v-btn variant="text" color="primary" prepend-icon="mdi-bookmark-multiple" to="/member/bookmarks">
            My Bookmarks
          </v-btn>
        </div>
      </v-card>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import api from '@/services/api'

const auth      = useAuthStore()
const loading   = ref(true)
const dashboard = ref({})

const stats = computed(() => [
  { label: 'Bookings',     value: dashboard.value.stats?.total_bookings     || 0, color: '#F5C518' },
  { label: 'Reservations', value: dashboard.value.stats?.total_reservations || 0, color: '#4CAF50' },
  { label: 'Bookmarks',    value: dashboard.value.stats?.bookmarks          || 0, color: '#2196F3' },
  {
  label: 'Member Since',
  value: auth.user?.created_at
    ? new Date(auth.user.created_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
    : '—',
  color: '#888'
},
])

function statusColor(s) {
  const map = { pending: 'warning', confirmed: 'success', cancelled: 'error', completed: 'info' }
  return map[s] || 'default'
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

onMounted(async () => {
  try {
    const res = await api.get('/members/dashboard')
    dashboard.value = res.data.dashboard
  } finally {
    loading.value = false
  }
})
</script>