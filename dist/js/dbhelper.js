"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var dbPromise = openDatabase();
/**
 * Common database helper functions.
 */

var DBHelper =
/*#__PURE__*/
function () {
  function DBHelper() {
    _classCallCheck(this, DBHelper);
  }

  _createClass(DBHelper, null, [{
    key: "fetchRestaurants",

    /**
     * Fetch all restaurants.
     */
    value: function fetchRestaurants() {
      return dbPromise.then(function (db) {
        var restaurantsURL = "".concat(DBHelper.DATABASE_URL, "/restaurants");

        if (!db) {
          // make regular fetch call
          return fetch(restaurantsURL).then(function (response) {
            if (!response.ok) {
              var error = "Request failed. Returned status of ".concat(response.status);
              return Promise.reject(error);
            }

            return response.json();
          });
        } // return restaurants from IDB


        var store = db.transaction('restaurants').objectStore('restaurants');
        return store.getAll().then(function (restaurants) {
          var fetchResponse = fetch(restaurantsURL).then(function (response) {
            if (!response.ok) {
              var error = "Request failed. Returned status of ".concat(response.status);
              return Promise.reject(error);
            }

            var responseJSON = response.clone().json(); // update IDB restaurants with fetch response even if values from IDB will be returned

            responseJSON.then(function (restaurants) {
              store = db.transaction('restaurants', 'readwrite').objectStore('restaurants');
              restaurants.forEach(function (restaurant) {
                store.put(restaurant);
              });
            });
            return response.json();
          });

          if (restaurants && restaurants.length > 0) {
            return restaurants;
          }

          return fetchResponse;
        });
      });
    }
    /**
     * Fetch a restaurant by its ID.
     */

  }, {
    key: "fetchRestaurantById",
    value: function fetchRestaurantById(id, callback) {
      dbPromise.then(function (db) {
        var restaurantByIdURL = "".concat(DBHelper.DATABASE_URL, "/restaurants/").concat(id);

        if (!db) {
          // make regular fetch call
          return fetch(restaurantByIdURL).then(function (response) {
            if (!response.ok) {
              var error = "Request failed. Returned status of ".concat(response.status);
              return Promise.reject(error);
            }

            return response.json();
          });
        } // return restaurant from IDB


        var store = db.transaction('restaurants').objectStore('restaurants'); // id comes as a string from the url, convert to a number before lookup

        return store.get(Number.parseInt(id, 10)).then(function (restaurant) {
          var fetchResponse = fetch(restaurantByIdURL).then(function (response) {
            if (!response.ok) {
              var error = "Request failed. Returned status of ".concat(response.status);
              return Promise.reject(error);
            }

            var responseJSON = response.clone().json(); // update IDB restaurants with fetch response even if value from IDB will be returned

            responseJSON.then(function (restaurant) {
              store = db.transaction('restaurants', 'readwrite').objectStore('restaurants');
              store.put(restaurant);
            });
            return response.json();
          });
          console.log(restaurant);
          return restaurant || fetchResponse;
        });
      }).then(function (restaurant) {
        callback(null, restaurant);
      }).catch(function (error) {
        callback(error, null);
      }); // DBHelper.fetchRestaurants().then((restaurants) => {
      //   const restaurant = restaurants.find(r => r.id == id);
      //   if (restaurant) { // Got the restaurant
      //     callback(null, restaurant);
      //   } else { // Restaurant does not exist in the database
      //     callback('Restaurant does not exist', null);
      //   }
      // }).catch((error) => {
      //   callback(error, null);
      // });
    }
    /**
     * Fetch restaurants by a cuisine type with proper error handling.
     */

  }, {
    key: "fetchRestaurantByCuisine",
    value: function fetchRestaurantByCuisine(cuisine, callback) {
      // Fetch all restaurants  with proper error handling
      DBHelper.fetchRestaurants().then(function (restaurants) {
        // Filter restaurants to have only given cuisine type
        var results = restaurants.filter(function (r) {
          return r.cuisine_type == cuisine;
        });
        callback(null, results);
      }).catch(function (error) {
        callback(error, null);
      });
    }
    /**
     * Fetch restaurants by a neighborhood with proper error handling.
     */

  }, {
    key: "fetchRestaurantByNeighborhood",
    value: function fetchRestaurantByNeighborhood(neighborhood, callback) {
      // Fetch all restaurants
      DBHelper.fetchRestaurants().then(function (restaurants) {
        // Filter restaurants to have only given neighborhood
        var results = restaurants.filter(function (r) {
          return r.neighborhood == neighborhood;
        });
        callback(null, results);
      }).catch(function (error) {
        callback(error, null);
      });
    }
    /**
     * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
     */

  }, {
    key: "fetchRestaurantByCuisineAndNeighborhood",
    value: function fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
      // Fetch all restaurants
      DBHelper.fetchRestaurants().then(function (restaurants) {
        var results = restaurants;

        if (cuisine != 'all') {
          // filter by cuisine
          results = results.filter(function (r) {
            return r.cuisine_type == cuisine;
          });
        }

        if (neighborhood != 'all') {
          // filter by neighborhood
          results = results.filter(function (r) {
            return r.neighborhood == neighborhood;
          });
        }

        callback(null, results);
      }).catch(function (error) {
        callback(error, null);
      });
    }
    /**
     * Fetch all neighborhoods with proper error handling.
     */

  }, {
    key: "fetchNeighborhoods",
    value: function fetchNeighborhoods(callback) {
      // Fetch all restaurants
      DBHelper.fetchRestaurants().then(function (restaurants) {
        // Get all neighborhoods from all restaurants
        var neighborhoods = restaurants.map(function (v, i) {
          return restaurants[i].neighborhood;
        }); // Remove duplicates from neighborhoods

        var uniqueNeighborhoods = neighborhoods.filter(function (v, i) {
          return neighborhoods.indexOf(v) == i;
        });
        callback(null, uniqueNeighborhoods);
      }).catch(function (error) {
        callback(error, null);
      });
    }
    /**
     * Fetch all cuisines with proper error handling.
     */

  }, {
    key: "fetchCuisines",
    value: function fetchCuisines(callback) {
      // Fetch all restaurants
      DBHelper.fetchRestaurants().then(function (restaurants) {
        // Get all cuisines from all restaurants
        var cuisines = restaurants.map(function (v, i) {
          return restaurants[i].cuisine_type;
        }); // Remove duplicates from cuisines

        var uniqueCuisines = cuisines.filter(function (v, i) {
          return cuisines.indexOf(v) == i;
        });
        callback(null, uniqueCuisines);
      }).catch(function (error) {
        callback(error, null);
      });
    }
    /**
     * Restaurant page URL.
     */

  }, {
    key: "urlForRestaurant",
    value: function urlForRestaurant(restaurant) {
      return "./restaurant.html?id=".concat(restaurant.id);
    }
    /**
     * Restaurant image URL.
     */

  }, {
    key: "imageUrlForRestaurant",
    value: function imageUrlForRestaurant(restaurant, options) {
      if (options) {
        if (options.size === 'small') {
          return "img/".concat(restaurant.photograph_small_1x, " 1x, img/").concat(restaurant.photograph_small_2x, " 2x");
        }

        if (options.size === 'medium') {
          return "img/".concat(restaurant.photograph_medium_1x, " 1x, img/").concat(restaurant.photograph_medium_2x, " 2x");
        }

        if (options.size === 'large' && options.wide) {
          return "img/".concat(restaurant.photograph_large_wide);
        }
      }

      return "img/".concat(restaurant.photograph_large);
    }
    /**
     * Map marker for a restaurant.
     */

  }, {
    key: "mapMarkerForRestaurant",
    value: function mapMarkerForRestaurant(restaurant, map) {
      // https://leafletjs.com/reference-1.3.0.html#marker
      var marker = new L.marker([restaurant.latlng.lat, restaurant.latlng.lng], {
        title: restaurant.name,
        alt: restaurant.name,
        url: DBHelper.urlForRestaurant(restaurant)
      });
      marker.addTo(newMap);
      return marker;
    }
  }, {
    key: "DATABASE_URL",

    /**
     * Database URL.
     * Change this to restaurants.json file location on your server.
     */
    get: function get() {
      var port = 1337; // Change this to your server port

      return "http://localhost:".concat(port);
    }
  }]);

  return DBHelper;
}();
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImRiaGVscGVyLmpzIl0sIm5hbWVzIjpbImRiUHJvbWlzZSIsIm9wZW5EYXRhYmFzZSIsIkRCSGVscGVyIiwidGhlbiIsImRiIiwicmVzdGF1cmFudHNVUkwiLCJEQVRBQkFTRV9VUkwiLCJmZXRjaCIsInJlc3BvbnNlIiwib2siLCJlcnJvciIsInN0YXR1cyIsIlByb21pc2UiLCJyZWplY3QiLCJqc29uIiwic3RvcmUiLCJ0cmFuc2FjdGlvbiIsIm9iamVjdFN0b3JlIiwiZ2V0QWxsIiwicmVzdGF1cmFudHMiLCJmZXRjaFJlc3BvbnNlIiwicmVzcG9uc2VKU09OIiwiY2xvbmUiLCJmb3JFYWNoIiwicmVzdGF1cmFudCIsInB1dCIsImxlbmd0aCIsImlkIiwiY2FsbGJhY2siLCJyZXN0YXVyYW50QnlJZFVSTCIsImdldCIsIk51bWJlciIsInBhcnNlSW50IiwiY29uc29sZSIsImxvZyIsImNhdGNoIiwiY3Vpc2luZSIsImZldGNoUmVzdGF1cmFudHMiLCJyZXN1bHRzIiwiZmlsdGVyIiwiciIsImN1aXNpbmVfdHlwZSIsIm5laWdoYm9yaG9vZCIsIm5laWdoYm9yaG9vZHMiLCJtYXAiLCJ2IiwiaSIsInVuaXF1ZU5laWdoYm9yaG9vZHMiLCJpbmRleE9mIiwiY3Vpc2luZXMiLCJ1bmlxdWVDdWlzaW5lcyIsIm9wdGlvbnMiLCJzaXplIiwicGhvdG9ncmFwaF9zbWFsbF8xeCIsInBob3RvZ3JhcGhfc21hbGxfMngiLCJwaG90b2dyYXBoX21lZGl1bV8xeCIsInBob3RvZ3JhcGhfbWVkaXVtXzJ4Iiwid2lkZSIsInBob3RvZ3JhcGhfbGFyZ2Vfd2lkZSIsInBob3RvZ3JhcGhfbGFyZ2UiLCJtYXJrZXIiLCJMIiwibGF0bG5nIiwibGF0IiwibG5nIiwidGl0bGUiLCJuYW1lIiwiYWx0IiwidXJsIiwidXJsRm9yUmVzdGF1cmFudCIsImFkZFRvIiwibmV3TWFwIiwicG9ydCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBQSxJQUFNQSxTQUFTLEdBQUdDLFlBQVks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YlByb21pc2UgPSBvcGVuRGF0YWJhc2UoKTtcblxuLyoqXG4gKiBDb21tb24gZGF0YWJhc2UgaGVscGVyIGZ1bmN0aW9ucy5cbiAqL1xuY2xhc3MgREJIZWxwZXIge1xuICAvKipcbiAgICogRGF0YWJhc2UgVVJMLlxuICAgKiBDaGFuZ2UgdGhpcyB0byByZXN0YXVyYW50cy5qc29uIGZpbGUgbG9jYXRpb24gb24geW91ciBzZXJ2ZXIuXG4gICAqL1xuICBzdGF0aWMgZ2V0IERBVEFCQVNFX1VSTCgpIHtcbiAgICBjb25zdCBwb3J0ID0gMTMzNzsgLy8gQ2hhbmdlIHRoaXMgdG8geW91ciBzZXJ2ZXIgcG9ydFxuICAgIHJldHVybiBgaHR0cDovL2xvY2FsaG9zdDoke3BvcnR9YDtcbiAgfVxuXG4gIC8qKlxuICAgKiBGZXRjaCBhbGwgcmVzdGF1cmFudHMuXG4gICAqL1xuICBzdGF0aWMgZmV0Y2hSZXN0YXVyYW50cygpIHtcbiAgICByZXR1cm4gZGJQcm9taXNlLnRoZW4oKGRiKSA9PiB7XG4gICAgICBjb25zdCByZXN0YXVyYW50c1VSTCA9IGAke0RCSGVscGVyLkRBVEFCQVNFX1VSTH0vcmVzdGF1cmFudHNgO1xuXG4gICAgICBpZiAoIWRiKSB7XG4gICAgICAgIC8vIG1ha2UgcmVndWxhciBmZXRjaCBjYWxsXG4gICAgICAgIHJldHVybiBmZXRjaChyZXN0YXVyYW50c1VSTClcbiAgICAgICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgICAgICAgIGlmICghcmVzcG9uc2Uub2spIHtcbiAgICAgICAgICAgICAgY29uc3QgZXJyb3IgPSAoYFJlcXVlc3QgZmFpbGVkLiBSZXR1cm5lZCBzdGF0dXMgb2YgJHtyZXNwb25zZS5zdGF0dXN9YCk7XG4gICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChlcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuanNvbigpO1xuICAgICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICAvLyByZXR1cm4gcmVzdGF1cmFudHMgZnJvbSBJREJcbiAgICAgIGxldCBzdG9yZSA9IGRiLnRyYW5zYWN0aW9uKCdyZXN0YXVyYW50cycpLm9iamVjdFN0b3JlKCdyZXN0YXVyYW50cycpO1xuICAgICAgcmV0dXJuIHN0b3JlLmdldEFsbCgpLnRoZW4oKHJlc3RhdXJhbnRzKSA9PiB7XG4gICAgICAgIGNvbnN0IGZldGNoUmVzcG9uc2UgPSBmZXRjaChyZXN0YXVyYW50c1VSTClcbiAgICAgICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgICAgICAgIGlmICghcmVzcG9uc2Uub2spIHtcbiAgICAgICAgICAgICAgY29uc3QgZXJyb3IgPSAoYFJlcXVlc3QgZmFpbGVkLiBSZXR1cm5lZCBzdGF0dXMgb2YgJHtyZXNwb25zZS5zdGF0dXN9YCk7XG4gICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChlcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCByZXNwb25zZUpTT04gPSByZXNwb25zZS5jbG9uZSgpLmpzb24oKTtcbiAgICAgICAgICAgIC8vIHVwZGF0ZSBJREIgcmVzdGF1cmFudHMgd2l0aCBmZXRjaCByZXNwb25zZSBldmVuIGlmIHZhbHVlcyBmcm9tIElEQiB3aWxsIGJlIHJldHVybmVkXG4gICAgICAgICAgICByZXNwb25zZUpTT04udGhlbigocmVzdGF1cmFudHMpID0+IHtcbiAgICAgICAgICAgICAgc3RvcmUgPSBkYi50cmFuc2FjdGlvbigncmVzdGF1cmFudHMnLCAncmVhZHdyaXRlJykub2JqZWN0U3RvcmUoJ3Jlc3RhdXJhbnRzJyk7XG4gICAgICAgICAgICAgIHJlc3RhdXJhbnRzLmZvckVhY2goKHJlc3RhdXJhbnQpID0+IHtcbiAgICAgICAgICAgICAgICBzdG9yZS5wdXQocmVzdGF1cmFudCk7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuanNvbigpO1xuICAgICAgICAgIH0pO1xuICAgICAgICBpZiAocmVzdGF1cmFudHMgJiYgcmVzdGF1cmFudHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgIHJldHVybiByZXN0YXVyYW50cztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmV0Y2hSZXNwb25zZTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEZldGNoIGEgcmVzdGF1cmFudCBieSBpdHMgSUQuXG4gICAqL1xuICBzdGF0aWMgZmV0Y2hSZXN0YXVyYW50QnlJZChpZCwgY2FsbGJhY2spIHtcbiAgICBkYlByb21pc2UudGhlbigoZGIpID0+IHtcbiAgICAgIGNvbnN0IHJlc3RhdXJhbnRCeUlkVVJMID0gYCR7REJIZWxwZXIuREFUQUJBU0VfVVJMfS9yZXN0YXVyYW50cy8ke2lkfWA7XG5cbiAgICAgIGlmICghZGIpIHtcbiAgICAgICAgLy8gbWFrZSByZWd1bGFyIGZldGNoIGNhbGxcbiAgICAgICAgcmV0dXJuIGZldGNoKHJlc3RhdXJhbnRCeUlkVVJMKVxuICAgICAgICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xuICAgICAgICAgICAgaWYgKCFyZXNwb25zZS5vaykge1xuICAgICAgICAgICAgICBjb25zdCBlcnJvciA9IChgUmVxdWVzdCBmYWlsZWQuIFJldHVybmVkIHN0YXR1cyBvZiAke3Jlc3BvbnNlLnN0YXR1c31gKTtcbiAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KGVycm9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5qc29uKCk7XG4gICAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIC8vIHJldHVybiByZXN0YXVyYW50IGZyb20gSURCXG4gICAgICBsZXQgc3RvcmUgPSBkYi50cmFuc2FjdGlvbigncmVzdGF1cmFudHMnKS5vYmplY3RTdG9yZSgncmVzdGF1cmFudHMnKTtcbiAgICAgIC8vIGlkIGNvbWVzIGFzIGEgc3RyaW5nIGZyb20gdGhlIHVybCwgY29udmVydCB0byBhIG51bWJlciBiZWZvcmUgbG9va3VwXG4gICAgICByZXR1cm4gc3RvcmUuZ2V0KE51bWJlci5wYXJzZUludChpZCwgMTApKS50aGVuKChyZXN0YXVyYW50KSA9PiB7XG4gICAgICAgIGNvbnN0IGZldGNoUmVzcG9uc2UgPSBmZXRjaChyZXN0YXVyYW50QnlJZFVSTClcbiAgICAgICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgICAgICAgIGlmICghcmVzcG9uc2Uub2spIHtcbiAgICAgICAgICAgICAgY29uc3QgZXJyb3IgPSAoYFJlcXVlc3QgZmFpbGVkLiBSZXR1cm5lZCBzdGF0dXMgb2YgJHtyZXNwb25zZS5zdGF0dXN9YCk7XG4gICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChlcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCByZXNwb25zZUpTT04gPSByZXNwb25zZS5jbG9uZSgpLmpzb24oKTtcbiAgICAgICAgICAgIC8vIHVwZGF0ZSBJREIgcmVzdGF1cmFudHMgd2l0aCBmZXRjaCByZXNwb25zZSBldmVuIGlmIHZhbHVlIGZyb20gSURCIHdpbGwgYmUgcmV0dXJuZWRcbiAgICAgICAgICAgIHJlc3BvbnNlSlNPTi50aGVuKChyZXN0YXVyYW50KSA9PiB7XG4gICAgICAgICAgICAgIHN0b3JlID0gZGIudHJhbnNhY3Rpb24oJ3Jlc3RhdXJhbnRzJywgJ3JlYWR3cml0ZScpLm9iamVjdFN0b3JlKCdyZXN0YXVyYW50cycpO1xuICAgICAgICAgICAgICBzdG9yZS5wdXQocmVzdGF1cmFudCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5qc29uKCk7XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICBjb25zb2xlLmxvZyhyZXN0YXVyYW50KTtcbiAgICAgICAgcmV0dXJuIHJlc3RhdXJhbnQgfHwgZmV0Y2hSZXNwb25zZTtcbiAgICAgIH0pO1xuICAgIH0pXG4gICAgICAudGhlbigocmVzdGF1cmFudCkgPT4geyBjYWxsYmFjayhudWxsLCByZXN0YXVyYW50KTsgfSlcbiAgICAgIC5jYXRjaCgoZXJyb3IpID0+IHsgY2FsbGJhY2soZXJyb3IsIG51bGwpOyB9KTtcblxuICAgIC8vIERCSGVscGVyLmZldGNoUmVzdGF1cmFudHMoKS50aGVuKChyZXN0YXVyYW50cykgPT4ge1xuICAgIC8vICAgY29uc3QgcmVzdGF1cmFudCA9IHJlc3RhdXJhbnRzLmZpbmQociA9PiByLmlkID09IGlkKTtcbiAgICAvLyAgIGlmIChyZXN0YXVyYW50KSB7IC8vIEdvdCB0aGUgcmVzdGF1cmFudFxuICAgIC8vICAgICBjYWxsYmFjayhudWxsLCByZXN0YXVyYW50KTtcbiAgICAvLyAgIH0gZWxzZSB7IC8vIFJlc3RhdXJhbnQgZG9lcyBub3QgZXhpc3QgaW4gdGhlIGRhdGFiYXNlXG4gICAgLy8gICAgIGNhbGxiYWNrKCdSZXN0YXVyYW50IGRvZXMgbm90IGV4aXN0JywgbnVsbCk7XG4gICAgLy8gICB9XG4gICAgLy8gfSkuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgLy8gICBjYWxsYmFjayhlcnJvciwgbnVsbCk7XG4gICAgLy8gfSk7XG4gIH1cblxuICAvKipcbiAgICogRmV0Y2ggcmVzdGF1cmFudHMgYnkgYSBjdWlzaW5lIHR5cGUgd2l0aCBwcm9wZXIgZXJyb3IgaGFuZGxpbmcuXG4gICAqL1xuICBzdGF0aWMgZmV0Y2hSZXN0YXVyYW50QnlDdWlzaW5lKGN1aXNpbmUsIGNhbGxiYWNrKSB7XG4gICAgLy8gRmV0Y2ggYWxsIHJlc3RhdXJhbnRzICB3aXRoIHByb3BlciBlcnJvciBoYW5kbGluZ1xuICAgIERCSGVscGVyLmZldGNoUmVzdGF1cmFudHMoKS50aGVuKChyZXN0YXVyYW50cykgPT4ge1xuICAgICAgLy8gRmlsdGVyIHJlc3RhdXJhbnRzIHRvIGhhdmUgb25seSBnaXZlbiBjdWlzaW5lIHR5cGVcbiAgICAgIGNvbnN0IHJlc3VsdHMgPSByZXN0YXVyYW50cy5maWx0ZXIociA9PiByLmN1aXNpbmVfdHlwZSA9PSBjdWlzaW5lKTtcbiAgICAgIGNhbGxiYWNrKG51bGwsIHJlc3VsdHMpO1xuICAgIH0pLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgY2FsbGJhY2soZXJyb3IsIG51bGwpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEZldGNoIHJlc3RhdXJhbnRzIGJ5IGEgbmVpZ2hib3Job29kIHdpdGggcHJvcGVyIGVycm9yIGhhbmRsaW5nLlxuICAgKi9cbiAgc3RhdGljIGZldGNoUmVzdGF1cmFudEJ5TmVpZ2hib3Job29kKG5laWdoYm9yaG9vZCwgY2FsbGJhY2spIHtcbiAgICAvLyBGZXRjaCBhbGwgcmVzdGF1cmFudHNcbiAgICBEQkhlbHBlci5mZXRjaFJlc3RhdXJhbnRzKCkudGhlbigocmVzdGF1cmFudHMpID0+IHtcbiAgICAgIC8vIEZpbHRlciByZXN0YXVyYW50cyB0byBoYXZlIG9ubHkgZ2l2ZW4gbmVpZ2hib3Job29kXG4gICAgICBjb25zdCByZXN1bHRzID0gcmVzdGF1cmFudHMuZmlsdGVyKHIgPT4gci5uZWlnaGJvcmhvb2QgPT0gbmVpZ2hib3Job29kKTtcbiAgICAgIGNhbGxiYWNrKG51bGwsIHJlc3VsdHMpO1xuICAgIH0pLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgY2FsbGJhY2soZXJyb3IsIG51bGwpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEZldGNoIHJlc3RhdXJhbnRzIGJ5IGEgY3Vpc2luZSBhbmQgYSBuZWlnaGJvcmhvb2Qgd2l0aCBwcm9wZXIgZXJyb3IgaGFuZGxpbmcuXG4gICAqL1xuICBzdGF0aWMgZmV0Y2hSZXN0YXVyYW50QnlDdWlzaW5lQW5kTmVpZ2hib3Job29kKGN1aXNpbmUsIG5laWdoYm9yaG9vZCwgY2FsbGJhY2spIHtcbiAgICAvLyBGZXRjaCBhbGwgcmVzdGF1cmFudHNcbiAgICBEQkhlbHBlci5mZXRjaFJlc3RhdXJhbnRzKCkudGhlbigocmVzdGF1cmFudHMpID0+IHtcbiAgICAgIGxldCByZXN1bHRzID0gcmVzdGF1cmFudHM7XG4gICAgICBpZiAoY3Vpc2luZSAhPSAnYWxsJykgeyAvLyBmaWx0ZXIgYnkgY3Vpc2luZVxuICAgICAgICByZXN1bHRzID0gcmVzdWx0cy5maWx0ZXIociA9PiByLmN1aXNpbmVfdHlwZSA9PSBjdWlzaW5lKTtcbiAgICAgIH1cbiAgICAgIGlmIChuZWlnaGJvcmhvb2QgIT0gJ2FsbCcpIHsgLy8gZmlsdGVyIGJ5IG5laWdoYm9yaG9vZFxuICAgICAgICByZXN1bHRzID0gcmVzdWx0cy5maWx0ZXIociA9PiByLm5laWdoYm9yaG9vZCA9PSBuZWlnaGJvcmhvb2QpO1xuICAgICAgfVxuICAgICAgY2FsbGJhY2sobnVsbCwgcmVzdWx0cyk7XG4gICAgfSkuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICBjYWxsYmFjayhlcnJvciwgbnVsbCk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogRmV0Y2ggYWxsIG5laWdoYm9yaG9vZHMgd2l0aCBwcm9wZXIgZXJyb3IgaGFuZGxpbmcuXG4gICAqL1xuICBzdGF0aWMgZmV0Y2hOZWlnaGJvcmhvb2RzKGNhbGxiYWNrKSB7XG4gICAgLy8gRmV0Y2ggYWxsIHJlc3RhdXJhbnRzXG4gICAgREJIZWxwZXIuZmV0Y2hSZXN0YXVyYW50cygpLnRoZW4oKHJlc3RhdXJhbnRzKSA9PiB7XG4gICAgICAvLyBHZXQgYWxsIG5laWdoYm9yaG9vZHMgZnJvbSBhbGwgcmVzdGF1cmFudHNcbiAgICAgIGNvbnN0IG5laWdoYm9yaG9vZHMgPSByZXN0YXVyYW50cy5tYXAoKHYsIGkpID0+IHJlc3RhdXJhbnRzW2ldLm5laWdoYm9yaG9vZCk7XG4gICAgICAvLyBSZW1vdmUgZHVwbGljYXRlcyBmcm9tIG5laWdoYm9yaG9vZHNcbiAgICAgIGNvbnN0IHVuaXF1ZU5laWdoYm9yaG9vZHMgPSBuZWlnaGJvcmhvb2RzLmZpbHRlcigodiwgaSkgPT4gbmVpZ2hib3Job29kcy5pbmRleE9mKHYpID09IGkpO1xuICAgICAgY2FsbGJhY2sobnVsbCwgdW5pcXVlTmVpZ2hib3Job29kcyk7XG4gICAgfSkuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICBjYWxsYmFjayhlcnJvciwgbnVsbCk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogRmV0Y2ggYWxsIGN1aXNpbmVzIHdpdGggcHJvcGVyIGVycm9yIGhhbmRsaW5nLlxuICAgKi9cbiAgc3RhdGljIGZldGNoQ3Vpc2luZXMoY2FsbGJhY2spIHtcbiAgICAvLyBGZXRjaCBhbGwgcmVzdGF1cmFudHNcbiAgICBEQkhlbHBlci5mZXRjaFJlc3RhdXJhbnRzKCkudGhlbigocmVzdGF1cmFudHMpID0+IHtcbiAgICAgIC8vIEdldCBhbGwgY3Vpc2luZXMgZnJvbSBhbGwgcmVzdGF1cmFudHNcbiAgICAgIGNvbnN0IGN1aXNpbmVzID0gcmVzdGF1cmFudHMubWFwKCh2LCBpKSA9PiByZXN0YXVyYW50c1tpXS5jdWlzaW5lX3R5cGUpO1xuICAgICAgLy8gUmVtb3ZlIGR1cGxpY2F0ZXMgZnJvbSBjdWlzaW5lc1xuICAgICAgY29uc3QgdW5pcXVlQ3Vpc2luZXMgPSBjdWlzaW5lcy5maWx0ZXIoKHYsIGkpID0+IGN1aXNpbmVzLmluZGV4T2YodikgPT0gaSk7XG4gICAgICBjYWxsYmFjayhudWxsLCB1bmlxdWVDdWlzaW5lcyk7XG4gICAgfSkuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICBjYWxsYmFjayhlcnJvciwgbnVsbCk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogUmVzdGF1cmFudCBwYWdlIFVSTC5cbiAgICovXG4gIHN0YXRpYyB1cmxGb3JSZXN0YXVyYW50KHJlc3RhdXJhbnQpIHtcbiAgICByZXR1cm4gKGAuL3Jlc3RhdXJhbnQuaHRtbD9pZD0ke3Jlc3RhdXJhbnQuaWR9YCk7XG4gIH1cblxuICAvKipcbiAgICogUmVzdGF1cmFudCBpbWFnZSBVUkwuXG4gICAqL1xuICBzdGF0aWMgaW1hZ2VVcmxGb3JSZXN0YXVyYW50KHJlc3RhdXJhbnQsIG9wdGlvbnMpIHtcbiAgICBpZiAob3B0aW9ucykge1xuICAgICAgaWYgKG9wdGlvbnMuc2l6ZSA9PT0gJ3NtYWxsJykge1xuICAgICAgICByZXR1cm4gYGltZy8ke3Jlc3RhdXJhbnQucGhvdG9ncmFwaF9zbWFsbF8xeH0gMXgsIGltZy8ke3Jlc3RhdXJhbnQucGhvdG9ncmFwaF9zbWFsbF8yeH0gMnhgO1xuICAgICAgfSBpZiAob3B0aW9ucy5zaXplID09PSAnbWVkaXVtJykge1xuICAgICAgICByZXR1cm4gYGltZy8ke3Jlc3RhdXJhbnQucGhvdG9ncmFwaF9tZWRpdW1fMXh9IDF4LCBpbWcvJHtyZXN0YXVyYW50LnBob3RvZ3JhcGhfbWVkaXVtXzJ4fSAyeGA7XG4gICAgICB9IGlmIChvcHRpb25zLnNpemUgPT09ICdsYXJnZScgJiYgb3B0aW9ucy53aWRlKSB7XG4gICAgICAgIHJldHVybiBgaW1nLyR7cmVzdGF1cmFudC5waG90b2dyYXBoX2xhcmdlX3dpZGV9YDtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIChgaW1nLyR7cmVzdGF1cmFudC5waG90b2dyYXBoX2xhcmdlfWApO1xuICB9XG5cbiAgLyoqXG4gICAqIE1hcCBtYXJrZXIgZm9yIGEgcmVzdGF1cmFudC5cbiAgICovXG4gIHN0YXRpYyBtYXBNYXJrZXJGb3JSZXN0YXVyYW50KHJlc3RhdXJhbnQsIG1hcCkge1xuICAgIC8vIGh0dHBzOi8vbGVhZmxldGpzLmNvbS9yZWZlcmVuY2UtMS4zLjAuaHRtbCNtYXJrZXJcbiAgICBjb25zdCBtYXJrZXIgPSBuZXcgTC5tYXJrZXIoW3Jlc3RhdXJhbnQubGF0bG5nLmxhdCwgcmVzdGF1cmFudC5sYXRsbmcubG5nXSxcbiAgICAgIHtcbiAgICAgICAgdGl0bGU6IHJlc3RhdXJhbnQubmFtZSxcbiAgICAgICAgYWx0OiByZXN0YXVyYW50Lm5hbWUsXG4gICAgICAgIHVybDogREJIZWxwZXIudXJsRm9yUmVzdGF1cmFudChyZXN0YXVyYW50KSxcbiAgICAgIH0pO1xuICAgIG1hcmtlci5hZGRUbyhuZXdNYXApO1xuICAgIHJldHVybiBtYXJrZXI7XG4gIH1cbn1cbiJdLCJmaWxlIjoiZGJoZWxwZXIuanMifQ==
