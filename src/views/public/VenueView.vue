<template>
  <div>
    <!-- Loading -->
    <div v-if="!branch && !site.loaded.branches" class="hs-wrap venue-loading">
      <div class="hs-skel" style="height: 60vh" />
    </div>

    <!-- Not found -->
    <div v-else-if="!branch" class="hs-wrap venue-loading">
      <div class="hs-state">
        <strong>{{ site.errors.branches ? 'This venue could not be loaded.' : 'We could not find that venue.' }}</strong>
        <router-link to="/branches" class="hs-btn hs-btn--gold">See all branches</router-link>
      </div>
    </div>

    <template v-else>
      <!-- ============ HERO ============ -->
      <section class="vhero" :aria-label="branch.name">
        <VenuePhoto :src="cover" :alt="branch.name" eager class="vhero__photo" />
        <div class="vhero__panel">
          <p class="vhero__type">{{ branch.eyebrow || typeLabel }}</p>
          <h1 class="hs-display vhero__name">{{ branch.name }}</h1>
          <p v-if="branch.tagline" class="vhero__tagline">{{ branch.tagline }}</p>
          <nav class="vhero__browse" aria-label="On this page">
            <a v-if="features.length || storyText.length" href="#experience">Experience</a>
            <a href="#this-week">This week</a>
            <a v-if="signatures.length" href="#signatures">{{ signaturesShort }}</a>
            <a v-if="photos.length" href="#gallery">Gallery</a>
            <a href="#menus">Menus</a>
            <a href="#visit-venue">Visit</a>
          </nav>
        </div>
      </section>

      <!-- ============ STATS (Admin → Branches → Page sections) ============ -->
      <section v-if="stats.length" class="stats" aria-label="At a glance">
        <ul class="hs-wrap stats__list">
          <li v-for="(st, i) in stats" :key="i" class="stats__item">
            <span class="stats__value">{{ st.value }}</span>
            <span class="stats__label">{{ st.label }}</span>
          </li>
        </ul>
      </section>

      <!-- ============ ABOUT ============ -->
      <section v-if="about.length" class="hs-section">
        <div class="hs-wrap about" :class="{ 'about--solo': !aboutPhoto }">
          <div class="about__copy">
            <h2 class="hs-h2">{{ branch.tagline || `About ${branch.name}` }}</h2>
            <p v-for="(p, i) in about" :key="i">{{ p }}</p>
          </div>
          <VenuePhoto v-if="aboutPhoto" :src="aboutPhoto" :alt="branch.name" class="about__photo" />
        </div>
      </section>

      <!-- ============ STORY + FEATURES ============ -->
      <section v-if="storyText.length || features.length" id="experience" class="hs-section">
        <div class="hs-wrap">
          <div v-if="storyText.length" class="story">
            <p class="hs-kicker">Our story</p>
            <h2 class="hs-h2 story__title">{{ branch.story_title || `The ${branch.name} story` }}</h2>
            <div class="story__copy">
              <p v-for="(p, i) in storyText" :key="i">{{ p }}</p>
            </div>
          </div>

          <template v-if="features.length">
            <h2 class="hs-h2 section-title" :class="{ 'features__head--after': storyText.length }">The {{ branch.name }} experience</h2>
            <ul class="features">
              <li v-for="(f, i) in features" :key="i" class="feature">
                <span class="feature__num" aria-hidden="true">{{ String(i + 1).padStart(2, '0') }}</span>
                <h3 class="feature__title">{{ f.title }}</h3>
                <p v-if="f.text" class="feature__text">{{ f.text }}</p>
              </li>
            </ul>
          </template>
        </div>
      </section>

      <!-- ============ SIGNATURES (e.g. cocktails) ============ -->
      <section v-if="signatures.length" id="signatures" class="hs-section sigs">
        <div class="hs-wrap">
          <h2 class="hs-h2 section-title">{{ branch.signatures_title || 'Signatures' }}</h2>
          <ul class="sigs__list">
            <li v-for="(d, i) in signatures" :key="i" class="sig">
              <span class="sig__name">{{ d.name }}</span>
              <span v-if="d.price" class="sig__price">{{ priceLabel(d.price) }}</span>
              <span v-if="d.text" class="sig__text">{{ d.text }}</span>
            </li>
          </ul>
        </div>
      </section>

      <!-- ============ THIS WEEK ============ -->
      <section id="this-week" class="hs-section">
        <div class="hs-wrap">
          <h2 class="hs-h2 section-title">What's on this week</h2>

          <div v-if="site.loading.weekly && !site.loaded.weekly" class="days">
            <div v-for="n in 4" :key="n" class="hs-skel" style="height: 120px" />
          </div>
          <div v-else-if="site.errors.weekly" class="hs-state">
            <strong>The line-up could not be loaded.</strong>
            <button type="button" class="hs-btn hs-btn--ghost" @click="site.retry('weekly')">Try again</button>
          </div>
          <div v-else-if="lineup.length" class="days">
            <article v-for="d in days" :key="d.day" class="day" :class="{ 'day--tonight': d.day === nightDay, 'day--quiet': !d.items.length }">
              <h3 class="day__name">
                {{ DAY_NAMES[d.day] }}
                <span v-if="d.day === nightDay" class="hs-pill hs-pill--gold">Tonight</span>
              </h3>
              <ul v-if="d.items.length" class="day__items">
                <li v-for="e in d.items" :key="e.id" class="day__item">
                  <span class="day__time">{{ timeRange(e) || 'Times TBC' }}</span>
                  <span class="day__title">{{ e.title }}</span>
                  <span v-if="e.description" class="day__desc">{{ e.description }}</span>
                  <span class="day__tags">
                    <span v-if="e.badge" class="hs-pill">{{ e.badge }}</span>
                    <span v-if="e.area" class="hs-pill">{{ e.area }}</span>
                  </span>
                </li>
              </ul>
              <p v-else class="hs-muted day__none">Open as usual</p>
            </article>
          </div>
          <div v-else class="hs-state">
            <strong>The line-up for {{ branch.name }} is being updated.</strong>
            <span v-if="site.instagram">Follow <a :href="site.instagram" target="_blank" rel="noopener" class="link">{{ site.instagramHandle || 'us on Instagram' }}</a> for this week's nights.</span>
          </div>
        </div>
      </section>

      <!-- ============ GALLERY ============ -->
      <section v-if="photos.length" id="gallery" class="hs-section">
        <div class="hs-wrap">
          <h2 class="hs-h2 section-title">Gallery</h2>
          <ul class="gallery">
            <li v-for="(p, i) in photos" :key="p.id">
              <button type="button" class="gallery__item" :aria-label="`Open photo ${i + 1}`" @click="lightbox = i">
                <VenuePhoto :src="p.thumbnail_url || p.file_url" :alt="p.title || branch.name" />
              </button>
            </li>
          </ul>
        </div>
      </section>

      <!-- ============ MENUS ============ -->
      <section id="menus" class="hs-section">
        <div class="hs-wrap menus">
          <div>
            <h2 class="hs-h2">Menus at {{ branch.name }}</h2>
            <p class="hs-muted">Our food and drinks menus, up to date and ready to view.</p>
          </div>
          <div class="menus__links">
            <router-link v-for="m in site.menuPdfs" :key="m.id" :to="{ path: '/menu', query: { m: m.id } }" class="hs-btn hs-btn--gold">
              {{ m.title }}
            </router-link>
            <router-link v-if="!site.menuPdfs.length" to="/menu" class="hs-btn hs-btn--gold">See the menu</router-link>
          </div>
        </div>
      </section>

      <!-- ============ VISIT ============ -->
      <section id="visit-venue" class="hs-section">
        <div class="hs-wrap visit">
          <div v-if="phones.length" class="visit__block">
            <h2 class="visit__title">Telephone</h2>
            <a v-for="p in phones" :key="p" :href="`tel:${p.replace(/\s/g, '')}`" class="visit__big">{{ p }}</a>
          </div>
          <div v-if="branch.address" class="visit__block">
            <h2 class="visit__title">Find us</h2>
            <p class="visit__big">{{ branch.address }}</p>
            <a :href="mapHref" target="_blank" rel="noopener" class="link">Get directions ›</a>
          </div>
          <div v-if="hours.length" class="visit__block">
            <h2 class="visit__title">Opening hours</h2>
            <p v-for="h in hours" :key="h">{{ h }}</p>
          </div>
          <div v-if="branch.established_year" class="visit__block">
            <h2 class="visit__title">Since</h2>
            <p class="visit__big">{{ branch.established_year }}</p>
          </div>
        </div>
      </section>

      <!-- ============ OTHER VENUES ============ -->
      <section v-if="others.length" class="hs-section">
        <div class="hs-wrap">
          <h2 class="hs-kicker others__title">More Honeysuckle</h2>
          <ul class="others">
            <li v-for="b in others" :key="b.id">
              <router-link :to="b.slug === 'bar-x' ? '/bar-x' : `/branches/${b.slug}`" class="others__item">{{ b.name }} <span>›</span></router-link>
            </li>
          </ul>
        </div>
      </section>

      <!-- Lightbox -->
      <div v-if="lightbox !== null" class="lightbox" role="dialog" aria-modal="true" :aria-label="`${branch.name} photo`" @click.self="lightbox = null">
        <button type="button" class="lightbox__btn lightbox__close" aria-label="Close" @click="lightbox = null">×</button>
        <button v-if="photos.length > 1" type="button" class="lightbox__btn lightbox__prev" aria-label="Previous photo" @click="step(-1)">‹</button>
        <img :src="photos[lightbox].file_url" :alt="photos[lightbox].title || branch.name" class="lightbox__img" />
        <button v-if="photos.length > 1" type="button" class="lightbox__btn lightbox__next" aria-label="Next photo" @click="step(1)">›</button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute } from 'vue-router'
import VenuePhoto from '@/components/site/VenuePhoto.vue'
import { useSiteStore, DAY_NAMES, WEEK_ORDER, timeRange, paragraphs, lines } from '@/stores/site.store'
import { useTonight } from '@/composables/useTonight'

// Used for /branches/:slug and for /bar-x (slugOverride)
const props = defineProps({ slugOverride: { type: String, default: '' } })

const route = useRoute()
const site = useSiteStore()
const { nightDay } = useTonight()

const slug = computed(() => props.slugOverride || route.params.slug)
const branch = computed(() => site.branchBySlug(slug.value))

const photos = computed(() => (branch.value ? site.photosFor(branch.value.id) : []))
const cover = computed(() => site.coverFor(branch.value))
const aboutPhoto = computed(() => photos.value.find(p => p.file_url !== cover.value)?.file_url || '')
const about = computed(() => paragraphs(branch.value?.description))
const hours = computed(() => lines(branch.value?.opening_hours))
const phones = computed(() => [branch.value?.phone_primary, branch.value?.phone_secondary].filter(Boolean))
const typeLabel = computed(() => ({ pub: 'Honeysuckle pub', bar: 'Honeysuckle bar & lounge', restaurant: 'Honeysuckle restaurant' }[branch.value?.venue_type] || 'Honeysuckle'))
const mapHref = computed(() => branch.value?.map_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Honeysuckle ${branch.value?.name} ${branch.value?.address || ''} Accra`)}`)

const lineup = computed(() => (branch.value ? site.weeklyFor(branch.value.id) : []))
const days = computed(() => WEEK_ORDER.map(day => ({ day, items: site.onDay(day, lineup.value) })))

// Optional page sections
const stats = computed(() => (branch.value?.stats || []).filter(x => x.value || x.label))
const features = computed(() => (branch.value?.features || []).filter(x => x.title))
const signatures = computed(() => (branch.value?.signatures || []).filter(x => x.name))
const storyText = computed(() => paragraphs(branch.value?.story))
const signaturesShort = computed(() => (branch.value?.signatures_title || 'Signatures').split(' ').slice(-1)[0])
// "85" → "GHS 85"; anything already written with a currency is shown as typed
const priceLabel = (p) => (/^\d+([.,]\d+)?$/.test(String(p).trim()) ? `GHS ${String(p).trim()}` : p)

const others = computed(() => site.venues.filter(b => b.id !== branch.value?.id))

// Lightbox
const lightbox = ref(null)
const step = (d) => { lightbox.value = (lightbox.value + d + photos.value.length) % photos.value.length }
const onKey = (e) => {
  if (lightbox.value === null) return
  if (e.key === 'Escape') lightbox.value = null
  if (e.key === 'ArrowRight') step(1)
  if (e.key === 'ArrowLeft') step(-1)
}

watch(branch, (b) => { if (b) document.title = `${b.name} | The Honeysuckle Pub` }, { immediate: true })

onMounted(() => {
  site.loadBranches()
  site.loadWeekly()
  site.loadMedia()
  site.loadMenu()
  window.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<style scoped>
.venue-loading { padding-top: 48px; }

/* ---------- Hero ---------- */
.vhero {
  position: relative;
  max-width: calc(var(--hs-wrap) + 80px);
  margin: -28px auto 0;
  padding: 0 clamp(0px, 2vw, 20px);
  min-height: clamp(460px, 72vh, 700px);
  display: flex;
  align-items: flex-end;
}

.vhero__photo { position: absolute; inset: 0 clamp(0px, 2vw, 20px); }

.vhero__panel {
  position: relative;
  margin: 0 0 clamp(24px, 5vw, 56px) clamp(0px, 3vw, 32px);
  width: min(560px, 100%);
  padding: 30px 48px 0 32px;
  background: rgba(11, 10, 7, 0.9);
  clip-path: polygon(0 0, 100% 0, 92% 100%, 0 100%);
  border-top: 4px solid var(--hs-gold);
}

.vhero__type { font-size: 0.75rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--hs-gold-2); }
.vhero__name { margin: 8px 0 10px; font-size: clamp(2.4rem, 6vw, 4.4rem); }
.vhero__tagline { color: var(--hs-muted); margin-bottom: 18px; }

.vhero__browse {
  display: flex;
  flex-wrap: wrap;
  margin: 14px -48px 0 -32px;
  background: rgba(239, 227, 179, 0.08);
}

.vhero__browse a {
  flex: 1 0 auto;
  white-space: nowrap;
  padding: 14px 10px;
  text-align: center;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.vhero__browse a:hover { background: var(--hs-gold); color: var(--hs-on-gold); }

/* ---------- About ---------- */
.about {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: clamp(28px, 5vw, 64px);
  align-items: center;
}

.about--solo { grid-template-columns: minmax(0, 760px); }
.about__copy { display: flex; flex-direction: column; gap: 16px; }
.about__copy p { color: var(--hs-muted); }
.about__photo { aspect-ratio: 4 / 3; }

.section-title { margin-bottom: 28px; }

/* ---------- Stats ---------- */
.stats { margin-top: clamp(28px, 4vw, 48px); background: var(--hs-gold); color: var(--hs-on-gold); }

.stats__list {
  list-style: none;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
}

.stats__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 26px 12px;
  text-align: center;
}

.stats__item + .stats__item { border-left: 1px solid rgba(11, 10, 7, 0.18); }
.stats__value { font-size: clamp(1.9rem, 4vw, 2.8rem); font-weight: 800; font-style: italic; line-height: 1; }
.stats__label { font-size: 0.72rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; }

/* ---------- Story & features ---------- */
.story { max-width: 820px; display: flex; flex-direction: column; gap: 14px; }
.story__title { max-width: 18ch; }
.story__copy { display: flex; flex-direction: column; gap: 14px; color: var(--hs-muted); font-size: 1.05rem; }
.features__head--after { margin-top: clamp(40px, 6vw, 72px); }

.features {
  list-style: none;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 14px;
}

.feature {
  position: relative;
  overflow: hidden;
  padding: 30px 28px 28px;
  background: rgba(239, 227, 179, 0.06);
  border-bottom: 3px solid transparent;
  transition: border-color 0.25s var(--hs-ease), background 0.25s var(--hs-ease);
}

.feature:hover { border-bottom-color: var(--hs-gold); background: rgba(239, 227, 179, 0.09); }

.feature__num {
  position: absolute;
  top: -8px;
  right: 14px;
  font-size: 4.6rem;
  font-weight: 800;
  font-style: italic;
  line-height: 1;
  color: rgba(239, 227, 179, 0.07);
  pointer-events: none;
}

.feature__title { position: relative; margin-bottom: 10px; font-size: 1.2rem; font-weight: 800; font-style: italic; text-transform: uppercase; }
.feature__text { position: relative; color: var(--hs-muted); font-size: 0.92rem; }

/* ---------- Signatures ---------- */
.sigs__list {
  list-style: none;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 0 40px;
}

.sig {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 4px 16px;
  padding: 18px 0;
  border-bottom: 1px solid var(--hs-line);
}

.sig__name { font-size: 1.1rem; font-weight: 800; font-style: italic; text-transform: uppercase; }
.sig__price { font-weight: 800; color: var(--hs-gold-2); white-space: nowrap; }
.sig__text { grid-column: 1 / -1; color: var(--hs-muted); font-size: 0.88rem; }

/* ---------- Week ---------- */
.days {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 14px;
}

.day {
  padding: 20px 22px;
  background: rgba(239, 227, 179, 0.06);
  border-top: 3px solid transparent;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.day--tonight { border-top-color: var(--hs-gold); background: rgba(201, 168, 59, 0.14); }
.day--quiet { opacity: 0.7; }

.day__name {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 1.2rem;
  font-weight: 800;
  font-style: italic;
  text-transform: uppercase;
}

.day__items { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 14px; }
.day__item { display: flex; flex-direction: column; gap: 4px; padding-top: 12px; border-top: 1px solid var(--hs-line); }
.day__item:first-child { border-top: none; padding-top: 0; }
.day__time { font-size: 0.75rem; font-weight: 700; color: var(--hs-gold-2); letter-spacing: 0.06em; text-transform: uppercase; }
.day__title { font-weight: 700; line-height: 1.3; }
.day__desc { font-size: 0.82rem; color: var(--hs-muted); }
.day__tags { display: flex; flex-wrap: wrap; gap: 6px; }
.day__none { font-size: 0.85rem; }

/* ---------- Gallery ---------- */
.gallery {
  list-style: none;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 10px;
}

.gallery__item { display: block; width: 100%; padding: 0; border: none; background: none; cursor: zoom-in; }
.gallery__item .hs-photo { aspect-ratio: 1; }

/* ---------- Menus ---------- */
.menus {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
  padding: clamp(24px, 4vw, 40px);
  background: rgba(239, 227, 179, 0.06);
  border-left: 6px solid var(--hs-gold);
}

.menus > div:first-child { display: flex; flex-direction: column; gap: 8px; }
.menus__links { display: flex; flex-wrap: wrap; gap: 10px; }

/* ---------- Visit ---------- */
.visit {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 14px;
}

.visit__block {
  padding: 24px;
  background: rgba(239, 227, 179, 0.06);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.visit__title { font-size: 1rem; font-weight: 800; font-style: italic; text-transform: uppercase; color: var(--hs-gold-2); margin-bottom: 4px; }
.visit__big { font-size: 1.15rem; font-weight: 600; }
a.visit__big:hover, .link:hover { color: var(--hs-gold-2); }
.link { font-weight: 700; text-decoration: underline; text-underline-offset: 3px; }

/* ---------- Others ---------- */
.others__title { margin-bottom: 16px; }
.others { list-style: none; padding: 0; display: flex; flex-wrap: wrap; gap: 8px; }

.others__item {
  display: inline-flex;
  gap: 10px;
  padding: 12px 20px;
  background: rgba(239, 227, 179, 0.07);
  font-weight: 800;
  font-style: italic;
  text-transform: uppercase;
}

.others__item:hover { background: var(--hs-gold); color: var(--hs-on-gold); }

/* ---------- Lightbox ---------- */
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

@media (max-width: 860px) {
  .vhero { margin-top: -10px; padding: 0; min-height: 0; flex-direction: column; align-items: stretch; }
  .vhero__photo { position: relative; inset: auto; height: 46vh; min-height: 280px; }
  .vhero__panel { margin: -60px 16px 0; width: auto; padding: 24px 28px 0 22px; }
  .vhero__browse { margin: 14px -28px 0 -22px; flex-wrap: nowrap; overflow-x: auto; scrollbar-width: none; }
  .vhero__browse::-webkit-scrollbar { display: none; }
  .vhero__browse a { padding: 14px 16px; }
  .about { grid-template-columns: 1fr; }
  .stats__list { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .stats__item:nth-child(odd) { border-left: none; }
  .stats__item:nth-child(n + 3) { border-top: 1px solid rgba(11, 10, 7, 0.18); }
  .day--quiet { flex-direction: row; align-items: center; justify-content: space-between; padding: 14px 18px; }
  .day--quiet .day__name { font-size: 1rem; }
}
</style>
