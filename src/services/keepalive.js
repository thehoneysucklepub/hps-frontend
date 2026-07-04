// Pings the API every 14 minutes to keep Render awake
const PING_URL = `${import.meta.env.VITE_API_BASE_URL}/health`
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