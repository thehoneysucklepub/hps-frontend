<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <div style="font-size:24px;font-weight:700;">Staff Dashboard</div>
        <div style="color:#888;font-size:13px;margin-top:2px;">
          Your branch activity — {{ auth.user?.branch_name || 'All branches' }}
        </div>
      </div>
      <v-chip color="success" variant="tonal" size="small" prepend-icon="mdi-account">
        {{ auth.user?.role }}
      </v-chip>
    </div>

    <!-- Today's stats -->
    <v-row class="mb-6">
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
      <!-- Today's Reservations -->
      <v-col cols="12" md="6">
        <v-card style="background:#111111;border:1px solid #2A2A2A;">
          <div class="pa-4 pb-3 d-flex align-center justify-space-between" style="border-bottom:1px solid #2A2A2A;">
            <div style="font-size:15px;font-weight:600;">Today's Reservations</div>
            <v-chip size="x-small" color="primary" variant="tonal">{{ todayReservations.length }}</v-chip>
          </div>
          <div v-if="loading" class="pa-4">
            <v-skeleton-loader v-for="i in 3" :key="i" type="list-item-two-line" />
          </div>
          <div v-else-if="todayReservations.length === 0" class="pa-6 text-center">
            <v-icon size="36" color="#333">mdi-table-chair</v-icon>
            <div style="color:#555;font-size:13px;margin-top:8px;">No reservations today</div>
          </div>
          <v-list v-else bg-color="transparent" density="compact">
            <v-list-item v-for="r in todayReservations" :key="r.id" class="px-4">
              <template #prepend>
                <v-avatar size="32" :color="statusColor(r.status)" variant="tonal">
                  <v-icon size="16">mdi-table-chair</v-icon>
                </v-avatar>
              </template>
              <v-list-item-title style="font-size:13px;font-weight:600;">{{ r.username }}</v-list-item-title>
              <v-list-item-subtitle style="font-size:11px;">
                {{ r.time }} · {{ r.guests }} guests
                <span v-if="r.occasion"> · {{ r.occasion }}</span>
              </v-list-item-subtitle>
              <template #append>
                <div class="d-flex ga-1">
                  <v-chip :color="statusColor(r.status)" size="x-small" variant="tonal">{{ r.status }}</v-chip>
                  <v-btn
                    v-if="r.status === 'pending'"
                    size="x-small" variant="text" color="success" icon="mdi-check"
                    @click="confirmReservation(r)"
                  />
                </div>
              </template>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <!-- Pending Bookings -->
      <v-col cols="12" md="6">
        <v-card style="background:#111111;border:1px solid #2A2A2A;">
          <div class="pa-4 pb-3 d-flex align-center justify-space-between" style="border-bottom:1px solid #2A2A2A;">
            <div style="font-size:15px;font-weight:600;">Pending Event Bookings</div>
            <v-chip size="x-small" color="warning" variant="tonal">{{ pendingBookings.length }}</v-chip>
          </div>
          <div v-if="loading" class="pa-4">
            <v-skeleton-loader v-for="i in 3" :key="i" type="list-item-two-line" />
          </div>
          <div v-else-if="pendingBookings.length === 0" class="pa-6 text-center">
            <v-icon size="36" color="#333">mdi-calendar-check</v-icon>
            <div style="color:#555;font-size:13px;margin-top:8px;">No pending bookings</div>
          </div>
          <v-list v-else bg-color="transparent" density="compact">
            <v-list-item v-for="b in pendingBookings" :key="b.id" class="px-4">
              <template #prepend>
                <v-avatar size="32" color="warning" variant="tonal">
                  <v-icon size="16">mdi-calendar-star</v-icon>
                </v-avatar>
              </template>
              <v-list-item-title style="font-size:13px;font-weight:600;">{{ b.event_title }}</v-list-item-title>
              <v-list-item-subtitle style="font-size:11px;">
                {{ b.username }} · {{ b.guests }} guests · {{ formatDate(b.event_date) }}
              </v-list-item-subtitle>
              <template #append>
                <v-btn size="x-small" variant="tonal" color="success" @click="confirmBooking(b)">
                  Confirm
                </v-btn>
              </template>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000" location="top right">
      {{ snackbar.text }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import api from '@/services/api'

const auth     = useAuthStore()
const loading  = ref(true)
const bookings = ref([])
const reservations = ref([])
const snackbar = ref({ show: false, text: '', color: 'success' })

const today = new Date().toISOString().split('T')[0]

const todayReservations = computed(() =>
  reservations.value.filter(r => r.date === today)
)
const pendingBookings = computed(() =>
  bookings.value.filter(b => b.status === 'pending')
)

const stats = computed(() => [
  { label: "Today's Reservations", value: todayReservations.value.length, color: '#F5C518' },
  { label: 'Pending Bookings',     value: pendingBookings.value.length,   color: '#FF9800' },
  { label: 'Total Bookings',       value: bookings.value.length,          color: '#4CAF50' },
  { label: 'Total Reservations',   value: reservations.value.length,      color: '#2196F3' },
])

function statusColor(s) {
  const map = { pending: 'warning', confirmed: 'success', cancelled: 'error', completed: 'info' }
  return map[s] || 'default'
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
}

async function confirmReservation(r) {
  try {
    await api.put(`/table_reservations/${r.id}`, { status: 'confirmed' })
    r.status = 'confirmed'
    showSnack('Reservation confirmed')
  } catch {
    showSnack('Failed', 'error')
  }
}

async function confirmBooking(b) {
  try {
    await api.put(`/event_bookings/${b.id}`, { status: 'confirmed' })
    b.status = 'confirmed'
    showSnack('Booking confirmed')
  } catch {
    showSnack('Failed', 'error')
  }
}

function showSnack(text, color = 'success') {
  snackbar.value = { show: true, text, color }
}

onMounted(async () => {
  try {
    const [bookRes, resRes] = await Promise.all([
      api.get('/event_bookings',      { params: { branch_id: auth.user?.branch_id || undefined } }),
      api.get('/table_reservations',  { params: { branch_id: auth.user?.branch_id || undefined } })
    ])
    bookings.value     = bookRes.data.bookings
    reservations.value = resRes.data.reservations
  } finally {
    loading.value = false
  }
})
</script>