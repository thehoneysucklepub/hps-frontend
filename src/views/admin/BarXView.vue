<template>
  <div>
    <!-- Header -->
    <div class="d-flex align-center justify-space-between flex-wrap ga-3 mb-5">
      <div>
        <div style="font-size:24px;font-weight:700;">Bar-X</div>
        <div style="color:#888;font-size:13px;margin-top:2px;">Everything on the Bar-X page: details, story, cocktails, photos and line-ups</div>
      </div>
      <div v-if="branch" class="d-flex align-center ga-2">
        <v-chip size="small" :color="form.active ? 'success' : 'warning'" variant="tonal">
          {{ form.active ? 'Shown on website' : 'Hidden from website' }}
        </v-chip>
        <v-btn variant="tonal" size="small" prepend-icon="mdi-open-in-new" href="/bar-x" target="_blank">View page</v-btn>
        <v-btn color="primary" size="small" prepend-icon="mdi-content-save" :loading="saving" :disabled="!dirty"
          style="color:#0A0A0A;font-weight:700;" @click="save">
          {{ dirty ? 'Save changes' : 'Saved' }}
        </v-btn>
      </div>
    </div>

    <div v-if="loading" class="d-flex justify-center pa-12">
      <v-progress-circular indeterminate color="primary" size="48" />
    </div>

    <!-- No Bar-X venue yet -->
    <v-card v-else-if="!branch" style="background:#111111;border:1px solid #2A2A2A;" class="pa-8 text-center">
      <div style="font-size:16px;font-weight:700;margin-bottom:6px;">{{ loadError || 'There is no Bar-X venue yet.' }}</div>
      <div style="color:#888;font-size:13px;margin-bottom:16px;">Create it, then fill in its page here.</div>
      <v-btn v-if="!loadError" color="primary" :loading="saving" style="color:#0A0A0A;font-weight:700;" @click="create">Create Bar-X</v-btn>
      <v-btn v-else variant="tonal" @click="load">Try again</v-btn>
    </v-card>

    <template v-else>
      <v-tabs v-model="tab" color="primary" class="mb-4" style="border-bottom:1px solid #2A2A2A;">
        <v-tab value="details">Details</v-tab>
        <v-tab value="sections">Story, offer &amp; cocktails</v-tab>
        <v-tab value="photos">Photos <v-chip size="x-small" class="ml-2" variant="tonal">{{ photos.length }}</v-chip></v-tab>
        <v-tab value="lineups">Line-ups <v-chip size="x-small" class="ml-2" variant="tonal">{{ lineups.length }}</v-chip></v-tab>
      </v-tabs>

      <v-alert v-if="error" type="error" variant="tonal" density="compact" class="mb-4" closable @click:close="error = ''">{{ error }}</v-alert>

      <!-- Details + page sections -->
      <v-card v-if="tab === 'details' || tab === 'sections'" style="background:#111111;border:1px solid #2A2A2A;" class="pa-5" max-width="900">
        <BranchEditor :form="form" :tab="tab" @cover-uploaded="onCoverUploaded" @error="msg => (error = msg)" />
        <div class="d-flex justify-end mt-5">
          <v-btn color="primary" :loading="saving" :disabled="!dirty" style="color:#0A0A0A;font-weight:700;" @click="save">
            {{ dirty ? 'Save changes' : 'Saved' }}
          </v-btn>
        </div>
      </v-card>

      <!-- Photos -->
      <div v-else-if="tab === 'photos'">
        <div class="d-flex align-center justify-space-between flex-wrap ga-2 mb-4">
          <div style="font-size:12px;color:#999;max-width:640px;">
            Photos here make up the gallery on the Bar-X page. The cover photo (Details tab) is the big photo at the top;
            without one, the first photo here is used. Each upload is saved straight away.
          </div>
          <v-btn color="primary" size="small" prepend-icon="mdi-upload" :loading="uploading" style="color:#0A0A0A;font-weight:700;" @click="photoInput?.click()">
            Upload photos
          </v-btn>
          <input ref="photoInput" type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple hidden @change="uploadPhotos" />
        </div>
        <div v-if="uploading" class="mb-4">
          <v-progress-linear :model-value="uploadProgress" color="primary" height="6" rounded />
          <div style="font-size:12px;color:#aaa;margin-top:6px;">{{ uploadStatus }}</div>
        </div>
        <div v-if="!photos.length" class="text-center pa-12" style="color:#666;border:1px dashed #2A2A2A;border-radius:12px;">
          No photos yet. The page shows the Honeysuckle logo until you add some.
        </div>
        <div class="photos">
          <div v-for="p in photos" :key="p.id" class="photo">
            <img :src="imgUrl(p.thumbnail_url || p.file_url)" :alt="p.title || 'Bar-X photo'" />
            <div class="photo__bar">
              <span class="photo__title">{{ p.title || 'Untitled' }}</span>
              <v-btn size="x-small" variant="text" :icon="form.image_url === p.file_url ? 'mdi-image-check' : 'mdi-image-outline'"
                :color="form.image_url === p.file_url ? 'primary' : undefined" title="Use as cover photo" @click="onCoverUploaded(p.file_url)" />
              <v-btn size="x-small" variant="text" :icon="p.featured ? 'mdi-star' : 'mdi-star-outline'" :color="p.featured ? 'primary' : undefined"
                title="Star (first in the home page gallery)" @click="toggleStar(p)" />
              <v-btn size="x-small" variant="text" icon="mdi-delete" color="error" title="Delete" @click="removePhoto(p)" />
            </div>
            <v-chip v-if="form.image_url === p.file_url" size="x-small" color="primary" class="photo__cover" style="color:#0A0A0A;">Cover</v-chip>
          </div>
        </div>
      </div>

      <!-- Line-ups -->
      <div v-else-if="tab === 'lineups'">
        <div class="d-flex align-center justify-space-between flex-wrap ga-2 mb-4">
          <div style="font-size:12px;color:#999;">Weekly nights shown on the Bar-X page and in What's on.</div>
          <v-btn color="primary" size="small" prepend-icon="mdi-calendar-edit" to="/admin/events" style="color:#0A0A0A;font-weight:700;">
            Add or edit in Events &amp; Line-ups
          </v-btn>
        </div>
        <v-card style="background:#111111;border:1px solid #2A2A2A;">
          <v-table style="background:transparent;">
            <thead>
              <tr><th>Day</th><th>Time</th><th>Night</th><th>Area</th></tr>
            </thead>
            <tbody>
              <tr v-for="e in lineups" :key="e.id">
                <td style="white-space:nowrap;">{{ days(e) }}</td>
                <td style="white-space:nowrap;">{{ timeRange(e) || 'Times TBC' }}</td>
                <td><b>{{ e.title }}</b><span v-if="e.badge" style="color:#888;"> · {{ e.badge }}</span></td>
                <td>{{ e.area || '—' }}</td>
              </tr>
              <tr v-if="!lineups.length">
                <td colspan="4" style="text-align:center;color:#666;padding:24px;">
                  No line-ups yet. Add one in Events &amp; Line-ups and choose the Bar-X branch.
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </div>
    </template>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="4000" location="top right">{{ snackbar.text }}</v-snackbar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import api, { errorText, uploadFile } from '@/services/api'
import BranchEditor from '@/components/admin/BranchEditor.vue'
import { blankBranch, branchToForm } from '@/utils/branchForm'
import { imgUrl } from '@/utils/img'
import { timeRange, DAY_SHORT } from '@/stores/site.store'

const SLUG = 'bar-x'

const branch = ref(null)
const form = ref(blankBranch())
const saved = ref('')
const loading = ref(true)
const loadError = ref('')
const saving = ref(false)
const error = ref('')
const tab = ref('details')
const photos = ref([])
const lineups = ref([])
const snackbar = ref({ show: false, text: '', color: 'success' })

const dirty = computed(() => JSON.stringify(form.value) !== saved.value)
const notify = (text, color = 'success') => { snackbar.value = { show: true, text, color } }

async function load() {
  loading.value = true
  loadError.value = ''
  try {
    const res = await api.get(`/branches/${SLUG}`)
    setBranch(res.data.branch)
    await Promise.all([loadPhotos(), loadLineups()])
  } catch (err) {
    branch.value = null
    if (err.response?.status !== 404) loadError.value = errorText(err, 'Bar-X could not be loaded')
  } finally {
    loading.value = false
  }
}

function setBranch(b) {
  branch.value = b
  form.value = branchToForm(b)
  saved.value = JSON.stringify(form.value)
}

async function loadPhotos() {
  const res = await api.get('/media_items', { params: { branch_id: branch.value.id } })
  photos.value = (res.data.media_items || []).filter(m => m.media_type !== 'video')
}

async function loadLineups() {
  const res = await api.get('/events/weekly', { params: { branch_id: branch.value.id } })
  lineups.value = res.data.events || []
}

async function create() {
  saving.value = true
  try {
    await api.post('/branches', { name: 'Bar-X', slug: SLUG, venue_type: 'bar', active: true, position: 60 })
    await load()
    notify('Bar-X created')
  } catch (err) {
    loadError.value = errorText(err, 'Could not create Bar-X')
  } finally {
    saving.value = false
  }
}

async function save() {
  if (!form.value.name) { error.value = 'Name is required'; tab.value = 'details'; return }
  saving.value = true
  error.value = ''
  try {
    const res = await api.put(`/branches/${branch.value.id}`, form.value)
    setBranch(res.data.branch)
    notify('Bar-X saved')
  } catch (err) {
    error.value = errorText(err, 'Could not save')
  } finally {
    saving.value = false
  }
}

// Cover photo is saved straight away (also used by "Use as cover" on a photo)
async function onCoverUploaded(url) {
  try {
    await api.put(`/branches/${branch.value.id}`, { image_url: url })
    form.value.image_url = url
    const s = JSON.parse(saved.value)
    s.image_url = url
    saved.value = JSON.stringify(s)
    notify('Cover photo saved')
  } catch (err) {
    form.value.image_url = url
    error.value = errorText(err, 'Photo uploaded but not saved: click Save changes')
  }
}

// ----- Photos -----
const photoInput = ref(null)
const uploading = ref(false)
const uploadProgress = ref(0)
const uploadStatus = ref('')

async function uploadPhotos(e) {
  const files = [...(e.target.files || [])]
  e.target.value = ''
  if (!files.length) return
  uploading.value = true
  const failed = []
  for (let i = 0; i < files.length; i++) {
    const f = files[i]
    uploadStatus.value = `Uploading ${i + 1} of ${files.length}: ${f.name}`
    try {
      if (f.size > 8 * 1024 * 1024) throw new Error('larger than 8 MB')
      const up = await uploadFile('/files', f, { purpose: 'photo' })
      await api.post('/media_items', {
        title: f.name.replace(/\.[a-z0-9]+$/i, '').replace(/[-_]+/g, ' '),
        media_type: 'image', file_url: up.data.url, branch_id: branch.value.id, featured: false,
      })
    } catch (err) {
      failed.push(`${f.name} (${err.response ? errorText(err) : err.message})`)
    }
    uploadProgress.value = Math.round(((i + 1) / files.length) * 100)
  }
  uploading.value = false
  uploadProgress.value = 0
  await loadPhotos()
  if (failed.length) error.value = `Not uploaded: ${failed.join(', ')}`
  else notify(`${files.length} photo${files.length === 1 ? '' : 's'} saved`)
}

async function toggleStar(p) {
  try {
    await api.patch(`/media_items/${p.id}/toggle_featured`)
    p.featured = !p.featured
  } catch (err) {
    notify(errorText(err, 'Could not update'), 'error')
  }
}

async function removePhoto(p) {
  if (!confirm(`Delete "${p.title || 'this photo'}"?`)) return
  try {
    await api.delete(`/media_items/${p.id}`)
    photos.value = photos.value.filter(x => x.id !== p.id)
    notify('Photo deleted', 'error')
  } catch (err) {
    notify(errorText(err, 'Could not delete'), 'error')
  }
}

// ----- Line-ups -----
const days = (e) => (e.days_of_week || []).map(d => DAY_SHORT[d]).join(', ') || '—'

// Warn before leaving with unsaved changes
const beforeUnload = (e) => { if (dirty.value) { e.preventDefault(); e.returnValue = '' } }
onBeforeRouteLeave(() => (dirty.value ? confirm('Leave without saving your Bar-X changes?') : true))

onMounted(() => {
  load()
  window.addEventListener('beforeunload', beforeUnload)
})
onBeforeUnmount(() => window.removeEventListener('beforeunload', beforeUnload))
</script>

<style scoped>
.photos { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; }
.photo { position: relative; background: #111111; border: 1px solid #2A2A2A; border-radius: 12px; overflow: hidden; }
.photo img { width: 100%; height: 150px; object-fit: cover; display: block; }
.photo__bar { display: flex; align-items: center; gap: 2px; padding: 4px 4px 4px 10px; }
.photo__title { flex: 1; min-width: 0; font-size: 12px; color: #ccc; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.photo__cover { position: absolute; top: 8px; left: 8px; }
</style>
