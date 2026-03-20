<template>
  <v-app theme="hpsTheme">

    <!-- Navbar -->
    <v-app-bar
      elevation="0"
      height="68"
      :style="`
        background: rgba(10,10,10,0.92);
        border-bottom: 1px solid rgba(245,197,24,0.15);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        transition: all 0.3s;
      `"
    >
      <!-- Logo -->
      <div style="display:flex;align-items:center;padding-left:20px;cursor:pointer;" @click="$router.push('/')">
        <img
          src="@/assets/logo.png"
          alt="The Honeysuckle"
          style="height:44px;width:auto;object-fit:contain;"
        />
      </div>

      <v-spacer />

      <!-- Desktop Nav links -->
      <div class="d-none d-md-flex align-center" style="gap:4px;margin-right:16px;">
        <router-link
          v-for="item in navItems"
          :key="item.name"
          :to="item.to"
          custom
          v-slot="{ isActive, navigate }"
        >
          <button
            @click="navigate"
            :style="`
              padding: 6px 14px;
              border-radius: 8px;
              font-size: 12px;
              font-weight: ${isActive ? '600' : '500'};
              letter-spacing: 0.4px;
              cursor: pointer;
              border: ${isActive ? '1px solid rgba(245,197,24,0.25)' : '1px solid transparent'};
              background: ${isActive ? 'rgba(245,197,24,0.1)' : 'transparent'};
              color: ${isActive ? '#F5C518' : '#aaa'};
              transition: all 0.2s;
            `"
            @mouseenter="e => { if (!isActive) { e.target.style.color='#fff'; e.target.style.background='rgba(255,255,255,0.06)'; } }"
            @mouseleave="e => { if (!isActive) { e.target.style.color='#aaa'; e.target.style.background='transparent'; } }"
          >
            {{ item.name }}
          </button>
        </router-link>
      </div>

      <!-- Gold accent separator -->
      <div style="width:1px;height:24px;background:rgba(245,197,24,0.2);margin-right:16px;" class="d-none d-md-block"></div>

      <!-- Auth / CTA -->
      <div class="d-none d-md-flex align-center" style="gap:8px;margin-right:20px;">
        <template v-if="auth.isAuthenticated">
          <button
            style="padding:6px 16px;border-radius:8px;border:1px solid #2A2A2A;background:transparent;color:#888;font-size:12px;cursor:pointer;"
            @click="$router.push(auth.isAdmin ? '/admin' : '/member')"
          >
            Dashboard
          </button>
          <button
            style="padding:6px 16px;border-radius:8px;border:1px solid transparent;background:transparent;color:#666;font-size:12px;cursor:pointer;"
            @click="handleLogout"
          >
            Logout
          </button>
        </template>
        <template v-else>
          <button
            style="padding:6px 16px;border-radius:8px;border:1px solid #2A2A2A;background:transparent;color:#888;font-size:12px;cursor:pointer;"
            @click="$router.push('/login')"
          >
            Login
          </button>
          <button
            style="padding:7px 18px;border-radius:8px;border:none;background:#F5C518;color:#0A0A0A;font-size:12px;font-weight:700;cursor:pointer;"
            @click="$router.push('/reservations')"
          >
            Reserve Table
          </button>
        </template>
      </div>

      <!-- Mobile menu button -->
      <v-btn class="d-md-none mr-2" icon="mdi-menu" variant="text" color="white" @click="mobileMenu = true" />
    </v-app-bar>

    <!-- Gold accent line under navbar -->
    <div
      style="position:fixed;top:68px;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(245,197,24,0.5) 30%,rgba(245,197,24,0.7) 50%,rgba(245,197,24,0.5) 70%,transparent);z-index:1000;pointer-events:none;"
    ></div>

    <!-- Mobile Drawer -->
    <v-navigation-drawer v-model="mobileMenu" location="right" temporary color="#111111">
      <div class="pa-4">
        <div class="d-flex justify-end mb-4">
          <v-btn icon="mdi-close" variant="text" color="white" @click="mobileMenu = false" />
        </div>
        <div style="padding:0 8px;">
          <router-link
            v-for="item in navItems"
            :key="item.name"
            :to="item.to"
            custom
            v-slot="{ isActive, navigate }"
          >
            <div
              @click="navigate; mobileMenu = false"
              :style="`
                padding: 12px 16px;
                border-radius: 10px;
                margin-bottom: 4px;
                cursor: pointer;
                font-size: 14px;
                font-weight: ${isActive ? '600' : '400'};
                color: ${isActive ? '#F5C518' : '#ccc'};
                background: ${isActive ? 'rgba(245,197,24,0.08)' : 'transparent'};
                border: 1px solid ${isActive ? 'rgba(245,197,24,0.2)' : 'transparent'};
              `"
            >
              {{ item.name }}
            </div>
          </router-link>
        </div>
        <div style="margin-top:20px;padding:0 8px;display:flex;flex-direction:column;gap:8px;">
          <button
            style="padding:10px;border-radius:10px;border:1px solid #2A2A2A;background:transparent;color:#888;font-size:13px;cursor:pointer;"
            @click="$router.push('/login'); mobileMenu = false"
          >
            Login
          </button>
          <button
            style="padding:10px;border-radius:10px;border:none;background:#F5C518;color:#0A0A0A;font-size:13px;font-weight:700;cursor:pointer;"
            @click="$router.push('/reservations'); mobileMenu = false"
          >
            Reserve Table
          </button>
        </div>
      </div>
    </v-navigation-drawer>

    <!-- Main -->
    <v-main>
      <transition name="fade" mode="out-in">
        <router-view />
      </transition>
    </v-main>

    <!-- Footer -->
    <footer style="background:#111111;border-top:1px solid #1E1E1E;padding:40px 24px;text-align:center;">
      <div style="display:flex;justify-content:center;margin-bottom:16px;">
        <a
          href="https://instagram.com/thehoneysucklepub"
          target="_blank"
          style="width:40px;height:40px;border-radius:50%;background:rgba(245,197,24,0.08);border:1px solid rgba(245,197,24,0.2);display:flex;align-items:center;justify-content:center;color:#F5C518;text-decoration:none;transition:all 0.2s;"
        >
          <v-icon size="18">mdi-instagram</v-icon>
        </a>
      </div>
      <div style="color:#333;font-size:12px;letter-spacing:1px;">
        COPYRIGHT © {{ new Date().getFullYear() }} THEHONEYSUCKLEPUB
      </div>
    </footer>

  </v-app>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { useRouter } from 'vue-router'

const auth       = useAuthStore()
const router     = useRouter()
const mobileMenu = ref(false)

const navItems = [
  { name: 'Home',        to: '/' },
  { name: 'Live Sports', to: '/live-sports' },
  { name: 'Branches',    to: '/branches' },
  { name: 'Contact Us',  to: '/contact' },
  { name: 'Menu',        to: '/menu' },
  { name: 'Bar-X',       to: '/bar-x' },
]

async function handleLogout() {
  await auth.logout()
  router.push('/')
}
</script>

<style>
.fade-enter-active,
.fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from,
.fade-leave-to    { opacity: 0; }
</style>