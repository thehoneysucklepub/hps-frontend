<template>
  <div>

    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-6">
  <div>
    <div style="font-size:24px;font-weight:700;">
      {{ auth.isStaff ? 'Staff Dashboard' : 'Dashboard' }}
    </div>
    <div style="color:#888;font-size:13px;margin-top:2px;">
      Welcome back, {{ auth.user?.username }}
      <span v-if="auth.isStaff && auth.user?.branch_name">
        — {{ auth.user.branch_name }}
      </span>
    </div>
  </div>
  <v-chip color="primary" variant="tonal" size="small">
    {{ new Date().toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long' }) }}
  </v-chip>
</div>

    <!-- Stat Cards -->
    <v-row class="mb-6">
      <v-col v-for="stat in stats" :key="stat.label" cols="12" sm="6" lg="3">
        <v-card
          style="background:#111111;border:1px solid #2A2A2A;"
          class="pa-5"
        >
          <div class="d-flex align-center justify-space-between mb-3">
            <div style="font-size:12px;color:#888;font-weight:500;text-transform:uppercase;letter-spacing:1px;">
              {{ stat.label }}
            </div>
            <v-icon :color="stat.color" size="20">{{ stat.icon }}</v-icon>
          </div>
          <div style="font-size:32px;font-weight:800;" :style="{ color: stat.color }">
            <span v-if="!loading">{{ stat.value }}</span>
            <v-skeleton-loader v-else type="text" width="60" />
          </div>
          <div style="font-size:12px;color:#888;margin-top:4px;">{{ stat.sub }}</div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Second Row -->
    <v-row>

      <!-- Recent Activity -->
      <v-col cols="12" lg="7">
        <v-card style="background:#111111;border:1px solid #2A2A2A;">
          <div class="d-flex align-center justify-space-between pa-5 pb-3">
            <div style="font-size:15px;font-weight:600;">Recent Activity</div>
            <v-btn
              variant="text"
              size="small"
              color="primary"
              to="/admin/audit-logs"
              v-if="auth.isSuperAdmin"
            >
              View all
            </v-btn>
          </div>
          <v-divider style="border-color:#2A2A2A;" />

          <div v-if="loading" class="pa-4">
            <v-skeleton-loader v-for="i in 5" :key="i" type="list-item-two-line" />
          </div>

          <div v-else-if="activity.length === 0" class="pa-8 text-center">
            <v-icon color="#444" size="40">mdi-history</v-icon>
            <div style="color:#555;margin-top:8px;font-size:13px;">No recent activity</div>
          </div>

          <v-list v-else bg-color="transparent" density="compact">
            <v-list-item
              v-for="log in activity"
              :key="log.id"
              class="px-5"
            >
              <template #prepend>
                <v-avatar size="32" :color="actionColor(log.action)" variant="tonal">
                  <v-icon size="16">{{ actionIcon(log.action) }}</v-icon>
                </v-avatar>
              </template>
              <v-list-item-title style="font-size:13px;">
                <span style="color:#F5C518;">{{ log.user }}</span>
                {{ ' ' + log.action.replace(/_/g, ' ') }}
              </v-list-item-title>
              <v-list-item-subtitle style="font-size:11px;">
                {{ timeAgo(log.created_at) }}
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <!-- Quick Actions -->
      <v-col cols="12" lg="5">
        <v-card style="background:#111111;border:1px solid #2A2A2A;">
          <div class="pa-5 pb-3" style="font-size:15px;font-weight:600;">Quick Actions</div>
          <v-divider style="border-color:#2A2A2A;" />
          <div class="pa-4 d-flex flex-column ga-3">
            <v-btn
              v-for="action in quickActions"
              :key="action.label"
              :to="action.to"
              :prepend-icon="action.icon"
              variant="tonal"
              :color="action.color"
              justify="start"
              style="justify-content:flex-start;"
            >
              {{ action.label }}
            </v-btn>
          </div>
        </v-card>

        <!-- Branches Summary -->
        <v-card style="background:#111111;border:1px solid #2A2A2A;" class="mt-4">
          <div class="pa-5 pb-3" style="font-size:15px;font-weight:600;">Branches</div>
          <v-divider style="border-color:#2A2A2A;" />
          <v-list bg-color="transparent" density="compact">
            <v-list-item
              v-for="branch in branches"
              :key="branch.id"
              class="px-5"
            >
              <template #prepend>
                <v-avatar size="28" color="primary" variant="tonal">
                  <v-icon size="14">mdi-store</v-icon>
                </v-avatar>
              </template>
              <v-list-item-title style="font-size:13px;">{{ branch.name }}</v-list-item-title>
              <v-list-item-subtitle style="font-size:11px;">{{ branch.address }}</v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

    </v-row>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import api from '@/services/api'

const auth     = useAuthStore()
const loading  = ref(true)
const statsRaw = ref({})
const activity = ref([])
const branches = ref([])

const stats = computed(() => [
  {
    label: 'Total Events',
    value: statsRaw.value?.events?.total ?? 0,
    sub:   'All time',
    icon:  'mdi-calendar-star',
    color: '#F5C518'
  },
  {
    label: 'Scheduled',
    value: statsRaw.value?.events?.scheduled ?? 0,
    sub:   'Upcoming',
    icon:  'mdi-calendar-clock',
    color: '#4CAF50'
  },
  {
    label: 'Bookings',
    value: statsRaw.value?.bookings?.total ?? 0,
    sub:   `${statsRaw.value?.bookings?.pending ?? 0} pending`,
    icon:  'mdi-calendar-check',
    color: '#FF9800'
  },
  {
    label: 'Reservations',
    value: statsRaw.value?.reservations?.total ?? 0,
    sub:   `${statsRaw.value?.reservations?.today ?? 0} today`,
    icon:  'mdi-table-chair',
    color: '#2196F3'
  }
])

const quickActions = [
  { label: 'Add New Event',       to: '/admin/events',        icon: 'mdi-plus-circle',  color: 'primary' },
  { label: 'Manage Bookings',     to: '/admin/bookings',      icon: 'mdi-calendar-check', color: 'warning' },
  { label: 'Manage Reservations', to: '/admin/reservations',  icon: 'mdi-table-chair',  color: 'info' },
  { label: 'Manage Users',        to: '/admin/users',         icon: 'mdi-account-group', color: 'success' },
]

function actionIcon(action) {
  if (action.includes('create')) return 'mdi-plus'
  if (action.includes('delete')) return 'mdi-delete'
  if (action.includes('update')) return 'mdi-pencil'
  if (action.includes('login'))  return 'mdi-login'
  return 'mdi-circle'
}

function actionColor(action) {
  if (action.includes('create')) return 'success'
  if (action.includes('delete')) return 'error'
  if (action.includes('update')) return 'warning'
  if (action.includes('login'))  return 'info'
  return 'primary'
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr)
  const mins = Math.floor(diff / 60000)
  if (mins < 1)  return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

onMounted(async () => {
  try {
    const [statsRes, branchRes] = await Promise.all([
      api.get('/dashboard/stats'),
      api.get('/branches')
    ])
    statsRaw.value = statsRes.data.stats
    activity.value = statsRes.data.stats.recent_activity || []
    branches.value = branchRes.data.branches
  } finally {
    loading.value = false
  }
})
</script>