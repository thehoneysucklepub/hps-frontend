<template>
  <div>
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <div style="font-size:24px;font-weight:700;">Events Management</div>
        <div style="color:#888;font-size:13px;margin-top:2px;">
          Manage your pub events across all branches
        </div>
      </div>
      <div class="d-flex ga-2">
        <v-btn
          variant="outlined"
          color="primary"
          prepend-icon="mdi-download"
          size="small"
          @click="exportEvents"
        >
          Export
        </v-btn>
        <v-btn
          v-if="auth.isAdmin"
          color="primary"
          prepend-icon="mdi-plus"
          size="small"
          style="color:#0A0A0A;font-weight:700;"
          @click="openCreate"
        >
          Add Event
        </v-btn>
      </div>
    </div>

    <!-- Stat Cards -->
    <v-row class="mb-5">
      <v-col v-for="s in statCards" :key="s.label" cols="6" sm="3">
        <v-card style="background:#111111;border:1px solid #2A2A2A;" class="pa-4">
          <div style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;">{{ s.label }}</div>
          <div style="font-size:28px;font-weight:800;margin-top:4px;" :style="{ color: s.color }">
            {{ s.value }}
          </div>
          <div style="font-size:11px;color:#555;margin-top:2px;">{{ s.sub }}</div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Filters -->
    <v-card style="background:#111111;border:1px solid #2A2A2A;" class="pa-4 mb-5">
      <v-row dense align="center">
        <v-col cols="12" md="4">
          <v-text-field
            v-model="filters.search"
            placeholder="Search events..."
            prepend-inner-icon="mdi-magnify"
            hide-details
            density="compact"
            bg-color="#1A1A1A"
            @update:model-value="debouncedFetch"
          />
        </v-col>
        <v-col cols="6" md="2">
          <v-select
            v-model="filters.status"
            :items="statusOptions"
            placeholder="Status"
            hide-details
            density="compact"
            bg-color="#1A1A1A"
            clearable
            @update:model-value="fetchEvents"
          />
        </v-col>
        <v-col cols="6" md="2">
          <v-select
            v-model="filters.branch_id"
            :items="branchOptions"
            placeholder="Branch"
            hide-details
            density="compact"
            bg-color="#1A1A1A"
            clearable
            @update:model-value="fetchEvents"
          />
        </v-col>
        <v-col cols="6" md="2">
          <v-select
            v-model="filters.type"
            :items="typeOptions"
            placeholder="Type"
            hide-details
            density="compact"
            bg-color="#1A1A1A"
            clearable
            @update:model-value="fetchEvents"
          />
        </v-col>
        <v-col cols="6" md="2">
          <v-btn
            variant="text"
            color="primary"
            size="small"
            prepend-icon="mdi-refresh"
            @click="resetFilters"
          >
            Reset
          </v-btn>
        </v-col>
      </v-row>
    </v-card>

    <!-- View Toggle + Count -->
    <div class="d-flex align-center justify-space-between mb-4">
      <div style="font-size:13px;color:#888;">
        Showing {{ events.length }} of {{ meta.total_count || 0 }} events
      </div>
      <div class="d-flex ga-1">
        <v-btn
          :variant="viewMode === 'grid' ? 'tonal' : 'text'"
          color="primary"
          icon="mdi-view-grid"
          size="small"
          @click="viewMode = 'grid'"
        />
        <v-btn
          :variant="viewMode === 'list' ? 'tonal' : 'text'"
          color="primary"
          icon="mdi-view-list"
          size="small"
          @click="viewMode = 'list'"
        />
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="d-flex justify-center pa-12">
      <v-progress-circular indeterminate color="primary" size="48" />
    </div>

    <!-- Empty -->
    <div v-else-if="events.length === 0" class="text-center pa-12">
      <v-icon size="64" color="#333">mdi-calendar-remove</v-icon>
      <div style="color:#555;margin-top:12px;font-size:15px;">No events found</div>
      <v-btn color="primary" class="mt-4" prepend-icon="mdi-plus" @click="openCreate">
        Add First Event
      </v-btn>
    </div>

    <!-- Grid View -->
    <v-row v-else-if="viewMode === 'grid'">
      <v-col
        v-for="event in events"
        :key="event.id"
        cols="12" sm="6" lg="4"
      >
        <v-card
          style="background:#111111;border:1px solid #2A2A2A;transition:border-color 0.2s;"
          class="event-card"
        >
          <!-- Image -->
          <div style="height:160px;background:#1A1A1A;position:relative;overflow:hidden;">
            <img
              v-if="event.image_url"
              :src="event.image_url"
              :alt="event.title"
              style="width:100%;height:100%;object-fit:cover;"
            />
            <div v-else class="d-flex align-center justify-center" style="height:100%;">
              <v-icon size="48" color="#333">mdi-calendar-star</v-icon>
            </div>
            <!-- Status badge -->
            <v-chip
              v-if="event.status === 'live'"
              color="error"
              size="x-small"
              style="position:absolute;top:8px;right:8px;font-weight:700;"
            >
              LIVE
            </v-chip>
            <v-chip
              v-else-if="event.featured"
              color="primary"
              size="x-small"
              style="position:absolute;top:8px;right:8px;font-weight:700;color:#0A0A0A;"
            >
              FEATURED
            </v-chip>
            <!-- Type badge -->
            <v-chip
              size="x-small"
              variant="tonal"
              style="position:absolute;bottom:8px;left:8px;"
            >
              {{ event.event_type }}
            </v-chip>
            <v-chip
              v-if="event.league_or_category"
              size="x-small"
              color="primary"
              variant="tonal"
              style="position:absolute;bottom:8px;left:60px;"
            >
              {{ event.league_or_category }}
            </v-chip>
          </div>

          <div class="pa-4">
            <div style="font-size:14px;font-weight:600;margin-bottom:8px;line-height:1.4;">
              {{ event.title }}
            </div>
            <div class="d-flex align-center ga-1 mb-1" style="font-size:12px;color:#888;">
              <v-icon size="12">mdi-map-marker</v-icon>
              {{ event.venue_or_city || event.branch_name || '—' }}
            </div>
            <div class="d-flex align-center ga-1 mb-4" style="font-size:12px;color:#888;">
              <v-icon size="12">mdi-calendar</v-icon>
              {{ formatDate(event.date_start) }}
              <span v-if="event.time_local"> • {{ event.time_local }}</span>
            </div>
            <div class="d-flex ga-2">
              <v-btn
                v-if="auth.isAdmin"
                variant="tonal"
                color="primary"
                size="x-small"
                prepend-icon="mdi-pencil"
                style="flex:1;"
                @click="openEdit(event)"
              >
                Edit
              </v-btn>
              <v-btn
                v-else
                variant="tonal"
                color="info"
                size="x-small"
                prepend-icon="mdi-eye"
                style="flex:1;"
              >
                View
              </v-btn>
              <v-btn
                v-if="auth.isAdmin"
                variant="tonal"
                color="error"
                size="x-small"
                prepend-icon="mdi-delete"
                @click="confirmDelete(event)"
              >
                Delete
              </v-btn>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- List View -->
    <v-card v-else style="background:#111111;border:1px solid #2A2A2A;">
      <v-table style="background:transparent;">
        <thead>
          <tr style="border-bottom:1px solid #2A2A2A;">
            <th style="color:#888;font-size:12px;font-weight:500;">Event</th>
            <th style="color:#888;font-size:12px;font-weight:500;">Branch</th>
            <th style="color:#888;font-size:12px;font-weight:500;">Date</th>
            <th style="color:#888;font-size:12px;font-weight:500;">Status</th>
            <th style="color:#888;font-size:12px;font-weight:500;">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="event in events"
            :key="event.id"
            style="border-bottom:1px solid #1A1A1A;"
          >
            <td style="padding:12px 16px;">
              <div style="font-size:13px;font-weight:600;">{{ event.title }}</div>
              <div style="font-size:11px;color:#888;">{{ event.league_or_category }}</div>
            </td>
            <td style="padding:12px 16px;font-size:13px;color:#888;">
              {{ event.branch_name || 'Global' }}
            </td>
            <td style="padding:12px 16px;font-size:13px;color:#888;">
              {{ formatDate(event.date_start) }}
              <span v-if="event.time_local" style="color:#555;"> {{ event.time_local }}</span>
            </td>
            <td style="padding:12px 16px;">
              <v-chip :color="statusColor(event.status)" size="x-small" variant="tonal">
                {{ event.status }}
              </v-chip>
            </td>
            <td style="padding:12px 16px;">
              <div class="d-flex ga-1">
                <v-btn
                  v-if="auth.isAdmin"
                  icon="mdi-pencil"
                  size="x-small"
                  variant="text"
                  color="primary"
                  @click="openEdit(event)"
                />
                <v-btn
                  v-if="auth.isAdmin"
                  icon="mdi-delete"
                  size="x-small"
                  variant="text"
                  color="error"
                  @click="confirmDelete(event)"
                />
                <v-btn
                  v-if="auth.isStaff"
                  icon="mdi-eye"
                  size="x-small"
                  variant="text"
                  color="primary"
                />
              </div>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <!-- Pagination -->
    <div v-if="meta.total_pages > 1" class="d-flex justify-center mt-6">
      <v-pagination
        v-model="page"
        :length="meta.total_pages"
        :total-visible="7"
        color="primary"
        @update:model-value="fetchEvents"
      />
    </div>

    <!-- ── Create / Edit Dialog ── -->
    <v-dialog v-model="dialog" max-width="600" persistent>
      <v-card style="background:#111111;border:1px solid #2A2A2A;">
        <div class="d-flex align-center justify-space-between pa-5 pb-4" style="border-bottom:1px solid #2A2A2A;">
          <div style="font-size:17px;font-weight:700;">
            {{ editingEvent ? 'Edit Event' : 'Add New Event' }}
          </div>
          <v-btn icon="mdi-close" variant="text" size="small" @click="closeDialog" />
        </div>

        <div class="pa-5">
          <v-row dense>
            <v-col cols="12">
              <v-text-field
                v-model="form.title"
                label="Event Title *"
                hide-details
                density="compact"
                bg-color="#1A1A1A"
                class="mb-3"
              />
            </v-col>
            <v-col cols="6">
              <v-select
                v-model="form.event_type"
                :items="['match','promo','special']"
                label="Type *"
                hide-details
                density="compact"
                bg-color="#1A1A1A"
                class="mb-3"
              />
            </v-col>
            <v-col cols="6">
              <v-select
                v-model="form.status"
                :items="['scheduled','live','finished','cancelled']"
                label="Status *"
                hide-details
                density="compact"
                bg-color="#1A1A1A"
                class="mb-3"
              />
            </v-col>
            <v-col cols="6">
              <v-select
                v-model="form.branch_id"
                :items="branchOptions"
                label="Branch"
                hide-details
                density="compact"
                bg-color="#1A1A1A"
                class="mb-3"
                clearable
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model="form.league_or_category"
                label="League / Category"
                hide-details
                density="compact"
                bg-color="#1A1A1A"
                class="mb-3"
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model="form.date_start"
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
                v-model="form.time_local"
                label="Time"
                type="time"
                hide-details
                density="compact"
                bg-color="#1A1A1A"
                class="mb-3"
              />
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="form.venue_or_city"
                label="Venue / City"
                hide-details
                density="compact"
                bg-color="#1A1A1A"
                class="mb-3"
              />
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="form.image_url"
                label="Image URL"
                hide-details
                density="compact"
                bg-color="#1A1A1A"
                class="mb-3"
              />
            </v-col>
            <v-col cols="6">
              <v-switch
                v-model="form.featured"
                label="Featured"
                color="primary"
                hide-details
                density="compact"
              />
            </v-col>
            <v-col cols="6">
              <v-switch
                v-model="form.is_global"
                label="Global Event"
                color="primary"
                hide-details
                density="compact"
              />
            </v-col>
          </v-row>

          <v-alert v-if="formError" type="error" variant="tonal" density="compact" class="mt-3">
            {{ formError }}
          </v-alert>
        </div>

        <div class="d-flex justify-end ga-2 pa-5 pt-0">
          <v-btn variant="text" @click="closeDialog">Cancel</v-btn>
          <v-btn
            color="primary"
            :loading="saving"
            style="color:#0A0A0A;font-weight:700;"
            @click="saveEvent"
          >
            {{ editingEvent ? 'Save Changes' : 'Create Event' }}
          </v-btn>
        </div>
      </v-card>
    </v-dialog>

    <!-- ── Delete Confirm Dialog ── -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card style="background:#111111;border:1px solid #2A2A2A;">
        <div class="pa-6">
          <div class="d-flex align-center ga-3 mb-4">
            <v-avatar color="error" variant="tonal" size="48">
              <v-icon>mdi-delete</v-icon>
            </v-avatar>
            <div>
              <div style="font-size:16px;font-weight:700;">Delete Event</div>
              <div style="font-size:13px;color:#888;">This action cannot be undone</div>
            </div>
          </div>
          <div style="font-size:13px;color:#ccc;">
            Are you sure you want to delete
            <span style="color:#F5C518;font-weight:600;">{{ deletingEvent?.title }}</span>?
          </div>
        </div>
        <div class="d-flex justify-end ga-2 pa-4 pt-0">
          <v-btn variant="text" @click="deleteDialog = false">Cancel</v-btn>
          <v-btn color="error" :loading="deleting" @click="deleteEvent">Delete</v-btn>
        </div>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000" location="top right">
      {{ snackbar.text }}
    </v-snackbar>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useEventsStore } from '@/stores/events.store'
import { useAuthStore } from '@/stores/auth.store'
import api from '@/services/api'

const store   = useEventsStore()
const auth    = useAuthStore()
const loading = ref(false)
const saving  = ref(false)
const deleting = ref(false)
const viewMode = ref('grid')
const page     = ref(1)
const dialog   = ref(false)
const deleteDialog = ref(false)
const editingEvent = ref(null)
const deletingEvent = ref(null)
const formError = ref(null)
const branches = ref([])

const filters = ref({
  search: '',
  status: null,
  branch_id: null,
  type: null
})

const form = ref(defaultForm())
const snackbar = ref({ show: false, text: '', color: 'success' })

function defaultForm() {
  return {
    title: '', event_type: 'match', status: 'scheduled',
    branch_id: null, league_or_category: '', date_start: '',
    time_local: '', venue_or_city: '', image_url: '',
    featured: false, is_global: false
  }
}

const events = computed(() => store.events)
const meta   = computed(() => store.meta)

const statCards = computed(() => [
  { label: 'Total Events', value: meta.value.total_count || 0, sub: 'All time', color: '#F5C518' },
  { label: 'Scheduled',    value: events.value.filter(e => e.status === 'scheduled').length, sub: 'Upcoming', color: '#4CAF50' },
  { label: 'Live Now',     value: events.value.filter(e => e.status === 'live').length, sub: 'In progress', color: '#FF5252' },
  { label: 'Featured',     value: events.value.filter(e => e.featured).length, sub: 'Highlighted', color: '#2196F3' },
])

const branchOptions = computed(() =>
  branches.value.map(b => ({ title: b.name, value: b.id }))
)

const statusOptions = ['scheduled', 'live', 'finished', 'cancelled']
const typeOptions   = ['match', 'promo', 'special']

let debounceTimer = null
function debouncedFetch() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(fetchEvents, 400)
}

async function fetchEvents() {
  loading.value = true
  await store.fetchAll({
    page: page.value,
    search: filters.value.search || undefined,
    status: filters.value.status || undefined,
    branch_id: filters.value.branch_id || undefined,
    type: filters.value.type || undefined,
  })
  loading.value = false
}

function resetFilters() {
  filters.value = { search: '', status: null, branch_id: null, type: null }
  page.value = 1
  fetchEvents()
}

function openCreate() {
  editingEvent.value = null
  form.value = defaultForm()
  formError.value = null
  dialog.value = true
}

function openEdit(event) {
  editingEvent.value = event
  form.value = {
    title: event.title,
    event_type: event.event_type,
    status: event.status,
    branch_id: event.branch_id,
    league_or_category: event.league_or_category || '',
    date_start: event.date_start,
    time_local: event.time_local || '',
    venue_or_city: event.venue_or_city || '',
    image_url: event.image_url || '',
    featured: event.featured,
    is_global: event.is_global
  }
  formError.value = null
  dialog.value = true
}

function closeDialog() {
  dialog.value = false
  editingEvent.value = null
  formError.value = null
}

async function saveEvent() {
  if (!form.value.title || !form.value.date_start) {
    formError.value = 'Title and date are required'
    return
  }
  saving.value = true
  formError.value = null
  try {
    if (editingEvent.value) {
      await store.updateEvent(editingEvent.value.id, form.value)
      showSnack('Event updated successfully')
    } else {
      await store.createEvent(form.value)
      showSnack('Event created successfully')
    }
    closeDialog()
    fetchEvents()
  } catch (err) {
    formError.value = err.response?.data?.error || 'Failed to save event'
  } finally {
    saving.value = false
  }
}

function confirmDelete(event) {
  deletingEvent.value = event
  deleteDialog.value = true
}

async function deleteEvent() {
  deleting.value = true
  try {
    await store.deleteEvent(deletingEvent.value.id)
    deleteDialog.value = false
    showSnack('Event deleted', 'error')
    fetchEvents()
  } finally {
    deleting.value = false
  }
}

function exportEvents() {
  const csv = [
    ['Title', 'Type', 'Branch', 'Date', 'Time', 'Status', 'Featured'],
    ...events.value.map(e => [
      e.title, e.event_type, e.branch_name, e.date_start, e.time_local, e.status, e.featured
    ])
  ].map(r => r.join(',')).join('\n')

  const blob = new Blob([csv], { type: 'text/csv' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url
  a.download = `hps-events-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
}

function statusColor(status) {
  const map = { scheduled: 'success', live: 'error', finished: 'default', cancelled: 'warning' }
  return map[status] || 'default'
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function showSnack(text, color = 'success') {
  snackbar.value = { show: true, text, color }
}

onMounted(async () => {
  const res = await api.get('/branches')
  branches.value = res.data.branches
  fetchEvents()
})
</script>

<style scoped>
.event-card:hover {
  border-color: #F5C518 !important;
}
</style>