const staticCacheName = 'restaurant-reviews-static-v2';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(staticCacheName).then(cache => cache.addAll([
      '/',
      '/restaurant.html',
      '/css/styles.css',
      '/js/main.js',
      '/js/restaurant_info.js',
      '/img/1-800_large.jpg', '/img/1_wide-800_large.jpg', '/img/1-600_medium_1x.jpg', '/img/1-800_medium_2x.jpg', '/img/1_crop-400_small_1x.jpg', '/img/1_crop-800_small_2x.jpg',
      '/img/2-800_large.jpg', '/img/2_wide-800_large.jpg', '/img/2-600_medium_1x.jpg', '/img/2-800_medium_2x.jpg', '/img/2-400_small_1x.jpg', '/img/2-800_small_2x.jpg',
      '/img/3-800_large.jpg', '/img/3_wide-800_large.jpg', '/img/3-600_medium_1x.jpg', '/img/3-800_medium_2x.jpg', '/img/3-400_small_1x.jpg', '/img/3-800_small_2x.jpg',
      '/img/4-800_large.jpg', '/img/4_wide-800_large.jpg', '/img/4-600_medium_1x.jpg', '/img/4-800_medium_2x.jpg', '/img/4-400_small_1x.jpg', '/img/4-800_small_2x.jpg',
      '/img/5-800_large.jpg', '/img/5_wide-800_large.jpg', '/img/5-600_medium_1x.jpg', '/img/5-800_medium_2x.jpg', '/img/5_crop-400_small_1x.jpg', '/img/5_crop-800_small_2x.jpg',
      '/img/6-800_large.jpg', '/img/6_wide-800_large.jpg', '/img/6-600_medium_1x.jpg', '/img/6-800_medium_2x.jpg', '/img/6_crop-400_small_1x.jpg', '/img/6_crop-800_small_2x.jpg',
      '/img/7-800_large.jpg', '/img/7_wide-800_large.jpg', '/img/7-600_medium_1x.jpg', '/img/7-800_medium_2x.jpg', '/img/7-400_small_1x.jpg', '/img/7-800_small_2x.jpg',
      '/img/8-800_large.jpg', '/img/8_wide-800_large.jpg', '/img/8-600_medium_1x.jpg', '/img/8-800_medium_2x.jpg', '/img/8-400_small_1x.jpg', '/img/8-800_small_2x.jpg',
      '/img/9-800_large.jpg', '/img/9_wide-800_large.jpg', '/img/9-600_medium_1x.jpg', '/img/9-800_medium_2x.jpg', '/img/9-400_small_1x.jpg', '/img/9-800_small_2x.jpg',
      '/img/10-800_large.jpg', '/img/10_wide-800_large.jpg', '/img/10-600_medium_1x.jpg', '/img/10-800_medium_2x.jpg', '/img/10_crop-400_small_1x.jpg', '/img/10_crop-800_small_2x.jpg',
      'https://unpkg.com/leaflet@1.3.1/dist/leaflet.css',
      'https://unpkg.com/leaflet@1.3.1/dist/leaflet.js',
      'https://fonts.googleapis.com/css?family=Source+Sans+Pro:200,300,400,600,700',
      'https://unpkg.com/leaflet@1.3.1/dist/images/marker-icon.png',
      'https://unpkg.com/leaflet@1.3.1/dist/images/marker-icon-2x.png',
      'https://unpkg.com/leaflet@1.3.1/dist/images/marker-shadow.png',
    ])).catch(error => console.log(error)),
  );
});
self.addEventListener('activate', (event) => {
  // delete the old versions of the cache
  event.waitUntil(
    caches.keys().then(cacheNames => Promise.all(
      cacheNames.filter(cacheName => (
        cacheName.startsWith('restaurant-reviews-') && cacheName !== staticCacheName
      )).map(cacheName => caches.delete(cacheName)),
    )).catch(error => console.log(error)),
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request)),
  );
});
