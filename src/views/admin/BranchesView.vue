<template>
  <div>
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <div style="font-size:24px;font-weight:700;">Branch Management</div>
        <div style="color:#888;font-size:13px;margin-top:2px;">Manage all Honeysuckle Pub locations</div>
      </div>
      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        size="small"
        style="color:#0A0A0A;font-weight:700;"
        @click="openCreate"
      >
        Add Branch
      </v-btn>
    </div>

    <!-- Branch Cards -->
    <div v-if="loading" class="d-flex justify-center pa-12">
      <v-progress-circular indeterminate color="primary" size="48" />
    </div>

    <v-row v-else>
      <v-col v-for="branch in branches" :key="branch.id" cols="12" sm="6" lg="4">
        <v-card style="background:#111111;border:1px solid #2A2A2A;" class="pa-5">
          <div v-if="branch.image_url" style="margin:-20px -20px 16px;height:120px;overflow:hidden;border-radius:4px 4px 0 0;">
            <img :src="imgUrl(branch.image_url)" alt="" style="width:100%;height:100%;object-fit:cover;" />
          </div>
          <div class="d-flex align-center justify-space-between mb-4">
            <div class="d-flex align-center ga-3">
              <v-avatar color="primary" variant="tonal" size="44">
                <v-icon>mdi-store</v-icon>
              </v-avatar>
              <div>
                <div style="font-size:15px;font-weight:700;">{{ branch.name }}</div>
                <v-chip size="x-small" :color="branch.active ? 'success' : 'error'" variant="tonal">
                  {{ branch.active ? 'Active' : 'Inactive' }}
                </v-chip>
              </div>
            </div>
            <v-chip v-if="branch.established_year" size="x-small" color="primary" variant="outlined">
              est. {{ branch.established_year }}
            </v-chip>
          </div>

          <div class="d-flex align-center ga-2 mb-2" style="font-size:13px;color:#888;">
            <v-icon size="14" color="primary">mdi-map-marker</v-icon>
            {{ branch.address || '—' }}
          </div>
          <div class="d-flex align-center ga-2 mb-1" style="font-size:13px;color:#888;">
            <v-icon size="14" color="primary">mdi-phone</v-icon>
            {{ branch.phone_primary || '—' }}
            <span v-if="branch.phone_secondary"> / {{ branch.phone_secondary }}</span>
          </div>

          <div class="d-flex flex-wrap ga-1 mt-2">
            <v-chip v-if="sectionCount(branch)" size="x-small" variant="tonal" color="info">{{ sectionCount(branch) }} page sections</v-chip>
            <v-chip size="x-small" variant="tonal">{{ { pub: 'Pub', bar: 'Bar / lounge', restaurant: 'Restaurant' }[branch.venue_type] || branch.venue_type }}</v-chip>
          </div>

          <v-divider class="my-4" style="border-color:#2A2A2A;" />

          <div class="d-flex ga-2">
            <v-btn
              variant="tonal"
              color="primary"
              size="small"
              prepend-icon="mdi-pencil"
              style="flex:1;"
              @click="openEdit(branch)"
            >
              Edit
            </v-btn>
            <v-btn
              variant="tonal"
              size="small"
              icon="mdi-open-in-new"
              :href="branch.slug === 'bar-x' ? '/bar-x' : `/branches/${branch.slug}`"
              target="_blank"
              :title="`Open the ${branch.name} page`"
            />
            <v-btn
              v-if="auth.isSuperAdmin"
              variant="tonal"
              color="error"
              size="small"
              icon="mdi-delete"
              @click="confirmDelete(branch)"
            />
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Dialog -->
    <v-dialog v-model="dialog" max-width="780" persistent scrollable>
      <v-card style="background:#111111;border:1px solid #2A2A2A;">
        <div class="d-flex align-center justify-space-between pa-5 pb-2">
          <div style="font-size:17px;font-weight:700;">
            {{ editingBranch ? `Edit ${editingBranch.name}` : 'Add Branch' }}
          </div>
          <v-btn icon="mdi-close" variant="text" size="small" @click="closeDialog" />
        </div>
        <v-tabs v-model="dialogTab" color="primary" density="compact" class="px-3" style="border-bottom:1px solid #2A2A2A;">
          <v-tab value="details">Details</v-tab>
          <v-tab value="sections">Page sections</v-tab>
        </v-tabs>
        <v-card-text class="pa-5" style="max-height:70vh;">
          <BranchEditor :form="form" :tab="dialogTab" @cover-uploaded="onCoverUploaded" @error="msg => (formError = msg)" />
          <v-alert v-if="formError" type="error" variant="tonal" density="compact" class="mt-3">{{ formError }}</v-alert>
        </v-card-text>
        <div class="d-flex justify-end ga-2 pa-5 pt-3" style="border-top:1px solid #2A2A2A;">
          <v-btn variant="text" @click="closeDialog">Cancel</v-btn>
          <v-btn color="primary" :loading="saving" style="color:#0A0A0A;font-weight:700;" @click="saveBranch">
            {{ editingBranch ? 'Save Changes' : 'Create Branch' }}
          </v-btn>
        </div>
      </v-card>
    </v-dialog>

    <!-- Delete Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card style="background:#111111;border:1px solid #2A2A2A;">
        <div class="pa-6">
          <div style="font-size:16px;font-weight:700;margin-bottom:8px;">Delete Branch</div>
          <div style="font-size:13px;color:#ccc;">
            Delete <span style="color:#F5C518;font-weight:600;">{{ deletingBranch?.name }}</span>? This cannot be undone.
          </div>
        </div>
        <div class="d-flex justify-end ga-2 pa-4 pt-0">
          <v-btn variant="text" @click="deleteDialog = false">Cancel</v-btn>
          <v-btn color="error" :loading="deleting" @click="deleteBranch">Delete</v-btn>
        </div>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000" location="top right">
      {{ snackbar.text }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import api, { errorText } from '@/services/api'
import BranchEditor from '@/components/admin/BranchEditor.vue'
import { blankBranch, branchToForm } from '@/utils/branchForm'
import { imgUrl } from '@/utils/img'

const auth    = useAuthStore()
const branches = ref([])
const loading  = ref(true)
const saving   = ref(false)
const deleting = ref(false)
const dialog   = ref(false)
const deleteDialog   = ref(false)
const editingBranch  = ref(null)
const deletingBranch = ref(null)
const formError      = ref(null)
const snackbar       = ref({ show: false, text: '', color: 'success' })
const dialogTab      = ref('details')

const LIST_FIELDS = ['stats', 'features', 'signatures']
const sectionCount = (b) => LIST_FIELDS.filter(k => b[k]?.length).length + (b.story ? 1 : 0)

const defaultForm = blankBranch
const form = ref(defaultForm())

function openCreate() {
  editingBranch.value = null
  form.value = defaultForm()
  formError.value = null
  dialogTab.value = 'details'
  dialog.value = true
}

function openEdit(branch) {
  editingBranch.value = branch
  form.value = branchToForm(branch)
  formError.value = null
  dialogTab.value = 'details'
  dialog.value = true
}

// Editing an existing venue: the new cover photo is saved straight away,
// so it is not lost if the page is refreshed before "Save Changes".
async function onCoverUploaded(url) {
  form.value.image_url = url
  if (!editingBranch.value) return
  try {
    await api.put(`/branches/${editingBranch.value.id}`, { image_url: url })
    editingBranch.value.image_url = url
    showSnack('Cover photo saved')
    fetchBranches()
  } catch (err) {
    formError.value = errorText(err, 'Photo uploaded but not saved: click Save Changes')
  }
}

function closeDialog() {
  dialog.value = false
  editingBranch.value = null
  formError.value = null
}

async function saveBranch() {
  if (!form.value.name) { formError.value = 'Branch name is required'; return }
  saving.value = true
  formError.value = null
  try {
    if (editingBranch.value) {
      await api.put(`/branches/${editingBranch.value.id}`, form.value)
      showSnack('Branch updated')
    } else {
      await api.post('/branches', form.value)
      showSnack('Branch created')
    }
    closeDialog()
    fetchBranches()
  } catch (err) {
    formError.value = errorText(err, 'Failed to save')
  } finally {
    saving.value = false
  }
}

function confirmDelete(branch) {
  deletingBranch.value = branch
  deleteDialog.value = true
}

async function deleteBranch() {
  deleting.value = true
  try {
    await api.delete(`/branches/${deletingBranch.value.id}`)
    deleteDialog.value = false
    showSnack('Branch deleted', 'error')
    fetchBranches()
  } finally {
    deleting.value = false
  }
}

async function fetchBranches() {
  loading.value = true
  try {
    const res = await api.get('/branches', { params: { all: 'true' } })
    branches.value = res.data.branches
  } finally {
    loading.value = false
  }
}

function showSnack(text, color = 'success') {
  snackbar.value = { show: true, text, color }
}

onMounted(fetchBranches)
</script>