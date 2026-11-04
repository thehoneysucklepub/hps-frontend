/**
 * Image address safe to show on this page.
 * The live site is https: an http:// photo would be blocked by the browser,
 * so it is upgraded (local addresses are left alone).
 */
export function imgUrl(url) {
  if (!url) return ''
  const u = String(url).trim()
  if (typeof window !== 'undefined' && window.location.protocol === 'https:' &&
      /^http:\/\//i.test(u) && !/^http:\/\/(localhost|127\.0\.0\.1)(:|\/)/i.test(u)) {
    return u.replace(/^http:/i, 'https:')
  }
  return u
}
