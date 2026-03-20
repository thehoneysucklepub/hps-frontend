<template>
  <div style="background:#0A0A0A;min-height:100vh;padding:40px 24px;">
    <div style="max-width:900px;margin:0 auto;">
      <div style="margin-bottom:32px;">
        <h1 style="font-size:28px;font-weight:800;">My Event Bookings</h1>
        <p style="color:#888;margin-top:6px;">All your event bookings in one place</p>
      </div>

      <div v-if="loading" class="d-flex justify-center pa-12">
        <v-progress-circular indeterminate color="primary" size="48" />
      </div>

      <div v-else-if="bookings.length === 0" class="text-center pa-12">
        <v-icon size="64" color="#333">mdi-calendar-remove</v-icon>
        <div style="color:#555;margin-top:12px;font-size:15px;">No bookings yet</div>
        <v-btn color="primary" class="mt-4" to="/live-sports">Browse Events</v-btn>
      </div>

      <div v-else style="display:flex;flex-direction:column;gap:12px;">
        <v-card
          v-for="b in bookings"
          :key="b.id"
          style="background:#111111;border:1px solid #2A2A2A;"
          class="pa-5"
        >
          <div class="d-flex align-center justify-space-between flex-wrap gap-3">
            <div class="d-flex align-center ga-4">
              <v-avatar size="48" :color="statusColor(b.status)" variant="tonal">
                <v-icon>mdi-calendar-star</v-icon>
              </v-avatar>
              <div>
                <div style="font-size:15px;font-weight:700;">{{ b.event_title }}</div>
                <div style="font-size:13px;color:#888;margin-top:2px;">
                  {{ formatDate(b.event_date) }} · {{ b.event_time }} · {{ b.branch_name }}
                </div>
                <div style="font-size:12px;margin-top:4px;">
                  <span style="color:#888;">{{ b.guests }} guest(s)</span>
                  <span style="color:#F5C518;font-family:monospace;margin-left:12px;">{{ b.confirmation_code }}</span>
                </div>
              </div>
            </div>
            <div class="d-flex align-center ga-2">
              <v-chip :color="statusColor(b.status)" size="small" variant="tonal">{{ b.status }}</v-chip>
              <v-btn
                v-if="b.status === 'pending'"
                icon="mdi-close"
                size="small"
                variant="text"
                color="error"
                @click="cancelBooking(b)"
              />
            </div>
          </div>
        </v-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'

const bookings = ref([])
const loading  = ref(true)

function statusColor(s) {
  const map = { pending: 'warning', confirmed: 'success', cancelled: 'error', attended: 'info' }
  return map[s] || 'default'
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })
}

async function cancelBooking(b) {
  try {
    await api.delete(`/event_bookings/${b.id}`)
    b.status = 'cancelled'
  } catch { /* silent */ }
}

onMounted(async () => {
  try {
    const res = await api.get('/event_bookings')
    bookings.value = res.data.bookings
  } finally {
    loading.value = false
  }
})
</script>