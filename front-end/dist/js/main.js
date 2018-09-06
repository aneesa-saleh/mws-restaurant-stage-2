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

var fetchNeighborhoods = function fetchNeighborhoods() {
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


var fillNeighborhoodsHTML = function fillNeighborhoodsHTML() {
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


var fetchCuisines = function fetchCuisines() {
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


var fillCuisinesHTML = function fillCuisinesHTML() {
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


var initMap = function initMap() {
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


var updateRestaurants = function updateRestaurants() {
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


var resetRestaurants = function resetRestaurants(restaurants) {
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


var fillRestaurantsHTML = function fillRestaurantsHTML() {
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


var createRestaurantHTML = function createRestaurantHTML(restaurant) {
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


var addMarkersToMap = function addMarkersToMap() {
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

var registerServiceWorker = function registerServiceWorker() {
  if (!navigator.serviceWorker) return;
  navigator.serviceWorker.register('/service-worker.js').catch(function (error) {
    return console.log(error);
  });
};
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOlsicmVzdGF1cmFudHMiLCJuZWlnaGJvcmhvb2RzIiwiY3Vpc2luZXMiLCJuZXdNYXAiLCJtYXJrZXJzIiwiZG9jdW1lbnQiLCJhZGRFdmVudExpc3RlbmVyIiwiZXZlbnQiLCJpbml0TWFwIiwiZmV0Y2hOZWlnaGJvcmhvb2RzIiwiZmV0Y2hDdWlzaW5lcyIsInJlZ2lzdGVyU2VydmljZVdvcmtlciIsIkRCSGVscGVyIiwiZXJyb3IiLCJjb25zb2xlIiwic2VsZiIsImZpbGxOZWlnaGJvcmhvb2RzSFRNTCIsInNlbGVjdCIsImdldEVsZW1lbnRCeUlkIiwiZm9yRWFjaCIsIm5laWdoYm9yaG9vZCIsIm9wdGlvbiIsImNyZWF0ZUVsZW1lbnQiLCJpbm5lckhUTUwiLCJ2YWx1ZSIsImFwcGVuZCIsImZpbGxDdWlzaW5lc0hUTUwiLCJjdWlzaW5lIiwiTUFQQk9YX0FQSV9LRVkiLCJMIiwibWFwIiwiY2VudGVyIiwiem9vbSIsInNjcm9sbFdoZWVsWm9vbSIsInRpbGVMYXllciIsIm1hcGJveFRva2VuIiwibWF4Wm9vbSIsImF0dHJpYnV0aW9uIiwiaWQiLCJhZGRUbyIsInVwZGF0ZVJlc3RhdXJhbnRzIiwiY1NlbGVjdCIsIm5TZWxlY3QiLCJjSW5kZXgiLCJzZWxlY3RlZEluZGV4IiwibkluZGV4IiwiZmV0Y2hSZXN0YXVyYW50QnlDdWlzaW5lQW5kTmVpZ2hib3Job29kIiwicmVzZXRSZXN0YXVyYW50cyIsImZpbGxSZXN0YXVyYW50c0hUTUwiLCJ1bCIsIm1hcmtlciIsInJlbW92ZSIsInJlc3RhdXJhbnQiLCJjcmVhdGVSZXN0YXVyYW50SFRNTCIsImFkZE1hcmtlcnNUb01hcCIsImFydGljbGUiLCJwaWN0dXJlIiwic291cmNlTWVkaXVtIiwibWVkaWEiLCJzcmNzZXQiLCJpbWFnZVVybEZvclJlc3RhdXJhbnQiLCJzaXplIiwidHlwZSIsImFwcGVuZENoaWxkIiwic291cmNlU21hbGwiLCJpbWFnZSIsImNsYXNzTmFtZSIsInNyYyIsImFsdCIsInNwYW4iLCJuYW1lIiwiYWRkcmVzcyIsIm1vcmUiLCJzZXRBdHRyaWJ1dGUiLCJocmVmIiwidXJsRm9yUmVzdGF1cmFudCIsIm1hcE1hcmtlckZvclJlc3RhdXJhbnQiLCJvbiIsIm9uQ2xpY2siLCJ3aW5kb3ciLCJsb2NhdGlvbiIsIm9wdGlvbnMiLCJ1cmwiLCJwdXNoIiwibmF2aWdhdG9yIiwic2VydmljZVdvcmtlciIsInJlZ2lzdGVyIiwiY2F0Y2giLCJsb2ciXSwibWFwcGluZ3MiOiI7O0FBQUEsSUFBSUEsV0FBSjtBQUNBLElBQUlDLGFBQUo7QUFDQSxJQUFJQyxRQUFKO0FBQ0EsSUFBSUMsTUFBSjtBQUNBLElBQUlDLE9BQU8sR0FBRyxFQUFkO0FBRUE7Ozs7QUFHQUMsUUFBUSxDQUFDQyxnQkFBVCxDQUEwQixrQkFBMUIsRUFBOEMsVUFBQ0MsS0FBRCxFQUFXO0FBQ3ZEQyxFQUFBQSxPQUFPLEdBRGdELENBQzVDOztBQUNYQyxFQUFBQSxrQkFBa0I7QUFDbEJDLEVBQUFBLGFBQWE7QUFDYkMsRUFBQUEscUJBQXFCO0FBQ3RCLENBTEQ7QUFPQTs7OztBQUdBLElBQU1GLGtCQUFrQixHQUFHLFNBQXJCQSxrQkFBcUIsR0FBTTtBQUMvQkcsRUFBQUEsUUFBUSxDQUFDSCxrQkFBVCxDQUE0QixVQUFDSSxLQUFELEVBQVFaLGFBQVIsRUFBMEI7QUFDcEQsUUFBSVksS0FBSixFQUFXO0FBQUU7QUFDWEMsTUFBQUEsT0FBTyxDQUFDRCxLQUFSLENBQWNBLEtBQWQ7QUFDRCxLQUZELE1BRU87QUFDTEUsTUFBQUEsSUFBSSxDQUFDZCxhQUFMLEdBQXFCQSxhQUFyQjtBQUNBZSxNQUFBQSxxQkFBcUI7QUFDdEI7QUFDRixHQVBEO0FBUUQsQ0FURDtBQVdBOzs7OztBQUdBLElBQU1BLHFCQUFxQixHQUFHLFNBQXhCQSxxQkFBd0IsR0FBd0M7QUFBQSxNQUF2Q2YsYUFBdUMsdUVBQXZCYyxJQUFJLENBQUNkLGFBQWtCO0FBQ3BFLE1BQU1nQixNQUFNLEdBQUdaLFFBQVEsQ0FBQ2EsY0FBVCxDQUF3QixzQkFBeEIsQ0FBZjtBQUNBakIsRUFBQUEsYUFBYSxDQUFDa0IsT0FBZCxDQUFzQixVQUFDQyxZQUFELEVBQWtCO0FBQ3RDLFFBQU1DLE1BQU0sR0FBR2hCLFFBQVEsQ0FBQ2lCLGFBQVQsQ0FBdUIsUUFBdkIsQ0FBZjtBQUNBRCxJQUFBQSxNQUFNLENBQUNFLFNBQVAsR0FBbUJILFlBQW5CO0FBQ0FDLElBQUFBLE1BQU0sQ0FBQ0csS0FBUCxHQUFlSixZQUFmO0FBQ0FILElBQUFBLE1BQU0sQ0FBQ1EsTUFBUCxDQUFjSixNQUFkO0FBQ0QsR0FMRDtBQU1ELENBUkQ7QUFVQTs7Ozs7QUFHQSxJQUFNWCxhQUFhLEdBQUcsU0FBaEJBLGFBQWdCLEdBQU07QUFDMUJFLEVBQUFBLFFBQVEsQ0FBQ0YsYUFBVCxDQUF1QixVQUFDRyxLQUFELEVBQVFYLFFBQVIsRUFBcUI7QUFDMUMsUUFBSVcsS0FBSixFQUFXO0FBQUU7QUFDWEMsTUFBQUEsT0FBTyxDQUFDRCxLQUFSLENBQWNBLEtBQWQ7QUFDRCxLQUZELE1BRU87QUFDTEUsTUFBQUEsSUFBSSxDQUFDYixRQUFMLEdBQWdCQSxRQUFoQjtBQUNBd0IsTUFBQUEsZ0JBQWdCO0FBQ2pCO0FBQ0YsR0FQRDtBQVFELENBVEQ7QUFXQTs7Ozs7QUFHQSxJQUFNQSxnQkFBZ0IsR0FBRyxTQUFuQkEsZ0JBQW1CLEdBQThCO0FBQUEsTUFBN0J4QixRQUE2Qix1RUFBbEJhLElBQUksQ0FBQ2IsUUFBYTtBQUNyRCxNQUFNZSxNQUFNLEdBQUdaLFFBQVEsQ0FBQ2EsY0FBVCxDQUF3QixpQkFBeEIsQ0FBZjtBQUVBaEIsRUFBQUEsUUFBUSxDQUFDaUIsT0FBVCxDQUFpQixVQUFDUSxPQUFELEVBQWE7QUFDNUIsUUFBTU4sTUFBTSxHQUFHaEIsUUFBUSxDQUFDaUIsYUFBVCxDQUF1QixRQUF2QixDQUFmO0FBQ0FELElBQUFBLE1BQU0sQ0FBQ0UsU0FBUCxHQUFtQkksT0FBbkI7QUFDQU4sSUFBQUEsTUFBTSxDQUFDRyxLQUFQLEdBQWVHLE9BQWY7QUFDQVYsSUFBQUEsTUFBTSxDQUFDUSxNQUFQLENBQWNKLE1BQWQ7QUFDRCxHQUxEO0FBTUQsQ0FURDtBQVdBOzs7OztBQUdBLElBQU1iLE9BQU8sR0FBRyxTQUFWQSxPQUFVLEdBQU07QUFDcEIsTUFBTW9CLGNBQWMsR0FBRyxrR0FBdkI7QUFDQWIsRUFBQUEsSUFBSSxDQUFDWixNQUFMLEdBQWMwQixDQUFDLENBQUNDLEdBQUYsQ0FBTSxLQUFOLEVBQWE7QUFDekJDLElBQUFBLE1BQU0sRUFBRSxDQUFDLFNBQUQsRUFBWSxDQUFDLFNBQWIsQ0FEaUI7QUFFekJDLElBQUFBLElBQUksRUFBRSxFQUZtQjtBQUd6QkMsSUFBQUEsZUFBZSxFQUFFO0FBSFEsR0FBYixDQUFkO0FBS0FKLEVBQUFBLENBQUMsQ0FBQ0ssU0FBRixDQUFZLG1GQUFaLEVBQWlHO0FBQy9GQyxJQUFBQSxXQUFXLEVBQUVQLGNBRGtGO0FBRS9GUSxJQUFBQSxPQUFPLEVBQUUsRUFGc0Y7QUFHL0ZDLElBQUFBLFdBQVcsRUFBRSw4RkFDVCwwRUFEUyxHQUVULHdEQUwyRjtBQU0vRkMsSUFBQUEsRUFBRSxFQUFFO0FBTjJGLEdBQWpHLEVBT0dDLEtBUEgsQ0FPU3BDLE1BUFQ7QUFTQXFDLEVBQUFBLGlCQUFpQjtBQUNsQixDQWpCRDtBQW1CQTs7Ozs7QUFHQSxJQUFNQSxpQkFBaUIsR0FBRyxTQUFwQkEsaUJBQW9CLEdBQU07QUFDOUIsTUFBTUMsT0FBTyxHQUFHcEMsUUFBUSxDQUFDYSxjQUFULENBQXdCLGlCQUF4QixDQUFoQjtBQUNBLE1BQU13QixPQUFPLEdBQUdyQyxRQUFRLENBQUNhLGNBQVQsQ0FBd0Isc0JBQXhCLENBQWhCO0FBRUEsTUFBTXlCLE1BQU0sR0FBR0YsT0FBTyxDQUFDRyxhQUF2QjtBQUNBLE1BQU1DLE1BQU0sR0FBR0gsT0FBTyxDQUFDRSxhQUF2QjtBQUVBLE1BQU1qQixPQUFPLEdBQUdjLE9BQU8sQ0FBQ0UsTUFBRCxDQUFQLENBQWdCbkIsS0FBaEM7QUFDQSxNQUFNSixZQUFZLEdBQUdzQixPQUFPLENBQUNHLE1BQUQsQ0FBUCxDQUFnQnJCLEtBQXJDO0FBRUFaLEVBQUFBLFFBQVEsQ0FBQ2tDLHVDQUFULENBQWlEbkIsT0FBakQsRUFBMERQLFlBQTFELEVBQXdFLFVBQUNQLEtBQUQsRUFBUWIsV0FBUixFQUF3QjtBQUM5RixRQUFJYSxLQUFKLEVBQVc7QUFBRTtBQUNYQyxNQUFBQSxPQUFPLENBQUNELEtBQVIsQ0FBY0EsS0FBZDtBQUNELEtBRkQsTUFFTztBQUNMa0MsTUFBQUEsZ0JBQWdCLENBQUMvQyxXQUFELENBQWhCO0FBQ0FnRCxNQUFBQSxtQkFBbUI7QUFDcEI7QUFDRixHQVBEO0FBUUQsQ0FsQkQ7QUFvQkE7Ozs7O0FBR0EsSUFBTUQsZ0JBQWdCLEdBQUcsU0FBbkJBLGdCQUFtQixDQUFDL0MsV0FBRCxFQUFpQjtBQUN4QztBQUNBZSxFQUFBQSxJQUFJLENBQUNmLFdBQUwsR0FBbUIsRUFBbkI7QUFDQSxNQUFNaUQsRUFBRSxHQUFHNUMsUUFBUSxDQUFDYSxjQUFULENBQXdCLGtCQUF4QixDQUFYO0FBQ0ErQixFQUFBQSxFQUFFLENBQUMxQixTQUFILEdBQWUsRUFBZixDQUp3QyxDQU14Qzs7QUFDQSxNQUFJUixJQUFJLENBQUNYLE9BQVQsRUFBa0I7QUFDaEJXLElBQUFBLElBQUksQ0FBQ1gsT0FBTCxDQUFhZSxPQUFiLENBQXFCLFVBQUErQixNQUFNO0FBQUEsYUFBSUEsTUFBTSxDQUFDQyxNQUFQLEVBQUo7QUFBQSxLQUEzQjtBQUNEOztBQUNEcEMsRUFBQUEsSUFBSSxDQUFDWCxPQUFMLEdBQWUsRUFBZjtBQUNBVyxFQUFBQSxJQUFJLENBQUNmLFdBQUwsR0FBbUJBLFdBQW5CO0FBQ0QsQ0FaRDtBQWNBOzs7OztBQUdBLElBQU1nRCxtQkFBbUIsR0FBRyxTQUF0QkEsbUJBQXNCLEdBQW9DO0FBQUEsTUFBbkNoRCxXQUFtQyx1RUFBckJlLElBQUksQ0FBQ2YsV0FBZ0I7QUFDOUQsTUFBTWlELEVBQUUsR0FBRzVDLFFBQVEsQ0FBQ2EsY0FBVCxDQUF3QixrQkFBeEIsQ0FBWDtBQUNBbEIsRUFBQUEsV0FBVyxDQUFDbUIsT0FBWixDQUFvQixVQUFDaUMsVUFBRCxFQUFnQjtBQUNsQ0gsSUFBQUEsRUFBRSxDQUFDeEIsTUFBSCxDQUFVNEIsb0JBQW9CLENBQUNELFVBQUQsQ0FBOUI7QUFDRCxHQUZEO0FBR0FFLEVBQUFBLGVBQWU7QUFDaEIsQ0FORDtBQVFBOzs7OztBQUdBLElBQU1ELG9CQUFvQixHQUFHLFNBQXZCQSxvQkFBdUIsQ0FBQ0QsVUFBRCxFQUFnQjtBQUMzQyxNQUFNRyxPQUFPLEdBQUdsRCxRQUFRLENBQUNpQixhQUFULENBQXVCLFNBQXZCLENBQWhCO0FBRUEsTUFBTWtDLE9BQU8sR0FBR25ELFFBQVEsQ0FBQ2lCLGFBQVQsQ0FBdUIsU0FBdkIsQ0FBaEIsQ0FIMkMsQ0FLM0M7QUFDQTs7QUFDQSxNQUFNbUMsWUFBWSxHQUFHcEQsUUFBUSxDQUFDaUIsYUFBVCxDQUF1QixRQUF2QixDQUFyQjtBQUNBbUMsRUFBQUEsWUFBWSxDQUFDQyxLQUFiLEdBQXFCLCtEQUFyQjtBQUNBRCxFQUFBQSxZQUFZLENBQUNFLE1BQWIsR0FBc0IvQyxRQUFRLENBQUNnRCxxQkFBVCxDQUErQlIsVUFBL0IsRUFBMkM7QUFBRVMsSUFBQUEsSUFBSSxFQUFFO0FBQVIsR0FBM0MsQ0FBdEI7QUFDQUosRUFBQUEsWUFBWSxDQUFDSyxJQUFiLEdBQW9CLFlBQXBCO0FBQ0FOLEVBQUFBLE9BQU8sQ0FBQ08sV0FBUixDQUFvQk4sWUFBcEIsRUFYMkMsQ0FhM0M7O0FBQ0EsTUFBTU8sV0FBVyxHQUFHM0QsUUFBUSxDQUFDaUIsYUFBVCxDQUF1QixRQUF2QixDQUFwQjtBQUNBMEMsRUFBQUEsV0FBVyxDQUFDTixLQUFaLEdBQW9CLCtEQUFwQjtBQUNBTSxFQUFBQSxXQUFXLENBQUNMLE1BQVosR0FBcUIvQyxRQUFRLENBQUNnRCxxQkFBVCxDQUErQlIsVUFBL0IsRUFBMkM7QUFBRVMsSUFBQUEsSUFBSSxFQUFFO0FBQVIsR0FBM0MsQ0FBckI7QUFDQUcsRUFBQUEsV0FBVyxDQUFDRixJQUFaLEdBQW1CLFlBQW5CO0FBQ0FOLEVBQUFBLE9BQU8sQ0FBQ08sV0FBUixDQUFvQkMsV0FBcEI7QUFFQSxNQUFNQyxLQUFLLEdBQUc1RCxRQUFRLENBQUNpQixhQUFULENBQXVCLEtBQXZCLENBQWQ7QUFDQTJDLEVBQUFBLEtBQUssQ0FBQ0MsU0FBTixHQUFrQixnQkFBbEIsQ0FyQjJDLENBc0IzQzs7QUFDQUQsRUFBQUEsS0FBSyxDQUFDRSxHQUFOLEdBQVl2RCxRQUFRLENBQUNnRCxxQkFBVCxDQUErQlIsVUFBL0IsRUFBMkM7QUFBRVMsSUFBQUEsSUFBSSxFQUFFO0FBQVIsR0FBM0MsQ0FBWjtBQUNBSSxFQUFBQSxLQUFLLENBQUNHLEdBQU4sR0FBWWhCLFVBQVUsQ0FBQ2dCLEdBQXZCO0FBQ0FaLEVBQUFBLE9BQU8sQ0FBQ08sV0FBUixDQUFvQkUsS0FBcEI7QUFFQVYsRUFBQUEsT0FBTyxDQUFDOUIsTUFBUixDQUFlK0IsT0FBZjtBQUVBLE1BQU1hLElBQUksR0FBR2hFLFFBQVEsQ0FBQ2lCLGFBQVQsQ0FBdUIsTUFBdkIsQ0FBYjtBQUVBLE1BQU1nRCxJQUFJLEdBQUdqRSxRQUFRLENBQUNpQixhQUFULENBQXVCLElBQXZCLENBQWI7QUFDQWdELEVBQUFBLElBQUksQ0FBQy9DLFNBQUwsR0FBaUI2QixVQUFVLENBQUNrQixJQUE1QjtBQUNBRCxFQUFBQSxJQUFJLENBQUM1QyxNQUFMLENBQVk2QyxJQUFaO0FBRUEsTUFBTWxELFlBQVksR0FBR2YsUUFBUSxDQUFDaUIsYUFBVCxDQUF1QixHQUF2QixDQUFyQjtBQUNBRixFQUFBQSxZQUFZLENBQUNHLFNBQWIsR0FBeUI2QixVQUFVLENBQUNoQyxZQUFwQztBQUNBaUQsRUFBQUEsSUFBSSxDQUFDNUMsTUFBTCxDQUFZTCxZQUFaO0FBRUEsTUFBTW1ELE9BQU8sR0FBR2xFLFFBQVEsQ0FBQ2lCLGFBQVQsQ0FBdUIsR0FBdkIsQ0FBaEI7QUFDQWlELEVBQUFBLE9BQU8sQ0FBQ2hELFNBQVIsR0FBb0I2QixVQUFVLENBQUNtQixPQUEvQjtBQUNBRixFQUFBQSxJQUFJLENBQUM1QyxNQUFMLENBQVk4QyxPQUFaO0FBRUEsTUFBTUMsSUFBSSxHQUFHbkUsUUFBUSxDQUFDaUIsYUFBVCxDQUF1QixHQUF2QixDQUFiO0FBQ0FrRCxFQUFBQSxJQUFJLENBQUNqRCxTQUFMLEdBQWlCLGNBQWpCO0FBQ0FpRCxFQUFBQSxJQUFJLENBQUNDLFlBQUwsQ0FBa0IsWUFBbEIsNEJBQW1EckIsVUFBVSxDQUFDa0IsSUFBOUQ7QUFDQUUsRUFBQUEsSUFBSSxDQUFDRSxJQUFMLEdBQVk5RCxRQUFRLENBQUMrRCxnQkFBVCxDQUEwQnZCLFVBQTFCLENBQVo7QUFDQWlCLEVBQUFBLElBQUksQ0FBQzVDLE1BQUwsQ0FBWStDLElBQVo7QUFFQWpCLEVBQUFBLE9BQU8sQ0FBQzlCLE1BQVIsQ0FBZTRDLElBQWY7QUFFQSxTQUFPZCxPQUFQO0FBQ0QsQ0FwREQ7QUFzREE7Ozs7O0FBR0EsSUFBTUQsZUFBZSxHQUFHLFNBQWxCQSxlQUFrQixHQUFvQztBQUFBLE1BQW5DdEQsV0FBbUMsdUVBQXJCZSxJQUFJLENBQUNmLFdBQWdCO0FBQzFEQSxFQUFBQSxXQUFXLENBQUNtQixPQUFaLENBQW9CLFVBQUNpQyxVQUFELEVBQWdCO0FBQ2xDO0FBQ0EsUUFBTUYsTUFBTSxHQUFHdEMsUUFBUSxDQUFDZ0Usc0JBQVQsQ0FBZ0N4QixVQUFoQyxFQUE0Q3JDLElBQUksQ0FBQ1osTUFBakQsQ0FBZjtBQUNBK0MsSUFBQUEsTUFBTSxDQUFDMkIsRUFBUCxDQUFVLE9BQVYsRUFBbUJDLE9BQW5COztBQUNBLGFBQVNBLE9BQVQsR0FBbUI7QUFDakJDLE1BQUFBLE1BQU0sQ0FBQ0MsUUFBUCxDQUFnQk4sSUFBaEIsR0FBdUJ4QixNQUFNLENBQUMrQixPQUFQLENBQWVDLEdBQXRDO0FBQ0Q7O0FBQ0RuRSxJQUFBQSxJQUFJLENBQUNYLE9BQUwsQ0FBYStFLElBQWIsQ0FBa0JqQyxNQUFsQjtBQUNELEdBUkQ7QUFTRCxDQVZEOztBQVlBLElBQU12QyxxQkFBcUIsR0FBRyxTQUF4QkEscUJBQXdCLEdBQU07QUFDbEMsTUFBSSxDQUFDeUUsU0FBUyxDQUFDQyxhQUFmLEVBQThCO0FBRTlCRCxFQUFBQSxTQUFTLENBQUNDLGFBQVYsQ0FBd0JDLFFBQXhCLENBQWlDLG9CQUFqQyxFQUNHQyxLQURILENBQ1MsVUFBQTFFLEtBQUs7QUFBQSxXQUFJQyxPQUFPLENBQUMwRSxHQUFSLENBQVkzRSxLQUFaLENBQUo7QUFBQSxHQURkO0FBRUQsQ0FMRCIsInNvdXJjZXNDb250ZW50IjpbImxldCByZXN0YXVyYW50cztcbmxldCBuZWlnaGJvcmhvb2RzO1xubGV0IGN1aXNpbmVzO1xudmFyIG5ld01hcDtcbnZhciBtYXJrZXJzID0gW107XG5cbi8qKlxuICogRmV0Y2ggbmVpZ2hib3Job29kcyBhbmQgY3Vpc2luZXMgYXMgc29vbiBhcyB0aGUgcGFnZSBpcyBsb2FkZWQuXG4gKi9cbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCAoZXZlbnQpID0+IHtcbiAgaW5pdE1hcCgpOyAvLyBhZGRlZFxuICBmZXRjaE5laWdoYm9yaG9vZHMoKTtcbiAgZmV0Y2hDdWlzaW5lcygpO1xuICByZWdpc3RlclNlcnZpY2VXb3JrZXIoKTtcbn0pO1xuXG4vKipcbiAqIEZldGNoIGFsbCBuZWlnaGJvcmhvb2RzIGFuZCBzZXQgdGhlaXIgSFRNTC5cbiAqL1xuY29uc3QgZmV0Y2hOZWlnaGJvcmhvb2RzID0gKCkgPT4ge1xuICBEQkhlbHBlci5mZXRjaE5laWdoYm9yaG9vZHMoKGVycm9yLCBuZWlnaGJvcmhvb2RzKSA9PiB7XG4gICAgaWYgKGVycm9yKSB7IC8vIEdvdCBhbiBlcnJvclxuICAgICAgY29uc29sZS5lcnJvcihlcnJvcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNlbGYubmVpZ2hib3Job29kcyA9IG5laWdoYm9yaG9vZHM7XG4gICAgICBmaWxsTmVpZ2hib3Job29kc0hUTUwoKTtcbiAgICB9XG4gIH0pO1xufTtcblxuLyoqXG4gKiBTZXQgbmVpZ2hib3Job29kcyBIVE1MLlxuICovXG5jb25zdCBmaWxsTmVpZ2hib3Job29kc0hUTUwgPSAobmVpZ2hib3Job29kcyA9IHNlbGYubmVpZ2hib3Job29kcykgPT4ge1xuICBjb25zdCBzZWxlY3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbmVpZ2hib3Job29kcy1zZWxlY3QnKTtcbiAgbmVpZ2hib3Job29kcy5mb3JFYWNoKChuZWlnaGJvcmhvb2QpID0+IHtcbiAgICBjb25zdCBvcHRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvcHRpb24nKTtcbiAgICBvcHRpb24uaW5uZXJIVE1MID0gbmVpZ2hib3Job29kO1xuICAgIG9wdGlvbi52YWx1ZSA9IG5laWdoYm9yaG9vZDtcbiAgICBzZWxlY3QuYXBwZW5kKG9wdGlvbik7XG4gIH0pO1xufTtcblxuLyoqXG4gKiBGZXRjaCBhbGwgY3Vpc2luZXMgYW5kIHNldCB0aGVpciBIVE1MLlxuICovXG5jb25zdCBmZXRjaEN1aXNpbmVzID0gKCkgPT4ge1xuICBEQkhlbHBlci5mZXRjaEN1aXNpbmVzKChlcnJvciwgY3Vpc2luZXMpID0+IHtcbiAgICBpZiAoZXJyb3IpIHsgLy8gR290IGFuIGVycm9yIVxuICAgICAgY29uc29sZS5lcnJvcihlcnJvcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNlbGYuY3Vpc2luZXMgPSBjdWlzaW5lcztcbiAgICAgIGZpbGxDdWlzaW5lc0hUTUwoKTtcbiAgICB9XG4gIH0pO1xufTtcblxuLyoqXG4gKiBTZXQgY3Vpc2luZXMgSFRNTC5cbiAqL1xuY29uc3QgZmlsbEN1aXNpbmVzSFRNTCA9IChjdWlzaW5lcyA9IHNlbGYuY3Vpc2luZXMpID0+IHtcbiAgY29uc3Qgc2VsZWN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2N1aXNpbmVzLXNlbGVjdCcpO1xuXG4gIGN1aXNpbmVzLmZvckVhY2goKGN1aXNpbmUpID0+IHtcbiAgICBjb25zdCBvcHRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvcHRpb24nKTtcbiAgICBvcHRpb24uaW5uZXJIVE1MID0gY3Vpc2luZTtcbiAgICBvcHRpb24udmFsdWUgPSBjdWlzaW5lO1xuICAgIHNlbGVjdC5hcHBlbmQob3B0aW9uKTtcbiAgfSk7XG59O1xuXG4vKipcbiAqIEluaXRpYWxpemUgbGVhZmxldCBtYXAsIGNhbGxlZCBmcm9tIEhUTUwuXG4gKi9cbmNvbnN0IGluaXRNYXAgPSAoKSA9PiB7XG4gIGNvbnN0IE1BUEJPWF9BUElfS0VZID0gJ3BrLmV5SjFJam9pWVc1bFpYTmhMWE5oYkdWb0lpd2lZU0k2SW1OcWEyeG1aSFZ3TURGb1lXNHpkbkF3WVdwbE1tNTNiSEVpZlEuVjExZERPdEVuV1N3VHhZLUM4bUpMdyc7XG4gIHNlbGYubmV3TWFwID0gTC5tYXAoJ21hcCcsIHtcbiAgICBjZW50ZXI6IFs0MC43MjIyMTYsIC03My45ODc1MDFdLFxuICAgIHpvb206IDEyLFxuICAgIHNjcm9sbFdoZWVsWm9vbTogZmFsc2UsXG4gIH0pO1xuICBMLnRpbGVMYXllcignaHR0cHM6Ly9hcGkudGlsZXMubWFwYm94LmNvbS92NC97aWR9L3t6fS97eH0ve3l9LmpwZzcwP2FjY2Vzc190b2tlbj17bWFwYm94VG9rZW59Jywge1xuICAgIG1hcGJveFRva2VuOiBNQVBCT1hfQVBJX0tFWSxcbiAgICBtYXhab29tOiAxOCxcbiAgICBhdHRyaWJ1dGlvbjogJ01hcCBkYXRhICZjb3B5OyA8YSBocmVmPVwiaHR0cHM6Ly93d3cub3BlbnN0cmVldG1hcC5vcmcvXCI+T3BlblN0cmVldE1hcDwvYT4gY29udHJpYnV0b3JzLCAnXG4gICAgICArICc8YSBocmVmPVwiaHR0cHM6Ly9jcmVhdGl2ZWNvbW1vbnMub3JnL2xpY2Vuc2VzL2J5LXNhLzIuMC9cIj5DQy1CWS1TQTwvYT4sICdcbiAgICAgICsgJ0ltYWdlcnkgwqkgPGEgaHJlZj1cImh0dHBzOi8vd3d3Lm1hcGJveC5jb20vXCI+TWFwYm94PC9hPicsXG4gICAgaWQ6ICdtYXBib3guc3RyZWV0cycsXG4gIH0pLmFkZFRvKG5ld01hcCk7XG5cbiAgdXBkYXRlUmVzdGF1cmFudHMoKTtcbn07XG5cbi8qKlxuICogVXBkYXRlIHBhZ2UgYW5kIG1hcCBmb3IgY3VycmVudCByZXN0YXVyYW50cy5cbiAqL1xuY29uc3QgdXBkYXRlUmVzdGF1cmFudHMgPSAoKSA9PiB7XG4gIGNvbnN0IGNTZWxlY3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY3Vpc2luZXMtc2VsZWN0Jyk7XG4gIGNvbnN0IG5TZWxlY3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbmVpZ2hib3Job29kcy1zZWxlY3QnKTtcblxuICBjb25zdCBjSW5kZXggPSBjU2VsZWN0LnNlbGVjdGVkSW5kZXg7XG4gIGNvbnN0IG5JbmRleCA9IG5TZWxlY3Quc2VsZWN0ZWRJbmRleDtcblxuICBjb25zdCBjdWlzaW5lID0gY1NlbGVjdFtjSW5kZXhdLnZhbHVlO1xuICBjb25zdCBuZWlnaGJvcmhvb2QgPSBuU2VsZWN0W25JbmRleF0udmFsdWU7XG5cbiAgREJIZWxwZXIuZmV0Y2hSZXN0YXVyYW50QnlDdWlzaW5lQW5kTmVpZ2hib3Job29kKGN1aXNpbmUsIG5laWdoYm9yaG9vZCwgKGVycm9yLCByZXN0YXVyYW50cykgPT4ge1xuICAgIGlmIChlcnJvcikgeyAvLyBHb3QgYW4gZXJyb3IhXG4gICAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzZXRSZXN0YXVyYW50cyhyZXN0YXVyYW50cyk7XG4gICAgICBmaWxsUmVzdGF1cmFudHNIVE1MKCk7XG4gICAgfVxuICB9KTtcbn07XG5cbi8qKlxuICogQ2xlYXIgY3VycmVudCByZXN0YXVyYW50cywgdGhlaXIgSFRNTCBhbmQgcmVtb3ZlIHRoZWlyIG1hcCBtYXJrZXJzLlxuICovXG5jb25zdCByZXNldFJlc3RhdXJhbnRzID0gKHJlc3RhdXJhbnRzKSA9PiB7XG4gIC8vIFJlbW92ZSBhbGwgcmVzdGF1cmFudHNcbiAgc2VsZi5yZXN0YXVyYW50cyA9IFtdO1xuICBjb25zdCB1bCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZXN0YXVyYW50cy1saXN0Jyk7XG4gIHVsLmlubmVySFRNTCA9ICcnO1xuXG4gIC8vIFJlbW92ZSBhbGwgbWFwIG1hcmtlcnNcbiAgaWYgKHNlbGYubWFya2Vycykge1xuICAgIHNlbGYubWFya2Vycy5mb3JFYWNoKG1hcmtlciA9PiBtYXJrZXIucmVtb3ZlKCkpO1xuICB9XG4gIHNlbGYubWFya2VycyA9IFtdO1xuICBzZWxmLnJlc3RhdXJhbnRzID0gcmVzdGF1cmFudHM7XG59O1xuXG4vKipcbiAqIENyZWF0ZSBhbGwgcmVzdGF1cmFudHMgSFRNTCBhbmQgYWRkIHRoZW0gdG8gdGhlIHdlYnBhZ2UuXG4gKi9cbmNvbnN0IGZpbGxSZXN0YXVyYW50c0hUTUwgPSAocmVzdGF1cmFudHMgPSBzZWxmLnJlc3RhdXJhbnRzKSA9PiB7XG4gIGNvbnN0IHVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Jlc3RhdXJhbnRzLWxpc3QnKTtcbiAgcmVzdGF1cmFudHMuZm9yRWFjaCgocmVzdGF1cmFudCkgPT4ge1xuICAgIHVsLmFwcGVuZChjcmVhdGVSZXN0YXVyYW50SFRNTChyZXN0YXVyYW50KSk7XG4gIH0pO1xuICBhZGRNYXJrZXJzVG9NYXAoKTtcbn07XG5cbi8qKlxuICogQ3JlYXRlIHJlc3RhdXJhbnQgSFRNTC5cbiAqL1xuY29uc3QgY3JlYXRlUmVzdGF1cmFudEhUTUwgPSAocmVzdGF1cmFudCkgPT4ge1xuICBjb25zdCBhcnRpY2xlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYXJ0aWNsZScpO1xuXG4gIGNvbnN0IHBpY3R1cmUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwaWN0dXJlJyk7XG5cbiAgLy8gYSB0d28tY29sdW1uIGxheW91dCBpcyB1c2VkIGZvciBsYXJnZXIgdmlld3BvcnRzXG4gIC8vIG1lZGl1bSBpbWFnZXMgYXJlIGRpc3BsYXllZCBmb3Igd2lkZSBzaW5nbGUtY29sdW1uICg0NTFweCAtIDc0OXB4KSBhbmQgd2lkZSAyLWNvbHVtbiB2aWV3cG9ydHMgKD49IDk1MHB4KVxuICBjb25zdCBzb3VyY2VNZWRpdW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzb3VyY2UnKTtcbiAgc291cmNlTWVkaXVtLm1lZGlhID0gJyhtaW4td2lkdGg6IDQ1MXB4KSBhbmQgKG1heC13aWR0aDogNzQ5cHgpLCAobWluLXdpZHRoOiA5NTBweCknO1xuICBzb3VyY2VNZWRpdW0uc3Jjc2V0ID0gREJIZWxwZXIuaW1hZ2VVcmxGb3JSZXN0YXVyYW50KHJlc3RhdXJhbnQsIHsgc2l6ZTogJ21lZGl1bScgfSk7XG4gIHNvdXJjZU1lZGl1bS50eXBlID0gJ2ltYWdlL2pwZWcnO1xuICBwaWN0dXJlLmFwcGVuZENoaWxkKHNvdXJjZU1lZGl1bSk7XG5cbiAgLy8gc21hbGwgaW1hZ2VzIGFyZSBkaXNwbGF5ZWQgZm9yIHNtYWxsIHNpbmdsZS1jb2x1bW4gKDw9IDQ1MHB4KSBhbmQgc21hbGwgMi1jb2x1bW4gdmlld3BvcnRzICg3NTBweCAtIDk0OXB4KVxuICBjb25zdCBzb3VyY2VTbWFsbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NvdXJjZScpO1xuICBzb3VyY2VTbWFsbC5tZWRpYSA9ICcobWF4LXdpZHRoOiA0NTBweCksIChtaW4td2lkdGg6IDc1MHB4KSBhbmQgKG1heC13aWR0aDogOTQ5cHgpJztcbiAgc291cmNlU21hbGwuc3Jjc2V0ID0gREJIZWxwZXIuaW1hZ2VVcmxGb3JSZXN0YXVyYW50KHJlc3RhdXJhbnQsIHsgc2l6ZTogJ3NtYWxsJyB9KTtcbiAgc291cmNlU21hbGwudHlwZSA9ICdpbWFnZS9qcGVnJztcbiAgcGljdHVyZS5hcHBlbmRDaGlsZChzb3VyY2VTbWFsbCk7XG5cbiAgY29uc3QgaW1hZ2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbWcnKTtcbiAgaW1hZ2UuY2xhc3NOYW1lID0gJ3Jlc3RhdXJhbnQtaW1nJztcbiAgLy8gc2V0IGRlZmF1bHQgc2l6ZSBpbiBjYXNlIHBpY3R1cmUgZWxlbWVudCBpcyBub3Qgc3VwcG9ydGVkXG4gIGltYWdlLnNyYyA9IERCSGVscGVyLmltYWdlVXJsRm9yUmVzdGF1cmFudChyZXN0YXVyYW50LCB7IHNpemU6ICdtZWRpdW0nIH0pO1xuICBpbWFnZS5hbHQgPSByZXN0YXVyYW50LmFsdDtcbiAgcGljdHVyZS5hcHBlbmRDaGlsZChpbWFnZSk7XG5cbiAgYXJ0aWNsZS5hcHBlbmQocGljdHVyZSk7XG5cbiAgY29uc3Qgc3BhbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcblxuICBjb25zdCBuYW1lID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaDInKTtcbiAgbmFtZS5pbm5lckhUTUwgPSByZXN0YXVyYW50Lm5hbWU7XG4gIHNwYW4uYXBwZW5kKG5hbWUpO1xuXG4gIGNvbnN0IG5laWdoYm9yaG9vZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3AnKTtcbiAgbmVpZ2hib3Job29kLmlubmVySFRNTCA9IHJlc3RhdXJhbnQubmVpZ2hib3Job29kO1xuICBzcGFuLmFwcGVuZChuZWlnaGJvcmhvb2QpO1xuXG4gIGNvbnN0IGFkZHJlc3MgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwJyk7XG4gIGFkZHJlc3MuaW5uZXJIVE1MID0gcmVzdGF1cmFudC5hZGRyZXNzO1xuICBzcGFuLmFwcGVuZChhZGRyZXNzKTtcblxuICBjb25zdCBtb3JlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICBtb3JlLmlubmVySFRNTCA9ICdWaWV3IERldGFpbHMnO1xuICBtb3JlLnNldEF0dHJpYnV0ZSgnYXJpYS1sYWJlbCcsIGBWaWV3IERldGFpbHMgb2YgJHtyZXN0YXVyYW50Lm5hbWV9YCk7XG4gIG1vcmUuaHJlZiA9IERCSGVscGVyLnVybEZvclJlc3RhdXJhbnQocmVzdGF1cmFudCk7XG4gIHNwYW4uYXBwZW5kKG1vcmUpO1xuXG4gIGFydGljbGUuYXBwZW5kKHNwYW4pO1xuXG4gIHJldHVybiBhcnRpY2xlO1xufTtcblxuLyoqXG4gKiBBZGQgbWFya2VycyBmb3IgY3VycmVudCByZXN0YXVyYW50cyB0byB0aGUgbWFwLlxuICovXG5jb25zdCBhZGRNYXJrZXJzVG9NYXAgPSAocmVzdGF1cmFudHMgPSBzZWxmLnJlc3RhdXJhbnRzKSA9PiB7XG4gIHJlc3RhdXJhbnRzLmZvckVhY2goKHJlc3RhdXJhbnQpID0+IHtcbiAgICAvLyBBZGQgbWFya2VyIHRvIHRoZSBtYXBcbiAgICBjb25zdCBtYXJrZXIgPSBEQkhlbHBlci5tYXBNYXJrZXJGb3JSZXN0YXVyYW50KHJlc3RhdXJhbnQsIHNlbGYubmV3TWFwKTtcbiAgICBtYXJrZXIub24oJ2NsaWNrJywgb25DbGljayk7XG4gICAgZnVuY3Rpb24gb25DbGljaygpIHtcbiAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gbWFya2VyLm9wdGlvbnMudXJsO1xuICAgIH1cbiAgICBzZWxmLm1hcmtlcnMucHVzaChtYXJrZXIpO1xuICB9KTtcbn07XG5cbmNvbnN0IHJlZ2lzdGVyU2VydmljZVdvcmtlciA9ICgpID0+IHtcbiAgaWYgKCFuYXZpZ2F0b3Iuc2VydmljZVdvcmtlcikgcmV0dXJuO1xuXG4gIG5hdmlnYXRvci5zZXJ2aWNlV29ya2VyLnJlZ2lzdGVyKCcvc2VydmljZS13b3JrZXIuanMnKVxuICAgIC5jYXRjaChlcnJvciA9PiBjb25zb2xlLmxvZyhlcnJvcikpO1xufTtcbiJdLCJmaWxlIjoibWFpbi5qcyJ9
