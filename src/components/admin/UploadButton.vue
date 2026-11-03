<template>
  <span class="d-inline-flex align-center ga-2">
    <v-btn
      :loading="busy"
      :size="size"
      :variant="variant"
      color="primary"
      :prepend-icon="icon"
      @click="input?.click()"
    >
      {{ label }}
    </v-btn>
    <input ref="input" type="file" :accept="accept" hidden @change="onPick" />
  </span>
</template>

<script setup>
/*
 * Uploads a file to the API (stored in the database, so it survives redeploys)
 * and emits the file's public address: @uploaded="url => form.image_url = url"
 */
import { ref } from 'vue'
import { uploadFile, errorText } from '@/services/api'

const props = defineProps({
  label: { type: String, default: 'Upload photo' },
  purpose: { type: String, default: 'photo' },           // photo | menu_pdf
  accept: { type: String, default: 'image/jpeg,image/png,image/webp,image/gif' },
  maxMb: { type: Number, default: 8 },
  size: { type: String, default: 'small' },
  variant: { type: String, default: 'tonal' },
  icon: { type: String, default: 'mdi-upload' },
})
const emit = defineEmits(['uploaded', 'error'])

const input = ref(null)
const busy = ref(false)

async function onPick(e) {
  const file = e.target.files?.[0]
  e.target.value = ''
  if (!file) return
  if (file.size > props.maxMb * 1024 * 1024) {
    emit('error', `File is too large (max ${props.maxMb} MB)`)
    return
  }
  busy.value = true
  try {
    const res = await uploadFile('/files', file, { purpose: props.purpose })
    emit('uploaded', res.data.url, res.data.file)
  } catch (err) {
    emit('error', errorText(err, 'Upload failed'))
  } finally {
    busy.value = false
  }
}
</script>
