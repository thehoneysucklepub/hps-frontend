<template>
  <div style="background:#0A0A0A;min-height:100vh;padding:40px 24px;">
    <div style="max-width:1000px;margin:0 auto;">
      <div style="margin-bottom:32px;">
        <h1 style="font-size:28px;font-weight:800;">My Bookmarks</h1>
        <p style="color:#888;margin-top:6px;">Events you have saved</p>
      </div>

      <div v-if="loading" class="d-flex justify-center pa-12">
        <v-progress-circular indeterminate color="primary" size="48" />
      </div>

      <div v-else-if="bookmarks.length === 0" class="text-center pa-12">
        <v-icon size="64" color="#333">mdi-bookmark-off</v-icon>
        <div style="color:#555;margin-top:12px;font-size:15px;">No bookmarks yet</div>
        <v-btn color="primary" class="mt-4" to="/live-sports">Browse Events</v-btn>
      </div>

      <v-row v-else>
        <v-col v-for="b in bookmarks" :key="b.id" cols="12" sm="6">
          <v-card style="background:#111111;border:1px solid #2A2A2A;" class="pa-4">
            <div class="d-flex align-center justify-space-between mb-3">
              <v-chip size="x-small" color="primary" variant="tonal">{{ b.event?.event_type }}</v-chip>
              <v-btn icon="mdi-bookmark-remove" size="x-small" variant="text" color="error" @click="removeBookmark(b)" />
            </div>
            <div style="font-size:15px;font-weight:700;margin-bottom:8px;">{{ b.event?.title }}</div>
            <div style="font-size:12px;color:#888;">
              {{ formatDate(b.event?.date_start) }} · {{ b.event?.time_local }}
            </div>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'

const bookmarks = ref([])
const loading   = ref(true)

async function removeBookmark(b) {
  try {
    await api.delete(`/event_bookmarks/${b.id}`)
    bookmarks.value = bookmarks.value.filter(x => x.id !== b.id)
  } catch { /* silent */ }
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

onMounted(async () => {
  try {
    const res = await api.get('/event_bookmarks')
    bookmarks.value = res.data.bookmarks
  } finally {
    loading.value = false
  }
})
</script>