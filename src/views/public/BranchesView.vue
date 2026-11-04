<template>
  <div>
    <PageHead :image="site.pageImage('branches')" kicker="Our locations" title="Branches" lede="Sports bars, pubs and lounges across Accra. Choose a venue for its weekly line-up, photos and contacts.">
      <div v-if="filters.length > 1" class="filters" role="tablist" aria-label="Venue type">
        <button
          v-for="f in filters"
          :key="f.key"
          type="button"
          role="tab"
          :aria-selected="filter === f.key"
          class="filters__btn"
          :class="{ 'is-active': filter === f.key }"
          @click="filter = f.key"
        >{{ f.label }} <span>{{ f.count }}</span></button>
      </div>
    </PageHead>

    <section class="hs-section">
      <div class="hs-wrap">
        <div v-if="site.loading.branches && !site.loaded.branches" class="grid">
          <div v-for="n in 6" :key="n" class="hs-skel" style="height: 380px" />
        </div>

        <div v-else-if="site.errors.branches" class="hs-state">
          <strong>Our branches could not be loaded.</strong>
          <span>Check your connection and try again.</span>
          <button type="button" class="hs-btn hs-btn--ghost" @click="site.retry('branches')">Try again</button>
        </div>

        <ul v-else-if="shown.length" class="grid">
          <li v-for="b in shown" :key="b.id">
            <router-link :to="link(b)" class="card">
              <VenuePhoto :src="site.coverFor(b)" :alt="b.name" class="card__photo">
                <span class="card__name">{{ b.name }}</span>
              </VenuePhoto>
              <div class="card__body">
                <p v-if="b.tagline" class="card__tagline">{{ b.tagline }}</p>
                <p v-if="b.address" class="card__line">{{ b.address }}</p>
                <p v-if="phones(b).length" class="card__line">{{ phones(b).join('  /  ') }}</p>
                <div class="card__foot">
                  <span v-if="nights(b)" class="hs-pill hs-pill--gold">{{ nights(b) }} {{ nights(b) === 1 ? 'night' : 'nights' }} this week</span>
                  <span v-if="b.established_year" class="hs-pill">Est. {{ b.established_year }}</span>
                  <span class="card__go" aria-hidden="true">›</span>
                </div>
              </div>
            </router-link>
          </li>
        </ul>

        <div v-else class="hs-state">
          <strong>No branches listed yet.</strong>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import PageHead from '@/components/site/PageHead.vue'
import VenuePhoto from '@/components/site/VenuePhoto.vue'
import { useSiteStore } from '@/stores/site.store'

const site = useSiteStore()
const filter = ref('all')

const filters = computed(() => [
  { key: 'all', label: 'All', count: site.venues.length },
  { key: 'pub', label: 'Pubs', count: site.pubs.length },
  ...(site.bars.length ? [{ key: 'bar', label: 'Bars & lounges', count: site.bars.length }] : []),
])

const shown = computed(() => (filter.value === 'all' ? site.venues : filter.value === 'pub' ? site.pubs : site.bars))

const phones = (b) => [b.phone_primary, b.phone_secondary].filter(Boolean)
const link = (b) => (b.slug === 'bar-x' ? '/bar-x' : `/branches/${b.slug}`)
// Number of distinct nights with a line-up
const nights = (b) => new Set(site.weeklyFor(b.id).flatMap(e => e.days_of_week || [])).size

onMounted(() => {
  site.loadBranches()
  site.loadWeekly()
  site.loadMedia()
  document.title = 'Branches | The Honeysuckle Pub'
})
</script>

<style scoped>
.filters { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 6px; }

.filters__btn {
  padding: 10px 18px;
  border: none;
  background: rgba(11, 10, 7, 0.45);
  font-size: 0.82rem;
  font-weight: 600;
}

.filters__btn span { opacity: 0.6; margin-left: 4px; }
.filters__btn.is-active { background: var(--hs-gold); color: var(--hs-on-gold); }

.grid {
  list-style: none;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 22px;
}

.card {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: rgba(239, 227, 179, 0.06);
  transition: background-color 0.2s ease;
}

.card:hover { background: rgba(239, 227, 179, 0.11); }

.card__photo { aspect-ratio: 4 / 3; }
.card__photo :deep(img) { transition: transform 0.5s ease; }
.card:hover .card__photo :deep(img:not(.hs-photo__mark)) { transform: scale(1.04); }

.card__name {
  position: absolute;
  left: 0;
  bottom: 18px;
  padding: 10px 34px 10px 20px;
  background: var(--hs-gold);
  color: var(--hs-on-gold);
  font-size: 1.4rem;
  font-weight: 800;
  font-style: italic;
  text-transform: uppercase;
  line-height: 1;
  clip-path: polygon(0 0, 100% 0, 92% 100%, 0 100%);
}

.card__body { padding: 20px 22px 22px; display: flex; flex-direction: column; gap: 6px; flex: 1; }
.card__tagline { font-weight: 600; }
.card__line { font-size: 0.85rem; color: var(--hs-muted); }

.card__foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: auto;
  padding-top: 14px;
}

.card__go { margin-left: auto; font-size: 1.6rem; font-weight: 700; color: var(--hs-gold-2); }
</style>
