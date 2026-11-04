<template>
  <header class="page-head">
    <div class="hs-wrap">
      <div class="page-head__band" :class="{ 'page-head__band--photo': photo }">
        <img v-if="photo" :src="photo" alt="" class="page-head__img" @error="failed = true" />
        <p v-if="kicker" class="hs-kicker page-head__kicker">{{ kicker }}</p>
        <h1 class="hs-display page-head__title">{{ title }}</h1>
        <p v-if="lede" class="page-head__lede">{{ lede }}</p>
        <slot />
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { imgUrl } from '@/utils/img'

const props = defineProps({
  title: { type: String, required: true },
  kicker: { type: String, default: '' },
  lede: { type: String, default: '' },
  // Background photo (Admin → Media → Website photos)
  image: { type: String, default: '' },
})
const failed = ref(false)
watch(() => props.image, () => { failed.value = false })
const photo = computed(() => (props.image && !failed.value ? imgUrl(props.image) : ''))
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

.page-head__band--photo { min-height: clamp(220px, 32vw, 360px); justify-content: flex-end; background: #0b0a07; }

.page-head__img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
}

.page-head__band--photo::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 0;
  background: linear-gradient(90deg, rgba(11, 10, 7, 0.88) 0%, rgba(11, 10, 7, 0.55) 55%, rgba(11, 10, 7, 0.2) 100%);
}

.page-head__band > :not(.page-head__img) { position: relative; z-index: 1; }

.page-head__kicker { font-size: 0.85rem; color: var(--hs-gold-2); }
.page-head__title { font-size: clamp(2.4rem, 6vw, 4.6rem); }
.page-head__lede { max-width: 56ch; color: var(--hs-muted); }
</style>
