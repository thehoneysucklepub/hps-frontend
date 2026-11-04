<template>
  <v-card style="background:#111111;border:1px solid #2A2A2A;" class="pa-4 mb-5">
    <div class="d-flex align-center justify-space-between flex-wrap ga-2 mb-3">
      <div>
        <div style="font-size:15px;font-weight:700;">Website photos</div>
        <div style="font-size:12px;color:#888;">Big photos at the top of each page. Saved as soon as you upload.</div>
      </div>
    </div>
    <v-row dense>
      <v-col v-for="slot in SLOTS" :key="slot.key" cols="12" sm="6" lg="3">
        <div class="slot">
          <div class="slot__img">
            <img v-if="values[slot.key]" :src="imgUrl(values[slot.key])" alt="" />
            <div v-else class="slot__empty">{{ slot.empty }}</div>
          </div>
          <div class="pa-3">
            <div style="font-size:13px;font-weight:700;">{{ slot.label }}</div>
            <div style="font-size:11px;color:#888;min-height:30px;">{{ slot.hint }}</div>
            <div class="d-flex ga-2 mt-2">
              <UploadButton :label="values[slot.key] ? 'Change' : 'Upload'" @uploaded="url => save(slot, url)" @error="msg => emit('message', msg, 'error')" />
              <v-btn v-if="values[slot.key]" size="small" variant="text" color="error" :loading="busy === slot.key" @click="save(slot, '')">Remove</v-btn>
            </div>
          </div>
        </div>
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import api, { errorText } from '@/services/api'
import UploadButton from '@/components/admin/UploadButton.vue'
import { imgUrl } from '@/utils/img'

const emit = defineEmits(['message'])

const SLOTS = [
  { key: 'image_home_hero', label: 'Home page', hint: 'Main background photo.', empty: 'Using the first starred photo' },
  { key: 'image_branches', label: 'Branches page', hint: 'Header of the Branches page.', empty: 'No photo (gold header)' },
  { key: 'image_whats_on', label: "What's on page", hint: "Header of What's on and its home page card.", empty: 'No photo (gold header)' },
  { key: 'image_menu', label: 'Menu page', hint: 'Header of the Menu page and its home page card.', empty: 'No photo (gold header)' },
]

const values = reactive({})
const busy = ref('')

async function load() {
  try {
    const res = await api.get('/site_settings')
    ;(res.data.settings || []).forEach(s => { if (s.key.startsWith('image_')) values[s.key] = s.value || '' })
  } catch (err) {
    emit('message', errorText(err, 'Could not load the website photos'), 'error')
  }
}

async function save(slot, url) {
  busy.value = slot.key
  try {
    await api.put(`/site_settings/${slot.key}`, { value: url })
    values[slot.key] = url
    emit('message', url ? `${slot.label} photo saved` : `${slot.label} photo removed`)
  } catch (err) {
    emit('message', errorText(err, 'Could not save the photo'), 'error')
  } finally {
    busy.value = ''
  }
}

onMounted(load)
</script>

<style scoped>
.slot { background: #151515; border: 1px solid #2A2A2A; border-radius: 10px; overflow: hidden; height: 100%; }
.slot__img { height: 120px; background: #1A1A1A; }
.slot__img img { width: 100%; height: 100%; object-fit: cover; display: block; }
.slot__empty { height: 100%; display: flex; align-items: center; justify-content: center; text-align: center; padding: 12px; font-size: 12px; color: #666; }
</style>
