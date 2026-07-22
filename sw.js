const CACHE_NAME = 'bseb-quiz-v1'; // नए प्रोजेक्ट का पहला वर्ज़न

// 🌟 GitHub Pages की नई रिपोजिटरी 'Class10th-quiz' का बेस पाथ
const BASE_PATH = '/Class10th-quiz';
const OFFLINE_URL = `${BASE_PATH}/offline.html`;

const ASSETS_TO_CACHE = [
  `${BASE_PATH}/`,
  `${BASE_PATH}/index.html`,
  `${BASE_PATH}/quiz.html`,
  `${BASE_PATH}/style.css`,
  `${BASE_PATH}/script.js`,
  `${BASE_PATH}/manifest.json`,
  OFFLINE_URL,
  `${BASE_PATH}/icon-192.png`
];

// 1. इंस्टॉल इवेंट (Cache Assets)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching app assets...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// 2. एक्टिवेट इवेंट (पुराना कैशे साफ़ करना)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. फ़ेच इवेंट (Network First for Pages, Cache First for Assets)
self.addEventListener('fetch', (event) => {
  // अगर यूज़र नया पेज खोल रहा है (Navigation Request)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          // अगर इंटरनेट नहीं है, तो कैश्ड पेज या ऑफलाइन पेज दिखाओ
          return caches.match(event.request).then((cachedPage) => {
            return cachedPage || caches.match(OFFLINE_URL);
          });
        })
    );
    return;
  }

  // CSS, JS, Images या JSON डेटा के लिए
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});
