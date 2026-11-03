<template>
  <header class="hs-header" :class="{ 'hs-header--solid': scrolled }">
    <div class="hs-header__inner">
      <router-link to="/" class="hs-header__logo" :aria-label="`${site.siteName}, home`">
        <img src="/brand/logo.webp" alt="" width="560" height="423" />
      </router-link>

      <nav class="hs-header__nav" aria-label="Main">
        <router-link v-for="item in nav" :key="item.to" :to="item.to" class="hs-header__link" active-class="is-active">
          {{ item.label }}
        </router-link>
      </nav>

      <router-link to="/whats-on" class="hs-header__cta">What's on tonight</router-link>

      <button type="button" class="hs-header__burger" aria-label="Open menu" :aria-expanded="open" @click="open = true">
        <span /><span /><span />
      </button>
    </div>

    <!-- Mobile menu -->
    <transition name="hs-menu">
      <div v-if="open" class="hs-menu" role="dialog" aria-modal="true" aria-label="Menu">
        <button type="button" class="hs-menu__close" aria-label="Close menu" @click="open = false">×</button>
        <nav class="hs-menu__nav">
          <router-link to="/" class="hs-menu__link" @click="open = false">Home</router-link>
          <router-link v-for="item in nav" :key="item.to" :to="item.to" class="hs-menu__link" @click="open = false">
            {{ item.label }}
          </router-link>
          <router-link to="/whats-on" class="hs-menu__link" @click="open = false">What's on</router-link>
        </nav>
        <a v-if="site.instagram" :href="site.instagram" target="_blank" rel="noopener" class="hs-btn hs-btn--gold">
          Instagram {{ site.instagramHandle }}
        </a>
      </div>
    </transition>
  </header>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { useSiteStore } from '@/stores/site.store'

const site = useSiteStore()
const route = useRoute()
const open = ref(false)
const scrolled = ref(false)

const nav = [
  { label: 'Branches', to: '/branches' },
  { label: "What's on", to: '/whats-on' },
  { label: 'Menu', to: '/menu' },
  { label: 'Bar-X', to: '/bar-x' },
]

const onScroll = () => { scrolled.value = window.scrollY > 10 }
const onKey = (e) => { if (e.key === 'Escape') open.value = false }
watch(() => route.fullPath, () => { open.value = false })
watch(open, (v) => { document.documentElement.style.overflow = v ? 'hidden' : '' })
onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('keydown', onKey)
  document.documentElement.style.overflow = ''
})
</script>

<style scoped>
.hs-header {
  position: sticky;
  top: 0;
  z-index: 50;
  transition: background-color 0.25s ease;
}

.hs-header--solid { background: rgba(11, 10, 7, 0.92); backdrop-filter: blur(10px); }

.hs-header__inner {
  max-width: var(--hs-wrap);
  margin: 0 auto;
  padding: 0 var(--hs-gutter);
  height: 76px;
  display: flex;
  align-items: center;
  gap: 32px;
}

/* Logo sits on a slanted black tab that hangs below the bar, like the reference */
.hs-header__logo {
  align-self: flex-start;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 128px;
  height: 104px;
  padding: 10px 14px 14px;
  background: #000;
  border-bottom: 3px solid var(--hs-gold);
  clip-path: polygon(10% 0, 100% 0, 90% 100%, 0 100%);
  flex-shrink: 0;
}

.hs-header__logo img { width: 100%; height: auto; }

.hs-header__nav {
  display: flex;
  gap: 4px;
  margin-left: auto;
}

.hs-header__link {
  position: relative;
  padding: 10px 14px;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--hs-text);
}

.hs-header__link:hover { color: var(--hs-gold-2); }
.hs-header__link.is-active::before {
  content: '';
  position: absolute;
  left: 2px;
  top: 50%;
  width: 4px;
  height: 14px;
  margin-top: -7px;
  background: var(--hs-gold);
  transform: skewX(-18deg);
}

.hs-header__cta {
  display: inline-flex;
  align-items: center;
  height: 50px;
  padding: 0 28px;
  background: var(--hs-cream);
  color: var(--hs-on-gold);
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  clip-path: polygon(10% 0, 100% 0, 100% 100%, 0 100%);
  transition: background-color 0.2s ease;
}

.hs-header__cta:hover { background: #fff; }

.hs-header__burger {
  display: none;
  margin-left: auto;
  width: 46px;
  height: 46px;
  border: none;
  background: rgba(239, 227, 179, 0.1);
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
}

.hs-header__burger span { width: 20px; height: 2px; background: var(--hs-text); }

.hs-menu {
  position: fixed;
  inset: 0;
  z-index: 60;
  padding: 90px var(--hs-gutter) 32px;
  background: linear-gradient(160deg, #241F10, var(--hs-ink) 60%);
  display: flex;
  flex-direction: column;
  gap: 28px;
  overflow-y: auto;
}

.hs-menu__close {
  position: absolute;
  top: 18px;
  right: var(--hs-gutter);
  width: 46px;
  height: 46px;
  border: none;
  background: rgba(239, 227, 179, 0.1);
  font-size: 28px;
  line-height: 1;
}

.hs-menu__nav { display: flex; flex-direction: column; }

.hs-menu__link {
  padding: 14px 0;
  border-bottom: 1px solid var(--hs-line);
  font-size: 1.7rem;
  font-weight: 800;
  font-style: italic;
  text-transform: uppercase;
}

.hs-menu__link.router-link-exact-active { color: var(--hs-gold-2); }

.hs-menu-enter-active, .hs-menu-leave-active { transition: opacity 0.2s ease; }
.hs-menu-enter-from, .hs-menu-leave-to { opacity: 0; }

@media (max-width: 900px) {
  .hs-header__nav, .hs-header__cta { display: none; }
  .hs-header__burger { display: flex; }
  .hs-header__inner { height: 64px; }
  .hs-header__logo { width: 100px; height: 82px; padding: 8px 12px 12px; }
}
</style>
