<template>
  <v-app theme="hpsTheme">
    <v-app-bar elevation="0" color="surface" style="border-bottom:1px solid #2A2A2A;">
      <div style="display:flex;align-items:center;gap:10px;padding-left:16px;cursor:pointer;" @click="$router.push('/')">
        <img
          src="@/assets/logo.png"
          alt="The Honeysuckle"
          style="height:44px;width:auto;object-fit:contain;"
        />
      </div>
      <v-spacer />
      <div class="d-flex align-center ga-1 mr-4">
        <v-btn v-for="item in navItems" :key="item.name" :to="item.to" variant="text" size="small" active-color="primary">
          {{ item.name }}
        </v-btn>
      </div>
      <div class="d-flex align-center ga-2 mr-4">
        <v-avatar size="32" color="primary" style="cursor:pointer;" @click="$router.push('/member/profile')">
          <span style="font-size:13px;font-weight:700;color:#0A0A0A;">
            {{ auth.user?.username?.charAt(0).toUpperCase() }}
          </span>
        </v-avatar>
        <v-btn variant="text" size="small" color="error" @click="handleLogout">Logout</v-btn>
      </div>
    </v-app-bar>

    <v-main style="background:#0A0A0A;">
      <transition name="fade" mode="out-in">
        <router-view />
      </transition>
    </v-main>
  </v-app>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth.store'
import { useRouter } from 'vue-router'

const auth   = useAuthStore()
const router = useRouter()

const navItems = [
  { name: 'Dashboard',    to: '/member' },
  { name: 'Bookings',     to: '/member/bookings' },
  { name: 'Reservations', to: '/member/reservations' },
  { name: 'Bookmarks',    to: '/member/bookmarks' },
  { name: 'Profile',      to: '/member/profile' },
]

async function handleLogout() {
  await auth.logout()
  router.push('/')
}
</script>