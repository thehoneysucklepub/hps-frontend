import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'

export const useEventsStore = defineStore('events', () => {
  const events  = ref([])
  const event   = ref(null)
  const loading = ref(false)
  const error   = ref(null)
  const meta    = ref({})

  async function fetchAll(params = {}) {
    loading.value = true
    error.value   = null
    try {
      const res    = await api.get('/events', { params })
      events.value = res.data.events
      meta.value   = res.data.meta || {}
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to load events'
    } finally {
      loading.value = false
    }
  }

  async function fetchOne(id) {
    loading.value = true
    try {
      const res   = await api.get(`/events/${id}`)
      event.value = res.data.event
    } finally {
      loading.value = false
    }
  }

  async function createEvent(payload) {
    const res = await api.post('/events', payload)
    events.value.unshift(res.data.event)
    return res.data
  }

  async function updateEvent(id, payload) {
    const res = await api.put(`/events/${id}`, payload)
    const idx = events.value.findIndex(e => e.id === id)
    if (idx !== -1) events.value[idx] = res.data.event
    return res.data
  }

  async function deleteEvent(id) {
    await api.delete(`/events/${id}`)
    events.value = events.value.filter(e => e.id !== id)
  }

  return {
    events, event, loading, error, meta,
    fetchAll, fetchOne, createEvent, updateEvent, deleteEvent
  }
})