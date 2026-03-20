<template>
  <div>
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <div style="font-size:24px;font-weight:700;">User Management</div>
        <div style="color:#888;font-size:13px;margin-top:2px;">
          Manage admin, staff and member accounts
        </div>
      </div>
      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        size="small"
        style="color:#0A0A0A;font-weight:700;"
        @click="openCreate"
      >
        Add User
      </v-btn>
    </div>

    <!-- Stats -->
    <v-row class="mb-5">
      <v-col v-for="s in statCards" :key="s.label" cols="6" sm="3">
        <v-card style="background:#111111;border:1px solid #2A2A2A;" class="pa-4">
          <div style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;">{{ s.label }}</div>
          <div style="font-size:28px;font-weight:800;margin-top:4px;" :style="{ color: s.color }">
            {{ s.value }}
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Filters -->
    <v-card style="background:#111111;border:1px solid #2A2A2A;" class="pa-4 mb-5">
      <v-row dense align="center">
        <v-col cols="12" md="5">
          <v-text-field
            v-model="search"
            placeholder="Search users..."
            prepend-inner-icon="mdi-magnify"
            hide-details
            density="compact"
            bg-color="#1A1A1A"
          />
        </v-col>
        <v-col cols="6" md="3">
          <v-select
            v-model="roleFilter"
            :items="roleOptions"
            placeholder="Filter by role"
            hide-details
            density="compact"
            bg-color="#1A1A1A"
            clearable
          />
        </v-col>
        <v-col cols="6" md="2">
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
            <th style="color:#888;font-size:12px;font-weight:500;">User</th>
            <th style="color:#888;font-size:12px;font-weight:500;">Role</th>
            <th style="color:#888;font-size:12px;font-weight:500;">Branch</th>
            <th style="color:#888;font-size:12px;font-weight:500;">Status</th>
            <th style="color:#888;font-size:12px;font-weight:500;">Created</th>
            <th style="color:#888;font-size:12px;font-weight:500;">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="user in filteredUsers"
            :key="user.id"
            style="border-bottom:1px solid #1A1A1A;"
          >
            <td style="padding:14px 16px;">
              <div class="d-flex align-center ga-3">
                <v-avatar size="36" :color="roleColor(user.role)" variant="tonal">
                  <span style="font-size:13px;font-weight:700;">
                    {{ user.username?.charAt(0).toUpperCase() }}
                  </span>
                </v-avatar>
                <div>
                  <div style="font-size:13px;font-weight:600;">{{ user.username }}</div>
                  <div style="font-size:11px;color:#888;">{{ user.email }}</div>
                </div>
              </div>
            </td>
            <td style="padding:14px 16px;">
              <v-chip
                :color="roleColor(user.role)"
                size="x-small"
                variant="tonal"
                style="text-transform:capitalize;"
              >
                {{ user.role?.replace('_', ' ') }}
              </v-chip>
            </td>
            <td style="padding:14px 16px;font-size:13px;color:#888;">
              {{ user.branch_name || '—' }}
            </td>
            <td style="padding:14px 16px;">
              <v-chip
                :color="user.active ? 'success' : 'error'"
                size="x-small"
                variant="tonal"
              >
                {{ user.active ? 'Active' : 'Inactive' }}
              </v-chip>
            </td>
            <td style="padding:14px 16px;font-size:12px;color:#888;">
              {{ formatDate(user.created_at) }}
            </td>
            <td style="padding:14px 16px;">
              <div class="d-flex ga-1">
                <v-btn
                  icon="mdi-pencil"
                  size="x-small"
                  variant="text"
                  color="primary"
                  @click="openEdit(user)"
                  :disabled="user.role === 'super_admin' && !auth.isSuperAdmin"
                />
                <v-btn
                  :icon="user.active ? 'mdi-account-off' : 'mdi-account-check'"
                  size="x-small"
                  variant="text"
                  :color="user.active ? 'warning' : 'success'"
                  @click="toggleActive(user)"
                  :disabled="user.role === 'super_admin'"
                />
                <v-btn
                  icon="mdi-delete"
                  size="x-small"
                  variant="text"
                  color="error"
                  @click="confirmDelete(user)"
                  :disabled="user.role === 'super_admin' || user.id === auth.user?.id"
                />
              </div>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <!-- Create / Edit Dialog -->
    <v-dialog v-model="dialog" max-width="500" persistent>
      <v-card style="background:#111111;border:1px solid #2A2A2A;">
        <div class="d-flex align-center justify-space-between pa-5 pb-4" style="border-bottom:1px solid #2A2A2A;">
          <div style="font-size:17px;font-weight:700;">
            {{ editingUser ? 'Edit User' : 'Add New User' }}
          </div>
          <v-btn icon="mdi-close" variant="text" size="small" @click="closeDialog" />
        </div>

        <div class="pa-5">
          <v-row dense>
            <v-col cols="12">
              <v-text-field
                v-model="form.username"
                label="Username *"
                hide-details
                density="compact"
                bg-color="#1A1A1A"
                class="mb-3"
                :disabled="!!editingUser"
              />
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="form.email"
                label="Email *"
                type="email"
                hide-details
                density="compact"
                bg-color="#1A1A1A"
                class="mb-3"
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model="form.first_name"
                label="First Name"
                hide-details
                density="compact"
                bg-color="#1A1A1A"
                class="mb-3"
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model="form.last_name"
                label="Last Name"
                hide-details
                density="compact"
                bg-color="#1A1A1A"
                class="mb-3"
              />
            </v-col>
            <v-col cols="6">
              <v-select
                v-model="form.role"
                :items="auth.isSuperAdmin ? allRoles : limitedRoles"
                label="Role *"
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
            <v-col cols="12">
              <v-text-field
                v-model="form.password"
                :label="editingUser ? 'New Password (leave blank to keep)' : 'Password *'"
                type="password"
                hide-details
                density="compact"
                bg-color="#1A1A1A"
                class="mb-3"
              />
            </v-col>
          </v-row>

          <v-alert v-if="formError" type="error" variant="tonal" density="compact" class="mt-2">
            {{ formError }}
          </v-alert>
        </div>

        <div class="d-flex justify-end ga-2 pa-5 pt-0">
          <v-btn variant="text" @click="closeDialog">Cancel</v-btn>
          <v-btn
            color="primary"
            :loading="saving"
            style="color:#0A0A0A;font-weight:700;"
            @click="saveUser"
          >
            {{ editingUser ? 'Save Changes' : 'Create User' }}
          </v-btn>
        </div>
      </v-card>
    </v-dialog>

    <!-- Delete Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card style="background:#111111;border:1px solid #2A2A2A;">
        <div class="pa-6">
          <div class="d-flex align-center ga-3 mb-4">
            <v-avatar color="error" variant="tonal" size="48">
              <v-icon>mdi-delete</v-icon>
            </v-avatar>
            <div>
              <div style="font-size:16px;font-weight:700;">Delete User</div>
              <div style="font-size:13px;color:#888;">This cannot be undone</div>
            </div>
          </div>
          <div style="font-size:13px;color:#ccc;">
            Delete <span style="color:#F5C518;font-weight:600;">{{ deletingUser?.username }}</span>?
          </div>
        </div>
        <div class="d-flex justify-end ga-2 pa-4 pt-0">
          <v-btn variant="text" @click="deleteDialog = false">Cancel</v-btn>
          <v-btn color="error" :loading="deleting" @click="deleteUser">Delete</v-btn>
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
import { useAuthStore } from '@/stores/auth.store'
import api from '@/services/api'

const auth    = useAuthStore()
const users   = ref([])
const loading = ref(false)
const saving  = ref(false)
const deleting = ref(false)
const dialog   = ref(false)
const deleteDialog  = ref(false)
const editingUser   = ref(null)
const deletingUser  = ref(null)
const formError     = ref(null)
const search        = ref('')
const roleFilter    = ref(null)
const branches      = ref([])
const snackbar      = ref({ show: false, text: '', color: 'success' })

const allRoles     = ['super_admin', 'admin', 'staff', 'member']
const limitedRoles = ['admin', 'staff', 'member']
const roleOptions  = ['super_admin', 'admin', 'staff', 'member']

const form = ref(defaultForm())

function defaultForm() {
  return { username: '', email: '', password: '', first_name: '', last_name: '', role: 'staff', branch_id: null }
}

const branchOptions = computed(() =>
  branches.value.map(b => ({ title: b.name, value: b.id }))
)

const filteredUsers = computed(() => {
  let list = users.value
  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter(u =>
      u.username?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q)
    )
  }
  if (roleFilter.value) list = list.filter(u => u.role === roleFilter.value)
  return list
})

const statCards = computed(() => [
  { label: 'Total Users',  value: users.value.length,                                       color: '#F5C518' },
  { label: 'Admins',       value: users.value.filter(u => ['super_admin','admin'].includes(u.role)).length, color: '#2196F3' },
  { label: 'Staff',        value: users.value.filter(u => u.role === 'staff').length,        color: '#4CAF50' },
  { label: 'Members',      value: users.value.filter(u => u.role === 'member').length,       color: '#FF9800' },
])

function roleColor(role) {
  const map = { super_admin: 'error', admin: 'primary', staff: 'success', member: 'info' }
  return map[role] || 'default'
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function resetFilters() {
  search.value = ''
  roleFilter.value = null
}

function openCreate() {
  editingUser.value = null
  form.value = defaultForm()
  formError.value = null
  dialog.value = true
}

function openEdit(user) {
  editingUser.value = user
  form.value = {
    username:   user.username,
    email:      user.email,
    password:   '',
    first_name: user.first_name || '',
    last_name:  user.last_name  || '',
    role:       user.role,
    branch_id:  user.branch_id
  }
  formError.value = null
  dialog.value = true
}

function closeDialog() {
  dialog.value = false
  editingUser.value = null
  formError.value = null
}

async function saveUser() {
  if (!form.value.email) {
    formError.value = 'Email is required'
    return
  }
  if (!editingUser.value && !form.value.password) {
    formError.value = 'Password is required for new users'
    return
  }
  saving.value = true
  formError.value = null
  try {
    const payload = { ...form.value }
    if (!payload.password) delete payload.password
    if (editingUser.value) {
      await api.put(`/users/${editingUser.value.id}`, payload)
      showSnack('User updated successfully')
    } else {
      await api.post('/users', payload)
      showSnack('User created successfully')
    }
    closeDialog()
    fetchUsers()
  } catch (err) {
    formError.value = err.response?.data?.error || 'Failed to save user'
  } finally {
    saving.value = false
  }
}

function confirmDelete(user) {
  deletingUser.value = user
  deleteDialog.value = true
}

async function deleteUser() {
  deleting.value = true
  try {
    await api.delete(`/users/${deletingUser.value.id}`)
    deleteDialog.value = false
    showSnack('User deleted', 'error')
    fetchUsers()
  } finally {
    deleting.value = false
  }
}

async function toggleActive(user) {
  try {
    await api.patch(`/users/${user.id}/toggle_active`)
    showSnack(`User ${user.active ? 'deactivated' : 'activated'}`)
    fetchUsers()
  } catch {
    showSnack('Failed to update user', 'error')
  }
}

async function fetchUsers() {
  loading.value = true
  try {
    const res = await api.get('/users')
    users.value = res.data.users
  } finally {
    loading.value = false
  }
}

function showSnack(text, color = 'success') {
  snackbar.value = { show: true, text, color }
}

onMounted(async () => {
  const [usersRes, branchRes] = await Promise.all([
    api.get('/users'),
    api.get('/branches')
  ])
  users.value    = usersRes.data.users
  branches.value = branchRes.data.branches
  loading.value  = false
})
</script>