<template>
  <div ref="root" class="reader" :class="{ 'reader--ready': state === 'ready' }">
    <div class="reader__bar">
      <span class="reader__count" aria-live="polite">
        <template v-if="state === 'ready'">{{ pageCount }} {{ pageCount === 1 ? 'page' : 'pages' }}</template>
        <template v-else-if="state === 'loading'">Loading menu…</template>
      </span>
      <span v-if="state === 'ready'" class="reader__zoom" role="group" aria-label="Zoom">
        <button type="button" class="reader__btn" aria-label="Zoom out" :disabled="zoom <= ZOOM_MIN" @click="setZoom(zoom - 0.25)">−</button>
        <button type="button" class="reader__btn reader__btn--text" @click="setZoom(1)">{{ Math.round(zoom * 100) }}%</button>
        <button type="button" class="reader__btn" aria-label="Zoom in" :disabled="zoom >= ZOOM_MAX" @click="setZoom(zoom + 0.25)">+</button>
      </span>
    </div>

    <div ref="scroller" class="reader__pages" tabindex="0" :aria-label="`${title} (PDF)`">
      <div v-if="state === 'loading'" class="reader__loading">
        <div class="hs-skel reader__skel" />
      </div>
      <div
        v-for="p in pages"
        :key="p.n"
        :ref="el => (pageEls[p.n] = el)"
        class="reader__page"
        :data-page="p.n"
        :style="{ width: `${p.w}px`, height: `${p.h}px` }"
      >
        <canvas :ref="el => (canvases[p.n] = el)" :aria-label="`Page ${p.n}`" role="img" />
        <span class="reader__num">{{ p.n }} / {{ pageCount }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
/*
 * In-page PDF reader (pdf.js). Works on phones too, where browsers often
 * cannot show a PDF inside a page. Pages are drawn as they scroll into view.
 * Emits "error" if the PDF cannot be loaded so the page can fall back.
 */
import { ref, shallowRef, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'

const props = defineProps({
  src: { type: String, required: true },
  title: { type: String, default: 'Menu' },
})
const emit = defineEmits(['error', 'loaded'])

const ZOOM_MIN = 0.5
const ZOOM_MAX = 3

const root = ref(null)
const scroller = ref(null)
const state = ref('loading')
const pageCount = ref(0)
const pages = ref([])
const zoom = ref(1)
const pageEls = {}
const canvases = {}

const doc = shallowRef(null)
let pdfjs = null
let observer = null
let resizeObserver = null
let loadTask = null
let lastWidth = 0
const drawn = new Map() // page number -> scale it was drawn at
const tasks = new Map() // page number -> running render task

async function loadPdfjs() {
  if (pdfjs) return pdfjs
  // Legacy build: supports older phones and browsers
  const [lib, worker] = await Promise.all([
    import('pdfjs-dist/legacy/build/pdf.mjs'),
    import('pdfjs-dist/legacy/build/pdf.worker.min.mjs?url'),
  ])
  lib.GlobalWorkerOptions.workerSrc = worker.default
  pdfjs = lib
  return lib
}

function availableWidth() {
  const w = scroller.value?.clientWidth || root.value?.clientWidth || 800
  return Math.max(240, w - 24)
}

/** Size every page box (no drawing yet) for the current width and zoom */
async function layout() {
  if (!doc.value) return
  const fit = availableWidth()
  const result = []
  for (let n = 1; n <= doc.value.numPages; n++) {
    const page = await doc.value.getPage(n)
    const base = page.getViewport({ scale: 1 })
    // Fit the width, but never larger than 1.6x the real size at 100%
    const scale = Math.min(fit / base.width, 1.6) * zoom.value
    result.push({ n, scale, w: Math.floor(base.width * scale), h: Math.floor(base.height * scale) })
  }
  pages.value = result
  drawn.clear()
  await nextTick()
  observe()
}

function observe() {
  observer?.disconnect()
  observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) draw(Number(e.target.dataset.page)) })
  }, { root: scroller.value, rootMargin: '600px 0px' })
  Object.values(pageEls).forEach(el => el && observer.observe(el))
}

async function draw(n) {
  const info = pages.value.find(p => p.n === n)
  const canvas = canvases[n]
  if (!info || !canvas || drawn.get(n) === info.scale) return
  drawn.set(n, info.scale)
  tasks.get(n)?.cancel()

  const page = await doc.value.getPage(n)
  const ratio = Math.min(window.devicePixelRatio || 1, 2.5)
  const viewport = page.getViewport({ scale: info.scale * ratio })
  canvas.width = Math.floor(viewport.width)
  canvas.height = Math.floor(viewport.height)
  canvas.style.width = `${info.w}px`
  canvas.style.height = `${info.h}px`

  const task = page.render({ canvasContext: canvas.getContext('2d'), viewport })
  tasks.set(n, task)
  try {
    await task.promise
  } catch (e) {
    if (e?.name !== 'RenderingCancelledException') drawn.delete(n)
  } finally {
    if (tasks.get(n) === task) tasks.delete(n)
  }
}

function setZoom(z) {
  zoom.value = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round(z * 100) / 100))
  layout()
}

async function open() {
  cleanup()
  state.value = 'loading'
  pages.value = []
  zoom.value = 1
  try {
    const lib = await loadPdfjs()
    // Fetch first so a server error is reported clearly
    const res = await fetch(props.src, { credentials: 'omit' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = new Uint8Array(await res.arrayBuffer())
    loadTask = lib.getDocument({ data, isEvalSupported: false })
    doc.value = await loadTask.promise
    pageCount.value = doc.value.numPages
    state.value = 'ready'
    await nextTick()
    lastWidth = availableWidth()
    await layout()
    emit('loaded', pageCount.value)
  } catch (e) {
    state.value = 'error'
    emit('error', e)
  }
}

function cleanup() {
  observer?.disconnect()
  tasks.forEach(t => t.cancel())
  tasks.clear()
  drawn.clear()
  loadTask?.destroy()
  loadTask = null
  doc.value = null
}

let resizeTimer = null
onMounted(() => {
  open()
  resizeObserver = new ResizeObserver(() => {
    clearTimeout(resizeTimer)
    resizeTimer = setTimeout(() => {
      const w = availableWidth()
      if (Math.abs(w - lastWidth) > 30) { lastWidth = w; layout() }
    }, 200)
  })
  resizeObserver.observe(root.value)
})

watch(() => props.src, open)

onBeforeUnmount(() => {
  clearTimeout(resizeTimer)
  resizeObserver?.disconnect()
  cleanup()
})
</script>

<style scoped>
.reader { display: flex; flex-direction: column; background: #16140f; }

.reader__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 48px;
  padding: 6px 12px 6px 20px;
  border-bottom: 1px solid var(--hs-line);
}

.reader__count { font-size: 0.8rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--hs-muted); }
.reader__zoom { display: inline-flex; gap: 2px; }

.reader__btn {
  min-width: 40px;
  height: 36px;
  border: none;
  background: rgba(239, 227, 179, 0.1);
  font-size: 1.2rem;
  font-weight: 700;
  line-height: 1;
}

.reader__btn--text { font-size: 0.8rem; min-width: 56px; }
.reader__btn:hover:not(:disabled) { background: var(--hs-gold); color: var(--hs-on-gold); }
.reader__btn:disabled { opacity: 0.35; cursor: default; }

.reader__pages {
  height: min(86vh, 1100px);
  overflow: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  outline: none;
  -webkit-overflow-scrolling: touch;
}

.reader__pages:focus-visible { box-shadow: inset 0 0 0 2px var(--hs-gold); }

.reader__page {
  position: relative;
  flex: none;
  background: #fff;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.45);
}

.reader__page canvas { display: block; }

.reader__num {
  position: absolute;
  right: 8px;
  bottom: 8px;
  padding: 2px 8px;
  font-size: 0.7rem;
  font-weight: 700;
  background: rgba(11, 10, 7, 0.75);
  color: var(--hs-cream);
}

.reader__loading { width: 100%; max-width: 760px; }
.reader__skel { height: 70vh; }

@media (max-width: 640px) {
  .reader__pages { height: 74vh; padding: 8px; }
}
</style>
