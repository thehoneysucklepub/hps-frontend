<template>
  <footer id="visit" class="hs-footer">
    <div class="hs-wrap hs-footer__top">
      <!-- Follow us: the reference's "Get notified" band, pointed at Instagram -->
      <a
        v-if="site.instagram"
        :href="site.instagram"
        target="_blank"
        rel="noopener"
        class="hs-follow"
      >
        <span class="hs-follow__ghost" aria-hidden="true">FOLLOW</span>
        <span class="hs-follow__title">Follow us</span>
        <span class="hs-follow__text">Line-ups, offers and match nights first on Instagram {{ site.instagramHandle }}</span>
        <span class="hs-follow__go" aria-hidden="true">›</span>
      </a>

      <div class="hs-footer__links">
        <router-link to="/branches">Branches</router-link>
        <router-link to="/whats-on">What's on</router-link>
        <router-link to="/menu">Menu</router-link>
        <router-link to="/bar-x">Bar-X</router-link>
      </div>
    </div>

    <!-- Contact for every venue (replaces the old Contact page) -->
    <div class="hs-wrap">
      <h2 class="hs-kicker hs-footer__heading">Find us</h2>
      <ul v-if="site.venues.length" class="hs-footer__venues">
        <li v-for="b in site.venues.filter(v => v.address || v.phone_primary)" :key="b.id">
          <router-link :to="venueLink(b)" class="hs-footer__venue">{{ b.name }}</router-link>
          <span v-if="b.address" class="hs-muted">{{ b.address }}</span>
          <a v-for="p in phones(b)" :key="p" :href="`tel:${p.replace(/\s/g, '')}`" class="hs-footer__phone">{{ p }}</a>
        </li>
      </ul>
      <p v-else-if="site.loading.branches" class="hs-muted">Loading venues…</p>
    </div>

    <div class="hs-wrap hs-footer__bottom">
      <span>&copy; {{ year }} {{ site.siteName }}</span>
      <router-link to="/login" class="hs-footer__staff">Staff login</router-link>
    </div>
  </footer>
</template>

<script setup>
import { useSiteStore } from '@/stores/site.store'

const site = useSiteStore()
const year = new Date().getFullYear()

const phones = (b) => [b.phone_primary, b.phone_secondary].filter(Boolean)
const venueLink = (b) => (b.slug === 'bar-x' ? '/bar-x' : `/branches/${b.slug}`)
</script>

<style scoped>
.hs-footer { margin-top: var(--hs-gap); padding-bottom: 28px; }

.hs-footer__top {
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr);
  gap: 40px;
  align-items: center;
  margin-bottom: 56px;
}

.hs-follow {
  position: relative;
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 4px 24px;
  padding: 34px 44px;
  background: var(--hs-cream);
  color: var(--hs-on-gold);
  clip-path: polygon(0 0, 100% 0, 95% 100%, 0 100%);
  overflow: hidden;
}

.hs-follow__ghost {
  position: absolute;
  left: -6px;
  top: -10px;
  font-size: 7rem;
  font-weight: 800;
  font-style: italic;
  line-height: 1;
  color: transparent;
  -webkit-text-stroke: 1px rgba(11, 10, 7, 0.12);
  pointer-events: none;
}

.hs-follow__title {
  position: relative;
  font-size: clamp(1.8rem, 3.4vw, 2.6rem);
  font-weight: 800;
  font-style: italic;
  text-transform: uppercase;
  line-height: 1;
}

.hs-follow__text { position: relative; grid-column: 1; font-size: 0.85rem; }

.hs-follow__go {
  grid-column: 2;
  grid-row: 1 / span 2;
  font-size: 2.4rem;
  font-weight: 800;
  transition: transform 0.2s ease;
}

.hs-follow:hover .hs-follow__go { transform: translateX(6px); }

.hs-footer__links {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 24px;
  font-size: 0.9rem;
  font-weight: 600;
}

.hs-footer__links a:hover { color: var(--hs-gold-2); }

.hs-footer__heading { margin-bottom: 20px; }

.hs-footer__venues {
  list-style: none;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 24px;
  padding: 0;
}

.hs-footer__venues li { display: flex; flex-direction: column; gap: 4px; font-size: 0.85rem; }
.hs-footer__venue { font-weight: 800; font-style: italic; text-transform: uppercase; font-size: 1rem; }
.hs-footer__venue:hover, .hs-footer__phone:hover { color: var(--hs-gold-2); }

.hs-footer__bottom {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-top: 48px;
  padding-top: 20px;
  border-top: 1px solid var(--hs-line);
  font-size: 0.78rem;
  color: var(--hs-muted);
}

.hs-footer__staff:hover { color: var(--hs-text); }

@media (max-width: 860px) {
  .hs-footer__top { grid-template-columns: 1fr; }
  .hs-follow { padding: 28px; }
}
</style>
