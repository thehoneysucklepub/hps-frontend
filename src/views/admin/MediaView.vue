<template>
  <div>
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <div style="font-size:24px;font-weight:700;">Media Library</div>
        <div style="color:#888;font-size:13px;margin-top:2px;">
          Manage images and videos across all branches
        </div>
      </div>
      <div class="d-flex ga-2">
        <v-btn variant="tonal" prepend-icon="mdi-link-variant" size="small" @click="openCreate">
          Add by link
        </v-btn>
        <v-btn color="primary" prepend-icon="mdi-upload" size="small"
          style="color:#0A0A0A;font-weight:700;" @click="openBulk">
          Upload photos
        </v-btn>
      </div>
    </div>

    <SitePhotos @message="showSnack" />

    <div style="font-size:12px;color:#999;margin:0 0 12px;">
      <b>Where photos appear:</b> a photo with a branch shows in that venue's gallery (the first one is its cover
      if it has no cover photo). <v-icon size="13" color="primary">mdi-star</v-icon> Starred photos appear first
      in the home page gallery. Every photo appears in the home page gallery (newest 9).
    </div>

    <!-- View Toggle + Filters -->
    <v-card style="background:#111111;border:1px solid #2A2A2A;" class="pa-4 mb-5">
      <v-row dense align="center">
        <v-col cols="6" md="2">
          <v-select v-model="typeFilter" :items="['image','video']" placeholder="Type"
            hide-details density="compact" bg-color="#1A1A1A" clearable
            @update:model-value="fetchMedia" />
        </v-col>
        <v-col cols="6" md="2">
          <v-select v-model="branchFilter" :items="branchOptions" placeholder="Branch"
            hide-details density="compact" bg-color="#1A1A1A" clearable
            @update:model-value="fetchMedia" />
        </v-col>
        <v-col cols="6" md="2">
          <v-switch v-model="featuredOnly" label="Featured only" color="primary"
            hide-details density="compact" @update:model-value="fetchMedia" />
        </v-col>
        <v-col cols="6" md="3">
          <div class="d-flex ga-1">
            <v-btn :variant="viewMode==='grid'?'tonal':'text'" color="primary"
              icon="mdi-view-grid" size="small" @click="viewMode='grid'" />
            <v-btn :variant="viewMode==='grouped'?'tonal':'text'" color="primary"
              icon="mdi-view-grid-plus" size="small" @click="viewMode='grouped'" />
            <v-btn :variant="viewMode==='list'?'tonal':'text'" color="primary"
              icon="mdi-view-list" size="small" @click="viewMode='list'" />
          </div>
        </v-col>
        <v-col cols="6" md="3" class="text-right">
          <span style="font-size:13px;color:#888;">{{ allMedia.length }} items</span>
        </v-col>
      </v-row>
    </v-card>

    <div v-if="loading" class="d-flex justify-center pa-12">
      <v-progress-circular indeterminate color="primary" size="48" />
    </div>

    <!-- Grouped View (by branch) -->
    <div v-else-if="viewMode === 'grouped'">
      <div v-for="group in groupedMedia" :key="group.branch" class="mb-8">
        <div class="d-flex align-center ga-3 mb-4">
          <v-avatar color="primary" variant="tonal" size="32">
            <v-icon size="16">mdi-store</v-icon>
          </v-avatar>
          <div style="font-size:17px;font-weight:700;color:#F5C518;">{{ group.branch }}</div>
          <v-chip size="x-small" variant="tonal">{{ group.items.length }} items</v-chip>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px;">
          <div
            v-for="item in group.items"
            :key="item.id"
            class="media-item"
            style="background:#111111;border:1px solid #2A2A2A;border-radius:12px;overflow:hidden;position:relative;cursor:pointer;"
            @click="openPreview(item)"
          >
            <div style="height:140px;background:#1A1A1A;position:relative;overflow:hidden;">
              <img v-if="item.media_type==='image' && item.file_url"
                :src="imgUrl(item.file_url)" style="width:100%;height:100%;object-fit:cover;" />
              <div v-else class="d-flex align-center justify-center" style="height:100%;">
                <v-icon size="40" color="#333">
                  {{ item.media_type==='video' ? 'mdi-play-circle' : 'mdi-image' }}
                </v-icon>
              </div>
              <div style="position:absolute;inset:0;background:rgba(0,0,0,0);transition:background 0.2s;"
                class="media-overlay">
                <div style="position:absolute;top:8px;right:8px;display:flex;gap:4px;opacity:0;transition:opacity 0.2s;"
                  class="media-actions">
                  <v-btn :icon="item.featured ? 'mdi-star' : 'mdi-star-outline'"
                    size="x-small" :color="item.featured ? 'primary' : 'white'"
                    @click.stop="toggleFeatured(item)" />
                  <v-btn icon="mdi-delete" size="x-small" color="error"
                    @click.stop="confirmDelete(item)" />
                </div>
              </div>
              <v-chip v-if="item.featured" color="primary" size="x-small"
                style="position:absolute;top:6px;left:6px;color:#0A0A0A;">
                Featured
              </v-chip>
            </div>
            <div class="pa-2">
              <div style="font-size:12px;color:#ccc;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                {{ item.title || 'Untitled' }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Grid View -->
    <v-row v-else-if="viewMode === 'grid'">
      <v-col v-for="item in allMedia" :key="item.id" cols="6" sm="4" lg="3">
        <div
          class="media-item"
          style="background:#111111;border:1px solid #2A2A2A;border-radius:12px;overflow:hidden;cursor:pointer;"
          @click="openPreview(item)"
        >
          <div style="height:160px;background:#1A1A1A;position:relative;">
            <img v-if="item.media_type==='image' && item.file_url"
              :src="imgUrl(item.file_url)" style="width:100%;height:100%;object-fit:cover;" />
            <div v-else class="d-flex align-center justify-center" style="height:100%;">
              <v-icon size="48" color="#333">
                {{ item.media_type==='video' ? 'mdi-play-circle' : 'mdi-image' }}
              </v-icon>
            </div>
            <v-chip v-if="item.featured" color="primary" size="x-small"
              style="position:absolute;top:8px;left:8px;color:#0A0A0A;">
              Featured
            </v-chip>
            <v-chip v-if="item.branch_name" size="x-small" variant="tonal"
              style="position:absolute;bottom:8px;left:8px;">
              {{ item.branch_name }}
            </v-chip>
          </div>
          <div class="pa-3">
            <div style="font-size:12px;color:#ccc;margin-bottom:8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
              {{ item.title || 'Untitled' }}
            </div>
            <div class="d-flex ga-1">
              <v-btn :icon="item.featured ? 'mdi-star' : 'mdi-star-outline'"
                size="x-small" variant="text"
                :color="item.featured ? 'primary' : 'default'"
                @click.stop="toggleFeatured(item)" />
              <v-btn icon="mdi-delete" size="x-small" variant="text" color="error"
                @click.stop="confirmDelete(item)" />
            </div>
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- List View -->
    <v-card v-else style="background:#111111;border:1px solid #2A2A2A;">
      <v-table style="background:transparent;">
        <thead>
          <tr style="border-bottom:1px solid #2A2A2A;">
            <th style="color:#888;font-size:12px;">Preview</th>
            <th style="color:#888;font-size:12px;">Title</th>
            <th style="color:#888;font-size:12px;">Type</th>
            <th style="color:#888;font-size:12px;">Branch</th>
            <th style="color:#888;font-size:12px;">Featured</th>
            <th style="color:#888;font-size:12px;">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in allMedia" :key="item.id" style="border-bottom:1px solid #1A1A1A;">
            <td style="padding:10px 16px;">
              <div style="width:60px;height:40px;background:#1A1A1A;border-radius:6px;overflow:hidden;">
                <img v-if="item.file_url && item.media_type==='image'"
                  :src="imgUrl(item.file_url)" style="width:100%;height:100%;object-fit:cover;" />
                <div v-else class="d-flex align-center justify-center" style="height:100%;">
                  <v-icon size="16" color="#555">mdi-image</v-icon>
                </div>
              </div>
            </td>
            <td style="padding:10px 16px;font-size:13px;">{{ item.title || 'Untitled' }}</td>
            <td style="padding:10px 16px;">
              <v-chip size="x-small" variant="tonal">{{ item.media_type }}</v-chip>
            </td>
            <td style="padding:10px 16px;font-size:13px;color:#888;">
              {{ item.branch_name || 'Global' }}
            </td>
            <td style="padding:10px 16px;">
              <v-icon :color="item.featured ? 'primary' : '#333'" size="18">
                {{ item.featured ? 'mdi-star' : 'mdi-star-outline' }}
              </v-icon>
            </td>
            <td style="padding:10px 16px;">
              <div class="d-flex ga-1">
                <v-btn :icon="item.featured ? 'mdi-star' : 'mdi-star-outline'"
                  size="x-small" variant="text"
                  :color="item.featured ? 'primary' : 'default'"
                  @click="toggleFeatured(item)" />
                <v-btn icon="mdi-delete" size="x-small" variant="text" color="error"
                  @click="confirmDelete(item)" />
              </div>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <!-- Preview Dialog -->
    <v-dialog v-model="previewDialog" max-width="800">
      <v-card style="background:#111111;border:1px solid #2A2A2A;">
        <div class="d-flex align-center justify-space-between pa-4" style="border-bottom:1px solid #2A2A2A;">
          <div style="font-size:15px;font-weight:600;">{{ previewItem?.title || 'Media Preview' }}</div>
          <v-btn icon="mdi-close" variant="text" size="small" @click="previewDialog = false" />
        </div>
        <div style="background:#0A0A0A;min-height:400px;display:flex;align-items:center;justify-content:center;">
          <img v-if="previewItem?.media_type==='image'"
            :src="imgUrl(previewItem?.file_url)"
            style="max-width:100%;max-height:500px;object-fit:contain;" />
          <video v-else-if="previewItem?.media_type==='video'"
            :src="imgUrl(previewItem?.file_url)" controls
            style="max-width:100%;max-height:500px;" />
        </div>
        <div v-if="previewItem" class="pa-4 pb-0">
          <v-row dense>
            <v-col cols="12" sm="6">
              <v-text-field v-model="editForm.title" label="Title" hide-details density="compact" bg-color="#1A1A1A" />
            </v-col>
            <v-col cols="12" sm="4">
              <v-select v-model="editForm.branch_id" :items="branchOptions" label="Branch (gallery)" placeholder="No branch" hide-details density="compact" bg-color="#1A1A1A" clearable />
            </v-col>
            <v-col cols="12" sm="2" class="d-flex align-center">
              <v-btn color="primary" size="small" :loading="saving" style="color:#0A0A0A;font-weight:700;" block @click="saveEdit">Save</v-btn>
            </v-col>
          </v-row>
        </div>
        <div class="pa-4 d-flex align-center justify-space-between">
          <div>
            <v-chip size="small" variant="tonal" class="mr-2">{{ previewItem?.media_type }}</v-chip>
            <v-chip v-if="previewItem?.branch_name" size="small" color="primary" variant="tonal">
              {{ previewItem?.branch_name }}
            </v-chip>
          </div>
          <div class="d-flex ga-2">
            <v-btn
              :prepend-icon="previewItem?.featured ? 'mdi-star' : 'mdi-star-outline'"
              :color="previewItem?.featured ? 'primary' : 'default'"
              variant="tonal" size="small"
              @click="toggleFeatured(previewItem)"
            >
              {{ previewItem?.featured ? 'Unfeature' : 'Feature' }}
            </v-btn>
            <v-btn prepend-icon="mdi-delete" color="error" variant="tonal" size="small"
              @click="confirmDelete(previewItem); previewDialog=false">
              Delete
            </v-btn>
          </div>
        </div>
      </v-card>
    </v-dialog>

    <!-- Add Media Dialog -->
    <v-dialog v-model="dialog" max-width="500" persistent>
      <v-card style="background:#111111;border:1px solid #2A2A2A;">
        <div class="d-flex align-center justify-space-between pa-5 pb-4" style="border-bottom:1px solid #2A2A2A;">
          <div style="font-size:17px;font-weight:700;">Add Media</div>
          <v-btn icon="mdi-close" variant="text" size="small" @click="dialog = false" />
        </div>
        <div class="pa-5">
          <v-text-field v-model="form.title" label="Title" hide-details density="compact"
            bg-color="#1A1A1A" class="mb-3" />
          <v-select v-model="form.media_type" :items="['image','video']" label="Type *"
            hide-details density="compact" bg-color="#1A1A1A" class="mb-3" />
          <div class="d-flex align-center ga-2 mb-3">
            <v-text-field v-model="form.file_url" label="File *" placeholder="Upload, or paste a link" hide-details density="compact"
              bg-color="#1A1A1A" style="flex:1;" clearable />
            <UploadButton v-if="form.media_type === 'image'" label="Upload photo"
              @uploaded="onUploaded" @error="msg => showSnack(msg, 'error')" />
          </div>
          <div v-if="form.media_type === 'image'" style="font-size:11px;color:#777;margin:-6px 0 12px;">
            Photos are saved on our server (JPG, PNG, WebP, max 8 MB). Choose the branch so it shows in that venue's gallery.
          </div>
          <v-text-field v-model="form.thumbnail_url" label="Thumbnail URL" hide-details density="compact"
            bg-color="#1A1A1A" class="mb-3" />
          <v-select v-model="form.branch_id" :items="branchOptions" label="Branch"
            hide-details density="compact" bg-color="#1A1A1A" class="mb-3" clearable />
          <v-switch v-model="form.featured" label="Featured" color="primary" hide-details density="compact" />

          <!-- Preview -->
          <div v-if="form.file_url && form.media_type === 'image'"
            style="margin-top:16px;border-radius:10px;overflow:hidden;height:160px;background:#1A1A1A;">
            <img :src="form.file_url" style="width:100%;height:100%;object-fit:cover;"
              @error="imageError = true" />
          </div>
        </div>
        <div class="d-flex justify-end ga-2 pa-5 pt-0">
          <v-btn variant="text" @click="dialog = false">Cancel</v-btn>
          <v-btn color="primary" :loading="saving" style="color:#0A0A0A;font-weight:700;"
            @click="saveMedia">
            Add Media
          </v-btn>
        </div>
      </v-card>
    </v-dialog>

    <!-- Upload photos (saved straight away) -->
    <v-dialog v-model="bulkDialog" max-width="520" :persistent="bulkBusy">
      <v-card style="background:#111111;border:1px solid #2A2A2A;">
        <div class="d-flex align-center justify-space-between pa-5 pb-4" style="border-bottom:1px solid #2A2A2A;">
          <div style="font-size:17px;font-weight:700;">Upload photos</div>
          <v-btn icon="mdi-close" variant="text" size="small" :disabled="bulkBusy" @click="bulkDialog = false" />
        </div>
        <div class="pa-5">
          <v-select v-model="bulk.branch_id" :items="branchOptions" label="Branch (shows in its gallery)" placeholder="No branch: home gallery only"
            hide-details density="compact" bg-color="#1A1A1A" class="mb-3" clearable :disabled="bulkBusy" />
          <v-switch v-model="bulk.featured" label="Star them (first in the home page gallery)" color="primary" hide-details density="compact" :disabled="bulkBusy" />
          <v-file-input v-model="bulk.files" label="Choose photos" accept="image/jpeg,image/png,image/webp,image/gif" multiple chips
            prepend-icon="" prepend-inner-icon="mdi-image-multiple" hide-details density="compact" bg-color="#1A1A1A" class="mt-3" :disabled="bulkBusy" />
          <div style="font-size:11px;color:#777;margin-top:6px;">JPG, PNG, WebP or GIF, up to 8 MB each. Each photo is saved as soon as it uploads.</div>
          <div v-if="bulkBusy || bulkDone" class="mt-4">
            <v-progress-linear :model-value="bulkProgress" color="primary" height="6" rounded />
            <div style="font-size:12px;color:#aaa;margin-top:6px;">{{ bulkStatus }}</div>
          </div>
          <v-alert v-for="(e, i) in bulkErrors" :key="i" type="error" variant="tonal" density="compact" class="mt-2">{{ e }}</v-alert>
        </div>
        <div class="d-flex justify-end ga-2 pa-5 pt-0">
          <v-btn variant="text" :disabled="bulkBusy" @click="bulkDialog = false">Close</v-btn>
          <v-btn color="primary" :loading="bulkBusy" :disabled="!bulkFiles.length" style="color:#0A0A0A;font-weight:700;" @click="runBulk">
            Upload {{ bulkFiles.length || '' }}
          </v-btn>
        </div>
      </v-card>
    </v-dialog>

    <!-- Delete Confirm -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card style="background:#111111;border:1px solid #2A2A2A;">
        <div class="pa-6">
          <div style="font-size:16px;font-weight:700;margin-bottom:8px;">Delete Media</div>
          <div style="font-size:13px;color:#ccc;">
            Delete <span style="color:#F5C518;">{{ deletingItem?.title || 'this item' }}</span>? Cannot be undone.
          </div>
        </div>
        <div class="d-flex justify-end ga-2 pa-4 pt-0">
          <v-btn variant="text" @click="deleteDialog = false">Cancel</v-btn>
          <v-btn color="error" :loading="deleting" @click="deleteMedia">Delete</v-btn>
        </div>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000" location="top right">
      {{ snackbar.text }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api, { errorText, uploadFile } from '@/services/api'
import UploadButton from '@/components/admin/UploadButton.vue'
import SitePhotos from '@/components/admin/SitePhotos.vue'
import { imgUrl } from '@/utils/img'

const allMedia      = ref([])
const groupedMedia  = ref([])
const branches      = ref([])
const loading       = ref(true)
const saving        = ref(false)
const deleting      = ref(false)
const dialog        = ref(false)
const deleteDialog  = ref(false)
const previewDialog = ref(false)
const deletingItem  = ref(null)
const previewItem   = ref(null)
const typeFilter    = ref(null)
const branchFilter  = ref(null)
const featuredOnly  = ref(false)
const viewMode      = ref('grouped')
const imageError    = ref(false)
const snackbar      = ref({ show: false, text: '', color: 'success' })

const form = ref({
  title: '', media_type: 'image', file_url: '',
  thumbnail_url: '', branch_id: null, featured: false
})

const branchOptions = computed(() => branches.value.map(b => ({ title: b.name, value: b.id })))

const editForm = ref({ title: '', branch_id: null })

function openPreview(item) {
  previewItem.value  = item
  editForm.value = { title: item.title || '', branch_id: item.branch_id || null }
  previewDialog.value = true
}

async function saveEdit() {
  saving.value = true
  try {
    await api.put(`/media_items/${previewItem.value.id}`, { title: editForm.value.title, branch_id: editForm.value.branch_id || '' })
    showSnack('Photo updated')
    previewDialog.value = false
    fetchMedia()
  } catch (err) {
    showSnack(errorText(err, 'Could not update the photo'), 'error')
  } finally {
    saving.value = false
  }
}

// ----- Upload photos: each file is uploaded and added to the library at once -----
const bulkDialog = ref(false)
const bulkBusy = ref(false)
const bulkDone = ref(false)
const bulkProgress = ref(0)
const bulkStatus = ref('')
const bulkErrors = ref([])
const bulk = ref({ branch_id: null, featured: false, files: [] })
const bulkFiles = computed(() => (Array.isArray(bulk.value.files) ? bulk.value.files : bulk.value.files ? [bulk.value.files] : []))

function openBulk() {
  bulk.value = { branch_id: branchFilter.value || null, featured: false, files: [] }
  bulkErrors.value = []
  bulkDone.value = false
  bulkProgress.value = 0
  bulkDialog.value = true
}

async function runBulk() {
  const files = [...bulkFiles.value]
  bulkBusy.value = true
  bulkDone.value = false
  bulkErrors.value = []
  let ok = 0
  for (let i = 0; i < files.length; i++) {
    const f = files[i]
    bulkStatus.value = `Uploading ${i + 1} of ${files.length}: ${f.name}`
    try {
      if (f.size > 8 * 1024 * 1024) throw new Error('is larger than 8 MB')
      const up = await uploadFile('/files', f, { purpose: 'photo' })
      await api.post('/media_items', {
        title: f.name.replace(/\.[a-z0-9]+$/i, '').replace(/[-_]+/g, ' '),
        media_type: 'image',
        file_url: up.data.url,
        branch_id: bulk.value.branch_id || null,
        featured: bulk.value.featured,
      })
      ok++
    } catch (err) {
      bulkErrors.value.push(`${f.name}: ${err.response ? errorText(err) : err.message}`)
    }
    bulkProgress.value = Math.round(((i + 1) / files.length) * 100)
  }
  bulkBusy.value = false
  bulkDone.value = true
  bulkStatus.value = `${ok} of ${files.length} photos saved`
  bulk.value.files = []
  if (ok) {
    showSnack(`${ok} photo${ok === 1 ? '' : 's'} saved`)
    fetchMedia()
  }
  if (!bulkErrors.value.length) bulkDialog.value = false
}

function openCreate() {
  form.value  = { title: '', media_type: 'image', file_url: '', thumbnail_url: '', branch_id: null, featured: false }
  imageError.value = false
  dialog.value = true
}

async function fetchMedia() {
  loading.value = true
  try {
    const res = await api.get('/media_items', {
      params: {
        media_type: typeFilter.value  || undefined,
        branch_id:  branchFilter.value || undefined,
        featured:   featuredOnly.value ? 'true' : undefined,
        grouped:    'true'
      }
    })
    allMedia.value     = res.data.media_items
    groupedMedia.value = res.data.grouped
  } finally {
    loading.value = false
  }
}

function onUploaded(url, file) {
  form.value.file_url = url
  if (!form.value.title && file?.filename) form.value.title = file.filename.replace(/\.[a-z0-9]+$/i, '').replace(/[-_]+/g, ' ')
}

async function saveMedia() {
  if (!form.value.file_url) return
  saving.value = true
  try {
    await api.post('/media_items', form.value)
    dialog.value = false
    showSnack('Media added successfully')
    fetchMedia()
  } catch (err) {
    showSnack(errorText(err, 'Failed to add media'), 'error')
  } finally {
    saving.value = false
  }
}

async function toggleFeatured(item) {
  try {
    await api.patch(`/media_items/${item.id}/toggle_featured`)
    item.featured = !item.featured
    if (previewItem.value?.id === item.id) {
      previewItem.value.featured = item.featured
    }
    showSnack(item.featured ? 'Marked as featured' : 'Removed from featured')
  } catch {
    showSnack('Failed to update', 'error')
  }
}

function confirmDelete(item) {
  deletingItem.value = item
  deleteDialog.value = true
}

async function deleteMedia() {
  deleting.value = true
  try {
    await api.delete(`/media_items/${deletingItem.value.id}`)
    deleteDialog.value = false
    showSnack('Media deleted', 'error')
    fetchMedia()
  } finally {
    deleting.value = false
  }
}

function showSnack(text, color = 'success') {
  snackbar.value = { show: true, text, color }
}

onMounted(async () => {
  const [mediaRes, branchRes] = await Promise.all([
    api.get('/media_items', { params: { grouped: 'true' } }),
    api.get('/branches')
  ])
  allMedia.value     = mediaRes.data.media_items
  groupedMedia.value = mediaRes.data.grouped
  branches.value     = branchRes.data.branches
  loading.value      = false
})
</script>

<style scoped>
.media-item:hover {
  border-color: #F5C518 !important;
}
.media-item:hover .media-overlay {
  background: rgba(0,0,0,0.4) !important;
}
.media-item:hover .media-actions {
  opacity: 1 !important;
}
</style>