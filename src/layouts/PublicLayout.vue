<template>
  <div class="hs-site">
    <a href="#hs-main" class="hs-skip">Skip to content</a>
    <SiteHeader />
    <main id="hs-main">
      <router-view v-slot="{ Component, route }">
        <transition name="hs-fade" mode="out-in">
          <component :is="Component" :key="route.fullPath" />
        </transition>
      </router-view>
    </main>
    <SiteFooter />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import SiteHeader from '@/components/site/SiteHeader.vue'
import SiteFooter from '@/components/site/SiteFooter.vue'
import { useSiteStore } from '@/stores/site.store'

// Shared data every public page needs (header, footer, venue links)
const site = useSiteStore()
onMounted(() => {
  site.loadSettings()
  site.loadBranches()
})
</script>

<style>
.hs-skip {
  position: absolute;
  left: 16px;
  top: -60px;
  z-index: 100;
  padding: 10px 16px;
  background: var(--hs-gold);
  color: var(--hs-on-gold);
  font-weight: 700;
}
.hs-skip:focus { top: 12px; }
.hs-fade-enter-active, .hs-fade-leave-active { transition: opacity 0.18s ease; }
.hs-fade-enter-from, .hs-fade-leave-to { opacity: 0; }
</style>
