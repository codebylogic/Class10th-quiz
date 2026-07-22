const CACHE_NAME = 'bseb-quiz-v5'; // 🌟 वर्जन बढ़ा दिया (v4 से v5)
const OFFLINE_URL = '/Class-10th-maha-quiz-/offline.html';
const ASSETS_TO_CACHE = [
  '/Class-10th-maha-quiz-/index.html',
  '/Class-10th-maha-quiz-/manifest.json',
  OFFLINE_URL,
  '/Class-10th-maha-quiz-/icon-192.png',
  '/Class-10th-maha-quiz-/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache); // पुराना कैश डिलीट करना बहुत ज़रूरी है
          }
        })
      );
    })
  );
});

// 🌟 असली सुधार यहाँ है (Fetch Event में):
self.addEventListener('fetch', (event) => {
  // अगर छात्र पेज खोल रहा है (Navigation request)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request) // पहले नेटवर्क से कोशिश करो
        .catch(() => caches.match(OFFLINE_URL)) // अगर इंटरनेट नहीं है, तो ऑफलाइन फाइल दिखाओ
    );
    return;
  }

  // अगर कोई इमेज या अन्य फाइल है, तो कैश का इस्तेमाल करो
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});
