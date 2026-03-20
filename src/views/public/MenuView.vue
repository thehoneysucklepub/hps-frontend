<template>
  <div style="background:#0A0A0A;min-height:100vh;padding:80px 24px;">
    <div style="max-width:1200px;margin:0 auto;">

      <!-- Header -->
      <div style="text-align:center;margin-bottom:60px;">
        <div style="font-size:12px;color:#F5C518;letter-spacing:3px;text-transform:uppercase;margin-bottom:8px;">
          Food & Drinks
        </div>
        <h1 style="font-size:clamp(32px,5vw,56px);font-weight:900;margin-bottom:16px;">
          Our Menu
        </h1>
        <p style="color:#888;font-size:15px;max-width:500px;margin:0 auto;">
          Explore our extensive selection of premium beverages, craft cocktails, fine wines, and refreshing drinks for every occasion.
        </p>
      </div>

      <!-- PDF Downloads -->
      <div v-if="pdfs.length > 0" style="margin-bottom:60px;">
        <div style="font-size:12px;color:#F5C518;letter-spacing:3px;text-transform:uppercase;margin-bottom:16px;">
          Download Menu
        </div>
        <div style="display:flex;gap:12px;flex-wrap:wrap;">
          <a
            v-for="pdf in pdfs"
            :key="pdf.id"
            :href="pdf.file_url"
            target="_blank"
            style="display:flex;align-items:center;gap:10px;background:#111111;border:1px solid #2A2A2A;border-radius:12px;padding:14px 20px;text-decoration:none;color:#fff;transition:border-color 0.2s;"
            @mouseenter="e => e.currentTarget.style.borderColor='#F5C518'"
            @mouseleave="e => e.currentTarget.style.borderColor='#2A2A2A'"
          >
            <v-icon color="error" size="24">mdi-file-pdf-box</v-icon>
            <div>
              <div style="font-size:14px;font-weight:600;">{{ pdf.title }}</div>
              <div style="font-size:11px;color:#888;text-transform:capitalize;">{{ pdf.pdf_type }} menu</div>
            </div>
            <v-icon color="#888" size="16" style="margin-left:8px;">mdi-download</v-icon>
          </a>
        </div>
      </div>

      <!-- Tabs -->
      <v-tabs v-model="tab" color="primary" class="mb-8" style="border-bottom:1px solid #2A2A2A;">
        <v-tab value="food">
          <v-icon start>mdi-food</v-icon>
          Food Menu
        </v-tab>
        <v-tab value="drinks">
          <v-icon start>mdi-glass-cocktail</v-icon>
          Drinks Menu
        </v-tab>
      </v-tabs>

      <div v-if="loading" class="d-flex justify-center pa-12">
        <v-progress-circular indeterminate color="primary" size="48" />
      </div>

      <v-window v-else v-model="tab">

        <!-- Food -->
        <v-window-item value="food">
          <div v-if="foodCategories.length === 0" class="text-center pa-12">
            <v-icon size="64" color="#333">mdi-food-off</v-icon>
            <div style="color:#555;margin-top:12px;">Menu coming soon</div>
          </div>
          <div v-else>
            <div
              v-for="category in foodCategories"
              :key="category.id"
              style="margin-bottom:48px;"
            >
              <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
                <div style="width:3px;height:24px;background:#F5C518;border-radius:2px;"></div>
                <h2 style="font-size:20px;font-weight:800;">{{ category.name }}</h2>
              </div>
              <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;">
                <div
                  v-for="item in category.menu_items"
                  :key="item.id"
                  style="background:#111111;border:1px solid #2A2A2A;border-radius:12px;padding:20px;display:flex;align-items:flex-start;gap:16px;"
                >
                  <div
                    v-if="item.image_url"
                    style="width:64px;height:64px;border-radius:10px;overflow:hidden;flex-shrink:0;"
                  >
                    <img :src="item.image_url" style="width:100%;height:100%;object-fit:cover;" />
                  </div>
                  <div
                    v-else
                    style="width:64px;height:64px;background:#1A1A1A;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;"
                  >
                    <v-icon color="#333" size="28">mdi-food</v-icon>
                  </div>
                  <div style="flex:1;">
                    <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;">
                      <div style="font-size:14px;font-weight:700;">{{ item.name }}</div>
                      <div v-if="item.price" style="font-size:14px;font-weight:800;color:#F5C518;white-space:nowrap;">
                        GHS {{ item.price }}
                      </div>
                    </div>
                    <div v-if="item.description" style="font-size:12px;color:#888;margin-top:4px;line-height:1.5;">
                      {{ item.description }}
                    </div>
                    <v-chip
                      v-if="!item.available"
                      size="x-small"
                      color="error"
                      variant="tonal"
                      class="mt-2"
                    >
                      Unavailable
                    </v-chip>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </v-window-item>

        <!-- Drinks -->
        <v-window-item value="drinks">
          <div v-if="drinksCategories.length === 0" class="text-center pa-12">
            <v-icon size="64" color="#333">mdi-glass-cocktail</v-icon>
            <div style="color:#555;margin-top:12px;">Drinks menu coming soon</div>
          </div>
          <div v-else>
            <div
              v-for="category in drinksCategories"
              :key="category.id"
              style="margin-bottom:48px;"
            >
              <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
                <div style="width:3px;height:24px;background:#F5C518;border-radius:2px;"></div>
                <h2 style="font-size:20px;font-weight:800;">{{ category.name }}</h2>
              </div>
              <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;">
                <div
                  v-for="item in category.menu_items"
                  :key="item.id"
                  style="background:#111111;border:1px solid #2A2A2A;border-radius:12px;padding:20px;"
                >
                  <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:4px;">
                    <div style="font-size:14px;font-weight:700;">{{ item.name }}</div>
                    <div v-if="item.price" style="font-size:14px;font-weight:800;color:#F5C518;white-space:nowrap;">
                      GHS {{ item.price }}
                    </div>
                  </div>
                  <div v-if="item.description" style="font-size:12px;color:#888;line-height:1.5;">
                    {{ item.description }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </v-window-item>

      </v-window>

      <!-- Order via Bolt CTA -->
      <div style="margin-top:80px;background:linear-gradient(135deg,#111111,#1A1A1A);border:1px solid #2A2A2A;border-radius:16px;padding:40px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:24px;">
        <div>
          <div style="font-size:20px;font-weight:800;margin-bottom:8px;">Order Now</div>
          <div style="color:#888;font-size:14px;">Get your favourite food and drinks delivered</div>
        </div>
        <v-btn
          color="success"
          size="large"
          style="font-weight:700;"
          href="https://food.bolt.eu"
          target="_blank"
        >
          <v-icon start>mdi-moped</v-icon>
          Order on Bolt
        </v-btn>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/services/api'

const tab        = ref('food')
const categories = ref([])
const pdfs       = ref([])
const loading    = ref(true)

const foodCategories   = computed(() => categories.value.filter(c => c.menu_type === 'food'))
const drinksCategories = computed(() => categories.value.filter(c => c.menu_type === 'drinks'))

onMounted(async () => {
  try {
    const [catRes, pdfRes] = await Promise.all([
      api.get('/menu_categories'),
      api.get('/menu_pdfs')
    ])
    categories.value = catRes.data.menu_categories
    pdfs.value       = pdfRes.data.menu_pdfs
  } finally {
    loading.value = false
  }
})
</script>