<template>
  <header class="page-head">
    <div class="hs-wrap">
      <div class="page-head__band">
        <p v-if="kicker" class="hs-kicker page-head__kicker">{{ kicker }}</p>
        <h1 class="hs-display page-head__title">{{ title }}</h1>
        <p v-if="lede" class="page-head__lede">{{ lede }}</p>
        <slot />
      </div>
    </div>
  </header>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  kicker: { type: String, default: '' },
  lede: { type: String, default: '' },
})
</script>

<style scoped>
.page-head { padding-top: clamp(28px, 5vw, 56px); }

.page-head__band {
  position: relative;
  padding: clamp(24px, 4vw, 44px) clamp(24px, 5vw, 56px);
  background: linear-gradient(115deg, rgba(201, 168, 59, 0.26), rgba(201, 168, 59, 0.05) 70%);
  border-left: 6px solid var(--hs-gold);
  clip-path: polygon(0 0, 100% 0, 97% 100%, 0 100%);
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.page-head__kicker { font-size: 0.85rem; color: var(--hs-gold-2); }
.page-head__title { font-size: clamp(2.4rem, 6vw, 4.6rem); }
.page-head__lede { max-width: 56ch; color: var(--hs-muted); }
</style>
