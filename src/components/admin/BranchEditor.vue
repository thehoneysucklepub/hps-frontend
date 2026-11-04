<template>
  <!-- Venue form shared by Admin → Branches (dialog) and Admin → Bar-X (page) -->
    <v-window :model-value="tab">
      <!-- Details -->
      <v-window-item value="details">
        <v-row dense>
          <v-col cols="12" sm="8">
            <v-text-field v-model="form.name" label="Name *" hide-details density="compact" bg-color="#1A1A1A" />
          </v-col>
          <v-col cols="12" sm="4">
            <v-select v-model="form.venue_type" :items="venueTypes" label="Type" hide-details density="compact" bg-color="#1A1A1A" />
          </v-col>
          <v-col cols="12">
            <v-text-field v-model="form.address" label="Address" hide-details density="compact" bg-color="#1A1A1A" />
          </v-col>
          <v-col cols="6">
            <v-text-field v-model="form.phone_primary" label="Primary phone" hide-details density="compact" bg-color="#1A1A1A" />
          </v-col>
          <v-col cols="6">
            <v-text-field v-model="form.phone_secondary" label="Second phone" hide-details density="compact" bg-color="#1A1A1A" />
          </v-col>
          <v-col cols="4">
            <v-text-field v-model="form.established_year" label="Est. year" hide-details density="compact" bg-color="#1A1A1A" />
          </v-col>
          <v-col cols="4">
            <v-text-field v-model.number="form.position" type="number" label="Display order" hide-details density="compact" bg-color="#1A1A1A" />
          </v-col>
          <v-col cols="4" class="d-flex align-center">
            <v-switch v-model="form.active" label="Shown on website" color="primary" hide-details density="compact" />
          </v-col>
          <v-col cols="12">
            <v-text-field v-model="form.tagline" label="Tagline (under the name)" hide-details density="compact" bg-color="#1A1A1A" />
          </v-col>
          <v-col cols="12">
            <div class="d-flex align-center ga-2 flex-wrap">
              <v-text-field v-model="form.image_url" label="Cover photo" placeholder="Upload, or paste an image link" hide-details density="compact" bg-color="#1A1A1A" style="flex:1;min-width:220px;" clearable />
              <UploadButton label="Upload" @uploaded="url => emit('cover-uploaded', url)" @error="msg => emit('error', msg)" />
            </div>
            <img v-if="form.image_url" :src="imgUrl(form.image_url)" alt="" style="width:100%;max-height:180px;object-fit:cover;border-radius:8px;margin-top:8px;" />
            <div v-else style="font-size:11px;color:#777;margin-top:4px;">No cover yet: the page uses the first gallery photo (Admin → Media), or the Honeysuckle logo.</div>
          </v-col>
          <v-col cols="12">
            <v-textarea v-model="form.description" label="About (blank line = new paragraph)" hide-details density="compact" bg-color="#1A1A1A" rows="3" auto-grow />
          </v-col>
          <v-col cols="12" sm="6">
            <v-textarea v-model="form.opening_hours" label="Opening hours (one line each)" hide-details density="compact" bg-color="#1A1A1A" rows="3" auto-grow />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field v-model="form.map_url" label="Google Maps link" hide-details density="compact" bg-color="#1A1A1A" />
            <div style="font-size:11px;color:#777;margin-top:4px;">Empty: the page searches Google Maps for the address.</div>
          </v-col>
        </v-row>
      </v-window-item>

      <!-- Page sections -->
      <v-window-item value="sections">
        <div style="font-size:12px;color:#999;margin-bottom:14px;">
          Optional extra sections for this venue's page. Empty sections are not shown.
        </div>
        <v-row dense>
          <v-col cols="12">
            <v-text-field v-model="form.eyebrow" label="Small line above the name" placeholder="e.g. Premium experience · The Honeysuckle Pub" hide-details density="compact" bg-color="#1A1A1A" />
          </v-col>
          <v-col cols="12">
            <v-text-field v-model="form.story_title" label="Story heading" hide-details density="compact" bg-color="#1A1A1A" />
          </v-col>
          <v-col cols="12">
            <v-textarea v-model="form.story" label="Story (blank line = new paragraph)" hide-details density="compact" bg-color="#1A1A1A" rows="3" auto-grow />
          </v-col>
        </v-row>
        <v-divider class="my-4" style="border-color:#2A2A2A;" />
        <RowsEditor v-model="form.stats" title="Numbers band" hint="Shown in a gold band under the photo, e.g. 50+ / Signature cocktails" :max="6"
          :fields="[{ key: 'value', label: 'Number', width: '120px' }, { key: 'label', label: 'Label' }]" />
        <v-divider class="my-4" style="border-color:#2A2A2A;" />
        <RowsEditor v-model="form.features" title="What we offer" hint="Cards under the story"
          :fields="[{ key: 'title', label: 'Title' }, { key: 'text', label: 'Text', multiline: true }]" />
        <v-divider class="my-4" style="border-color:#2A2A2A;" />
        <v-text-field v-model="form.signatures_title" label="Signature list heading" placeholder="e.g. Signature cocktails" hide-details density="compact" bg-color="#1A1A1A" class="mb-3" />
        <RowsEditor v-model="form.signatures" title="Signature list" hint="Name, short description and price (85 is shown as GHS 85)"
          :fields="[{ key: 'name', label: 'Name' }, { key: 'price', label: 'Price', width: '110px' }, { key: 'text', label: 'Description', multiline: true }]" />
      </v-window-item>
    </v-window>
</template>

<script setup>
import UploadButton from '@/components/admin/UploadButton.vue'
import RowsEditor from '@/components/admin/RowsEditor.vue'
import { imgUrl } from '@/utils/img'

// form: reactive object owned by the parent (fields are edited in place)
defineProps({
  form: { type: Object, required: true },
  tab: { type: String, default: 'details' }, // details | sections
})
const emit = defineEmits(['cover-uploaded', 'error'])

const venueTypes = [
  { title: 'Pub', value: 'pub' },
  { title: 'Bar / lounge', value: 'bar' },
  { title: 'Restaurant', value: 'restaurant' },
]
</script>
