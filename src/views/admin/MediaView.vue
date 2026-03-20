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
      <v-btn color="primary" prepend-icon="mdi-plus" size="small"
        style="color:#0A0A0A;font-weight:700;" @click="openCreate">
        Add Media
      </v-btn>
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
                :src="item.file_url" style="width:100%;height:100%;object-fit:cover;" />
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
              :src="item.file_url" style="width:100%;height:100%;object-fit:cover;" />
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
                  :src="item.file_url" style="width:100%;height:100%;object-fit:cover;" />
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
            :src="previewItem?.file_url"
            style="max-width:100%;max-height:500px;object-fit:contain;" />
          <video v-else-if="previewItem?.media_type==='video'"
            :src="previewItem?.file_url" controls
            style="max-width:100%;max-height:500px;" />
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
          <v-text-field v-model="form.file_url" label="File URL *" hide-details density="compact"
            bg-color="#1A1A1A" class="mb-3" />
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
import api from '@/services/api'

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

function openPreview(item) {
  previewItem.value  = item
  previewDialog.value = true
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

async function saveMedia() {
  if (!form.value.file_url) return
  saving.value = true
  try {
    await api.post('/media_items', form.value)
    dialog.value = false
    showSnack('Media added successfully')
    fetchMedia()
  } catch {
    showSnack('Failed to add media', 'error')
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