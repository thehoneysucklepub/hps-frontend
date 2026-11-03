import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

const routes = [
  // ── Auth ──────────────────────────────────────────
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: { guest: true }
  },

  // ── Admin / Staff Dashboard ───────────────────────
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      {
        path: '',
        name: 'AdminDashboard',
        component: () => import('@/views/admin/DashboardView.vue')
      },
      {
        path: 'events',
        name: 'AdminEvents',
        component: () => import('@/views/admin/EventsView.vue')
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: () => import('@/views/admin/UsersView.vue')
      },
      {
        path: 'branches',
        name: 'AdminBranches',
        component: () => import('@/views/admin/BranchesView.vue')
      },
      {
        path: 'menu',
        name: 'AdminMenu',
        component: () => import('@/views/admin/MenuView.vue')
      },
      {
        path: 'media',
        name: 'AdminMedia',
        component: () => import('@/views/admin/MediaView.vue')
      },
      {
        path: 'settings',
        name: 'AdminSettings',
        component: () => import('@/views/admin/SettingsView.vue')
      },
      {
        path: 'audit-logs',
        name: 'AdminAuditLogs',
        component: () => import('@/views/admin/AuditLogsView.vue'),
        meta: { requiresSuperAdmin: true }
      },
    ]
  },

  // ── Public Website ────────────────────────────────
  {
    path: '/',
    component: () => import('@/layouts/PublicLayout.vue'),
    children: [
      { path: '', name: 'Home', component: () => import('@/views/public/HomeView.vue') },
      { path: 'branches', name: 'Branches', component: () => import('@/views/public/BranchesView.vue') },
      { path: 'branches/:slug', name: 'BranchDetail', component: () => import('@/views/public/VenueView.vue') },
      { path: 'whats-on', name: 'WhatsOn', component: () => import('@/views/public/WhatsOnView.vue') },
      { path: 'menu', name: 'Menu', component: () => import('@/views/public/MenuView.vue') },
      // Bar-X is a venue like the branches; its content is managed in Admin → Branches
      { path: 'bar-x', name: 'BarX', component: () => import('@/views/public/VenueView.vue'), props: { slugOverride: 'bar-x' } },
    ]
  },

  // ── Retired pages: keep old links working ──────────
  { path: '/live-sports', redirect: '/whats-on' },
  { path: '/contact', redirect: { path: '/', hash: '#visit' } },
  { path: '/register', redirect: '/' },
  { path: '/member/:pathMatch(.*)*', redirect: '/' },
  { path: '/member', redirect: '/' },

  // ── Catch all ─────────────────────────────────────
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, saved) {
    if (saved) return saved
    if (to.hash) return { el: to.hash, top: 80, behavior: 'smooth' }
    return { top: 0 }
  }
})

// ── Navigation Guards ──────────────────────────────
router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore()

  if (auth.accessToken && !auth.user) {
    await auth.fetchMe()
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return next({ name: 'Login', query: { redirect: to.fullPath } })
  }

  if (to.meta.requiresAdmin && !auth.isAdmin && !auth.isStaff) {
    return next({ name: 'Home' })
  }

  if (to.meta.requiresSuperAdmin && !auth.isSuperAdmin) {
    return next({ name: 'AdminDashboard' })
  }

  // Block staff from admin-only pages
  if (auth.isStaff) {
    const staffBlocked = [
      'AdminUsers', 'AdminBranches', 'AdminMenu',
      'AdminMedia', 'AdminSettings', 'AdminAuditLogs'
    ]
    if (staffBlocked.includes(to.name)) {
      return next({ name: 'AdminDashboard' })
    }
  }

  if (to.meta.guest && auth.isAuthenticated) {
    if (auth.isAdmin || auth.isStaff) return next({ name: 'AdminDashboard' })
    return next({ name: 'Home' })
  }

  next()
})

export default router