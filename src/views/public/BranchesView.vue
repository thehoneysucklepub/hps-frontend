<template>
  <div style="background:#0A0A0A;min-height:100vh;padding:80px 24px;">
    <div style="max-width:1200px;margin:0 auto;">
      <div style="margin-bottom:48px;">
        <div style="font-size:12px;color:#F5C518;letter-spacing:3px;text-transform:uppercase;margin-bottom:8px;">Our Locations</div>
        <h1 style="font-size:clamp(32px,5vw,56px);font-weight:900;">Branches</h1>
        <p style="color:#888;margin-top:12px;font-size:15px;">Bold and unique destinations, located across Accra, Ghana.</p>
      </div>

      <div v-if="loading" class="d-flex justify-center pa-12">
        <v-progress-circular indeterminate color="primary" size="48" />
      </div>

      <div v-else style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:24px;">
        <div
          v-for="branch in branches"
          :key="branch.id"
          style="background:#111111;border:1px solid #2A2A2A;border-radius:16px;overflow:hidden;cursor:pointer;transition:border-color 0.2s,transform 0.2s;"
          @mouseenter="e => { e.currentTarget.style.borderColor='#F5C518'; e.currentTarget.style.transform='translateY(-4px)' }"
          @mouseleave="e => { e.currentTarget.style.borderColor='#2A2A2A'; e.currentTarget.style.transform='translateY(0)' }"
          @click="$router.push(`/branches/${branch.slug}`)"
        >
          <div style="height:160px;background:linear-gradient(135deg,#1A1200,#111111);display:flex;align-items:center;justify-content:center;position:relative;">
            <div style="font-size:48px;font-weight:900;color:rgba(245,197,24,0.15);letter-spacing:-2px;text-transform:uppercase;">
              {{ branch.name.charAt(0) }}
            </div>
            <div style="position:absolute;bottom:12px;right:12px;font-size:11px;color:#555;background:#111;padding:3px 10px;border-radius:100px;border:1px solid #2A2A2A;">
              est.{{ branch.established_year }}
            </div>
          </div>
          <div style="padding:24px;">
            <h3 style="font-size:20px;font-weight:800;color:#F5C518;margin-bottom:12px;">{{ branch.name }}</h3>
            <div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:8px;font-size:13px;color:#888;">
              <v-icon size="14" color="primary" style="margin-top:2px;">mdi-map-marker</v-icon>
              {{ branch.address }}
            </div>
            <div style="display:flex;align-items:center;gap:8px;font-size:13px;color:#888;">
              <v-icon size="14" color="primary">mdi-phone</v-icon>
              {{ branch.phone_primary }}
            </div>
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