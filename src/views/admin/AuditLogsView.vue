<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <div style="font-size:24px;font-weight:700;">Audit Logs</div>
        <div style="color:#888;font-size:13px;margin-top:2px;">Full system activity trail</div>
      </div>
      <v-chip color="error" variant="tonal" size="small" prepend-icon="mdi-shield-check">
        Super Admin Only
      </v-chip>
    </div>

    <!-- Filters -->
    <v-card style="background:#111111;border:1px solid #2A2A2A;" class="pa-4 mb-5">
      <v-row dense align="center">
        <v-col cols="12" md="4">
          <v-select
            v-model="filters.action"
            :items="actionOptions"
            placeholder="Filter by action"
            hide-details
            density="compact"
            bg-color="#1A1A1A"
            clearable
            @update:model-value="fetchLogs"
          />
        </v-col>
        <v-col cols="12" md="4">
          <v-select
            v-model="filters.resource"
            :items="resourceOptions"
            placeholder="Filter by resource"
            hide-details
            density="compact"
            bg-color="#1A1A1A"
            clearable
            @update:model-value="fetchLogs"
          />
        </v-col>
        <v-col cols="12" md="2">
          <v-btn variant="text" color="primary" size="small" prepend-icon="mdi-refresh" @click="resetFilters">
            Reset
          </v-btn>
        </v-col>
      </v-row>
    </v-card>

    <!-- Table -->
    <v-card style="background:#111111;border:1px solid #2A2A2A;">
      <div v-if="loading" class="d-flex justify-center pa-12">
        <v-progress-circular indeterminate color="primary" size="48" />
      </div>

      <v-table v-else style="background:transparent;">
        <thead>
          <tr style="border-bottom:1px solid #2A2A2A;">
            <th style="color:#888;font-size:12px;font-weight:500;">Action</th>
            <th style="color:#888;font-size:12px;font-weight:500;">Resource</th>
            <th style="color:#888;font-size:12px;font-weight:500;">User</th>
            <th style="color:#888;font-size:12px;font-weight:500;">IP</th>
            <th style="color:#888;font-size:12px;font-weight:500;">Time</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="log in logs"
            :key="log.id"
            style="border-bottom:1px solid #1A1A1A;"
          >
            <td style="padding:12px 16px;">
              <div class="d-flex align-center ga-2">
                <v-avatar :color="actionColor(log.action)" variant="tonal" size="28">
                  <v-icon size="14">{{ actionIcon(log.action) }}</v-icon>
                </v-avatar>
                <span style="font-size:13px;text-transform:capitalize;">
                  {{ log.action.replace(/_/g, ' ') }}
                </span>
              </div>
            </td>
            <td style="padding:12px 16px;">
              <v-chip size="x-small" variant="tonal" v-if="log.resource">
                {{ log.resource }}
                <span v-if="log.resource_id"> #{{ log.resource_id }}</span>
              </v-chip>
              <span v-else style="color:#555;">—</span>
            </td>
            <td style="padding:12px 16px;font-size:13px;color:#F5C518;">
              {{ log.user || '—' }}
            </td>
            <td style="padding:12px 16px;font-size:12px;color:#888;font-family:monospace;">
              {{ log.ip_address || '—' }}
            </td>
            <td style="padding:12px 16px;font-size:12px;color:#888;">
              {{ formatDateTime(log.created_at) }}
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
        @update:model-value="fetchLogs"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'

const logs    = ref([])
const loading = ref(true)
const page    = ref(1)
const meta    = ref({})

const filters = ref({ action: null, resource: null })

const actionOptions   = ['login', 'create_event', 'update_event', 'delete_event', 'create_user', 'update_user', 'delete_user', 'create_branch', 'update_branch', 'update_setting']
const resourceOptions = ['Event', 'User', 'Branch', 'SiteSetting']

function actionColor(action) {
  if (action.includes('create')) return 'success'
  if (action.includes('delete')) return 'error'
  if (action.includes('update')) return 'warning'
  if (action.includes('login'))  return 'info'
  return 'primary'
}

function actionIcon(action) {
  if (action.includes('create')) return 'mdi-plus'
  if (action.includes('delete')) return 'mdi-delete'
  if (action.includes('update')) return 'mdi-pencil'
  if (action.includes('login'))  return 'mdi-login'
  return 'mdi-circle'
}

function formatDateTime(d) {
  if (!d) return '—'
  return new Date(d).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

function resetFilters() {
  filters.value = { action: null, resource: null }
  page.value = 1
  fetchLogs()
}

async function fetchLogs() {
  loading.value = true
  try {
    const res = await api.get('/audit_logs', {
      params: {
        page: page.value,
        action:   filters.value.action   || undefined,
        resource: filters.value.resource || undefined,
      }
    })
    logs.value = res.data.logs
    meta.value = res.data.meta || {}
  } finally {
    loading.value = false
  }
}

onMounted(fetchLogs)
</script>