<template>
  <div style="background:#0A0A0A;min-height:100vh;padding:60px 24px;">
    <div style="max-width:1200px;margin:0 auto;">

      <!-- Header -->
      <div style="margin-bottom:48px;">
        <div style="font-size:12px;color:#F5C518;letter-spacing:3px;text-transform:uppercase;margin-bottom:8px;">
          Up-Coming Sports
        </div>
        <h1 style="font-size:clamp(32px,5vw,56px);font-weight:900;margin-bottom:16px;">Live Sports</h1>
        <p style="color:#888;font-size:15px;max-width:600px;line-height:1.7;">
          Join us for an electrifying lineup of live sports events. Enjoy the action on our big screens with your favourite drinks and snacks in hand.
        </p>
      </div>

      <!-- Live Now -->
      <div v-if="liveEvents.length > 0" style="margin-bottom:60px;">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;">
          <div style="width:10px;height:10px;background:#FF5252;border-radius:50%;animation:pulse 1.5s infinite;"></div>
          <h2 style="font-size:20px;font-weight:700;">Live Right Now</h2>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px;">
          <div
            v-for="event in liveEvents"
            :key="event.id"
            style="background:#1A0A0A;border:1px solid rgba(255,82,82,0.3);border-radius:12px;padding:20px;"
          >
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
              <v-chip color="error" size="x-small" style="font-weight:700;">LIVE</v-chip>
              <span style="font-size:11px;color:#888;">{{ event.branch_name || 'All Branches' }}</span>
            </div>
            <div style="font-size:16px;font-weight:700;margin-bottom:8px;">{{ event.title }}</div>
            <div style="font-size:12px;color:#888;margin-bottom:16px;">{{ event.league_or_category }}</div>
            <v-btn color="error" size="small" block variant="tonal" @click="openBooking(event)">
              <v-icon start size="16">mdi-calendar-check</v-icon>
              Book Spot
            </v-btn>
          </div>
        </div>
      </div>

      <!-- This Week -->
      <div style="margin-bottom:60px;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:24px;">
          <v-icon color="primary">mdi-calendar-week</v-icon>
          <h2 style="font-size:20px;font-weight:700;">This Week</h2>
        </div>
        <div v-if="weekEvents.length === 0" style="text-align:center;padding:48px;background:#111111;border:1px solid #2A2A2A;border-radius:12px;">
          <v-icon size="48" color="#333">mdi-calendar</v-icon>
          <div style="color:#555;margin-top:12px;">No matches this week.</div>
        </div>
        <div v-else style="display:flex;flex-direction:column;gap:12px;">
          <div
            v-for="event in weekEvents"
            :key="event.id"
            style="background:#111111;border:1px solid #2A2A2A;border-radius:12px;padding:16px 20px;display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;"
          >
            <div style="display:flex;align-items:center;gap:16px;">
              <div style="width:4px;height:40px;background:#F5C518;border-radius:2px;"></div>
              <div>
                <div style="font-size:14px;font-weight:600;">{{ event.title }}</div>
                <div style="font-size:12px;color:#888;margin-top:2px;">{{ event.league_or_category }}</div>
              </div>
            </div>
            <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;">
              <div style="text-align:right;">
                <div style="font-size:13px;color:#F5C518;font-weight:600;">{{ formatDate(event.date_start) }}</div>
                <div style="font-size:12px;color:#888;">{{ event.time_local }}</div>
              </div>
              <v-btn color="primary" size="small" style="color:#0A0A0A;font-weight:700;" @click="openBooking(event)">
                <v-icon start size="14">mdi-calendar-check</v-icon>
                Book
              </v-btn>
            </div>
          </div>
        </div>
      </div>

      <!-- Coming Up -->
      <div>
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:24px;">
          <v-icon color="primary">mdi-calendar-clock</v-icon>
          <h2 style="font-size:20px;font-weight:700;">Coming Up</h2>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;">
          <div
            v-for="(event, i) in upcomingEvents"
            :key="event.id"
            style="background:#111111;border:1px solid #2A2A2A;border-radius:10px;padding:14px 20px;display:flex;align-items:center;gap:16px;flex-wrap:wrap;"
          >
            <div style="width:28px;height:28px;background:rgba(245,197,24,0.1);border:1px solid rgba(245,197,24,0.3);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;color:#F5C518;font-weight:700;flex-shrink:0;">
              {{ i + 1 }}
            </div>
            <div style="flex:1;">
              <div style="font-size:14px;font-weight:600;">{{ event.title }}</div>
              <div style="font-size:12px;color:#888;margin-top:2px;display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
                <span>{{ event.league_or_category }}</span>
                <span v-if="event.time_local">· {{ event.time_local }}</span>
                <span v-if="event.venue_or_city">· {{ event.venue_or_city }}</span>
              </div>
            </div>
            <div style="display:flex;align-items:center;gap:12px;flex-shrink:0;">
              <div style="font-size:12px;color:#F5C518;font-weight:600;">{{ formatDate(event.date_start) }}</div>
              <v-btn color="primary" size="small" style="color:#0A0A0A;font-weight:700;" @click="openBooking(event)">
                <v-icon start size="14">mdi-calendar-check</v-icon>
                Book
              </v-btn>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- ── Book Event Dialog ── -->
    <v-dialog v-model="bookDialog" max-width="500" persistent>
      <v-card style="background:#111111;border:1px solid #2A2A2A;">
        <div class="d-flex align-center justify-space-between pa-5 pb-4" style="border-bottom:1px solid #2A2A2A;">
          <div style="font-size:17px;font-weight:700;">Book Event Spot</div>
          <v-btn icon="mdi-close" variant="text" size="small" @click="bookDialog = false" />
        </div>
        <div class="pa-5">

          <!-- Event info -->
          <div style="background:#1A1A1A;border-radius:10px;padding:16px;margin-bottom:20px;">
            <div style="font-size:15px;font-weight:700;margin-bottom:4px;">{{ bookingEvent?.title }}</div>
            <div style="font-size:13px;color:#888;">
              {{ formatDate(bookingEvent?.date_start) }}
              <span v-if="bookingEvent?.time_local"> · {{ bookingEvent.time_local }}</span>
            </div>
            <div v-if="bookingEvent?.venue_or_city" style="font-size:12px;color:#555;margin-top:2px;">
              {{ bookingEvent.venue_or_city }}
            </div>
          </div>

          <!-- Branch selector — REQUIRED -->
          <div style="margin-bottom:16px;">
            <div style="font-size:12px;color:#F5C518;font-weight:600;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px;">
              Choose which branch to watch at *
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px;">
              <div
                v-for="branch in branches"
                :key="branch.id"
                style="border-radius:10px;padding:12px;cursor:pointer;transition:all 0.2s;text-align:center;"
                :style="{
                  background: bookForm.branch_id === branch.id ? 'rgba(245,197,24,0.15)' : '#1A1A1A',
                  border: bookForm.branch_id === branch.id ? '1px solid #F5C518' : '1px solid #2A2A2A'
                }"
                @click="bookForm.branch_id = branch.id"
              >
                <v-icon
                  size="20"
                  :color="bookForm.branch_id === branch.id ? 'primary' : '#555'"
                  class="mb-1"
                >
                  mdi-store
                </v-icon>
                <div
                  style="font-size:12px;font-weight:600;"
                  :style="{ color: bookForm.branch_id === branch.id ? '#F5C518' : '#888' }"
                >
                  {{ branch.name }}
                </div>
              </div>
            </div>
          </div>

          <v-text-field
            v-model="bookForm.guests"
            label="Number of Guests *"
            type="number"
            min="1"
            max="20"
            hide-details
            density="compact"
            bg-color="#1A1A1A"
            class="mb-3"
          />
          <v-textarea
            v-model="bookForm.notes"
            label="Special Notes"
            placeholder="Any special requests..."
            hide-details
            density="compact"
            bg-color="#1A1A1A"
            rows="2"
          />
          <v-alert v-if="bookError" type="error" variant="tonal" density="compact" class="mt-3">
            {{ bookError }}
          </v-alert>
        </div>
        <div class="d-flex justify-end ga-2 pa-5 pt-0">
          <v-btn variant="text" @click="bookDialog = false">Cancel</v-btn>
          <v-btn
            color="primary"
            :loading="bookSaving"
            style="color:#0A0A0A;font-weight:700;"
            @click="submitBooking"
          >
            Confirm Booking
          </v-btn>
        </div>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="5000" location="top right">
      {{ snackbar.text }}
      <template #actions>
        <v-btn variant="text" size="small" to="/member/bookings">View Bookings</v-btn>
      </template>
    </v-snackbar>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import api from '@/services/api'

const auth   = useAuthStore()
const router = useRouter()

const liveEvents     = ref([])
const weekEvents     = ref([])
const upcomingEvents = ref([])
const branches       = ref([])

const bookDialog   = ref(false)
const bookingEvent = ref(null)
const bookSaving   = ref(false)
const bookError    = ref(null)
const bookForm     = ref({ branch_id: null, guests: 1, notes: '' })
const snackbar     = ref({ show: false, text: '', color: 'success' })

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' })
}

function openBooking(event) {
  if (!auth.isAuthenticated) {
    router.push('/register')
    return
  }
  bookingEvent.value = event
  bookForm.value = {
    branch_id: event.branch_id || null,
    guests: 1,
    notes: ''
  }
  bookError.value  = null
  bookDialog.value = true
}

async function submitBooking() {
  if (!bookForm.value.branch_id) {
    bookError.value = 'Please select a branch to watch at'
    return
  }
  bookSaving.value = true
  bookError.value  = null
  try {
    const res = await api.post('/event_bookings', {
      event_id:  bookingEvent.value.id,
      branch_id: bookForm.value.branch_id,
      guests:    bookForm.value.guests,
      notes:     bookForm.value.notes
    })
    bookDialog.value = false
    snackbar.value = {
      show:  true,
      text:  `Booked! Code: ${res.data.booking.confirmation_code}`,
      color: 'success'
    }
  } catch (err) {
    bookError.value = err.response?.data?.error || 'Booking failed. Please try again.'
  } finally {
    bookSaving.value = false
  }
}

onMounted(async () => {
  const [liveRes, weekRes, upcomingRes, branchRes] = await Promise.all([
    api.get('/events/live'),
    api.get('/events/this_week'),
    api.get('/events/upcoming'),
    api.get('/branches')
  ])
  liveEvents.value     = liveRes.data.events
  weekEvents.value     = weekRes.data.events
  upcomingEvents.value = upcomingRes.data.events
  branches.value       = branchRes.data.branches
})
</script>

<style scoped>
@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(255,82,82,0.4); }
  50% { box-shadow: 0 0 0 8px rgba(255,82,82,0); }
}
</style>