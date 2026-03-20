<template>
  <div style="background:#0A0A0A;min-height:100vh;padding:80px 24px;">
    <div style="max-width:1000px;margin:0 auto;">

      <div style="text-align:center;margin-bottom:60px;">
        <h1 style="font-size:clamp(32px,5vw,56px);font-weight:900;color:#F5C518;letter-spacing:4px;text-transform:uppercase;">
          Contact Us
        </h1>
        <p style="color:#888;margin-top:12px;">Visit any of our convenient locations</p>
      </div>

      <div v-if="loading" class="d-flex justify-center pa-12">
        <v-progress-circular indeterminate color="primary" size="48" />
      </div>

      <div v-else style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:20px;">
        <div
          v-for="branch in branches"
          :key="branch.id"
          style="background:#111111;border:1px solid #2A2A2A;border-radius:16px;padding:28px;transition:border-color 0.2s;"
          @mouseenter="e => e.currentTarget.style.borderColor='#F5C518'"
          @mouseleave="e => e.currentTarget.style.borderColor='#2A2A2A'"
        >
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">
            <h3 style="font-size:20px;font-weight:800;text-transform:uppercase;letter-spacing:2px;">
              {{ branch.name }}
            </h3>
            <div style="font-size:11px;background:rgba(245,197,24,0.1);color:#F5C518;border:1px solid rgba(245,197,24,0.3);padding:4px 12px;border-radius:100px;">
              est.{{ branch.established_year }}
            </div>
          </div>

          <div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:12px;">
            <v-icon size="16" color="primary" style="margin-top:2px;flex-shrink:0;">mdi-map-marker</v-icon>
            <span style="font-size:14px;color:#ccc;line-height:1.5;">{{ branch.address }}</span>
          </div>

          <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;" v-if="branch.phone_primary">
            <v-icon size="16" color="primary">mdi-phone</v-icon>
            <a :href="`tel:${branch.phone_primary}`" style="font-size:14px;color:#F5C518;text-decoration:none;background:rgba(245,197,24,0.1);padding:4px 12px;border-radius:100px;">
              {{ branch.phone_primary }}
            </a>
          </div>

          <div style="display:flex;align-items:center;gap:10px;" v-if="branch.phone_secondary">
            <v-icon size="16" color="primary">mdi-phone</v-icon>
            <a :href="`tel:${branch.phone_secondary}`" style="font-size:14px;color:#F5C518;text-decoration:none;background:rgba(245,197,24,0.1);padding:4px 12px;border-radius:100px;">
              {{ branch.phone_secondary }}
            </a>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'

const branches = ref([])
const loading  = ref(true)

onMounted(async () => {
  try {
    const res = await api.get('/branches')
    branches.value = res.data.branches
  } finally {
    loading.value = false
  }
})
</script>