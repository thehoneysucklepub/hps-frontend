<template>
  <v-app :theme="'hpsTheme'">

    <!-- ── Sidebar ── -->
    <v-navigation-drawer
      v-model="drawer"
      :rail="rail"
      permanent
      color="surface"
      style="border-right: 1px solid #2A2A2A;"
    >
      <!-- Logo -->
      <div class="d-flex align-center justify-center pa-3" style="min-height: 64px; border-bottom: 1px solid #2A2A2A;">
        <img
          v-if="!rail"
          src="@/assets/logo.png"
          alt="HPS"
          style="height:44px;width:auto;object-fit:contain;"
        />
        <img
          v-else
          src="@/assets/logo.png"
          alt="HPS"
          style="height:30px;width:30px;object-fit:contain;"
        />
      </div>

      <!-- Nav Items -->
      <v-list nav density="compact" class="mt-2">
        <v-list-item
          v-for="item in navItems"
          :key="item.name"
          :to="item.to"
          :prepend-icon="item.icon"
          :title="item.name"
          rounded="lg"
          active-color="primary"
          class="mb-1"
          style="font-size:13px;"
        />

        <v-divider class="my-3" style="border-color:#2A2A2A;" />

        <v-list-item
          v-if="auth.isSuperAdmin"
          to="/admin/audit-logs"
          prepend-icon="mdi-shield-check"
          title="Audit Logs"
          rounded="lg"
          active-color="primary"
          class="mb-1"
          style="font-size:13px;"
        />
      </v-list>

      <!-- Bottom: User + Logout -->
      <template #append>
        <div style="border-top: 1px solid #2A2A2A;" class="pa-3">
          <div v-if="!rail" class="d-flex align-center ga-2 mb-3 pa-2" style="background:#1A1A1A;border-radius:10px;">
            <v-avatar size="32" color="primary">
              <span style="color:#0A0A0A;font-weight:700;font-size:13px;">
                {{ auth.user?.username?.charAt(0).toUpperCase() }}
              </span>
            </v-avatar>
            <div style="overflow:hidden;">
              <div style="font-size:12px;font-weight:600;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                {{ auth.user?.username }}
              </div>
              <div style="font-size:10px;color:#F5C518;text-transform:capitalize;">
                {{ auth.user?.role?.replace('_', ' ') }}
              </div>
            </div>
          </div>
          <v-btn
            block
            variant="text"
            color="error"
            :prepend-icon="rail ? undefined : 'mdi-logout'"
            :icon="rail ? 'mdi-logout' : undefined"
            size="small"
            @click="handleLogout"
          >
            <span v-if="!rail">Logout</span>
          </v-btn>
        </div>
      </template>
    </v-navigation-drawer>

    <!-- ── Top Bar ── -->
    <v-app-bar
      elevation="0"
      color="surface"
      style="border-bottom: 1px solid #2A2A2A;"
    >
      <v-btn
        :icon="rail ? 'mdi-menu' : 'mdi-menu-open'"
        variant="text"
        @click="rail = !rail"
      />

      <v-app-bar-title>
        <span style="font-weight:600;font-size:15px;">{{ pageTitle }}</span>
      </v-app-bar-title>

      <template #append>
        <div class="d-flex align-center ga-2 mr-3">
          <!-- Notifications -->
          <v-btn icon="mdi-bell-outline" variant="text" size="small" />

          <!-- Role badge -->
          <v-chip
            size="small"
            color="primary"
            variant="tonal"
            style="text-transform:capitalize;"
          >
            {{ auth.user?.role?.replace('_', ' ') }}
          </v-chip>

          <!-- Username -->
          <span style="font-size:13px;color:#888;">
            {{ auth.user?.username }}
          </span>
        </div>
      </template>
    </v-app-bar>

    <!-- ── Main Content ── -->
    <v-main style="background:#0A0A0A;">
      <div class="pa-6">
        <transition name="fade" mode="out-in">
          <router-view />
        </transition>
      </div>
    </v-main>

  </v-app>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

const auth         = useAuthStore()
const currentRoute = useRoute()
const router       = useRouter()
const drawer       = ref(true)
const rail         = ref(false)

const navItems = computed(() => {
  const base = [
    { name: 'Dashboard',    to: '/admin',             icon: 'mdi-view-dashboard-outline' },
    { name: 'Events',       to: '/admin/events',       icon: 'mdi-calendar-star' },
    { name: 'Bookings',     to: '/admin/bookings',     icon: 'mdi-calendar-check' },
    { name: 'Reservations', to: '/admin/reservations', icon: 'mdi-table-chair' },
  ]

  if (auth.can_manage || auth.isAdmin) {
    base.push(
      { name: 'Users',    to: '/admin/users',    icon: 'mdi-account-group-outline' },
      { name: 'Branches', to: '/admin/branches', icon: 'mdi-store-outline' },
      { name: 'Menu',     to: '/admin/menu',     icon: 'mdi-food-outline' },
      { name: 'Media',    to: '/admin/media',    icon: 'mdi-image-multiple-outline' },
      { name: 'Settings', to: '/admin/settings', icon: 'mdi-cog-outline' },
    )
  }

  return base
})

const pageTitles = {
  AdminDashboard:    'Dashboard',
  AdminEvents:       'Events',
  AdminUsers:        'User Management',
  AdminBranches:     'Branch Management',
  AdminMenu:         'Menu Management',
  AdminMedia:        'Media Library',
  AdminSettings:     'Site Settings',
  AdminAuditLogs:    'Audit Logs',
  AdminBookings:     'Event Bookings',
  AdminReservations: 'Table Reservations',
  StaffDashboard:    'Staff Dashboard',
}

const pageTitle = computed(() => pageTitles[currentRoute.name] || 'HPS Admin')

async function handleLogout() {
  await auth.logout()
  router.push('/login')
}
</script>