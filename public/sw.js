// ============================================================
// LET REVIEWER PH — SERVICE WORKER (PWA Offline Support)
// ============================================================

const CACHE_NAME = 'let-reviewer-v1'

// Static assets to cache for offline use
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/exam/quick',
  '/exam/daily',
  '/offline',
]

// Install: cache core static files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Failed to cache some assets:', err)
      })
    })
  )
  self.skipWaiting()
})

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  )
  self.clients.claim()
})

// Fetch: serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip API routes, auth, and non-GET requests
  if (
    request.method !== 'GET' ||
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/auth/') ||
    url.pathname.includes('_next/webpack-hmr') ||
    url.hostname !== location.hostname
  ) {
    return
  }

  // Network-first for HTML pages (fresh content)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
          return response
        })
        .catch(() =>
          caches.match(request).then((cached) => cached ?? caches.match('/offline'))
        )
    )
    return
  }

  // Cache-first for static assets
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached
      return fetch(request).then((response) => {
        if (response.ok) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
        }
        return response
      })
    })
  )
})

// Background sync for offline attempts
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-attempts') {
    event.waitUntil(syncOfflineAttempts())
  }
})

async function syncOfflineAttempts() {
  // Sync queued offline answers when back online
  const db = await openDB()
  const attempts = await getOfflineAttempts(db)
  for (const attempt of attempts) {
    try {
      await fetch('/api/exam/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attempt),
      })
      await deleteOfflineAttempt(db, attempt.id)
    } catch {
      break // Stop if network still unavailable
    }
  }
}

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('let-reviewer-offline', 1)
    req.onupgradeneeded = () => req.result.createObjectStore('attempts', { keyPath: 'id' })
    req.onsuccess = () => resolve(req.result)
    req.onerror = reject
  })
}

function getOfflineAttempts(db) {
  return new Promise((resolve) => {
    const tx = db.transaction('attempts', 'readonly')
    const req = tx.objectStore('attempts').getAll()
    req.onsuccess = () => resolve(req.result || [])
    req.onerror = () => resolve([])
  })
}

function deleteOfflineAttempt(db, id) {
  return new Promise((resolve) => {
    const tx = db.transaction('attempts', 'readwrite')
    tx.objectStore('attempts').delete(id)
    tx.oncomplete = resolve
  })
}
