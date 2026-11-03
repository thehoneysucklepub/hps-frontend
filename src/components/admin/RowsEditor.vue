<template>
  <div class="rows">
    <div class="d-flex align-center justify-space-between mb-2">
      <div>
        <div style="font-size:13px;font-weight:700;">{{ title }}</div>
        <div v-if="hint" style="font-size:11px;color:#888;">{{ hint }}</div>
      </div>
      <v-btn size="x-small" variant="tonal" color="primary" prepend-icon="mdi-plus" :disabled="modelValue.length >= max" @click="add">
        Add
      </v-btn>
    </div>

    <div v-if="!modelValue.length" style="font-size:12px;color:#666;padding:10px 0;">
      Nothing yet. This section is hidden on the website until you add a row.
    </div>

    <div v-for="(row, i) in modelValue" :key="i" class="rows__row">
      <div class="rows__fields" :style="{ gridTemplateColumns: columns }">
        <template v-for="f in fields" :key="f.key">
          <v-textarea
            v-if="f.multiline"
            :model-value="row[f.key]"
            :label="f.label"
            rows="2"
            auto-grow
            hide-details
            density="compact"
            bg-color="#1A1A1A"
            class="rows__wide"
            @update:model-value="v => set(i, f.key, v)"
          />
          <v-text-field
            v-else
            :model-value="row[f.key]"
            :label="f.label"
            hide-details
            density="compact"
            bg-color="#1A1A1A"
            @update:model-value="v => set(i, f.key, v)"
          />
        </template>
      </div>
      <div class="rows__tools">
        <v-btn icon="mdi-arrow-up" size="x-small" variant="text" :disabled="i === 0" aria-label="Move up" @click="move(i, -1)" />
        <v-btn icon="mdi-arrow-down" size="x-small" variant="text" :disabled="i === modelValue.length - 1" aria-label="Move down" @click="move(i, 1)" />
        <v-btn icon="mdi-delete" size="x-small" variant="text" color="error" aria-label="Remove" @click="remove(i)" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// fields: [{ key, label, multiline?, width? }]
const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  fields: { type: Array, required: true },
  title: { type: String, required: true },
  hint: { type: String, default: '' },
  max: { type: Number, default: 24 },
})
const emit = defineEmits(['update:modelValue'])

const columns = computed(() => props.fields.filter(f => !f.multiline).map(f => f.width || '1fr').join(' '))

const blank = () => Object.fromEntries(props.fields.map(f => [f.key, '']))
const copy = () => props.modelValue.map(r => ({ ...r }))

function set(i, key, value) {
  const rows = copy()
  rows[i][key] = value
  emit('update:modelValue', rows)
}
function add() { emit('update:modelValue', [...copy(), blank()]) }
function remove(i) { emit('update:modelValue', copy().filter((_, j) => j !== i)) }
function move(i, d) {
  const rows = copy()
  ;[rows[i], rows[i + d]] = [rows[i + d], rows[i]]
  emit('update:modelValue', rows)
}
</script>

<style scoped>
.rows__row {
  display: flex;
  gap: 6px;
  align-items: flex-start;
  padding: 10px;
  margin-bottom: 8px;
  background: #151515;
  border: 1px solid #2A2A2A;
  border-radius: 8px;
}
.rows__fields { flex: 1; display: grid; gap: 8px; min-width: 0; }
.rows__wide { grid-column: 1 / -1; }
.rows__tools { display: flex; flex-direction: column; }
</style>
