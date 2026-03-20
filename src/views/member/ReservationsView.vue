<template>
  <div style="background:#0A0A0A;min-height:100vh;padding:40px 24px;">
    <div style="max-width:900px;margin:0 auto;">
      <div class="d-flex align-center justify-space-between mb-8">
        <div>
          <h1 style="font-size:28px;font-weight:800;">Table Reservations</h1>
          <p style="color:#888;margin-top:6px;">Book a table at any Honeysuckle branch</p>
        </div>
        <v-btn color="primary" prepend-icon="mdi-plus" style="color:#0A0A0A;font-weight:700;" @click="dialog = true">
          New Reservation
        </v-btn>
      </div>

      <div v-if="loading" class="d-flex justify-center pa-12">
        <v-progress-circular indeterminate color="primary" size="48" />
      </div>

      <div v-else-if="reservations.length === 0" class="text-center pa-12">
        <v-icon size="64" color="#333">mdi-table-chair</v-icon>
        <div style="color:#555;margin-top:12px;font-size:15px;">No reservations yet</div>
        <v-btn color="primary" class="mt-4" @click="dialog = true">Make a Reservation</v-btn>
      </div>

      <div v-else style="display:flex;flex-direction:column;gap:12px;">
        <v-card
          v-for="r in reservations"
          :key="r.id"
          style="background:#111111;border:1px solid #2A2A2A;"
          class="pa-5"
        >
          <div class="d-flex align-center justify-space-between flex-wrap gap-3">
            <div class="d-flex align-center ga-4">
              <v-avatar size="48" color="primary" variant="tonal">
                <v-icon>mdi-table-chair</v-icon>
              </v-avatar>
              <div>
                <div style="font-size:15px;font-weight:700;">{{ r.branch_name }}</div>
                <div style="font-size:13px;color:#888;margin-top:2px;">
                  {{ formatDate(r.date) }} at {{ r.time }} · {{ r.guests }} guests
                  <span v-if="r.occasion"> · {{ r.occasion }}</span>
                </div>
                <div style="font-size:11px;color:#F5C518;font-family:monospace;margin-top:4px;">
                  {{ r.confirmation_code }}
                </div>
              </div>
            </div>
            <div class="d-flex align-center ga-2">
              <v-chip :color="statusColor(r.status)" size="small" variant="tonal">{{ r.status }}</v-chip>
              <v-btn
                v-if="r.status === 'pending'"
                icon="mdi-close"
                size="small"
                variant="text"
                color="error"
                @click="cancelReservation(r)"
              />
            </div>
          </div>
        </v-card>
      </div>

      <!-- New Reservation Dialog -->
      <v-dialog v-model="dialog" max-width="500" persistent>
        <v-card style="background:#111111;border:1px solid #2A2A2A;">
          <div class="d-flex align-center justify-space-between pa-5 pb-4" style="border-bottom:1px solid #2A2A2A;">
            <div style="font-size:17px;font-weight:700;">Reserve a Table</div>
            <v-btn icon="mdi-close" variant="text" size="small" @click="dialog = false" />
          </div>
          <div class="pa-5">
            <v-row dense>
              <v-col cols="12">
                <!-- Branch Grid Selector -->
                <div style="margin-bottom:16px;">
                  <div style="font-size:12px;color:#F5C518;font-weight:600;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px;">
                    Choose Branch *
                  </div>
                  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:8px;">
                    <div
                      v-for="branch in branches"
                      :key="branch.id"
                      style="border-radius:10px;padding:12px;cursor:pointer;transition:all 0.2s;text-align:center;"
                      :style="{
                        background: form.branch_id === branch.id ? 'rgba(245,197,24,0.15)' : '#1A1A1A',
                        border: form.branch_id === branch.id ? '1px solid #F5C518' : '1px solid #2A2A2A'
                      }"
                      @click="form.branch_id = branch.id"
                    >
                      <v-icon size="18" :color="form.branch_id === branch.id ? 'primary' : '#555'" class="mb-1">mdi-store</v-icon>
                      <div style="font-size:11px;font-weight:600;" :style="{ color: form.branch_id === branch.id ? '#F5C518' : '#888' }">
                        {{ branch.name }}
                      </div>
                      <div v-if="branch.address" style="font-size:10px;color:#555;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                        {{ branch.address }}
                      </div>
                    </div>
                  </div>
                </div>
              </v-col>
              <v-col cols="6">
                <v-text-field v-model="form.date" label="Date *" type="date" hide-details density="compact" bg-color="#1A1A1A" class="mb-3" />
              </v-col>
              <v-col cols="6">
                <v-text-field v-model="form.time" label="Time *" type="time" hide-details density="compact" bg-color="#1A1A1A" class="mb-3" />
              </v-col>
              <v-col cols="6">
                <v-text-field v-model="form.guests" label="Guests *" type="number" min="1" max="20" hide-details density="compact" bg-color="#1A1A1A" class="mb-3" />
              </v-col>
              <v-col cols="6">
                <v-text-field v-model="form.occasion" label="Occasion" placeholder="Birthday, Anniversary..." hide-details density="compact" bg-color="#1A1A1A" class="mb-3" />
              </v-col>
              <v-col cols="12">
                <v-textarea v-model="form.notes" label="Special Requests" hide-details density="compact" bg-color="#1A1A1A" rows="2" />
              </v-col>
            </v-row>
            <v-alert v-if="formError" type="error" variant="tonal" density="compact" class="mt-3">{{ formError }}</v-alert>
          </div>
          <div class="d-flex justify-end ga-2 pa-5 pt-0">
            <v-btn variant="text" @click="dialog = false">Cancel</v-btn>
            <v-btn color="primary" :loading="saving" style="color:#0A0A0A;font-weight:700;" @click="saveReservation">
              Confirm Reservation
            </v-btn>
          </div>
        </v-card>
      </v-dialog>

      <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="4000" location="top right">
        {{ snackbar.text }}
      </v-snackbar>
    </div>
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
const saving       = ref(false)
const dialog       = ref(false)
const formError    = ref(null)
const snackbar     = ref({ show: false, text: '', color: 'success' })

const form = ref({ branch_id: null, date: '', time: '', guests: 2, occasion: '', notes: '' })

const branchOptions = computed(() => branches.value.map(b => ({ title: b.name, value: b.id })))

function statusColor(s) {
  const map = { pending: 'warning', confirmed: 'success', cancelled: 'error', completed: 'info' }
  return map[s] || 'default'
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })
}

async function saveReservation() {
  if (!form.value.branch_id || !form.value.date || !form.value.time) {
    formError.value = 'Branch, date and time are required'
    return
  }
  saving.value    = true
  formError.value = null
  try {
    const res = await api.post('/table_reservations', form.value)
    reservations.value.unshift(res.data.reservation)
    dialog.value = false
    snackbar.value = { show: true, text: `Reservation confirmed! Code: ${res.data.reservation.confirmation_code}`, color: 'success' }
  } catch (err) {
    formError.value = err.response?.data?.error || 'Failed to create reservation'
  } finally {
    saving.value = false
  }
}

async function cancelReservation(r) {
  try {
    await api.delete(`/table_reservations/${r.id}`)
    r.status = 'cancelled'
    snackbar.value = { show: true, text: 'Reservation cancelled', color: 'error' }
  } catch {
    snackbar.value = { show: true, text: 'Failed to cancel', color: 'error' }
  }
}

onMounted(async () => {
  const params = auth.isStaff && auth.user?.branch_id
    ? { branch_id: auth.user.branch_id }
    : {}

  try {
    const [resRes, branchRes] = await Promise.all([
      api.get('/table_reservations', { params }),
      api.get('/branches')
    ])
    reservations.value = resRes.data.reservations
    branches.value     = branchRes.data.branches
  } finally {
    loading.value = false
  }
})
</script>