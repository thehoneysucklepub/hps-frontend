<template>
  <div>
    <PageHead :image="site.pageImage('menu')" kicker="Food & drinks" title="Menu" lede="Our current food and drinks menus. Read them here or download them to your phone." />

    <section class="hs-section">
      <div class="hs-wrap">
        <div v-if="loading" class="hs-skel" style="height: 70vh" />

        <div v-else-if="site.errors.menuPdfs" class="hs-state">
          <strong>The menu could not be loaded.</strong>
          <button type="button" class="hs-btn hs-btn--ghost" @click="site.retry('menuPdfs')">Try again</button>
        </div>

        <template v-else-if="site.menuPdfs.length">
          <div class="tabs" role="tablist" aria-label="Menus">
            <button
              v-for="m in site.menuPdfs"
              :key="m.id"
              type="button"
              role="tab"
              :aria-selected="current?.id === m.id"
              class="tabs__btn"
              :class="{ 'is-active': current?.id === m.id }"
              @click="selectedId = m.id"
            >{{ m.title }}</button>
          </div>

          <div v-if="current" class="viewer">
            <div class="viewer__bar">
              <span class="viewer__title">{{ current.title }}</span>
              <span class="viewer__actions">
                <a :href="current.download_url" class="hs-btn hs-btn--gold" download>Download PDF</a>
                <a :href="openUrl" target="_blank" rel="noopener" class="hs-btn hs-btn--ghost">Open full screen</a>
              </span>
            </div>

            <!-- Stored copy: our own reader (works on phones too) -->
            <PdfReader
              v-if="useReader"
              :key="`r-${current.id}-${current.file.view_url}`"
              :src="current.file.view_url"
              :title="current.title"
              @error="readerFailed[current.id] = true"
            />
            <!-- No stored copy, or the reader failed: Google's viewer -->
            <iframe
              v-else-if="current.preview_url"
              :key="`f-${current.id}`"
              :src="current.preview_url"
              :title="`${current.title} (PDF)`"
              class="viewer__frame"
              loading="lazy"
              allow="autoplay"
            />
            <div v-else class="hs-state viewer__none">
              <strong>This menu can't be shown here right now.</strong>
              <a :href="current.download_url" class="hs-btn hs-btn--gold" download>Download PDF</a>
            </div>
          </div>
        </template>

        <div v-else-if="!categories.length" class="hs-state">
          <strong>Our new menu is coming soon.</strong>
          <span>Ask the team at any branch for today's food and drinks.</span>
        </div>

        <!-- Itemised menu, if entered in Admin → Menu -->
        <div v-if="categories.length" class="cats">
          <section v-for="c in categories" :key="c.id" class="cat">
            <h2 class="hs-h3 cat__title">{{ c.name }}</h2>
            <ul class="cat__items">
              <li v-for="i in c.menu_items" :key="i.id" class="cat__item">
                <span class="cat__name">{{ i.name }}</span>
                <span v-if="i.price" class="cat__price">GHS {{ Number(i.price).toFixed(2).replace(/\.00$/, '') }}</span>
                <span v-if="i.description" class="cat__desc">{{ i.description }}</span>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageHead from '@/components/site/PageHead.vue'
import PdfReader from '@/components/site/PdfReader.vue'
import { useSiteStore } from '@/stores/site.store'

// Menus are managed in Admin → Menu → Menu PDFs. Each has a copy stored by the
// API (shown in our PDF reader, downloaded from the API) and/or a Google Drive link.
const site = useSiteStore()
const route = useRoute()
const router = useRouter()

const selectedId = ref(Number(route.query.m) || null)
const current = computed(() => site.menuPdfs.find(m => m.id === selectedId.value) || site.menuPdfs[0])
const categories = computed(() => site.menuCategories.filter(c => c.menu_items?.length))
const loading = computed(() => !site.loaded.menuPdfs && !site.errors.menuPdfs)

const readerFailed = reactive({})
const useReader = computed(() => current.value?.file?.view_url && !readerFailed[current.value.id])
const openUrl = computed(() => current.value?.file?.view_url || current.value?.file_url || current.value?.download_url)

// Keep the selected menu in the address so it can be shared
watch(selectedId, (id) => {
  if (id && Number(route.query.m) !== id) router.replace({ query: { ...route.query, m: id } })
})

onMounted(() => {
  site.loadMenu()
  document.title = 'Menu | The Honeysuckle Pub'
})
</script>

<style scoped>
.tabs { display: flex; flex-wrap: wrap; gap: 4px; }

.tabs__btn {
  padding: 14px 26px;
  border: none;
  background: rgba(239, 227, 179, 0.07);
  font-size: 0.95rem;
  font-weight: 800;
  font-style: italic;
  text-transform: uppercase;
}

.tabs__btn:hover { background: rgba(239, 227, 179, 0.14); }
.tabs__btn.is-active { background: var(--hs-gold); color: var(--hs-on-gold); }

.viewer { margin-top: 4px; background: rgba(239, 227, 179, 0.06); }

.viewer__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  padding: 16px 20px;
}

.viewer__title { font-size: 1.3rem; font-weight: 800; font-style: italic; text-transform: uppercase; }
.viewer__actions { display: flex; flex-wrap: wrap; gap: 8px; }

.viewer__frame {
  display: block;
  width: 100%;
  height: min(86vh, 1100px);
  border: 0;
  background: #111;
}

.cats {
  margin-top: 40px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 18px;
}

.cat { padding: 24px; background: rgba(239, 227, 179, 0.06); }
.cat__title { margin-bottom: 14px; color: var(--hs-gold-2); }
.cat__items { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 12px; }
.cat__item { display: grid; grid-template-columns: 1fr auto; gap: 2px 12px; }
.cat__name { font-weight: 700; }
.cat__price { font-weight: 700; color: var(--hs-gold-2); }
.cat__desc { grid-column: 1 / -1; font-size: 0.82rem; color: var(--hs-muted); }

.viewer__none { margin: 0; padding: 48px 20px; }

@media (max-width: 640px) {
  .viewer__frame { height: 72vh; }
  .viewer__actions { width: 100%; }
  .viewer__actions .hs-btn { flex: 1; justify-content: center; white-space: nowrap; padding-left: 12px; padding-right: 12px; font-size: 0.72rem; }
}
</style>
