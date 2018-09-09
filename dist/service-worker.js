"use strict";

var staticCacheName = 'restaurant-reviews-static-v2';
var restaurantImagesCache = 'restaurant-reviews-restaurant-images';
var mapboxTilesCache = 'restaurant-reviews-map-tiles';
var allCaches = [staticCacheName, restaurantImagesCache, mapboxTilesCache];
self.addEventListener('install', function (event) {
  event.waitUntil(caches.open(staticCacheName).then(function (cache) {
    return cache.addAll(['/', '/restaurant.html', '/data/restaurants.json', '/css/restaurant-details.css', '/css/restaurants-list.css', '/js/dbhelper.js', '/js/main.js', '/js/restaurant_info.js', '/img/offline.svg', '/img/offline_wide.svg', 'https://unpkg.com/leaflet@1.3.1/dist/leaflet.css', 'https://unpkg.com/leaflet@1.3.1/dist/leaflet.js', 'https://fonts.googleapis.com/css?family=Source+Sans+Pro:200,300,400,600,700', 'https://unpkg.com/leaflet@1.3.1/dist/images/marker-icon.png', 'https://unpkg.com/leaflet@1.3.1/dist/images/marker-icon-2x.png', 'https://unpkg.com/leaflet@1.3.1/dist/images/marker-shadow.png']);
  }).catch(function (error) {
    return console.log(error);
  }));
});
self.addEventListener('activate', function (event) {
  // delete the old versions of the cache
  event.waitUntil(caches.keys().then(function (cacheNames) {
    return Promise.all(cacheNames.filter(function (cacheName) {
      return cacheName.startsWith('restaurant-reviews-') && !allCaches.includes(cacheName);
    }).map(function (cacheName) {
      return caches.delete(cacheName);
    }));
  }).catch(function (error) {
    return console.log(error);
  }));
});
self.addEventListener('fetch', function (event) {
  var requestUrl = new URL(event.request.url);

  if (requestUrl.origin === location.origin) {
    var restaurantImagePathRegex = /img\/[0-9_\-a-zA-Z]+\.jpg/;

    if (restaurantImagePathRegex.test(requestUrl.pathname)) {
      event.respondWith(serveRestaurantImage(event.request));
      return;
    } // cache should match index.html to /


    if (requestUrl.pathname.startsWith('/index.html')) {
      event.respondWith(caches.match('/').then(function (response) {
        return response || fetch(event.request);
      }));
      return;
    }
  } else if (requestUrl.origin === 'https://api.tiles.mapbox.com') {
    event.respondWith(serveMapboxTiles(event.request));
    return;
  }

  event.respondWith(caches.match(event.request, {
    ignoreSearch: true
  }) // ignore search for /restaurant.html?id=X
  .then(function (response) {
    return response || fetch(event.request);
  }));
});

var serveRestaurantImage = function serveRestaurantImage(request) {
  // image urls have multiple - and _ for orientation, crop, pixel density and screen size
  // the relevant part of the url is before the first -
  var storageUrl = request.url.split('-')[0];
  return caches.open(restaurantImagesCache).then(function (cache) {
    return cache.match(storageUrl).then(function (response) {
      if (response) return response;
      return fetch(request).then(function (networkResponse) {
        cache.put(storageUrl, networkResponse.clone());
        return networkResponse;
      }).catch(function (error) {
        console.log(error); // use of offline images inspired by Salah Hamza's stage 1 project
        // Available at https://github.com/SalahHamza/mws-restaurant-stage-1/blob/master/sw.js

        if (request.url.includes('wide')) return caches.match('/img/offline_wide.svg');
        return caches.match('/img/offline.svg');
      });
    });
  });
};

var serveMapboxTiles = function serveMapboxTiles(request) {
  return caches.open(mapboxTilesCache).then(function (cache) {
    return cache.match(request.url).then(function (response) {
      if (response) return response;
      return fetch(request).then(function (networkResponse) {
        cache.put(request.url, networkResponse.clone());
        return networkResponse;
      });
    });
  });
};
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNlcnZpY2Utd29ya2VyLmpzIl0sIm5hbWVzIjpbInN0YXRpY0NhY2hlTmFtZSIsInJlc3RhdXJhbnRJbWFnZXNDYWNoZSIsIm1hcGJveFRpbGVzQ2FjaGUiLCJhbGxDYWNoZXMiLCJzZWxmIiwiYWRkRXZlbnRMaXN0ZW5lciIsImV2ZW50Iiwid2FpdFVudGlsIiwiY2FjaGVzIiwib3BlbiIsInRoZW4iLCJjYWNoZSIsImFkZEFsbCIsImNhdGNoIiwiZXJyb3IiLCJjb25zb2xlIiwibG9nIiwia2V5cyIsImNhY2hlTmFtZXMiLCJQcm9taXNlIiwiYWxsIiwiZmlsdGVyIiwiY2FjaGVOYW1lIiwic3RhcnRzV2l0aCIsImluY2x1ZGVzIiwibWFwIiwiZGVsZXRlIiwicmVxdWVzdFVybCIsIlVSTCIsInJlcXVlc3QiLCJ1cmwiLCJvcmlnaW4iLCJsb2NhdGlvbiIsInJlc3RhdXJhbnRJbWFnZVBhdGhSZWdleCIsInRlc3QiLCJwYXRobmFtZSIsInJlc3BvbmRXaXRoIiwic2VydmVSZXN0YXVyYW50SW1hZ2UiLCJtYXRjaCIsInJlc3BvbnNlIiwiZmV0Y2giLCJzZXJ2ZU1hcGJveFRpbGVzIiwiaWdub3JlU2VhcmNoIiwic3RvcmFnZVVybCIsInNwbGl0IiwibmV0d29ya1Jlc3BvbnNlIiwicHV0IiwiY2xvbmUiXSwibWFwcGluZ3MiOiI7O0FBQUEsSUFBTUEsZUFBZSxHQUFHLDhCQUF4QjtBQUNBLElBQU1DLHFCQUFxQixHQUFHLHNDQUE5QjtBQUNBLElBQU1DLGdCQUFnQixHQUFHLDhCQUF6QjtBQUNBLElBQU1DLFNBQVMsR0FBRyxDQUNoQkgsZUFEZ0IsRUFFaEJDLHFCQUZnQixFQUdoQkMsZ0JBSGdCLENBQWxCO0FBTUFFLElBQUksQ0FBQ0MsZ0JBQUwsQ0FBc0IsU0FBdEIsRUFBaUMsVUFBQ0MsS0FBRCxFQUFXO0FBQzFDQSxFQUFBQSxLQUFLLENBQUNDLFNBQU4sQ0FDRUMsTUFBTSxDQUFDQyxJQUFQLENBQVlULGVBQVosRUFBNkJVLElBQTdCLENBQWtD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LEdBQUcsU0FBbkJBLGdCQUFtQixDQUFBWixPQUFPO0FBQUEsU0FBSXJCLE1BQU0sQ0FBQ0MsSUFBUCxDQUFZUCxnQkFBWixFQUE4QlEsSUFBOUIsQ0FDbEMsVUFBQUMsS0FBSztBQUFBLFdBQUlBLEtBQUssQ0FBQzJCLEtBQU4sQ0FBWVQsT0FBTyxDQUFDQyxHQUFwQixFQUF5QnBCLElBQXpCLENBQThCLFVBQUM2QixRQUFELEVBQWM7QUFDbkQsVUFBSUEsUUFBSixFQUFjLE9BQU9BLFFBQVA7QUFFZCxhQUFPQyxLQUFLLENBQUNYLE9BQUQsQ0FBTCxDQUFlbkIsSUFBZixDQUFvQixVQUFDbUMsZUFBRCxFQUFxQjtBQUM5Q2xDLFFBQUFBLEtBQUssQ0FBQ21DLEdBQU4sQ0FBVWpCLE9BQU8sQ0FBQ0MsR0FBbEIsRUFBdUJlLGVBQWUsQ0FBQ0UsS0FBaEIsRUFBdkI7QUFDQSxlQUFPRixlQUFQO0FBQ0QsT0FITSxDQUFQO0FBSUQsS0FQUSxDQUFKO0FBQUEsR0FENkIsQ0FBSjtBQUFBLENBQWhDIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3Qgc3RhdGljQ2FjaGVOYW1lID0gJ3Jlc3RhdXJhbnQtcmV2aWV3cy1zdGF0aWMtdjInO1xuY29uc3QgcmVzdGF1cmFudEltYWdlc0NhY2hlID0gJ3Jlc3RhdXJhbnQtcmV2aWV3cy1yZXN0YXVyYW50LWltYWdlcyc7XG5jb25zdCBtYXBib3hUaWxlc0NhY2hlID0gJ3Jlc3RhdXJhbnQtcmV2aWV3cy1tYXAtdGlsZXMnO1xuY29uc3QgYWxsQ2FjaGVzID0gW1xuICBzdGF0aWNDYWNoZU5hbWUsXG4gIHJlc3RhdXJhbnRJbWFnZXNDYWNoZSxcbiAgbWFwYm94VGlsZXNDYWNoZSxcbl07XG5cbnNlbGYuYWRkRXZlbnRMaXN0ZW5lcignaW5zdGFsbCcsIChldmVudCkgPT4ge1xuICBldmVudC53YWl0VW50aWwoXG4gICAgY2FjaGVzLm9wZW4oc3RhdGljQ2FjaGVOYW1lKS50aGVuKGNhY2hlID0+IGNhY2hlLmFkZEFsbChbXG4gICAgICAnLycsXG4gICAgICAnL3Jlc3RhdXJhbnQuaHRtbCcsXG4gICAgICAnL2RhdGEvcmVzdGF1cmFudHMuanNvbicsXG4gICAgICAnL2Nzcy9yZXN0YXVyYW50LWRldGFpbHMuY3NzJyxcbiAgICAgICcvY3NzL3Jlc3RhdXJhbnRzLWxpc3QuY3NzJyxcbiAgICAgICcvanMvZGJoZWxwZXIuanMnLFxuICAgICAgJy9qcy9tYWluLmpzJyxcbiAgICAgICcvanMvcmVzdGF1cmFudF9pbmZvLmpzJyxcbiAgICAgICcvaW1nL29mZmxpbmUuc3ZnJyxcbiAgICAgICcvaW1nL29mZmxpbmVfd2lkZS5zdmcnLFxuICAgICAgJ2h0dHBzOi8vdW5wa2cuY29tL2xlYWZsZXRAMS4zLjEvZGlzdC9sZWFmbGV0LmNzcycsXG4gICAgICAnaHR0cHM6Ly91bnBrZy5jb20vbGVhZmxldEAxLjMuMS9kaXN0L2xlYWZsZXQuanMnLFxuICAgICAgJ2h0dHBzOi8vZm9udHMuZ29vZ2xlYXBpcy5jb20vY3NzP2ZhbWlseT1Tb3VyY2UrU2FucytQcm86MjAwLDMwMCw0MDAsNjAwLDcwMCcsXG4gICAgICAnaHR0cHM6Ly91bnBrZy5jb20vbGVhZmxldEAxLjMuMS9kaXN0L2ltYWdlcy9tYXJrZXItaWNvbi5wbmcnLFxuICAgICAgJ2h0dHBzOi8vdW5wa2cuY29tL2xlYWZsZXRAMS4zLjEvZGlzdC9pbWFnZXMvbWFya2VyLWljb24tMngucG5nJyxcbiAgICAgICdodHRwczovL3VucGtnLmNvbS9sZWFmbGV0QDEuMy4xL2Rpc3QvaW1hZ2VzL21hcmtlci1zaGFkb3cucG5nJyxcbiAgICBdKSkuY2F0Y2goZXJyb3IgPT4gY29uc29sZS5sb2coZXJyb3IpKSxcbiAgKTtcbn0pO1xuXG5zZWxmLmFkZEV2ZW50TGlzdGVuZXIoJ2FjdGl2YXRlJywgKGV2ZW50KSA9PiB7XG4gIC8vIGRlbGV0ZSB0aGUgb2xkIHZlcnNpb25zIG9mIHRoZSBjYWNoZVxuICBldmVudC53YWl0VW50aWwoXG4gICAgY2FjaGVzLmtleXMoKS50aGVuKGNhY2hlTmFtZXMgPT4gUHJvbWlzZS5hbGwoXG4gICAgICBjYWNoZU5hbWVzLmZpbHRlcihjYWNoZU5hbWUgPT4gKFxuICAgICAgICBjYWNoZU5hbWUuc3RhcnRzV2l0aCgncmVzdGF1cmFudC1yZXZpZXdzLScpICYmICFhbGxDYWNoZXMuaW5jbHVkZXMoY2FjaGVOYW1lKVxuICAgICAgKSkubWFwKGNhY2hlTmFtZSA9PiBjYWNoZXMuZGVsZXRlKGNhY2hlTmFtZSkpLFxuICAgICkpLmNhdGNoKGVycm9yID0+IGNvbnNvbGUubG9nKGVycm9yKSksXG4gICk7XG59KTtcblxuc2VsZi5hZGRFdmVudExpc3RlbmVyKCdmZXRjaCcsIChldmVudCkgPT4ge1xuICBjb25zdCByZXF1ZXN0VXJsID0gbmV3IFVSTChldmVudC5yZXF1ZXN0LnVybCk7XG5cbiAgaWYgKHJlcXVlc3RVcmwub3JpZ2luID09PSBsb2NhdGlvbi5vcmlnaW4pIHtcbiAgICBjb25zdCByZXN0YXVyYW50SW1hZ2VQYXRoUmVnZXggPSAvaW1nXFwvWzAtOV9cXC1hLXpBLVpdK1xcLmpwZy87XG4gICAgaWYgKHJlc3RhdXJhbnRJbWFnZVBhdGhSZWdleC50ZXN0KHJlcXVlc3RVcmwucGF0aG5hbWUpKSB7XG4gICAgICBldmVudC5yZXNwb25kV2l0aChzZXJ2ZVJlc3RhdXJhbnRJbWFnZShldmVudC5yZXF1ZXN0KSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gY2FjaGUgc2hvdWxkIG1hdGNoIGluZGV4Lmh0bWwgdG8gL1xuICAgIGlmIChyZXF1ZXN0VXJsLnBhdGhuYW1lLnN0YXJ0c1dpdGgoJy9pbmRleC5odG1sJykpIHtcbiAgICAgIGV2ZW50LnJlc3BvbmRXaXRoKGNhY2hlcy5tYXRjaCgnLycpXG4gICAgICAgIC50aGVuKHJlc3BvbnNlID0+IHJlc3BvbnNlIHx8IGZldGNoKGV2ZW50LnJlcXVlc3QpKSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICB9IGVsc2UgaWYgKHJlcXVlc3RVcmwub3JpZ2luID09PSAnaHR0cHM6Ly9hcGkudGlsZXMubWFwYm94LmNvbScpIHtcbiAgICBldmVudC5yZXNwb25kV2l0aChzZXJ2ZU1hcGJveFRpbGVzKGV2ZW50LnJlcXVlc3QpKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBldmVudC5yZXNwb25kV2l0aChcbiAgICBjYWNoZXMubWF0Y2goZXZlbnQucmVxdWVzdCwgeyBpZ25vcmVTZWFyY2g6IHRydWUgfSkgLy8gaWdub3JlIHNlYXJjaCBmb3IgL3Jlc3RhdXJhbnQuaHRtbD9pZD1YXG4gICAgICAudGhlbihyZXNwb25zZSA9PiByZXNwb25zZSB8fCBmZXRjaChldmVudC5yZXF1ZXN0KSksXG4gICk7XG59KTtcblxuY29uc3Qgc2VydmVSZXN0YXVyYW50SW1hZ2UgPSAocmVxdWVzdCkgPT4ge1xuICAvLyBpbWFnZSB1cmxzIGhhdmUgbXVsdGlwbGUgLSBhbmQgXyBmb3Igb3JpZW50YXRpb24sIGNyb3AsIHBpeGVsIGRlbnNpdHkgYW5kIHNjcmVlbiBzaXplXG4gIC8vIHRoZSByZWxldmFudCBwYXJ0IG9mIHRoZSB1cmwgaXMgYmVmb3JlIHRoZSBmaXJzdCAtXG4gIGNvbnN0IHN0b3JhZ2VVcmwgPSByZXF1ZXN0LnVybC5zcGxpdCgnLScpWzBdO1xuXG4gIHJldHVybiBjYWNoZXMub3BlbihyZXN0YXVyYW50SW1hZ2VzQ2FjaGUpLnRoZW4oXG4gICAgY2FjaGUgPT4gY2FjaGUubWF0Y2goc3RvcmFnZVVybCkudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgIGlmIChyZXNwb25zZSkgcmV0dXJuIHJlc3BvbnNlO1xuXG4gICAgICByZXR1cm4gZmV0Y2gocmVxdWVzdCkudGhlbigobmV0d29ya1Jlc3BvbnNlKSA9PiB7XG4gICAgICAgIGNhY2hlLnB1dChzdG9yYWdlVXJsLCBuZXR3b3JrUmVzcG9uc2UuY2xvbmUoKSk7XG4gICAgICAgIHJldHVybiBuZXR3b3JrUmVzcG9uc2U7XG4gICAgICB9KS5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xuICAgICAgICAvLyB1c2Ugb2Ygb2ZmbGluZSBpbWFnZXMgaW5zcGlyZWQgYnkgU2FsYWggSGFtemEncyBzdGFnZSAxIHByb2plY3RcbiAgICAgICAgLy8gQXZhaWxhYmxlIGF0IGh0dHBzOi8vZ2l0aHViLmNvbS9TYWxhaEhhbXphL213cy1yZXN0YXVyYW50LXN0YWdlLTEvYmxvYi9tYXN0ZXIvc3cuanNcbiAgICAgICAgaWYgKHJlcXVlc3QudXJsLmluY2x1ZGVzKCd3aWRlJykpIHJldHVybiBjYWNoZXMubWF0Y2goJy9pbWcvb2ZmbGluZV93aWRlLnN2ZycpO1xuICAgICAgICByZXR1cm4gY2FjaGVzLm1hdGNoKCcvaW1nL29mZmxpbmUuc3ZnJyk7XG4gICAgICB9KTtcbiAgICB9KSxcbiAgKTtcbn07XG5cbmNvbnN0IHNlcnZlTWFwYm94VGlsZXMgPSByZXF1ZXN0ID0+IGNhY2hlcy5vcGVuKG1hcGJveFRpbGVzQ2FjaGUpLnRoZW4oXG4gIGNhY2hlID0+IGNhY2hlLm1hdGNoKHJlcXVlc3QudXJsKS50aGVuKChyZXNwb25zZSkgPT4ge1xuICAgIGlmIChyZXNwb25zZSkgcmV0dXJuIHJlc3BvbnNlO1xuXG4gICAgcmV0dXJuIGZldGNoKHJlcXVlc3QpLnRoZW4oKG5ldHdvcmtSZXNwb25zZSkgPT4ge1xuICAgICAgY2FjaGUucHV0KHJlcXVlc3QudXJsLCBuZXR3b3JrUmVzcG9uc2UuY2xvbmUoKSk7XG4gICAgICByZXR1cm4gbmV0d29ya1Jlc3BvbnNlO1xuICAgIH0pO1xuICB9KSxcbik7XG4iXSwiZmlsZSI6InNlcnZpY2Utd29ya2VyLmpzIn0=
