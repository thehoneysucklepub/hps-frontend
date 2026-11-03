import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

/**
 * The current "night" at the pub: until 6AM it is still the previous day's
 * night (a 9PM - 3AM set on Friday is "tonight" at 1AM on Saturday).
 */
export function useTonight() {
  const now = ref(new Date())
  let timer
  onMounted(() => { timer = setInterval(() => { now.value = new Date() }, 60_000) })
  onBeforeUnmount(() => clearInterval(timer))

  const nightDay = computed(() => {
    const d = new Date(now.value)
    if (d.getHours() < 6) d.setDate(d.getDate() - 1)
    return d.getDay()
  })

  /** The next 7 nights starting tonight, as { day, date } */
  const nextSeven = computed(() => {
    const start = new Date(now.value)
    if (start.getHours() < 6) start.setDate(start.getDate() - 1)
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      return { day: d.getDay(), date: d, offset: i }
    })
  })

  return { now, nightDay, nextSeven }
}
