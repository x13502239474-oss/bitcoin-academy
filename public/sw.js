/* Bitcoin Academy Service Worker —— 离线缓存课程与资源 */
const CACHE = 'bitcoin-academy-v2'

// 安装时缓存应用外壳
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      cache.addAll([
        './',
        './index.html',
        './manifest.webmanifest',
        './icons/icon-192.png',
        './icons/icon-512.png',
      ]).catch(() => {})
    ).then(() => self.skipWaiting())
  )
})

// 激活时清理旧缓存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

// 请求策略：网络优先，失败回退缓存（保证更新及时且可离线）
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return
  const url = new URL(event.request.url)
  if (url.origin !== self.location.origin) return

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200) {
          const copy = response.clone()
          caches.open(CACHE).then((cache) => cache.put(event.request, copy)).catch(() => {})
        }
        return response
      })
      .catch(() => caches.match(event.request).then((cached) => cached || caches.match('./index.html')))
  )
})
