"use strict";

var restaurants;
var neighborhoods;
var cuisines;
var newMap;
var markers = [];
/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */

document.addEventListener('DOMContentLoaded', function (event) {
  initMap(); // added

  fetchNeighborhoods();
  fetchCuisines();
  registerServiceWorker();
});
/**
 * Fetch all neighborhoods and set their HTML.
 */

fetchNeighborhoods = function fetchNeighborhoods() {
  DBHelper.fetchNeighborhoods(function (error, neighborhoods) {
    if (error) {
      // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
};
/**
 * Set neighborhoods HTML.
 */


fillNeighborhoodsHTML = function fillNeighborhoodsHTML() {
  var neighborhoods = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : self.neighborhoods;
  var select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(function (neighborhood) {
    var option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
};
/**
 * Fetch all cuisines and set their HTML.
 */


fetchCuisines = function fetchCuisines() {
  DBHelper.fetchCuisines(function (error, cuisines) {
    if (error) {
      // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
};
/**
 * Set cuisines HTML.
 */


fillCuisinesHTML = function fillCuisinesHTML() {
  var cuisines = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : self.cuisines;
  var select = document.getElementById('cuisines-select');
  cuisines.forEach(function (cuisine) {
    var option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
};
/**
 * Initialize leaflet map, called from HTML.
 */


initMap = function initMap() {
  var MAPBOX_API_KEY = 'pk.eyJ1IjoiYW5lZXNhLXNhbGVoIiwiYSI6ImNqa2xmZHVwMDFoYW4zdnAwYWplMm53bHEifQ.V11dDOtEnWSwTxY-C8mJLw';
  self.newMap = L.map('map', {
    center: [40.722216, -73.987501],
    zoom: 12,
    scrollWheelZoom: false
  });
  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
    mapboxToken: MAPBOX_API_KEY,
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' + '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' + 'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    id: 'mapbox.streets'
  }).addTo(newMap);
  updateRestaurants();
};
/**
 * Update page and map for current restaurants.
 */


updateRestaurants = function updateRestaurants() {
  var cSelect = document.getElementById('cuisines-select');
  var nSelect = document.getElementById('neighborhoods-select');
  var cIndex = cSelect.selectedIndex;
  var nIndex = nSelect.selectedIndex;
  var cuisine = cSelect[cIndex].value;
  var neighborhood = nSelect[nIndex].value;
  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, function (error, restaurants) {
    if (error) {
      // Got an error!
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
  });
};
/**
 * Clear current restaurants, their HTML and remove their map markers.
 */


resetRestaurants = function resetRestaurants(restaurants) {
  // Remove all restaurants
  self.restaurants = [];
  var ul = document.getElementById('restaurants-list');
  ul.innerHTML = ''; // Remove all map markers

  if (self.markers) {
    self.markers.forEach(function (marker) {
      return marker.remove();
    });
  }

  self.markers = [];
  self.restaurants = restaurants;
};
/**
 * Create all restaurants HTML and add them to the webpage.
 */


fillRestaurantsHTML = function fillRestaurantsHTML() {
  var restaurants = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : self.restaurants;
  var ul = document.getElementById('restaurants-list');
  restaurants.forEach(function (restaurant) {
    ul.append(createRestaurantHTML(restaurant));
  });
  addMarkersToMap();
};
/**
 * Create restaurant HTML.
 */


createRestaurantHTML = function createRestaurantHTML(restaurant) {
  var article = document.createElement('article');
  var picture = document.createElement('picture'); // a two-column layout is used for larger viewports
  // medium images are displayed for wide single-column (451px - 749px) and wide 2-column viewports (>= 950px)

  var sourceMedium = document.createElement('source');
  sourceMedium.media = '(min-width: 451px) and (max-width: 749px), (min-width: 950px)';
  sourceMedium.srcset = DBHelper.imageUrlForRestaurant(restaurant, {
    size: 'medium'
  });
  sourceMedium.type = 'image/jpeg';
  picture.appendChild(sourceMedium); // small images are displayed for small single-column (<= 450px) and small 2-column viewports (750px - 949px)

  var sourceSmall = document.createElement('source');
  sourceSmall.media = '(max-width: 450px), (min-width: 750px) and (max-width: 949px)';
  sourceSmall.srcset = DBHelper.imageUrlForRestaurant(restaurant, {
    size: 'small'
  });
  sourceSmall.type = 'image/jpeg';
  picture.appendChild(sourceSmall);
  var image = document.createElement('img');
  image.className = 'restaurant-img'; // set default size in case picture element is not supported

  image.src = DBHelper.imageUrlForRestaurant(restaurant, {
    size: 'medium'
  });
  image.alt = restaurant.alt;
  picture.appendChild(image);
  article.append(picture);
  var span = document.createElement('span');
  var name = document.createElement('h2');
  name.innerHTML = restaurant.name;
  span.append(name);
  var neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  span.append(neighborhood);
  var address = document.createElement('p');
  address.innerHTML = restaurant.address;
  span.append(address);
  var more = document.createElement('a');
  more.innerHTML = 'View Details';
  more.setAttribute('aria-label', "View Details of ".concat(restaurant.name));
  more.href = DBHelper.urlForRestaurant(restaurant);
  span.append(more);
  article.append(span);
  return article;
};
/**
 * Add markers for current restaurants to the map.
 */


addMarkersToMap = function addMarkersToMap() {
  var restaurants = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : self.restaurants;
  restaurants.forEach(function (restaurant) {
    // Add marker to the map
    var marker = DBHelper.mapMarkerForRestaurant(restaurant, self.newMap);
    marker.on('click', onClick);

    function onClick() {
      window.location.href = marker.options.url;
    }

    self.markers.push(marker);
  });
};

registerServiceWorker = function registerServiceWorker() {
  if (!navigator.serviceWorker) return;
  navigator.serviceWorker.register('/service-worker.js').catch(function (error) {
    return console.log(error);
  });
};
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOlsicmVzdGF1cmFudHMiLCJuZWlnaGJvcmhvb2RzIiwiY3Vpc2luZXMiLCJuZXdNYXAiLCJtYXJrZXJzIiwiZG9jdW1lbnQiLCJhZGRFdmVudExpc3RlbmVyIiwiZXZlbnQiLCJpbml0TWFwIiwiZmV0Y2hOZWlnaGJvcmhvb2RzIiwiZmV0Y2hDdWlzaW5lcyIsInJlZ2lzdGVyU2VydmljZVdvcmtlciIsIkRCSGVscGVyIiwiZXJyb3IiLCJjb25zb2xlIiwic2VsZiIsImZpbGxOZWlnaGJvcmhvb2RzSFRNTCIsInNlbGVjdCIsImdldEVsZW1lbnRCeUlkIiwiZm9yRWFjaCIsIm5laWdoYm9yaG9vZCIsIm9wdGlvbiIsImNyZWF0ZUVsZW1lbnQiLCJpbm5lckhUTUwiLCJ2YWx1ZSIsImFwcGVuZCIsImZpbGxDdWlzaW5lc0hUTUwiLCJjdWlzaW5lIiwiTUFQQk9YX0FQSV9LRVkiLCJMIiwibWFwIiwiY2VudGVyIiwiem9vbSIsInNjcm9sbFdoZWVsWm9vbSIsInRpbGVMYXllciIsIm1hcGJveFRva2VuIiwibWF4Wm9vbSIsImF0dHJpYnV0aW9uIiwiaWQiLCJhZGRUbyIsInVwZGF0ZVJlc3RhdXJhbnRzIiwiY1NlbGVjdCIsIm5TZWxlY3QiLCJjSW5kZXgiLCJzZWxlY3RlZEluZGV4IiwibkluZGV4IiwiZmV0Y2hSZXN0YXVyYW50QnlDdWlzaW5lQW5kTmVpZ2hib3Job29kIiwicmVzZXRSZXN0YXVyYW50cyIsImZpbGxSZXN0YXVyYW50c0hUTUwiLCJ1bCIsIm1hcmtlciIsInJlbW92ZSIsInJlc3RhdXJhbnQiLCJjcmVhdGVSZXN0YXVyYW50SFRNTCIsImFkZE1hcmtlcnNUb01hcCIsImFydGljbGUiLCJwaWN0dXJlIiwic291cmNlTWVkaXVtIiwibWVkaWEiLCJzcmNzZXQiLCJpbWFnZVVybEZvclJlc3RhdXJhbnQiLCJzaXplIiwidHlwZSIsImFwcGVuZENoaWxkIiwic291cmNlU21hbGwiLCJpbWFnZSIsImNsYXNzTmFtZSIsInNyYyIsImFsdCIsInNwYW4iLCJuYW1lIiwiYWRkcmVzcyIsIm1vcmUiLCJzZXRBdHRyaWJ1dGUiLCJocmVmIiwidXJsRm9yUmVzdGF1cmFudCIsIm1hcE1hcmtlckZvclJlc3RhdXJhbnQiLCJvbiIsIm9uQ2xpY2siLCJ3aW5kb3ciLCJsb2NhdGlvbiIsIm9wdGlvbnMiLCJ1cmwiLCJwdXNoIiwibmF2aWdhdG9yIiwic2VydmljZVdvcmtlciIsInJlZ2lzdGVyIiwiY2F0Y2giLCJsb2ciXSwibWFwcGluZ3MiOiI7O0FBQUEsSUFBSUEsV0FBSjtBQUNBLElBQUlDLGFBQUo7QUFDQSxJQUFJQyxRQUFKO0FBQ0EsSUFBSUMsTUFBSjtBQUNBLElBQUlDLE9BQU8sR0FBRyxFQUFkO0FBRUE7Ozs7QUFHQUMsUUFBUSxDQUFDQyxnQkFBVCxDQUEwQixrQkFBMUIsRUFBOEMsVUFBQ0MsS0FBRCxFQUFXO0FBQ3ZEQyxFQUFBQSxPQUFPLEdBRGdELENBQzVDOztBQUNYQyxFQUFBQSxrQkFBa0I7QUFDbEJDLEVBQUFBLGFBQWE7QUFDYkMsRUFBQUEscUJBQXFCO0FBQ3RCLENBTEQ7QUFPQTs7OztBQUdBRixrQkFBa0IsR0FBRyw4QkFBTTtBQUN6QkcsRUFBQUEsUUFBUSxDQUFDSCxrQkFBVCxDQUE0QixVQUFDSSxLQUFELEVBQVFaLGFBQVIsRUFBMEI7QUFDcEQsUUFBSVksS0FBSixFQUFXO0FBQUU7QUFDWEMsTUFBQUEsT0FBTyxDQUFDRCxLQUFSLENBQWNBLEtBQWQ7QUFDRCxLQUZELE1BRU87QUFDTEUsTUFBQUEsSUFBSSxDQUFDZCxhQUFMLEdBQXFCQSxhQUFyQjtBQUNBZSxNQUFBQSxxQkFBcUI7QUFDdEI7QUFDRixHQVBEO0FBUUQsQ0FURDtBQVdBOzs7OztBQUdBQSxxQkFBcUIsR0FBRyxpQ0FBd0M7QUFBQSxNQUF2Q2YsYUFBdUMsdUVBQXZCYyxJQUFJLENBQUNkLGFBQWtCO0FBQzlELE1BQU1nQixNQUFNLEdBQUdaLFFBQVEsQ0FBQ2EsY0FBVCxDQUF3QixzQkFBeEIsQ0FBZjtBQUNBakIsRUFB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dCI6WyJsZXQgcmVzdGF1cmFudHM7XG5sZXQgbmVpZ2hib3Job29kcztcbmxldCBjdWlzaW5lcztcbnZhciBuZXdNYXA7XG52YXIgbWFya2VycyA9IFtdO1xuXG4vKipcbiAqIEZldGNoIG5laWdoYm9yaG9vZHMgYW5kIGN1aXNpbmVzIGFzIHNvb24gYXMgdGhlIHBhZ2UgaXMgbG9hZGVkLlxuICovXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgKGV2ZW50KSA9PiB7XG4gIGluaXRNYXAoKTsgLy8gYWRkZWRcbiAgZmV0Y2hOZWlnaGJvcmhvb2RzKCk7XG4gIGZldGNoQ3Vpc2luZXMoKTtcbiAgcmVnaXN0ZXJTZXJ2aWNlV29ya2VyKCk7XG59KTtcblxuLyoqXG4gKiBGZXRjaCBhbGwgbmVpZ2hib3Job29kcyBhbmQgc2V0IHRoZWlyIEhUTUwuXG4gKi9cbmZldGNoTmVpZ2hib3Job29kcyA9ICgpID0+IHtcbiAgREJIZWxwZXIuZmV0Y2hOZWlnaGJvcmhvb2RzKChlcnJvciwgbmVpZ2hib3Job29kcykgPT4ge1xuICAgIGlmIChlcnJvcikgeyAvLyBHb3QgYW4gZXJyb3JcbiAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzZWxmLm5laWdoYm9yaG9vZHMgPSBuZWlnaGJvcmhvb2RzO1xuICAgICAgZmlsbE5laWdoYm9yaG9vZHNIVE1MKCk7XG4gICAgfVxuICB9KTtcbn07XG5cbi8qKlxuICogU2V0IG5laWdoYm9yaG9vZHMgSFRNTC5cbiAqL1xuZmlsbE5laWdoYm9yaG9vZHNIVE1MID0gKG5laWdoYm9yaG9vZHMgPSBzZWxmLm5laWdoYm9yaG9vZHMpID0+IHtcbiAgY29uc3Qgc2VsZWN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25laWdoYm9yaG9vZHMtc2VsZWN0Jyk7XG4gIG5laWdoYm9yaG9vZHMuZm9yRWFjaCgobmVpZ2hib3Job29kKSA9PiB7XG4gICAgY29uc3Qgb3B0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnb3B0aW9uJyk7XG4gICAgb3B0aW9uLmlubmVySFRNTCA9IG5laWdoYm9yaG9vZDtcbiAgICBvcHRpb24udmFsdWUgPSBuZWlnaGJvcmhvb2Q7XG4gICAgc2VsZWN0LmFwcGVuZChvcHRpb24pO1xuICB9KTtcbn07XG5cbi8qKlxuICogRmV0Y2ggYWxsIGN1aXNpbmVzIGFuZCBzZXQgdGhlaXIgSFRNTC5cbiAqL1xuZmV0Y2hDdWlzaW5lcyA9ICgpID0+IHtcbiAgREJIZWxwZXIuZmV0Y2hDdWlzaW5lcygoZXJyb3IsIGN1aXNpbmVzKSA9PiB7XG4gICAgaWYgKGVycm9yKSB7IC8vIEdvdCBhbiBlcnJvciFcbiAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzZWxmLmN1aXNpbmVzID0gY3Vpc2luZXM7XG4gICAgICBmaWxsQ3Vpc2luZXNIVE1MKCk7XG4gICAgfVxuICB9KTtcbn07XG5cbi8qKlxuICogU2V0IGN1aXNpbmVzIEhUTUwuXG4gKi9cbmZpbGxDdWlzaW5lc0hUTUwgPSAoY3Vpc2luZXMgPSBzZWxmLmN1aXNpbmVzKSA9PiB7XG4gIGNvbnN0IHNlbGVjdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjdWlzaW5lcy1zZWxlY3QnKTtcblxuICBjdWlzaW5lcy5mb3JFYWNoKChjdWlzaW5lKSA9PiB7XG4gICAgY29uc3Qgb3B0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnb3B0aW9uJyk7XG4gICAgb3B0aW9uLmlubmVySFRNTCA9IGN1aXNpbmU7XG4gICAgb3B0aW9uLnZhbHVlID0gY3Vpc2luZTtcbiAgICBzZWxlY3QuYXBwZW5kKG9wdGlvbik7XG4gIH0pO1xufTtcblxuLyoqXG4gKiBJbml0aWFsaXplIGxlYWZsZXQgbWFwLCBjYWxsZWQgZnJvbSBIVE1MLlxuICovXG5pbml0TWFwID0gKCkgPT4ge1xuICBjb25zdCBNQVBCT1hfQVBJX0tFWSA9ICdway5leUoxSWpvaVlXNWxaWE5oTFhOaGJHVm9JaXdpWVNJNkltTnFhMnhtWkhWd01ERm9ZVzR6ZG5Bd1lXcGxNbTUzYkhFaWZRLlYxMWRET3RFbldTd1R4WS1DOG1KTHcnO1xuICBzZWxmLm5ld01hcCA9IEwubWFwKCdtYXAnLCB7XG4gICAgY2VudGVyOiBbNDAuNzIyMjE2LCAtNzMuOTg3NTAxXSxcbiAgICB6b29tOiAxMixcbiAgICBzY3JvbGxXaGVlbFpvb206IGZhbHNlLFxuICB9KTtcbiAgTC50aWxlTGF5ZXIoJ2h0dHBzOi8vYXBpLnRpbGVzLm1hcGJveC5jb20vdjQve2lkfS97en0ve3h9L3t5fS5qcGc3MD9hY2Nlc3NfdG9rZW49e21hcGJveFRva2VufScsIHtcbiAgICBtYXBib3hUb2tlbjogTUFQQk9YX0FQSV9LRVksXG4gICAgbWF4Wm9vbTogMTgsXG4gICAgYXR0cmlidXRpb246ICdNYXAgZGF0YSAmY29weTsgPGEgaHJlZj1cImh0dHBzOi8vd3d3Lm9wZW5zdHJlZXRtYXAub3JnL1wiPk9wZW5TdHJlZXRNYXA8L2E+IGNvbnRyaWJ1dG9ycywgJ1xuICAgICAgKyAnPGEgaHJlZj1cImh0dHBzOi8vY3JlYXRpdmVjb21tb25zLm9yZy9saWNlbnNlcy9ieS1zYS8yLjAvXCI+Q0MtQlktU0E8L2E+LCAnXG4gICAgICArICdJbWFnZXJ5IMKpIDxhIGhyZWY9XCJodHRwczovL3d3dy5tYXBib3guY29tL1wiPk1hcGJveDwvYT4nLFxuICAgIGlkOiAnbWFwYm94LnN0cmVldHMnLFxuICB9KS5hZGRUbyhuZXdNYXApO1xuXG4gIHVwZGF0ZVJlc3RhdXJhbnRzKCk7XG59O1xuXG4vKipcbiAqIFVwZGF0ZSBwYWdlIGFuZCBtYXAgZm9yIGN1cnJlbnQgcmVzdGF1cmFudHMuXG4gKi9cbnVwZGF0ZVJlc3RhdXJhbnRzID0gKCkgPT4ge1xuICBjb25zdCBjU2VsZWN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2N1aXNpbmVzLXNlbGVjdCcpO1xuICBjb25zdCBuU2VsZWN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25laWdoYm9yaG9vZHMtc2VsZWN0Jyk7XG5cbiAgY29uc3QgY0luZGV4ID0gY1NlbGVjdC5zZWxlY3RlZEluZGV4O1xuICBjb25zdCBuSW5kZXggPSBuU2VsZWN0LnNlbGVjdGVkSW5kZXg7XG5cbiAgY29uc3QgY3Vpc2luZSA9IGNTZWxlY3RbY0luZGV4XS52YWx1ZTtcbiAgY29uc3QgbmVpZ2hib3Job29kID0gblNlbGVjdFtuSW5kZXhdLnZhbHVlO1xuXG4gIERCSGVscGVyLmZldGNoUmVzdGF1cmFudEJ5Q3Vpc2luZUFuZE5laWdoYm9yaG9vZChjdWlzaW5lLCBuZWlnaGJvcmhvb2QsIChlcnJvciwgcmVzdGF1cmFudHMpID0+IHtcbiAgICBpZiAoZXJyb3IpIHsgLy8gR290IGFuIGVycm9yIVxuICAgICAgY29uc29sZS5lcnJvcihlcnJvcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc2V0UmVzdGF1cmFudHMocmVzdGF1cmFudHMpO1xuICAgICAgZmlsbFJlc3RhdXJhbnRzSFRNTCgpO1xuICAgIH1cbiAgfSk7XG59O1xuXG4vKipcbiAqIENsZWFyIGN1cnJlbnQgcmVzdGF1cmFudHMsIHRoZWlyIEhUTUwgYW5kIHJlbW92ZSB0aGVpciBtYXAgbWFya2Vycy5cbiAqL1xucmVzZXRSZXN0YXVyYW50cyA9IChyZXN0YXVyYW50cykgPT4ge1xuICAvLyBSZW1vdmUgYWxsIHJlc3RhdXJhbnRzXG4gIHNlbGYucmVzdGF1cmFudHMgPSBbXTtcbiAgY29uc3QgdWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVzdGF1cmFudHMtbGlzdCcpO1xuICB1bC5pbm5lckhUTUwgPSAnJztcblxuICAvLyBSZW1vdmUgYWxsIG1hcCBtYXJrZXJzXG4gIGlmIChzZWxmLm1hcmtlcnMpIHtcbiAgICBzZWxmLm1hcmtlcnMuZm9yRWFjaChtYXJrZXIgPT4gbWFya2VyLnJlbW92ZSgpKTtcbiAgfVxuICBzZWxmLm1hcmtlcnMgPSBbXTtcbiAgc2VsZi5yZXN0YXVyYW50cyA9IHJlc3RhdXJhbnRzO1xufTtcblxuLyoqXG4gKiBDcmVhdGUgYWxsIHJlc3RhdXJhbnRzIEhUTUwgYW5kIGFkZCB0aGVtIHRvIHRoZSB3ZWJwYWdlLlxuICovXG5maWxsUmVzdGF1cmFudHNIVE1MID0gKHJlc3RhdXJhbnRzID0gc2VsZi5yZXN0YXVyYW50cykgPT4ge1xuICBjb25zdCB1bCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZXN0YXVyYW50cy1saXN0Jyk7XG4gIHJlc3RhdXJhbnRzLmZvckVhY2goKHJlc3RhdXJhbnQpID0+IHtcbiAgICB1bC5hcHBlbmQoY3JlYXRlUmVzdGF1cmFudEhUTUwocmVzdGF1cmFudCkpO1xuICB9KTtcbiAgYWRkTWFya2Vyc1RvTWFwKCk7XG59O1xuXG4vKipcbiAqIENyZWF0ZSByZXN0YXVyYW50IEhUTUwuXG4gKi9cbmNyZWF0ZVJlc3RhdXJhbnRIVE1MID0gKHJlc3RhdXJhbnQpID0+IHtcbiAgY29uc3QgYXJ0aWNsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2FydGljbGUnKTtcblxuICBjb25zdCBwaWN0dXJlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncGljdHVyZScpO1xuXG4gIC8vIGEgdHdvLWNvbHVtbiBsYXlvdXQgaXMgdXNlZCBmb3IgbGFyZ2VyIHZpZXdwb3J0c1xuICAvLyBtZWRpdW0gaW1hZ2VzIGFyZSBkaXNwbGF5ZWQgZm9yIHdpZGUgc2luZ2xlLWNvbHVtbiAoNDUxcHggLSA3NDlweCkgYW5kIHdpZGUgMi1jb2x1bW4gdmlld3BvcnRzICg+PSA5NTBweClcbiAgY29uc3Qgc291cmNlTWVkaXVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc291cmNlJyk7XG4gIHNvdXJjZU1lZGl1bS5tZWRpYSA9ICcobWluLXdpZHRoOiA0NTFweCkgYW5kIChtYXgtd2lkdGg6IDc0OXB4KSwgKG1pbi13aWR0aDogOTUwcHgpJztcbiAgc291cmNlTWVkaXVtLnNyY3NldCA9IERCSGVscGVyLmltYWdlVXJsRm9yUmVzdGF1cmFudChyZXN0YXVyYW50LCB7IHNpemU6ICdtZWRpdW0nIH0pO1xuICBzb3VyY2VNZWRpdW0udHlwZSA9ICdpbWFnZS9qcGVnJztcbiAgcGljdHVyZS5hcHBlbmRDaGlsZChzb3VyY2VNZWRpdW0pO1xuXG4gIC8vIHNtYWxsIGltYWdlcyBhcmUgZGlzcGxheWVkIGZvciBzbWFsbCBzaW5nbGUtY29sdW1uICg8PSA0NTBweCkgYW5kIHNtYWxsIDItY29sdW1uIHZpZXdwb3J0cyAoNzUwcHggLSA5NDlweClcbiAgY29uc3Qgc291cmNlU21hbGwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzb3VyY2UnKTtcbiAgc291cmNlU21hbGwubWVkaWEgPSAnKG1heC13aWR0aDogNDUwcHgpLCAobWluLXdpZHRoOiA3NTBweCkgYW5kIChtYXgtd2lkdGg6IDk0OXB4KSc7XG4gIHNvdXJjZVNtYWxsLnNyY3NldCA9IERCSGVscGVyLmltYWdlVXJsRm9yUmVzdGF1cmFudChyZXN0YXVyYW50LCB7IHNpemU6ICdzbWFsbCcgfSk7XG4gIHNvdXJjZVNtYWxsLnR5cGUgPSAnaW1hZ2UvanBlZyc7XG4gIHBpY3R1cmUuYXBwZW5kQ2hpbGQoc291cmNlU21hbGwpO1xuXG4gIGNvbnN0IGltYWdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW1nJyk7XG4gIGltYWdlLmNsYXNzTmFtZSA9ICdyZXN0YXVyYW50LWltZyc7XG4gIC8vIHNldCBkZWZhdWx0IHNpemUgaW4gY2FzZSBwaWN0dXJlIGVsZW1lbnQgaXMgbm90IHN1cHBvcnRlZFxuICBpbWFnZS5zcmMgPSBEQkhlbHBlci5pbWFnZVVybEZvclJlc3RhdXJhbnQocmVzdGF1cmFudCwgeyBzaXplOiAnbWVkaXVtJyB9KTtcbiAgaW1hZ2UuYWx0ID0gcmVzdGF1cmFudC5hbHQ7XG4gIHBpY3R1cmUuYXBwZW5kQ2hpbGQoaW1hZ2UpO1xuXG4gIGFydGljbGUuYXBwZW5kKHBpY3R1cmUpO1xuXG4gIGNvbnN0IHNwYW4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG5cbiAgY29uc3QgbmFtZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2gyJyk7XG4gIG5hbWUuaW5uZXJIVE1MID0gcmVzdGF1cmFudC5uYW1lO1xuICBzcGFuLmFwcGVuZChuYW1lKTtcblxuICBjb25zdCBuZWlnaGJvcmhvb2QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwJyk7XG4gIG5laWdoYm9yaG9vZC5pbm5lckhUTUwgPSByZXN0YXVyYW50Lm5laWdoYm9yaG9vZDtcbiAgc3Bhbi5hcHBlbmQobmVpZ2hib3Job29kKTtcblxuICBjb25zdCBhZGRyZXNzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncCcpO1xuICBhZGRyZXNzLmlubmVySFRNTCA9IHJlc3RhdXJhbnQuYWRkcmVzcztcbiAgc3Bhbi5hcHBlbmQoYWRkcmVzcyk7XG5cbiAgY29uc3QgbW9yZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgbW9yZS5pbm5lckhUTUwgPSAnVmlldyBEZXRhaWxzJztcbiAgbW9yZS5zZXRBdHRyaWJ1dGUoJ2FyaWEtbGFiZWwnLCBgVmlldyBEZXRhaWxzIG9mICR7cmVzdGF1cmFudC5uYW1lfWApO1xuICBtb3JlLmhyZWYgPSBEQkhlbHBlci51cmxGb3JSZXN0YXVyYW50KHJlc3RhdXJhbnQpO1xuICBzcGFuLmFwcGVuZChtb3JlKTtcblxuICBhcnRpY2xlLmFwcGVuZChzcGFuKTtcblxuICByZXR1cm4gYXJ0aWNsZTtcbn07XG5cbi8qKlxuICogQWRkIG1hcmtlcnMgZm9yIGN1cnJlbnQgcmVzdGF1cmFudHMgdG8gdGhlIG1hcC5cbiAqL1xuYWRkTWFya2Vyc1RvTWFwID0gKHJlc3RhdXJhbnRzID0gc2VsZi5yZXN0YXVyYW50cykgPT4ge1xuICByZXN0YXVyYW50cy5mb3JFYWNoKChyZXN0YXVyYW50KSA9PiB7XG4gICAgLy8gQWRkIG1hcmtlciB0byB0aGUgbWFwXG4gICAgY29uc3QgbWFya2VyID0gREJIZWxwZXIubWFwTWFya2VyRm9yUmVzdGF1cmFudChyZXN0YXVyYW50LCBzZWxmLm5ld01hcCk7XG4gICAgbWFya2VyLm9uKCdjbGljaycsIG9uQ2xpY2spO1xuICAgIGZ1bmN0aW9uIG9uQ2xpY2soKSB7XG4gICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IG1hcmtlci5vcHRpb25zLnVybDtcbiAgICB9XG4gICAgc2VsZi5tYXJrZXJzLnB1c2gobWFya2VyKTtcbiAgfSk7XG59O1xuXG5yZWdpc3RlclNlcnZpY2VXb3JrZXIgPSAoKSA9PiB7XG4gIGlmICghbmF2aWdhdG9yLnNlcnZpY2VXb3JrZXIpIHJldHVybjtcblxuICBuYXZpZ2F0b3Iuc2VydmljZVdvcmtlci5yZWdpc3RlcignL3NlcnZpY2Utd29ya2VyLmpzJylcbiAgICAuY2F0Y2goZXJyb3IgPT4gY29uc29sZS5sb2coZXJyb3IpKTtcbn07XG4iXSwiZmlsZSI6Im1haW4uanMifQ==