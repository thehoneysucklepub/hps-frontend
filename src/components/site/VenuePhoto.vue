<template>
  <div class="hs-photo" :class="{ 'hs-photo--empty': !src || failed }">
    <img v-if="src && !failed" :src="imgUrl(src)" :alt="alt" :loading="eager ? 'eager' : 'lazy'" @error="failed = true" />
    <img v-else src="/brand/logo.webp" alt="" aria-hidden="true" class="hs-photo__mark" />
    <slot />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { imgUrl } from '@/utils/img'

// Shows the venue/event photo; until one is uploaded (or if it fails to load)
// it shows the Honeysuckle mark instead of a stock picture.
const props = defineProps({
  src: { type: String, default: '' },
  alt: { type: String, default: '' },
  eager: { type: Boolean, default: false },
})
const failed = ref(false)
watch(() => props.src, () => { failed.value = false })
</script>
