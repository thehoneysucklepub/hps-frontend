<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <div style="font-size:24px;font-weight:700;">Table Reservations</div>
        <div style="color:#888;font-size:13px;margin-top:2px;">Manage table bookings across all branches</div>
      </div>
      <div class="d-flex ga-2">
        <v-chip color="warning" variant="tonal" size="small">{{ pendingCount }} pending</v-chip>
        <v-chip color="success" variant="tonal" size="small">{{ todayCount }} today</v-chip>
      </div>
    </div>

    <!-- Filters -->
    <v-card style="background:#111111;border:1px solid #2A2A2A;" class="pa-4 mb-5">
      <v-row dense align="center">
        <v-col cols="6" md="3">
          <v-select
            v-model="filters.status"
            :items="['pending','confirmed','cancelled','completed']"
            placeholder="Status"
            hide-details density="compact" bg-color="#1A1A1A" clearable
            @update:model-value="fetchReservations"
          />
        </v-col>
        <v-col cols="6" md="3">
          <v-select
            v-model="filters.branch_id"
            :items="branchOptions"
            placeholder="Branch"
            hide-details density="compact" bg-color="#1A1A1A" clearable
            @update:model-value="fetchReservations"
          />
        </v-col>
        <v-col cols="6" md="3">
          <v-text-field
            v-model="filters.date"
            type="date"
            label="Filter by date"
            hide-details density="compact" bg-color="#1A1A1A"
            @update:model-value="fetchReservations"
          />
        </v-col>
        <v-col cols="6" md="3">
          <v-btn variant="text" color="primary" size="small" prepend-icon="mdi-refresh" @click="resetFilters">
            Reset
          </v-btn>
        </v-col>
      </v-row>
    </v-card>

    <!-- Table -->
    <v-card style="background:#111111;border:1px solid #2A2A2A;">
      <div v-if="loading" class="d-flex justify-center pa-12">
        <v-progress-circular indeterminate color="primary" size="48" />
      </div>

      <div v-else-if="reservations.length === 0" class="text-center pa-12">
        <v-icon size="64" color="#333">mdi-table-chair</v-icon>
        <div style="color:#555;margin-top:12px;">No reservations found</div>
      </div>

      <v-table v-else style="background:transparent;">
        <thead>
          <tr style="border-bottom:1px solid #2A2A2A;">
            <th style="color:#888;font-size:12px;font-weight:500;">Code</th>
            <th style="color:#888;font-size:12px;font-weight:500;">Member</th>
            <th style="color:#888;font-size:12px;font-weight:500;">Branch</th>
            <th style="color:#888;font-size:12px;font-weight:500;">Date & Time</th>
            <th style="color:#888;font-size:12px;font-weight:500;">Guests</th>
            <th style="color:#888;font-size:12px;font-weight:500;">Occasion</th>
            <th style="color:#888;font-size:12px;font-weight:500;">Status</th>
            <th style="color:#888;font-size:12px;font-weight:500;">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="r in reservations"
            :key="r.id"
            style="border-bottom:1px solid #1A1A1A;"
          >
            <td style="padding:12px 16px;">
              <span style="font-family:monospace;font-size:12px;color:#F5C518;">{{ r.confirmation_code }}</span>
            </td>
            <td style="padding:12px 16px;font-size:13px;font-weight:600;">{{ r.username }}</td>
            <td style="padding:12px 16px;font-size:13px;color:#888;">{{ r.branch_name }}</td>
            <td style="padding:12px 16px;">
              <div style="font-size:13px;font-weight:600;">{{ formatDate(r.date) }}</div>
              <div style="font-size:11px;color:#888;">{{ r.time }}</div>
            </td>
            <td style="padding:12px 16px;font-size:13px;color:#888;">{{ r.guests }}</td>
            <td style="padding:12px 16px;font-size:12px;color:#888;">{{ r.occasion || '—' }}</td>
            <td style="padding:12px 16px;">
              <v-chip :color="statusColor(r.status)" size="x-small" variant="tonal">{{ r.status }}</v-chip>
            </td>
            <td style="padding:12px 16px;">
              <div class="d-flex ga-1">
                <v-btn
                  v-if="r.status === 'pending'"
                  size="x-small" variant="tonal" color="success"
                  @click="updateStatus(r, 'confirmed')"
                >
                  Confirm
                </v-btn>
                <v-btn
                  v-if="r.status === 'confirmed'"
                  size="x-small" variant="tonal" color="info"
                  @click="updateStatus(r, 'completed')"
                >
                  Done
                </v-btn>
                <v-btn
                  v-if="['pending','confirmed'].includes(r.status)"
                  size="x-small" variant="text" color="error" icon="mdi-close"
                  @click="updateStatus(r, 'cancelled')"
                />
              </div>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000" location="top right">
      {{ snackbar.text }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import api from '@/services/api'

const auth         = useAuthStore()
const reservations = ref([])
const branches     = ref([])
const loading      = ref(true)
const snackbar     = ref({ show: false, text: '', color: 'success' })
const filters      = ref({ status: null, branch_id: null, date: null })

const branchOptions = computed(() => branches.value.map(b => ({ title: b.name, value: b.id })))
const pendingCount  = computed(() => reservations.value.filter(r => r.status === 'pending').length)
const todayCount    = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return reservations.value.filter(r => r.date === today).length
})

function statusColor(s) {
  const map = { pending: 'warning', confirmed: 'success', cancelled: 'error', completed: 'info' }
  return map[s] || 'default'
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB', {
    weekday: 'short', day: '2-digit', month: 'short', year: 'numeric'
  })
}

function resetFilters() {
  filters.value = { status: null, branch_id: null, date: null }
  fetchReservations()
}

async function updateStatus(res, status) {
  try {
    await api.put(`/table_reservations/${res.id}`, { status })
    res.status = status
    showSnack(`Reservation ${status}`)
  } catch {
    showSnack('Failed to update', 'error')
  }
}

async function fetchReservations() {
  loading.value = true
  try {
    const params = {
      status:    filters.value.status    || undefined,
      branch_id: filters.value.branch_id || undefined,
      date:      filters.value.date      || undefined,
    }
    if (auth.isStaff && auth.user?.branch_id) {
      params.branch_id = auth.user.branch_id
    }
    const res = await api.get('/table_reservations', { params })
    reservations.value = res.data.reservations
  } finally {
    loading.value = false
  }
}

function showSnack(text, color = 'success') {
  snackbar.value = { show: true, text, color }
}

onMounted(async () => {
  const branchRes = await api.get('/branches')
  branches.value  = branchRes.data.branches
  await fetchReservations()
})
</script>