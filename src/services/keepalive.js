// Pings the API every 14 minutes to keep Render awake
import { API_BASE } from './api'
const PING_URL = `${API_BASE}/health`
const INTERVAL = 14 * 60 * 1000 // 14 minutes

let timer = null

export function startKeepAlive() {
  if (timer) return
  // Ping immediately on start
  ping()
  timer = setInterval(ping, INTERVAL)
}

export function stopKeepAlive() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

async function ping() {
  try {
    await fetch(PING_URL)
  } catch { /* silent */ }
}