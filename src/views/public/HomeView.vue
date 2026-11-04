<template>
  <div class="home">
    <!-- ============ HERO ============ -->
    <section class="hero" aria-labelledby="hero-title">
      <div class="hero__media">
        <img v-if="heroImage" :src="heroImage" alt="" class="hero__img" fetchpriority="high" @error="heroFailed = true" />
      </div>

      <div class="hero__title-panel">
        <h1 id="hero-title" class="hs-display hero__title">{{ site.siteName }}</h1>
        <p v-if="site.tagline" class="hero__chip">{{ site.tagline }}</p>
      </div>

      <!-- Tonight: built live from the weekly line-ups -->
      <aside class="hero__tonight" aria-labelledby="tonight-title">
        <h2 id="tonight-title" class="hero__tonight-title">Tonight<span>{{ DAY_NAMES[nightDay] }}</span></h2>
        <div v-if="site.loading.weekly && !site.loaded.weekly" class="hero__tonight-list">
          <div v-for="n in 3" :key="n" class="hs-skel" style="height: 46px" />
        </div>
        <ul v-else-if="tonight.length" class="hero__tonight-list">
          <li v-for="e in tonight.slice(0, 5)" :key="e.id">
            <router-link :to="venueLink(e)" class="hero__tonight-item">
              <span class="hero__tonight-name">{{ e.title }}</span>
              <span class="hero__tonight-meta">{{ e.branch_name }}<template v-if="timeRange(e)"> | {{ timeRange(e) }}</template></span>
            </router-link>
          </li>
        </ul>
        <p v-else class="hs-muted hero__tonight-empty">No line-up listed for tonight. All venues are open as usual.</p>
        <router-link to="/whats-on" class="hero__tonight-more">
          {{ tonight.length > 5 ? `+${tonight.length - 5} more tonight` : 'Full weekly line-up' }} ›
        </router-link>
      </aside>
    </section>

    <!-- ============ ON THIS WEEK ============ -->
    <section class="hs-section week" aria-labelledby="week-title">
      <div class="hs-wrap week__inner">
        <div class="week__copy">
          <h2 id="week-title" class="hs-kicker">On this week</h2>
          <p class="hs-lede">DJs, live bands and karaoke across every Honeysuckle. Pick your night and your branch.</p>
          <div class="week__arrows">
            <button type="button" class="hs-arrow-btn" :disabled="!canPrev" aria-label="Previous" @click="scrollWeek(-1)">‹</button>
            <button type="button" class="hs-arrow-btn" :disabled="!canNext" aria-label="Next" @click="scrollWeek(1)">›</button>
          </div>
        </div>

        <div v-if="site.loading.weekly && !site.loaded.weekly" class="week__track">
          <div v-for="n in 3" :key="n" class="hs-skel week__card" />
        </div>
        <div v-else-if="site.errors.weekly" class="hs-state">
          <strong>The line-up could not be loaded.</strong>
          <button type="button" class="hs-btn hs-btn--ghost" @click="site.retry('weekly')">Try again</button>
        </div>
        <div v-else-if="weekCards.length" ref="track" class="week__track" @scroll="updateArrows">
          <router-link
            v-for="(c, i) in weekCards"
            :key="`${c.event.id}-${c.offset}`"
            :to="venueLink(c.event)"
            class="week__card"
            :class="{ 'week__card--now': i === 0 }"
          >
            <span class="week__badge">{{ c.event.badge || c.event.branch_name }}</span>
            <span class="week__title">{{ c.event.title }}</span>
            <span class="week__venue">{{ c.event.branch_name }}<template v-if="c.event.area"> | {{ c.event.area }}</template></span>
            <span class="week__when">
              <span>{{ c.offset === 0 ? 'Tonight' : `${DAY_SHORT[c.day]} ${c.date.getDate()} ${MONTHS[c.date.getMonth()]}` }}</span>
              <span>{{ c.event.time_local ? clock(c.event.time_local) : '' }}</span>
            </span>
          </router-link>
        </div>
        <div v-else class="hs-state">
          <strong>The weekly line-up is being updated.</strong>
          <span>Follow us on Instagram for this week's nights.</span>
        </div>
      </div>
    </section>

    <!-- ============ OUR VENUES (gold block) ============ -->
    <section class="hs-section" aria-labelledby="venues-title">
      <div class="venues">
        <div class="venues__copy">
          <h2 id="venues-title" class="venues__title">
            <span class="venues__outline">Our</span>
            <span>Venues</span>
          </h2>
          <p>{{ site.venues.length ? `${site.venues.length} places across Accra.` : 'Across Accra.' }} Same Honeysuckle welcome at every one.</p>
          <router-link to="/branches" class="hs-btn hs-btn--cream venues__cta">Find a branch</router-link>
        </div>
        <div class="venues__track">
          <template v-if="site.venues.length">
            <router-link
              v-for="b in site.venues"
              :key="b.id"
              :to="venueLinkFor(b)"
              class="venues__card"
            >
              <VenuePhoto :src="site.coverFor(b)" :alt="b.name" class="venues__photo" />
              <span class="venues__name">{{ b.name }}</span>
            </router-link>
          </template>
          <template v-else>
            <div v-for="n in 3" :key="n" class="venues__card hs-skel" />
          </template>
        </div>
      </div>
    </section>

    <!-- ============ FIND YOUR LOCAL (list with tabs) ============ -->
    <section class="hs-section" aria-labelledby="local-title">
      <div class="hs-wrap local">
        <div class="local__copy">
          <h2 id="local-title" class="hs-kicker">Find your local</h2>
          <p class="hs-lede">Sports bars, pubs and lounges, each with its own nights. Choose a venue to see its line-up, photos and contacts.</p>
        </div>
        <div class="local__list">
          <div class="local__tabs" role="tablist" aria-label="Venue type">
            <button
              v-for="t in tabs"
              :key="t.key"
              type="button"
              role="tab"
              :aria-selected="tab === t.key"
              class="local__tab"
              :class="{ 'is-active': tab === t.key }"
              @click="tab = t.key"
            >{{ t.label }}</button>
          </div>
          <ul class="local__rows">
            <li v-for="b in tabVenues" :key="b.id">
              <router-link :to="venueLinkFor(b)" class="local__row">
                <span class="local__name">{{ b.name }}</span>
                <span class="local__addr">{{ b.address || 'Accra' }}</span>
                <span class="local__go" aria-hidden="true">›</span>
              </router-link>
            </li>
            <li v-if="site.loaded.branches && !tabVenues.length" class="hs-muted local__none">No venues in this list yet.</li>
          </ul>
        </div>
      </div>
    </section>

    <!-- ============ WHAT'S ON ============ -->
    <!-- ============ GALLERY (Admin → Media; starred photos first) ============ -->
    <section v-if="site.galleryPhotos.length" class="hs-section" aria-labelledby="gallery-title">
      <div class="hs-wrap">
        <h2 id="gallery-title" class="hs-kicker gal__heading">Inside Honeysuckle</h2>
        <ul class="gal" :class="`gal--${Math.min(site.galleryPhotos.length, 5)}`">
          <li v-for="(p, i) in site.galleryPhotos" :key="p.id" class="gal__item" :class="{ 'gal__item--big': i === 0 }">
            <button type="button" class="gal__btn" :aria-label="`Open photo${p.title ? ': ' + p.title : ''}`" @click="openPhoto(i)">
              <VenuePhoto :src="p.thumbnail_url || p.file_url" :alt="p.title || p.branch_name || 'The Honeysuckle Pub'" />
              <span v-if="p.branch_name" class="gal__tag">{{ p.branch_name }}</span>
            </button>
          </li>
        </ul>
      </div>
    </section>

    <div v-if="photoIndex !== null" class="lightbox" role="dialog" aria-modal="true" aria-label="Photo" @click.self="photoIndex = null">
      <button type="button" class="lightbox__btn lightbox__close" aria-label="Close" @click="photoIndex = null">×</button>
      <button v-if="site.galleryPhotos.length > 1" type="button" class="lightbox__btn lightbox__prev" aria-label="Previous photo" @click="stepPhoto(-1)">‹</button>
      <img :src="imgUrl(site.galleryPhotos[photoIndex].file_url)" :alt="site.galleryPhotos[photoIndex].title || 'The Honeysuckle Pub'" class="lightbox__img" />
      <button v-if="site.galleryPhotos.length > 1" type="button" class="lightbox__btn lightbox__next" aria-label="Next photo" @click="stepPhoto(1)">›</button>
    </div>

    <section class="hs-section" aria-labelledby="wo-title">
      <div class="hs-wrap">
        <h2 id="wo-title" class="hs-kicker wo__heading">What's on</h2>
        <div class="wo">
          <router-link v-for="c in whatsOn" :key="c.to" :to="c.to" class="wo__card">
            <VenuePhoto :src="c.image" :alt="c.title" class="wo__photo" />
            <p class="wo__text">{{ c.text }}</p>
            <h3 class="hs-h3 wo__title">{{ c.title }}</h3>
          </router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import VenuePhoto from '@/components/site/VenuePhoto.vue'
import { imgUrl } from '@/utils/img'
import { useSiteStore, DAY_NAMES, DAY_SHORT, clock, timeRange } from '@/stores/site.store'
import { useTonight } from '@/composables/useTonight'

const site = useSiteStore()
const { nightDay, nextSeven } = useTonight()
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// Hero: Admin → Media → Website photos → Home page; else the first starred
// photo in Admin → Media; until there is one, the image the old site used.
const HERO_FALLBACK = 'https://images.unsplash.com/photo-1574096079513-d8259312b785?w=1800&q=80'
const heroFailed = ref(false)
const heroImage = computed(() => {
  if (heroFailed.value) return '' // plain branded backdrop
  return imgUrl(site.pageImage('home_hero') || site.featuredPhotos[0]?.file_url || HERO_FALLBACK)
})

const tonight = computed(() => site.onDay(nightDay.value))

// Next seven nights, one card per line-up entry
const weekCards = computed(() =>
  nextSeven.value.flatMap(n => site.onDay(n.day).map(event => ({ ...n, event }))).slice(0, 24),
)

const venueLinkFor = (b) => (b.slug === 'bar-x' ? '/bar-x' : `/branches/${b.slug}`)
const venueLink = (e) => (e.branch_slug === 'bar-x' ? '/bar-x' : e.branch_slug ? `/branches/${e.branch_slug}` : '/whats-on')

// Carousel arrows
const track = ref(null)
const canPrev = ref(false)
const canNext = ref(false)
function updateArrows() {
  const el = track.value
  if (!el) return
  canPrev.value = el.scrollLeft > 4
  canNext.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 4
}
function scrollWeek(dir) {
  const el = track.value
  if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' })
}
watch(weekCards, async () => { await nextTick(); updateArrows() })

// Venue list tabs
const tab = ref('pub')
const tabs = computed(() => [
  { key: 'pub', label: 'Pubs' },
  ...(site.bars.length ? [{ key: 'bar', label: 'Bars & lounges' }] : []),
])
const tabVenues = computed(() => (tab.value === 'pub' ? site.pubs : site.bars))

const barX = computed(() => site.branchBySlug('bar-x'))
const whatsOn = computed(() => [
  {
    to: '/whats-on',
    title: 'Weekly line-ups',
    text: 'Every DJ, band and karaoke night at every branch, day by day.',
    image: site.pageImage('whats_on') || site.featuredPhotos[1]?.file_url || '',
  },
  {
    to: '/menu',
    title: 'Food & drinks',
    text: 'Our current food and drinks menus, ready to view or download.',
    image: site.pageImage('menu') || site.featuredPhotos[2]?.file_url || '',
  },
  {
    to: '/bar-x',
    title: 'Bar-X',
    text: barX.value?.tagline || 'Line-ups, photos and contacts for Bar-X.',
    image: site.coverFor(barX.value),
  },
])

// Gallery lightbox
const photoIndex = ref(null)
const openPhoto = (i) => { photoIndex.value = i }
const stepPhoto = (d) => {
  const n = site.galleryPhotos.length
  photoIndex.value = (photoIndex.value + d + n) % n
}
const onKey = (e) => {
  if (photoIndex.value === null) return
  if (e.key === 'Escape') photoIndex.value = null
  if (e.key === 'ArrowRight') stepPhoto(1)
  if (e.key === 'ArrowLeft') stepPhoto(-1)
}

onMounted(() => {
  site.loadWeekly()
  site.loadMedia()
  window.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<style scoped>
/* ---------- Gallery ---------- */
.gal__heading { margin-bottom: 20px; }

.gal {
  list-style: none;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  grid-auto-rows: clamp(140px, 17vw, 230px);
  gap: 10px;
}

.gal--1 { grid-template-columns: 1fr; grid-auto-rows: clamp(220px, 40vw, 460px); }
.gal--2 { grid-template-columns: repeat(2, minmax(0, 1fr)); grid-auto-rows: clamp(200px, 28vw, 360px); }
.gal__item--big { grid-column: span 2; grid-row: span 2; }
.gal--1 .gal__item--big, .gal--2 .gal__item--big { grid-column: auto; grid-row: auto; }

.gal__btn { position: relative; display: block; width: 100%; height: 100%; padding: 0; border: none; background: none; cursor: zoom-in; }
.gal__btn .hs-photo { width: 100%; height: 100%; }
.gal__btn:hover .hs-photo { filter: brightness(1.08); }

.gal__tag {
  position: absolute;
  left: 0;
  bottom: 12px;
  padding: 6px 14px 6px 12px;
  background: var(--hs-gold);
  color: var(--hs-on-gold);
  font-size: 0.72rem;
  font-weight: 800;
  font-style: italic;
  text-transform: uppercase;
  clip-path: polygon(0 0, 100% 0, 92% 100%, 0 100%);
}

.lightbox {
  position: fixed;
  inset: 0;
  z-index: 80;
  background: rgba(5, 5, 4, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 70px;
}

.lightbox__img { max-width: 100%; max-height: 100%; object-fit: contain; }

.lightbox__btn {
  position: absolute;
  width: 48px;
  height: 48px;
  border: none;
  background: rgba(239, 227, 179, 0.12);
  font-size: 28px;
  line-height: 1;
}

.lightbox__btn:hover { background: var(--hs-gold); color: var(--hs-on-gold); }
.lightbox__close { top: 16px; right: 16px; }
.lightbox__prev { left: 12px; top: 50%; transform: translateY(-50%); }
.lightbox__next { right: 12px; top: 50%; transform: translateY(-50%); }

@media (max-width: 760px) {
  .gal { grid-template-columns: repeat(2, minmax(0, 1fr)); grid-auto-rows: 42vw; }
  .gal--1 { grid-template-columns: 1fr; grid-auto-rows: 62vw; }
  .gal__item--big { grid-column: span 2; grid-row: span 1; }
  .lightbox { padding: 60px 12px; }
}

/* ---------- Hero ---------- */
.hero {
  position: relative;
  max-width: calc(var(--hs-wrap) + 80px);
  margin: -28px auto 0;
  padding: 0 clamp(0px, 2vw, 20px);
  min-height: clamp(520px, 78vh, 760px);
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(280px, 380px);
  align-items: end;
}

.hero__media {
  position: absolute;
  inset: 0 clamp(0px, 2vw, 20px);
  overflow: hidden;
  background:
    repeating-linear-gradient(-60deg, rgba(201, 168, 59, 0.07) 0 18px, transparent 18px 36px),
    radial-gradient(800px 500px at 70% 30%, rgba(201, 168, 59, 0.22), transparent 70%),
    var(--hs-panel-solid);
}

.hero__img { width: 100%; height: 100%; object-fit: cover; }
.hero__media::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(11,10,7,0.15) 0%, rgba(11,10,7,0) 40%, rgba(11,10,7,0.55) 100%);
}

.hero__title-panel {
  position: relative;
  align-self: end;
  margin-bottom: clamp(32px, 6vw, 72px);
  padding: clamp(22px, 3vw, 34px) clamp(28px, 5vw, 64px) clamp(22px, 3vw, 34px) clamp(20px, 4vw, 48px);
  background: linear-gradient(110deg, var(--hs-gold-2), var(--hs-gold));
  color: var(--hs-on-gold);
  clip-path: polygon(0 0, 100% 0, 94% 100%, 0 100%);
  max-width: 760px;
}

.hero__title { line-height: 0.92; }

.hero__chip {
  display: inline-block;
  margin-top: 14px;
  padding: 8px 22px 8px 16px;
  background: var(--hs-ink);
  color: var(--hs-cream);
  font-size: clamp(0.85rem, 1.6vw, 1.1rem);
  font-weight: 800;
  font-style: italic;
  text-transform: uppercase;
  clip-path: polygon(4% 0, 100% 0, 96% 100%, 0 100%);
}

.hero__tonight {
  position: relative;
  align-self: stretch;
  margin-top: clamp(140px, 22vh, 220px);
  padding: 28px 28px 24px 44px;
  background: linear-gradient(180deg, rgba(27, 24, 16, 0.92), rgba(11, 10, 7, 0.96));
  clip-path: polygon(10% 0, 100% 0, 100% 100%, 0 100%);
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.hero__tonight-title {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  font-size: 1.5rem;
  font-weight: 800;
  font-style: italic;
  text-transform: uppercase;
}

.hero__tonight-title span { font-size: 0.75rem; font-style: normal; color: var(--hs-gold-2); letter-spacing: 0.08em; }

.hero__tonight-list { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 8px; }

.hero__tonight-item {
  display: flex;
  flex-direction: column;
  padding: 10px 0;
  border-bottom: 1px solid var(--hs-line);
}

.hero__tonight-name { font-weight: 700; font-size: 0.95rem; line-height: 1.3; }
.hero__tonight-meta { font-size: 0.75rem; color: var(--hs-muted); }
.hero__tonight-item:hover .hero__tonight-name { color: var(--hs-gold-2); }
.hero__tonight-empty { font-size: 0.85rem; }
.hero__tonight-more { margin-top: auto; font-size: 0.8rem; font-weight: 700; color: var(--hs-gold-2); text-transform: uppercase; letter-spacing: 0.05em; }

/* ---------- This week ---------- */
.week__inner {
  display: grid;
  grid-template-columns: minmax(220px, 300px) minmax(0, 1fr);
  gap: clamp(24px, 4vw, 48px);
  align-items: center;
}

.week__inner > * { min-width: 0; }
.week__copy { display: flex; flex-direction: column; gap: 14px; }
.week__arrows { display: flex; gap: 10px; margin-top: 6px; }

.week__track {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(230px, 260px);
  gap: 16px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  padding-bottom: 6px;
  scrollbar-width: none;
}

.week__track::-webkit-scrollbar { display: none; }

.week__card {
  scroll-snap-align: start;
  min-height: 230px;
  padding: 20px 22px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: rgba(239, 227, 179, 0.07);
  border-left: 4px solid var(--hs-gold);
  transition: background-color 0.2s ease;
}

.week__card:hover { background: rgba(239, 227, 179, 0.12); }

.week__card--now {
  background: linear-gradient(140deg, var(--hs-gold-2), var(--hs-gold));
  color: var(--hs-on-gold);
  border-left-color: transparent;
}

.week__card--now:hover { background: var(--hs-gold-2); }

.week__badge { font-size: 0.72rem; opacity: 0.8; }

.week__title {
  font-size: 1.45rem;
  font-weight: 800;
  font-style: italic;
  text-transform: uppercase;
  line-height: 1.02;
}

.week__venue { font-size: 0.78rem; opacity: 0.85; }

.week__when {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  gap: 8px;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

/* ---------- Our venues ---------- */
.venues {
  display: grid;
  grid-template-columns: minmax(260px, 0.8fr) minmax(0, 1.6fr);
  background: linear-gradient(115deg, var(--hs-gold-2), var(--hs-gold) 70%, #A88A2A);
  color: var(--hs-on-gold);
  overflow: hidden;
}

.venues__copy {
  padding: clamp(32px, 5vw, 64px) clamp(24px, 4vw, 48px);
  display: flex;
  flex-direction: column;
  gap: 16px;
  justify-content: center;
}

.venues__title {
  display: flex;
  flex-direction: column;
  font-size: clamp(3rem, 7vw, 5.6rem);
  font-weight: 800;
  font-style: italic;
  text-transform: uppercase;
  line-height: 0.9;
}

.venues__outline { color: transparent; -webkit-text-stroke: 2px var(--hs-on-gold); }
.venues__cta { align-self: flex-start; }

.venues__track {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(220px, 260px);
  gap: 12px;
  overflow-x: auto;
  padding: 28px 28px 28px 0;
  scroll-snap-type: x mandatory;
  scrollbar-width: thin;
}

.venues__card {
  position: relative;
  min-height: 340px;
  scroll-snap-align: start;
  clip-path: polygon(12% 0, 100% 0, 88% 100%, 0 100%);
  overflow: hidden;
}

.venues__photo { position: absolute; inset: 0; transition: transform 0.5s ease; }
.venues__card:hover .venues__photo { transform: scale(1.04); }

.venues__name {
  position: absolute;
  left: 18%;
  right: 14%;
  bottom: 18px;
  padding: 8px 12px;
  background: rgba(11, 10, 7, 0.82);
  color: var(--hs-text);
  font-weight: 800;
  font-style: italic;
  text-transform: uppercase;
  font-size: 1.05rem;
  line-height: 1.1;
}

/* ---------- Find your local ---------- */
.local {
  display: grid;
  grid-template-columns: minmax(220px, 360px) minmax(0, 1fr);
  gap: clamp(24px, 5vw, 64px);
  align-items: start;
}

.local__copy { display: flex; flex-direction: column; gap: 14px; }

.local__tabs { display: flex; gap: 2px; }

.local__tab {
  padding: 12px 22px;
  border: none;
  background: rgba(239, 227, 179, 0.06);
  font-size: 0.85rem;
  font-weight: 600;
}

.local__tab.is-active { background: rgba(239, 227, 179, 0.16); color: var(--hs-gold-2); }

.local__rows { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 6px; margin-top: 6px; }

.local__row {
  display: grid;
  grid-template-columns: minmax(140px, 0.9fr) 1.2fr auto;
  align-items: center;
  gap: 16px;
  padding: 18px 22px;
  background: rgba(239, 227, 179, 0.07);
  transition: background-color 0.2s ease;
}

.local__row:hover { background: rgba(239, 227, 179, 0.14); }

.local__name { font-size: 1.15rem; font-weight: 800; font-style: italic; text-transform: uppercase; }
.local__addr { font-size: 0.75rem; color: var(--hs-muted); text-transform: uppercase; letter-spacing: 0.04em; }
.local__go { font-size: 1.5rem; font-weight: 700; }
.local__none { padding: 18px 0; }

/* ---------- What's on ---------- */
.wo__heading { margin-bottom: 24px; }

.wo {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 22px;
}

.wo__card { display: flex; flex-direction: column; gap: 12px; }
.wo__photo { aspect-ratio: 16 / 9; }
.wo__photo :deep(img) { transition: transform 0.5s ease; }
.wo__card:hover .wo__photo :deep(img) { transform: scale(1.04); }
.wo__text { font-size: 0.88rem; color: var(--hs-muted); }
.wo__card:hover .wo__title { color: var(--hs-gold-2); }

/* ---------- Responsive ---------- */
@media (max-width: 960px) {
  .hero { grid-template-columns: minmax(0, 1fr); min-height: 0; padding: 0; margin-top: -10px; }
  .hero__media, .hero__title-panel, .hero__tonight { grid-column: 1; }
  .hero__media { position: relative; inset: auto; grid-row: 1; height: 56vh; min-height: 340px; }
  .hero__title-panel { grid-row: 1; align-self: end; margin: 0 0 24px; max-width: 94%; min-width: 0; }
  .hero__title { font-size: clamp(1.9rem, 9vw, 3.2rem); overflow-wrap: anywhere; }
  .hero__tonight { grid-row: 2; margin: 0; clip-path: none; padding: 24px var(--hs-gutter); }
  .week__inner, .local { grid-template-columns: 1fr; }
  .venues { grid-template-columns: 1fr; }
  .venues__track { padding: 0 20px 28px; }
  .wo { grid-template-columns: 1fr; }
}

@media (max-width: 560px) {
  .local__row { grid-template-columns: 1fr auto; }
  .local__addr { grid-column: 1; grid-row: 2; }
  .local__go { grid-row: 1 / span 2; grid-column: 2; }
}
</style>
