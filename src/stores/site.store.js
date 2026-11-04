import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'

/**
 * Everything the public website shows comes from the API through this store:
 *  - /site_settings/public  site name, tagline, Instagram…  (Admin → Settings)
 *  - /branches              venues incl. Borracha and Bar-X  (Admin → Branches)
 *  - /events/weekly         weekly line-ups                   (Admin → Events)
 *  - /events/upcoming       one-off special events            (Admin → Events)
 *  - /menu_pdfs, /menu_categories                             (Admin → Menu)
 *  - /media_items           photos per venue                  (Admin → Media)
 * Each list is fetched once per visit and shared by every page.
 */

export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
export const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
export const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0] // Monday first

/** "21:00" → "9PM", "00:00" → "12AM", "18:30" → "6:30PM" */
export function clock(hhmm) {
  if (!hhmm) return ''
  const m = String(hhmm).match(/^(\d{1,2}):(\d{2})/)
  if (!m) return hhmm // free text from older entries, shown as typed
  const h = Number(m[1])
  const suffix = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 === 0 ? 12 : h % 12
  return m[2] === '00' ? `${h12}${suffix}` : `${h12}:${m[2]}${suffix}`
}

export function timeRange(e) {
  if (!e?.time_local) return ''
  return e.time_end ? `${clock(e.time_local)} - ${clock(e.time_end)}` : `From ${clock(e.time_local)}`
}

/** Sort key inside one night: after-midnight sets come last */
export function nightKey(e) {
  const t = e?.time_local || ''
  if (!t) return '9'
  return (t < '06:00' ? '1' : '0') + t
}

/** Google Drive "view" links can't be embedded; their "preview" form can */
export function embeddableUrl(url) {
  if (!url) return ''
  const m = url.match(/drive\.google\.com\/file\/d\/([^/]+)/)
  return m ? `https://drive.google.com/file/d/${m[1]}/preview` : url
}

export function downloadableUrl(url) {
  if (!url) return ''
  const m = url.match(/drive\.google\.com\/file\/d\/([^/]+)/)
  return m ? `https://drive.google.com/uc?export=download&id=${m[1]}` : url
}

export function paragraphs(text) {
  return String(text || '').split(/\r?\n\s*\r?\n/).map(p => p.trim()).filter(Boolean)
}

export function lines(text) {
  return String(text || '').split(/\r?\n/).map(p => p.trim()).filter(Boolean)
}

export const useSiteStore = defineStore('site', () => {
  const settings = ref({})
  const branches = ref([])
  const weekly = ref([])
  const upcoming = ref([])
  const menuPdfs = ref([])
  const menuCategories = ref([])
  const media = ref([])

  const loaded = ref({})
  const loading = ref({})
  const errors = ref({})

  async function load(key, request, assign) {
    if (loaded.value[key] || loading.value[key]) return
    loading.value = { ...loading.value, [key]: true }
    errors.value = { ...errors.value, [key]: null }
    try {
      const { data } = await request()
      assign(data)
      loaded.value = { ...loaded.value, [key]: true }
    } catch (e) {
      errors.value = { ...errors.value, [key]: e?.message || 'Request failed' }
    } finally {
      loading.value = { ...loading.value, [key]: false }
    }
  }

  const loadSettings = () => load('settings', () => api.get('/site_settings/public'), d => { settings.value = d.settings || {} })
  const loadBranches = () => load('branches', () => api.get('/branches'), d => { branches.value = d.branches || [] })
  const loadWeekly = () => load('weekly', () => api.get('/events/weekly'), d => { weekly.value = d.events || [] })
  const loadUpcoming = () => load('upcoming', () => api.get('/events/upcoming'), d => { upcoming.value = d.events || [] })
  const loadMenu = () => Promise.all([
    // Already in display order (Admin → Menu → Menu PDFs → order)
    load('menuPdfs', () => api.get('/menu_pdfs'), d => { menuPdfs.value = d.menu_pdfs || [] }),
    load('menuCategories', () => api.get('/menu_categories'), d => { menuCategories.value = d.menu_categories || [] }),
  ])
  const loadMedia = () => load('media', () => api.get('/media_items', { params: { media_type: 'image' } }), d => { media.value = d.media_items || [] })

  function retry(key) {
    loaded.value = { ...loaded.value, [key]: false }
    const map = { settings: loadSettings, branches: loadBranches, weekly: loadWeekly, upcoming: loadUpcoming, media: loadMedia, menuPdfs: loadMenu, menuCategories: loadMenu }
    return map[key]?.()
  }

  // ---------- Derived ----------
  const siteName = computed(() => settings.value.site_name || 'The Honeysuckle Pub')
  const tagline = computed(() => settings.value.site_tagline || '')
  const instagram = computed(() => settings.value.instagram_url || '')
  const instagramHandle = computed(() => {
    const m = instagram.value.match(/instagram\.com\/([^/?#]+)/i)
    return m ? `@${m[1]}` : ''
  })

  const venues = computed(() => branches.value)
  const pubs = computed(() => branches.value.filter(b => (b.venue_type || 'pub') === 'pub'))
  const bars = computed(() => branches.value.filter(b => b.venue_type && b.venue_type !== 'pub'))

  function branchBySlug(slug) {
    return branches.value.find(b => b.slug === slug)
  }

  function weeklyFor(branchId) {
    return weekly.value.filter(e => e.branch_id === branchId)
  }

  function onDay(day, list = weekly.value) {
    return list
      .filter(e => (e.days_of_week || []).includes(day))
      .sort((a, b) => nightKey(a).localeCompare(nightKey(b)))
  }

  /** Photos for a venue (Admin → Media, linked to the branch) */
  function photosFor(branchId) {
    return media.value.filter(m => m.branch_id === branchId && m.file_url)
  }

  /** Cover image: the venue's own photo, else its first gallery photo */
  function coverFor(branch) {
    if (!branch) return ''
    return branch.image_url || photosFor(branch.id)[0]?.file_url || ''
  }

  const featuredPhotos = computed(() => media.value.filter(m => m.featured && m.file_url))

  /** Website photo for a page (Admin → Media → Website photos): home_hero, branches, whats_on, menu */
  const pageImage = (key) => settings.value[`image_${key}`] || ''

  /** Photos for the home gallery: starred ones first, then the newest others */
  const galleryPhotos = computed(() => {
    const all = media.value.filter(m => m.file_url && m.media_type !== 'video')
    const starred = all.filter(m => m.featured)
    const rest = all.filter(m => !m.featured).sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))
    return [...starred, ...rest].slice(0, 9)
  })

  return {
    settings, branches, weekly, upcoming, menuPdfs, menuCategories, media,
    loaded, loading, errors,
    loadSettings, loadBranches, loadWeekly, loadUpcoming, loadMenu, loadMedia, retry,
    siteName, tagline, instagram, instagramHandle, venues, pubs, bars,
    branchBySlug, weeklyFor, onDay, photosFor, coverFor, featuredPhotos, pageImage, galleryPhotos,
  }
})
