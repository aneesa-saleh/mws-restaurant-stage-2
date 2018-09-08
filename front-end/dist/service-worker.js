const staticCacheName = 'restaurant-reviews-static-v2';
const restaurantImagesCache = 'restaurant-reviews-restaurant-images';
const allCaches = [
  staticCacheName,
  restaurantImagesCache,
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(staticCacheName).then(cache => cache.addAll([
      '/',
      '/restaurant.html',
      '/css/restaurant-details.css',
      '/css/restaurants-list.css',
      '/js/dbhelper.js',
      '/js/main.js',
      '/js/restaurant_info.js',
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
        cacheName.startsWith('restaurant-reviews-') && !allCaches.includes(cacheName)
      )).map(cacheName => caches.delete(cacheName)),
    )).catch(error => console.log(error)),
  );
});

self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  if (requestUrl.origin === location.origin) {
    const restaurantImagePathRegex = /img\/[0-9_\-a-zA-Z]+\.jpg/;
    if (restaurantImagePathRegex.test(requestUrl.pathname)) {
      event.respondWith(serveRestaurantImage(event.request));
      return;
    }
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request)),
  );
});

const serveRestaurantImage = (request) => {
  // image urls have multiple - and _ for orientation, crop, pixel density and screen size
  // the relevant part of the url is before the first -
  const storageUrl = request.url.split('-')[0];

  return caches.open(restaurantImagesCache).then(
    cache => cache.match(storageUrl).then((response) => {
      if (response) return response;

      return fetch(request).then((networkResponse) => {
        cache.put(storageUrl, networkResponse.clone());
        return networkResponse;
      });
    }),
  );
};
