<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <div style="font-size:24px;font-weight:700;">Event Bookings</div>
        <div style="color:#888;font-size:13px;margin-top:2px;">
          All member event bookings across branches
        </div>
      </div>
      <div class="d-flex ga-2">
        <v-chip color="warning" variant="tonal" size="small">
          {{ pendingCount }} pending
        </v-chip>
        <v-chip color="success" variant="tonal" size="small">
          {{ confirmedCount }} confirmed
        </v-chip>
      </div>
    </div>

    <!-- Filters -->
    <v-card style="background:#111111;border:1px solid #2A2A2A;" class="pa-4 mb-5">
      <v-row dense align="center">
        <v-col cols="6" md="3">
          <v-select
            v-model="filters.status"
            :items="['pending','confirmed','cancelled','attended']"
            placeholder="Status"
            hide-details density="compact" bg-color="#1A1A1A" clearable
            @update:model-value="fetchBookings"
          />
        </v-col>
        <v-col cols="6" md="3">
          <v-select
            v-model="filters.branch_id"
            :items="branchOptions"
            placeholder="Branch"
            hide-details density="compact" bg-color="#1A1A1A" clearable
            @update:model-value="fetchBookings"
          />
        </v-col>
        <v-col cols="6" md="3">
          <v-text-field
            v-model="filters.search"
            placeholder="Search..."
            prepend-inner-icon="mdi-magnify"
            hide-details density="compact" bg-color="#1A1A1A"
            @update:model-value="debouncedSearch"
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

      <div v-else-if="filteredBookings.length === 0" class="text-center pa-12">
        <v-icon size="64" color="#333">mdi-calendar-remove</v-icon>
        <div style="color:#555;margin-top:12px;">No bookings found</div>
      </div>

      <v-table v-else style="background:transparent;">
        <thead>
          <tr style="border-bottom:1px solid #2A2A2A;">
            <th style="color:#888;font-size:12px;font-weight:500;">Code</th>
            <th style="color:#888;font-size:12px;font-weight:500;">Member</th>
            <th style="color:#888;font-size:12px;font-weight:500;">Event</th>
            <th style="color:#888;font-size:12px;font-weight:500;">Branch</th>
            <th style="color:#888;font-size:12px;font-weight:500;">Guests</th>
            <th style="color:#888;font-size:12px;font-weight:500;">Status</th>
            <th style="color:#888;font-size:12px;font-weight:500;">Date</th>
            <th style="color:#888;font-size:12px;font-weight:500;">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="b in filteredBookings"
            :key="b.id"
            style="border-bottom:1px solid #1A1A1A;"
          >
            <td style="padding:12px 16px;">
              <span style="font-family:monospace;font-size:12px;color:#F5C518;">
                {{ b.confirmation_code }}
              </span>
            </td>
            <td style="padding:12px 16px;">
              <div style="font-size:13px;font-weight:600;">{{ b.username }}</div>
            </td>
            <td style="padding:12px 16px;">
              <div style="font-size:13px;font-weight:600;">{{ b.event_title }}</div>
              <div style="font-size:11px;color:#888;">{{ formatDate(b.event_date) }} · {{ b.event_time }}</div>
            </td>
            <td style="padding:12px 16px;font-size:13px;color:#888;">{{ b.branch_name }}</td>
            <td style="padding:12px 16px;font-size:13px;color:#888;">{{ b.guests }}</td>
            <td style="padding:12px 16px;">
              <v-chip :color="statusColor(b.status)" size="x-small" variant="tonal">{{ b.status }}</v-chip>
            </td>
            <td style="padding:12px 16px;font-size:12px;color:#888;">
              {{ formatDate(b.created_at) }}
            </td>
            <td style="padding:12px 16px;">
              <div class="d-flex ga-1">
                <v-btn
                  v-if="b.status === 'pending'"
                  size="x-small"
                  variant="tonal"
                  color="success"
                  @click="updateStatus(b, 'confirmed')"
                >
                  Confirm
                </v-btn>
                <v-btn
                  v-if="b.status === 'confirmed'"
                  size="x-small"
                  variant="tonal"
                  color="info"
                  @click="updateStatus(b, 'attended')"
                >
                  Attended
                </v-btn>
                <v-btn
                  v-if="['pending','confirmed'].includes(b.status)"
                  size="x-small"
                  variant="text"
                  color="error"
                  icon="mdi-close"
                  @click="updateStatus(b, 'cancelled')"
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
import api from '@/services/api'

const bookings  = ref([])
const branches  = ref([])
const loading   = ref(true)
const snackbar  = ref({ show: false, text: '', color: 'success' })
const filters   = ref({ status: null, branch_id: null, search: '' })

const branchOptions   = computed(() => branches.value.map(b => ({ title: b.name, value: b.id })))
const pendingCount    = computed(() => bookings.value.filter(b => b.status === 'pending').length)
const confirmedCount  = computed(() => bookings.value.filter(b => b.status === 'confirmed').length)

const filteredBookings = computed(() => {
  let list = bookings.value
  if (filters.value.search) {
    const q = filters.value.search.toLowerCase()
    list = list.filter(b =>
      b.username?.toLowerCase().includes(q) ||
      b.event_title?.toLowerCase().includes(q) ||
      b.confirmation_code?.toLowerCase().includes(q)
    )
  }
  return list
})

function statusColor(s) {
  const map = { pending: 'warning', confirmed: 'success', cancelled: 'error', attended: 'info' }
  return map[s] || 'default'
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function resetFilters() {
  filters.value = { status: null, branch_id: null, search: '' }
  fetchBookings()
}

let debounceTimer = null
function debouncedSearch() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(fetchBookings, 400)
}

async function updateStatus(booking, status) {
  try {
    await api.put(`/event_bookings/${booking.id}`, { status })
    booking.status = status
    showSnack(`Booking ${status}`)
  } catch {
    showSnack('Failed to update', 'error')
  }
}

async function fetchBookings() {
  loading.value = true
  try {
    const res = await api.get('/event_bookings', {
      params: {
        status:    filters.value.status    || undefined,
        branch_id: filters.value.branch_id || undefined,
      }
    })
    bookings.value = res.data.bookings
  } finally {
    loading.value = false
  }
}

function showSnack(text, color = 'success') {
  snackbar.value = { show: true, text, color }
}

onMounted(async () => {
  const [bookRes, branchRes] = await Promise.all([
    api.get('/event_bookings'),
    api.get('/branches')
  ])
  bookings.value = bookRes.data.bookings
  branches.value = branchRes.data.branches
  loading.value  = false
})
</script>