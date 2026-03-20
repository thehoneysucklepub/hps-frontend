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
            <v-chip size="x-small" color="primary" variant="outlined">
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
    <v-dialog v-model="dialog" max-width="500" persistent>
      <v-card style="background:#111111;border:1px solid #2A2A2A;">
        <div class="d-flex align-center justify-space-between pa-5 pb-4" style="border-bottom:1px solid #2A2A2A;">
          <div style="font-size:17px;font-weight:700;">
            {{ editingBranch ? 'Edit Branch' : 'Add Branch' }}
          </div>
          <v-btn icon="mdi-close" variant="text" size="small" @click="closeDialog" />
        </div>
        <div class="pa-5">
          <v-row dense>
            <v-col cols="12">
              <v-text-field v-model="form.name" label="Branch Name *" hide-details density="compact" bg-color="#1A1A1A" class="mb-3" />
            </v-col>
            <v-col cols="12">
              <v-text-field v-model="form.address" label="Address" hide-details density="compact" bg-color="#1A1A1A" class="mb-3" />
            </v-col>
            <v-col cols="6">
              <v-text-field v-model="form.phone_primary" label="Primary Phone" hide-details density="compact" bg-color="#1A1A1A" class="mb-3" />
            </v-col>
            <v-col cols="6">
              <v-text-field v-model="form.phone_secondary" label="Secondary Phone" hide-details density="compact" bg-color="#1A1A1A" class="mb-3" />
            </v-col>
            <v-col cols="6">
              <v-text-field v-model="form.established_year" label="Est. Year" hide-details density="compact" bg-color="#1A1A1A" class="mb-3" />
            </v-col>
            <v-col cols="6">
              <v-switch v-model="form.active" label="Active" color="primary" hide-details density="compact" />
            </v-col>
            <v-col cols="12">
              <v-textarea v-model="form.description" label="Description" hide-details density="compact" bg-color="#1A1A1A" rows="3" />
            </v-col>
          </v-row>
          <v-alert v-if="formError" type="error" variant="tonal" density="compact" class="mt-3">{{ formError }}</v-alert>
        </div>
        <div class="d-flex justify-end ga-2 pa-5 pt-0">
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
import api from '@/services/api'

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

const form = ref(defaultForm())
function defaultForm() {
  return { name: '', address: '', phone_primary: '', phone_secondary: '', established_year: '', description: '', active: true }
}

function openCreate() {
  editingBranch.value = null
  form.value = defaultForm()
  formError.value = null
  dialog.value = true
}

function openEdit(branch) {
  editingBranch.value = branch
  form.value = { ...branch }
  formError.value = null
  dialog.value = true
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
    formError.value = err.response?.data?.error || 'Failed to save'
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
    const res = await api.get('/branches')
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