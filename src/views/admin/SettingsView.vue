<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <div style="font-size:24px;font-weight:700;">Site Settings</div>
        <div style="color:#888;font-size:13px;margin-top:2px;">Manage global site configuration</div>
      </div>
      <v-btn color="primary" prepend-icon="mdi-plus" size="small" style="color:#0A0A0A;font-weight:700;" @click="openCreate">
        Add Setting
      </v-btn>
    </div>

    <div v-if="loading" class="d-flex justify-center pa-12">
      <v-progress-circular indeterminate color="primary" size="48" />
    </div>

    <div v-else>
      <div v-for="(group, groupName) in groupedSettings" :key="groupName" class="mb-6">
        <div style="font-size:12px;color:#F5C518;text-transform:uppercase;letter-spacing:2px;font-weight:600;margin-bottom:12px;">
          {{ groupName }}
        </div>
        <v-card style="background:#111111;border:1px solid #2A2A2A;">
          <v-table style="background:transparent;">
            <tbody>
              <tr v-for="setting in group" :key="setting.id" style="border-bottom:1px solid #1A1A1A;">
                <td style="padding:14px 16px;width:30%;">
                  <div style="font-size:13px;font-weight:600;font-family:monospace;color:#F5C518;">
                    {{ setting.key }}
                  </div>
                </td>
                <td style="padding:14px 16px;">
                  <div v-if="editingKey !== setting.key" style="font-size:13px;color:#ccc;">
                    {{ setting.value || '—' }}
                  </div>
                  <v-text-field
                    v-else
                    v-model="editValue"
                    hide-details
                    density="compact"
                    bg-color="#1A1A1A"
                    autofocus
                  />
                </td>
                <td style="padding:14px 16px;width:120px;">
                  <div v-if="editingKey !== setting.key" class="d-flex ga-1">
                    <v-btn icon="mdi-pencil" size="x-small" variant="text" color="primary" @click="startEdit(setting)" />
                  </div>
                  <div v-else class="d-flex ga-1">
                    <v-btn icon="mdi-check" size="x-small" variant="text" color="success" :loading="saving" @click="saveEdit(setting)" />
                    <v-btn icon="mdi-close" size="x-small" variant="text" color="error" @click="cancelEdit" />
                  </div>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </div>
    </div>

    <!-- Add Setting Dialog -->
    <v-dialog v-model="dialog" max-width="440" persistent>
      <v-card style="background:#111111;border:1px solid #2A2A2A;">
        <div class="d-flex align-center justify-space-between pa-5 pb-4" style="border-bottom:1px solid #2A2A2A;">
          <div style="font-size:17px;font-weight:700;">Add Setting</div>
          <v-btn icon="mdi-close" variant="text" size="small" @click="dialog = false" />
        </div>
        <div class="pa-5">
          <v-text-field v-model="newSetting.key" label="Key *" hide-details density="compact" bg-color="#1A1A1A" class="mb-3" />
          <v-text-field v-model="newSetting.value" label="Value" hide-details density="compact" bg-color="#1A1A1A" class="mb-3" />
          <v-select v-model="newSetting.group" :items="['general','social','features','contact']" label="Group" hide-details density="compact" bg-color="#1A1A1A" />
        </div>
        <div class="d-flex justify-end ga-2 pa-5 pt-0">
          <v-btn variant="text" @click="dialog = false">Cancel</v-btn>
          <v-btn color="primary" :loading="saving" style="color:#0A0A0A;font-weight:700;" @click="createSetting">Create</v-btn>
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

const settings    = ref([])
const loading     = ref(true)
const saving      = ref(false)
const dialog      = ref(false)
const editingKey  = ref(null)
const editValue   = ref('')
const snackbar    = ref({ show: false, text: '', color: 'success' })
const newSetting  = ref({ key: '', value: '', group: 'general' })

const groupedSettings = computed(() => {
  return settings.value.reduce((acc, s) => {
    const g = s.group || 'general'
    if (!acc[g]) acc[g] = []
    acc[g].push(s)
    return acc
  }, {})
})

function startEdit(setting) {
  editingKey.value = setting.key
  editValue.value  = setting.value || ''
}

function cancelEdit() {
  editingKey.value = null
  editValue.value  = ''
}

async function saveEdit(setting) {
  saving.value = true
  try {
    await api.put(`/site_settings/${setting.key}`, { value: editValue.value })
    setting.value = editValue.value
    cancelEdit()
    showSnack('Setting updated')
  } catch {
    showSnack('Failed to update', 'error')
  } finally {
    saving.value = false
  }
}

function openCreate() {
  newSetting.value = { key: '', value: '', group: 'general' }
  dialog.value = true
}

async function createSetting() {
  if (!newSetting.value.key) return
  saving.value = true
  try {
    await api.post('/site_settings', newSetting.value)
    dialog.value = false
    showSnack('Setting created')
    fetchSettings()
  } catch {
    showSnack('Failed to create', 'error')
  } finally {
    saving.value = false
  }
}

async function fetchSettings() {
  loading.value = true
  try {
    const res = await api.get('/site_settings')
    settings.value = res.data.settings
  } finally {
    loading.value = false
  }
}

function showSnack(text, color = 'success') {
  snackbar.value = { show: true, text, color }
}

onMounted(fetchSettings)
</script>