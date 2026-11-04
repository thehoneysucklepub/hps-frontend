<template>
  <div>
    <PageHead :image="site.pageImage('whats_on')" kicker="Weekly line-ups" title="What's on" lede="DJs, live bands, karaoke and offers at every Honeysuckle, night by night." />

    <section class="hs-section wo-page">
      <div class="hs-wrap">
        <!-- Day tabs -->
        <div class="daytabs" role="tablist" aria-label="Day of the week">
          <button
            v-for="d in WEEK_ORDER"
            :key="d"
            type="button"
            role="tab"
            :aria-selected="day === d"
            class="daytabs__btn"
            :class="{ 'is-active': day === d }"
            @click="day = d"
          >
            <span class="daytabs__short">{{ DAY_SHORT[d] }}</span>
            <span v-if="d === nightDay" class="daytabs__tonight">Tonight</span>
          </button>
        </div>

        <!-- Venue filter -->
        <div class="venuefilter">
          <label for="venue-filter" class="hs-sr">Venue</label>
          <select id="venue-filter" v-model="venueId" class="venuefilter__select">
            <option :value="null">All venues</option>
            <option v-for="b in venuesWithLineups" :key="b.id" :value="b.id">{{ b.name }}</option>
          </select>
        </div>

        <h2 class="hs-h2 wo-page__day">{{ day === nightDay ? `Tonight, ${DAY_NAMES[day]}` : DAY_NAMES[day] }}</h2>

        <div v-if="site.loading.weekly && !site.loaded.weekly" class="groups">
          <div v-for="n in 3" :key="n" class="hs-skel" style="height: 140px" />
        </div>
        <div v-else-if="site.errors.weekly" class="hs-state">
          <strong>The line-up could not be loaded.</strong>
          <button type="button" class="hs-btn hs-btn--ghost" @click="site.retry('weekly')">Try again</button>
        </div>
        <div v-else-if="groups.length" class="groups">
          <article v-for="g in groups" :key="g.branch.id" class="group">
            <router-link :to="g.branch.slug === 'bar-x' ? '/bar-x' : `/branches/${g.branch.slug}`" class="group__venue">
              {{ g.branch.name }} <span aria-hidden="true">›</span>
            </router-link>
            <ul class="group__items">
              <li v-for="e in g.items" :key="e.id" class="item">
                <span class="item__time">{{ timeRange(e) || 'Times TBC' }}</span>
                <span class="item__main">
                  <span class="item__title">{{ e.title }}</span>
                  <span v-if="e.description" class="item__desc">{{ e.description }}</span>
                </span>
                <span class="item__tags">
                  <span v-if="e.badge" class="hs-pill">{{ e.badge }}</span>
                  <span v-if="e.area" class="hs-pill">{{ e.area }}</span>
                </span>
              </li>
            </ul>
          </article>
        </div>
        <div v-else class="hs-state">
          <strong>No line-up listed for {{ DAY_NAMES[day] }}{{ venueId ? ` at ${venueName}` : '' }}.</strong>
          <span>Our venues are open as usual.</span>
        </div>

        <!-- One-off events (Admin → Events, "One-off date") -->
        <section v-if="site.upcoming.length" class="special" aria-labelledby="special-title">
          <h2 id="special-title" class="hs-kicker">Coming up</h2>
          <ul class="special__list">
            <li v-for="e in site.upcoming" :key="e.id" class="special__item" :class="{ 'special__item--photo': e.image_url }">
              <VenuePhoto v-if="e.image_url" :src="e.image_url" :alt="e.title" class="special__photo" />
              <span class="special__date">{{ formatDate(e.date_start) }}<template v-if="e.time_local"> | {{ clock(e.time_local) }}</template></span>
              <span class="special__title">{{ e.title }}</span>
              <span class="hs-muted">{{ e.branch_name || 'All venues' }}</span>
            </li>
          </ul>
        </section>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import PageHead from '@/components/site/PageHead.vue'
import VenuePhoto from '@/components/site/VenuePhoto.vue'
import { useSiteStore, DAY_NAMES, DAY_SHORT, WEEK_ORDER, timeRange, clock } from '@/stores/site.store'
import { useTonight } from '@/composables/useTonight'

const site = useSiteStore()
const { nightDay } = useTonight()

const day = ref(nightDay.value)
const venueId = ref(null)

const venuesWithLineups = computed(() => site.venues.filter(b => site.weeklyFor(b.id).length))
const venueName = computed(() => site.venues.find(b => b.id === venueId.value)?.name || '')

const groups = computed(() =>
  site.venues
    .filter(b => !venueId.value || b.id === venueId.value)
    .map(branch => ({ branch, items: site.onDay(day.value, site.weeklyFor(branch.id)) }))
    .filter(g => g.items.length),
)

const formatDate = (d) => new Date(d).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })

onMounted(() => {
  site.loadBranches()
  site.loadWeekly()
  site.loadUpcoming()
  document.title = "What's on | The Honeysuckle Pub"
})
</script>

<style scoped>
.daytabs {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 4px;
}

.daytabs__btn {
  position: relative;
  padding: 16px 6px;
  border: none;
  background: rgba(239, 227, 179, 0.07);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  transition: background-color 0.2s ease;
}

.daytabs__btn:hover { background: rgba(239, 227, 179, 0.14); }
.daytabs__btn.is-active { background: var(--hs-gold); color: var(--hs-on-gold); }

.daytabs__short { font-size: 1.1rem; font-weight: 800; font-style: italic; text-transform: uppercase; }
.daytabs__tonight { font-size: 0.62rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }

.venuefilter { margin-top: 14px; }

.venuefilter__select {
  min-width: 240px;
  padding: 12px 16px;
  border: 1px solid var(--hs-line);
  background: var(--hs-panel-solid);
  color: var(--hs-text);
  font: inherit;
  font-size: 0.9rem;
}

.wo-page__day { margin: 36px 0 20px; }

.groups { display: flex; flex-direction: column; gap: 16px; }

.group {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  gap: 24px;
  padding: 22px 24px;
  background: rgba(239, 227, 179, 0.06);
}

.group__venue {
  align-self: start;
  font-size: 1.5rem;
  font-weight: 800;
  font-style: italic;
  text-transform: uppercase;
  line-height: 1.05;
}

.group__venue span { color: var(--hs-gold-2); }
.group__venue:hover { color: var(--hs-gold-2); }

.group__items { list-style: none; padding: 0; display: flex; flex-direction: column; }

.item {
  display: grid;
  grid-template-columns: 150px minmax(0, 1fr) auto;
  gap: 16px;
  align-items: baseline;
  padding: 12px 0;
  border-top: 1px solid var(--hs-line);
}

.item:first-child { border-top: none; padding-top: 0; }
.item__time { font-size: 0.8rem; font-weight: 700; color: var(--hs-gold-2); letter-spacing: 0.04em; text-transform: uppercase; }
.item__main { display: flex; flex-direction: column; gap: 2px; }
.item__title { font-weight: 700; }
.item__desc { font-size: 0.82rem; color: var(--hs-muted); }
.item__tags { display: flex; gap: 6px; flex-wrap: wrap; justify-content: flex-end; }

.special { margin-top: var(--hs-gap); display: flex; flex-direction: column; gap: 16px; }
.special__list { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 8px; }

.special__item {
  display: grid;
  grid-template-columns: 200px 1fr auto;
  gap: 16px;
  padding: 16px 20px;
  background: rgba(239, 227, 179, 0.06);
  border-left: 4px solid var(--hs-gold);
}

.special__item--photo { grid-template-columns: 120px 200px 1fr auto; align-items: center; }
.special__photo { width: 120px; aspect-ratio: 4 / 3; }

.special__date { font-size: 0.8rem; font-weight: 700; color: var(--hs-gold-2); text-transform: uppercase; }
.special__title { font-weight: 700; }

@media (max-width: 760px) {
  .daytabs { grid-template-columns: repeat(7, minmax(44px, 1fr)); overflow-x: auto; }
  .daytabs__short { font-size: 0.9rem; }
  /* not enough room for the word on phones: a dot marks tonight */
  .daytabs__tonight { font-size: 0; width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
  .group { grid-template-columns: 1fr; gap: 12px; }
  .item { grid-template-columns: 1fr; gap: 4px; }
  .item__tags { justify-content: flex-start; }
  .special__item { grid-template-columns: 1fr; gap: 4px; }
  .special__photo { width: 100%; aspect-ratio: 16 / 9; }
}
</style>
