<template>
  <div style="background:#0A0A0A;min-height:100vh;padding:80px 24px;">
    <div style="max-width:1000px;margin:0 auto;">

      <v-btn variant="text" color="primary" prepend-icon="mdi-arrow-left" to="/branches" class="mb-6">
        All Branches
      </v-btn>

      <div v-if="loading" class="d-flex justify-center pa-12">
        <v-progress-circular indeterminate color="primary" size="48" />
      </div>

      <div v-else-if="!branch" class="text-center pa-12">
        <div style="color:#555;">Branch not found</div>
      </div>

      <div v-else>
        <!-- Header -->
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px;margin-bottom:40px;">
          <div>
            <h1 style="font-size:clamp(32px,5vw,56px);font-weight:900;color:#F5C518;">
              {{ branch.name }}
            </h1>
            <div style="display:flex;align-items:center;gap:8px;margin-top:8px;font-size:14px;color:#888;">
              <v-icon size="16" color="primary">mdi-map-marker</v-icon>
              {{ branch.address }}
            </div>
          </div>
          <div style="font-size:12px;color:#555;background:#111;padding:6px 16px;border-radius:100px;border:1px solid #2A2A2A;">
            est. {{ branch.established_year }}
          </div>
        </div>

        <!-- Contact -->
        <v-card style="background:#111111;border:1px solid #2A2A2A;" class="pa-5 mb-6">
          <div style="font-size:15px;font-weight:600;margin-bottom:16px;color:#F5C518;">Contact</div>
          <div class="d-flex flex-wrap ga-3">
            <a
              v-if="branch.phone_primary"
              :href="`tel:${branch.phone_primary}`"
              style="display:flex;align-items:center;gap:8px;color:#fff;text-decoration:none;background:#1A1A1A;padding:10px 16px;border-radius:10px;border:1px solid #2A2A2A;"
            >
              <v-icon color="primary" size="18">mdi-phone</v-icon>
              {{ branch.phone_primary }}
            </a>
            <a
              v-if="branch.phone_secondary"
              :href="`tel:${branch.phone_secondary}`"
              style="display:flex;align-items:center;gap:8px;color:#fff;text-decoration:none;background:#1A1A1A;padding:10px 16px;border-radius:10px;border:1px solid #2A2A2A;"
            >
              <v-icon color="primary" size="18">mdi-phone</v-icon>
              {{ branch.phone_secondary }}
            </a>
          </div>
        </v-card>

        <!-- Upcoming Events -->
        <div style="margin-bottom:48px;">
          <h2 style="font-size:20px;font-weight:700;margin-bottom:20px;">
            Upcoming Events at {{ branch.name }}
          </h2>

          <div v-if="eventsLoading" class="d-flex justify-center pa-8">
            <v-progress-circular indeterminate color="primary" size="36" />
          </div>

          <div
            v-else-if="events.length === 0"
            class="text-center pa-8"
            style="background:#111111;border:1px solid #2A2A2A;border-radius:12px;"
          >
            <v-icon size="48" color="#333">mdi-calendar-remove</v-icon>
            <div style="color:#555;margin-top:12px;">No upcoming events at this branch</div>
          </div>

          <div
            v-else
            style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;"
          >
            <div
              v-for="event in events"
              :key="event.id"
              style="background:#111111;border:1px solid #2A2A2A;border-radius:12px;padding:20px;transition:border-color 0.2s;"
              @mouseenter="e => e.currentTarget.style.borderColor='#F5C518'"
              @mouseleave="e => e.currentTarget.style.borderColor='#2A2A2A'"
            >
              <div style="font-size:11px;color:#F5C518;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;">
                {{ event.league_or_category || event.event_type }}
              </div>
              <div style="font-size:15px;font-weight:700;margin-bottom:12px;line-height:1.4;">
                {{ event.title }}
              </div>
              <div style="font-size:12px;color:#888;margin-bottom:16px;display:flex;align-items:center;gap:12px;">
                <span style="display:flex;align-items:center;gap:4px;">
                  <v-icon size="12">mdi-calendar</v-icon>
                  {{ formatDate(event.date_start) }}
                </span>
                <span v-if="event.time_local" style="display:flex;align-items:center;gap:4px;">
                  <v-icon size="12">mdi-clock</v-icon>
                  {{ event.time_local }}
                </span>
              </div>
              <v-btn
                color="primary"
                size="small"
                block
                style="color:#0A0A0A;font-weight:700;"
                @click="openBooking(event)"
              >
                <v-icon start size="16">mdi-calendar-check</v-icon>
                Book Spot
              </v-btn>
            </div>
          </div>
        </div>

        <!-- Branch Gallery / Highlights -->
        <div v-if="media.length > 0" style="margin-bottom:48px;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">
            <h2 style="font-size:20px;font-weight:700;">Highlights</h2>
            <v-chip size="small" variant="tonal">{{ media.length }} photos</v-chip>
          </div>
          <div style="columns:2 200px;gap:12px;">
            <div
              v-for="item in media"
              :key="item.id"
              style="break-inside:avoid;margin-bottom:12px;border-radius:12px;overflow:hidden;cursor:pointer;position:relative;"
              @click="lightboxItem = item; lightbox = true"
            >
              <img
                v-if="item.media_type === 'image'"
                :src="item.file_url"
                :alt="item.title"
                style="width:100%;display:block;transition:transform 0.3s;"
                @mouseenter="e => e.target.style.transform='scale(1.03)'"
                @mouseleave="e => e.target.style.transform='scale(1)'"
              />
            </div>
          </div>
        </div>

        <!-- Lightbox -->
        <v-dialog v-model="lightbox" max-width="900">
          <v-card style="background:#0A0A0A;border:none;">
            <div class="d-flex justify-end pa-2">
              <v-btn icon="mdi-close" variant="text" color="white" @click="lightbox = false" />
            </div>
            <div style="display:flex;align-items:center;justify-content:center;min-height:400px;padding:0 16px 16px;">
              <img
                v-if="lightboxItem?.file_url"
                :src="lightboxItem.file_url"
                style="max-width:100%;max-height:600px;object-fit:contain;border-radius:8px;"
              />
            </div>
            <div v-if="lightboxItem?.title" class="pa-4 pt-0" style="text-align:center;color:#888;font-size:13px;">
              {{ lightboxItem.title }}
            </div>
          </v-card>
        </v-dialog>

        <!-- Reserve Table CTA -->
        <v-card
          style="background:linear-gradient(135deg,#1A1200,#111111);border:1px solid rgba(245,197,24,0.2);"
          class="pa-6 text-center"
        >
          <v-icon size="40" color="primary" class="mb-3">mdi-table-chair</v-icon>
          <div style="font-size:20px;font-weight:700;margin-bottom:8px;">Reserve a Table</div>
          <div style="color:#888;font-size:14px;margin-bottom:20px;">
            Book your table at {{ branch.name }} for a great experience
          </div>
          <v-btn
            color="primary"
            size="large"
            style="color:#0A0A0A;font-weight:700;"
            @click="openTableReservation"
          >
            Reserve Now
          </v-btn>
        </v-card>
      </div>
    </div>

    <!-- Book Event Dialog -->
    <v-dialog v-model="bookDialog" max-width="460" persistent>
      <v-card style="background:#111111;border:1px solid #2A2A2A;">
        <div class="d-flex align-center justify-space-between pa-5 pb-4" style="border-bottom:1px solid #2A2A2A;">
          <div style="font-size:17px;font-weight:700;">Book Event Spot</div>
          <v-btn icon="mdi-close" variant="text" size="small" @click="bookDialog = false" />
        </div>
        <div class="pa-5">
          <div style="background:#1A1A1A;border-radius:10px;padding:16px;margin-bottom:20px;">
            <div style="font-size:15px;font-weight:700;margin-bottom:4px;">{{ bookingEvent?.title }}</div>
            <div style="font-size:13px;color:#888;">
              {{ formatDate(bookingEvent?.date_start) }} · {{ bookingEvent?.time_local }}
            </div>
            <div style="font-size:12px;color:#F5C518;margin-top:4px;">
              @ {{ branch?.name }}
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

    <!-- Table Reservation Dialog -->
    <v-dialog v-model="reserveDialog" max-width="460" persistent>
      <v-card style="background:#111111;border:1px solid #2A2A2A;">
        <div class="d-flex align-center justify-space-between pa-5 pb-4" style="border-bottom:1px solid #2A2A2A;">
          <div style="font-size:17px;font-weight:700;">Reserve a Table</div>
          <v-btn icon="mdi-close" variant="text" size="small" @click="reserveDialog = false" />
        </div>
        <div class="pa-5">
          <div style="background:#1A1A1A;border-radius:10px;padding:12px 16px;margin-bottom:20px;">
            <div style="font-size:14px;font-weight:600;color:#F5C518;">{{ branch?.name }}</div>
            <div style="font-size:12px;color:#888;margin-top:2px;">{{ branch?.address }}</div>
          </div>
          <v-row dense>
            <v-col cols="6">
              <v-text-field
                v-model="reserveForm.date"
                label="Date *"
                type="date"
                hide-details
                density="compact"
                bg-color="#1A1A1A"
                class="mb-3"
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model="reserveForm.time"
                label="Time *"
                type="time"
                hide-details
                density="compact"
                bg-color="#1A1A1A"
                class="mb-3"
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model="reserveForm.guests"
                label="Guests *"
                type="number"
                min="1"
                max="20"
                hide-details
                density="compact"
                bg-color="#1A1A1A"
                class="mb-3"
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model="reserveForm.occasion"
                label="Occasion"
                placeholder="Birthday..."
                hide-details
                density="compact"
                bg-color="#1A1A1A"
                class="mb-3"
              />
            </v-col>
            <v-col cols="12">
              <v-textarea
                v-model="reserveForm.notes"
                label="Special Requests"
                hide-details
                density="compact"
                bg-color="#1A1A1A"
                rows="2"
              />
            </v-col>
          </v-row>
          <v-alert v-if="reserveError" type="error" variant="tonal" density="compact" class="mt-3">
            {{ reserveError }}
          </v-alert>
        </div>
        <div class="d-flex justify-end ga-2 pa-5 pt-0">
          <v-btn variant="text" @click="reserveDialog = false">Cancel</v-btn>
          <v-btn
            color="primary"
            :loading="reserveSaving"
            style="color:#0A0A0A;font-weight:700;"
            @click="submitReservation"
          >
            Confirm Reservation
          </v-btn>
        </div>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="5000" location="top right">
      {{ snackbar.text }}
    </v-snackbar>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import api from '@/services/api'

const route  = useRoute()
const router = useRouter()
const auth   = useAuthStore()

const branch        = ref(null)
const events        = ref([])
const media         = ref([])
const loading       = ref(true)
const eventsLoading = ref(true)

const lightbox      = ref(false)
const lightboxItem  = ref(null)

const bookDialog    = ref(false)
const bookingEvent  = ref(null)
const bookSaving    = ref(false)
const bookError     = ref(null)
const bookForm      = ref({ guests: 1, notes: '' })

const reserveDialog  = ref(false)
const reserveSaving  = ref(false)
const reserveError   = ref(null)
const reserveForm    = ref({ date: '', time: '', guests: 2, occasion: '', notes: '' })

const snackbar = ref({ show: false, text: '', color: 'success' })

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric'
  })
}

function openBooking(event) {
  if (!auth.isAuthenticated) {
    router.push('/register')
    return
  }
  bookingEvent.value = event
  bookForm.value     = { guests: 1, notes: '' }
  bookError.value    = null
  bookDialog.value   = true
}

function openTableReservation() {
  if (!auth.isAuthenticated) {
    router.push('/register')
    return
  }
  reserveForm.value  = { date: '', time: '', guests: 2, occasion: '', notes: '' }
  reserveError.value = null
  reserveDialog.value = true
}

async function submitBooking() {
  if (!bookForm.value.guests) {
    bookError.value = 'Please enter number of guests'
    return
  }
  bookSaving.value = true
  bookError.value  = null
  try {
    const res = await api.post('/event_bookings', {
      event_id:  bookingEvent.value.id,
      branch_id: branch.value.id,
      guests:    bookForm.value.guests,
      notes:     bookForm.value.notes
    })
    bookDialog.value = false
    snackbar.value = {
      show:  true,
      text:  `Booking confirmed! Code: ${res.data.booking.confirmation_code}`,
      color: 'success'
    }
  } catch (err) {
    bookError.value = err.response?.data?.error || 'Booking failed. Please try again.'
  } finally {
    bookSaving.value = false
  }
}

async function submitReservation() {
  if (!reserveForm.value.date || !reserveForm.value.time) {
    reserveError.value = 'Date and time are required'
    return
  }
  reserveSaving.value = true
  reserveError.value  = null
  try {
    const res = await api.post('/table_reservations', {
      branch_id: branch.value.id,
      date:      reserveForm.value.date,
      time:      reserveForm.value.time,
      guests:    reserveForm.value.guests,
      occasion:  reserveForm.value.occasion,
      notes:     reserveForm.value.notes
    })
    reserveDialog.value = false
    snackbar.value = {
      show:  true,
      text:  `Reservation confirmed! Code: ${res.data.reservation.confirmation_code}`,
      color: 'success'
    }
  } catch (err) {
    reserveError.value = err.response?.data?.error || 'Reservation failed. Please try again.'
  } finally {
    reserveSaving.value = false
  }
}

onMounted(async () => {
  try {
    const branchRes = await api.get('/branches')
    branch.value = branchRes.data.branches.find(b => b.slug === route.params.slug)
  } finally {
    loading.value = false
  }

  if (branch.value) {
    try {
      const [eventsRes, mediaRes] = await Promise.all([
        api.get('/events/upcoming', { params: { branch_id: branch.value.id } }),
        api.get('/media_items', { params: { branch_id: branch.value.id, media_type: 'image' } })
      ])
      events.value = eventsRes.data.events
      media.value  = mediaRes.data.media_items || []
    } finally {
      eventsLoading.value = false
    }
  }
})
</script>