<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <div style="font-size:24px;font-weight:700;">Menu Management</div>
        <div style="color:#888;font-size:13px;margin-top:2px;">Manage food and drinks menu</div>
      </div>
      <div class="d-flex ga-2">
        <v-btn variant="outlined" color="primary" size="small" prepend-icon="mdi-plus" @click="openCategoryDialog">
          Add Category
        </v-btn>
        <v-btn color="primary" size="small" prepend-icon="mdi-plus" style="color:#0A0A0A;font-weight:700;" @click="openItemDialog">
          Add Item
        </v-btn>
      </div>
    </div>

    <!-- Tabs -->
    <v-tabs v-model="tab" color="primary" class="mb-6" style="border-bottom:1px solid #2A2A2A;">
      <v-tab value="food">Food Menu</v-tab>
      <v-tab value="drinks">Drinks Menu</v-tab>
      <v-tab value="pdfs">Menu PDFs</v-tab>
    </v-tabs>

    <div v-if="loading" class="d-flex justify-center pa-12">
      <v-progress-circular indeterminate color="primary" size="48" />
    </div>

    <v-window v-else v-model="tab">

      <!-- Food / Drinks -->
      <v-window-item v-for="menuType in ['food','drinks']" :key="menuType" :value="menuType">
        <div
          v-for="category in categoriesByType(menuType)"
          :key="category.id"
          class="mb-6"
        >
          <div class="d-flex align-center justify-space-between mb-3">
            <div style="font-size:16px;font-weight:700;color:#F5C518;">
              {{ category.name }}
            </div>
            <div class="d-flex ga-1">
              <v-btn size="x-small" variant="text" color="primary" icon="mdi-pencil" @click="editCategory(category)" />
              <v-btn size="x-small" variant="text" color="error" icon="mdi-delete" @click="deleteCategory(category)" />
            </div>
          </div>

          <v-card style="background:#111111;border:1px solid #2A2A2A;">
            <v-table style="background:transparent;">
              <thead>
                <tr style="border-bottom:1px solid #2A2A2A;">
                  <th style="color:#888;font-size:12px;">Item</th>
                  <th style="color:#888;font-size:12px;">Price</th>
                  <th style="color:#888;font-size:12px;">Status</th>
                  <th style="color:#888;font-size:12px;">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in category.menu_items"
                  :key="item.id"
                  style="border-bottom:1px solid #1A1A1A;"
                >
                  <td style="padding:12px 16px;">
                    <div style="font-size:13px;font-weight:600;">{{ item.name }}</div>
                    <div style="font-size:11px;color:#888;">{{ item.description }}</div>
                  </td>
                  <td style="padding:12px 16px;font-size:13px;color:#F5C518;font-weight:600;">
                    {{ item.price ? `GHS ${item.price}` : '—' }}
                  </td>
                  <td style="padding:12px 16px;">
                    <v-chip :color="item.available ? 'success' : 'error'" size="x-small" variant="tonal">
                      {{ item.available ? 'Available' : 'Unavailable' }}
                    </v-chip>
                  </td>
                  <td style="padding:12px 16px;">
                    <div class="d-flex ga-1">
                      <v-btn icon="mdi-pencil" size="x-small" variant="text" color="primary" @click="editItem(item, category)" />
                      <v-btn icon="mdi-delete" size="x-small" variant="text" color="error" @click="deleteItem(item)" />
                    </div>
                  </td>
                </tr>
                <tr v-if="!category.menu_items?.length">
                  <td colspan="4" style="padding:16px;text-align:center;color:#555;font-size:13px;">
                    No items in this category
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card>
        </div>

        <div v-if="categoriesByType(menuType).length === 0" class="text-center pa-12">
          <v-icon size="48" color="#333">mdi-food-off</v-icon>
          <div style="color:#555;margin-top:8px;">No categories yet</div>
        </div>
      </v-window-item>

      <!-- PDFs -->
      <v-window-item value="pdfs">
        <div class="d-flex justify-end mb-4">
          <v-btn color="primary" size="small" prepend-icon="mdi-plus" style="color:#0A0A0A;" @click="openPdfDialog">
            Add PDF
          </v-btn>
        </div>
        <v-row>
          <v-col v-for="pdf in pdfs" :key="pdf.id" cols="12" sm="6" md="4">
            <v-card style="background:#111111;border:1px solid #2A2A2A;" class="pa-4">
              <div class="d-flex align-center ga-3 mb-3">
                <v-avatar color="error" variant="tonal" size="40">
                  <v-icon>mdi-file-pdf-box</v-icon>
                </v-avatar>
                <div>
                  <div style="font-size:14px;font-weight:600;">{{ pdf.title }}</div>
                  <v-chip size="x-small" :color="pdf.pdf_type === 'food' ? 'success' : 'info'" variant="tonal">
                    {{ pdf.pdf_type }}
                  </v-chip>
                </div>
              </div>
              <div class="d-flex ga-2">
                <v-btn variant="tonal" color="primary" size="small" :href="pdf.file_url" target="_blank" prepend-icon="mdi-open-in-new" style="flex:1;">
                  View
                </v-btn>
                <v-btn variant="tonal" color="error" size="small" icon="mdi-delete" @click="deletePdf(pdf)" />
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-window-item>

    </v-window>

    <!-- Category Dialog -->
    <v-dialog v-model="categoryDialog" max-width="400" persistent>
      <v-card style="background:#111111;border:1px solid #2A2A2A;">
        <div class="d-flex align-center justify-space-between pa-5 pb-4" style="border-bottom:1px solid #2A2A2A;">
          <div style="font-size:17px;font-weight:700;">{{ editingCategory ? 'Edit Category' : 'Add Category' }}</div>
          <v-btn icon="mdi-close" variant="text" size="small" @click="categoryDialog = false" />
        </div>
        <div class="pa-5">
          <v-text-field v-model="categoryForm.name" label="Category Name *" hide-details density="compact" bg-color="#1A1A1A" class="mb-3" />
          <v-select v-model="categoryForm.menu_type" :items="['food','drinks']" label="Menu Type *" hide-details density="compact" bg-color="#1A1A1A" />
        </div>
        <div class="d-flex justify-end ga-2 pa-5 pt-0">
          <v-btn variant="text" @click="categoryDialog = false">Cancel</v-btn>
          <v-btn color="primary" :loading="saving" style="color:#0A0A0A;font-weight:700;" @click="saveCategory">
            {{ editingCategory ? 'Save' : 'Create' }}
          </v-btn>
        </div>
      </v-card>
    </v-dialog>

    <!-- Item Dialog -->
    <v-dialog v-model="itemDialog" max-width="440" persistent>
      <v-card style="background:#111111;border:1px solid #2A2A2A;">
        <div class="d-flex align-center justify-space-between pa-5 pb-4" style="border-bottom:1px solid #2A2A2A;">
          <div style="font-size:17px;font-weight:700;">{{ editingItem ? 'Edit Item' : 'Add Item' }}</div>
          <v-btn icon="mdi-close" variant="text" size="small" @click="itemDialog = false" />
        </div>
        <div class="pa-5">
          <v-select v-model="itemForm.menu_category_id" :items="categoryOptions" label="Category *" hide-details density="compact" bg-color="#1A1A1A" class="mb-3" />
          <v-text-field v-model="itemForm.name" label="Item Name *" hide-details density="compact" bg-color="#1A1A1A" class="mb-3" />
          <v-textarea v-model="itemForm.description" label="Description" hide-details density="compact" bg-color="#1A1A1A" rows="2" class="mb-3" />
          <v-text-field v-model="itemForm.price" label="Price (GHS)" type="number" hide-details density="compact" bg-color="#1A1A1A" class="mb-3" />
          <v-switch v-model="itemForm.available" label="Available" color="primary" hide-details density="compact" />
        </div>
        <div class="d-flex justify-end ga-2 pa-5 pt-0">
          <v-btn variant="text" @click="itemDialog = false">Cancel</v-btn>
          <v-btn color="primary" :loading="saving" style="color:#0A0A0A;font-weight:700;" @click="saveItem">
            {{ editingItem ? 'Save' : 'Create' }}
          </v-btn>
        </div>
      </v-card>
    </v-dialog>

    <!-- PDF Dialog -->
    <v-dialog v-model="pdfDialog" max-width="400" persistent>
      <v-card style="background:#111111;border:1px solid #2A2A2A;">
        <div class="d-flex align-center justify-space-between pa-5 pb-4" style="border-bottom:1px solid #2A2A2A;">
          <div style="font-size:17px;font-weight:700;">Add Menu PDF</div>
          <v-btn icon="mdi-close" variant="text" size="small" @click="pdfDialog = false" />
        </div>
        <div class="pa-5">
          <v-text-field v-model="pdfForm.title" label="Title *" hide-details density="compact" bg-color="#1A1A1A" class="mb-3" />
          <v-text-field v-model="pdfForm.file_url" label="PDF URL *" hide-details density="compact" bg-color="#1A1A1A" class="mb-3" />
          <v-select v-model="pdfForm.pdf_type" :items="['food','drinks']" label="Type *" hide-details density="compact" bg-color="#1A1A1A" />
        </div>
        <div class="d-flex justify-end ga-2 pa-5 pt-0">
          <v-btn variant="text" @click="pdfDialog = false">Cancel</v-btn>
          <v-btn color="primary" :loading="saving" style="color:#0A0A0A;font-weight:700;" @click="savePdf">Add PDF</v-btn>
        </div>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000" location="top right">
      {{ snackbar.text }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/services/api'

const tab        = ref('food')
const categories = ref([])
const pdfs       = ref([])
const loading    = ref(true)
const saving     = ref(false)
const snackbar   = ref({ show: false, text: '', color: 'success' })

const categoryDialog = ref(false)
const itemDialog     = ref(false)
const pdfDialog      = ref(false)
const editingCategory = ref(null)
const editingItem     = ref(null)

const categoryForm = ref({ name: '', menu_type: 'food' })
const itemForm     = ref({ menu_category_id: null, name: '', description: '', price: '', available: true })
const pdfForm      = ref({ title: '', file_url: '', pdf_type: 'food' })

const categoryOptions = computed(() =>
  categories.value.map(c => ({ title: `${c.name} (${c.menu_type})`, value: c.id }))
)

function categoriesByType(type) {
  return categories.value.filter(c => c.menu_type === type)
}

function openCategoryDialog() {
  editingCategory.value = null
  categoryForm.value = { name: '', menu_type: tab.value === 'pdfs' ? 'food' : tab.value }
  categoryDialog.value = true
}

function editCategory(cat) {
  editingCategory.value = cat
  categoryForm.value = { name: cat.name, menu_type: cat.menu_type }
  categoryDialog.value = true
}

function openItemDialog() {
  editingItem.value = null
  itemForm.value = { menu_category_id: null, name: '', description: '', price: '', available: true }
  itemDialog.value = true
}

function editItem(item, category) {
  editingItem.value = item
  itemForm.value = {
    menu_category_id: category.id,
    name: item.name,
    description: item.description || '',
    price: item.price || '',
    available: item.available
  }
  itemDialog.value = true
}

function openPdfDialog() {
  pdfForm.value = { title: '', file_url: '', pdf_type: 'food' }
  pdfDialog.value = true
}

async function saveCategory() {
  if (!categoryForm.value.name) return
  saving.value = true
  try {
    if (editingCategory.value) {
      await api.put(`/menu_categories/${editingCategory.value.id}`, categoryForm.value)
    } else {
      await api.post('/menu_categories', categoryForm.value)
    }
    categoryDialog.value = false
    showSnack(editingCategory.value ? 'Category updated' : 'Category created')
    fetchMenu()
  } finally {
    saving.value = false
  }
}

async function deleteCategory(cat) {
  if (!confirm(`Delete category "${cat.name}"?`)) return
  try {
    await api.delete(`/menu_categories/${cat.id}`)
    showSnack('Category deleted', 'error')
    fetchMenu()
  } catch {
    showSnack('Failed to delete', 'error')
  }
}

async function saveItem() {
  if (!itemForm.value.name || !itemForm.value.menu_category_id) return
  saving.value = true
  try {
    if (editingItem.value) {
      await api.put(`/menu_categories/${itemForm.value.menu_category_id}/menu_items/${editingItem.value.id}`, itemForm.value)
    } else {
      await api.post(`/menu_categories/${itemForm.value.menu_category_id}/menu_items`, itemForm.value)
    }
    itemDialog.value = false
    showSnack(editingItem.value ? 'Item updated' : 'Item created')
    fetchMenu()
  } finally {
    saving.value = false
  }
}

async function deleteItem(item) {
  if (!confirm(`Delete "${item.name}"?`)) return
  try {
    const cat = categories.value.find(c => c.menu_items?.some(i => i.id === item.id))
    if (cat) await api.delete(`/menu_categories/${cat.id}/menu_items/${item.id}`)
    showSnack('Item deleted', 'error')
    fetchMenu()
  } catch {
    showSnack('Failed to delete', 'error')
  }
}

async function savePdf() {
  if (!pdfForm.value.title || !pdfForm.value.file_url) return
  saving.value = true
  try {
    await api.post('/menu_pdfs', pdfForm.value)
    pdfDialog.value = false
    showSnack('PDF added')
    fetchMenu()
  } finally {
    saving.value = false
  }
}

async function deletePdf(pdf) {
  if (!confirm(`Delete "${pdf.title}"?`)) return
  try {
    await api.delete(`/menu_pdfs/${pdf.id}`)
    showSnack('PDF deleted', 'error')
    fetchMenu()
  } catch {
    showSnack('Failed to delete', 'error')
  }
}

async function fetchMenu() {
  loading.value = true
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
}

function showSnack(text, color = 'success') {
  snackbar.value = { show: true, text, color }
}

onMounted(fetchMenu)
</script>