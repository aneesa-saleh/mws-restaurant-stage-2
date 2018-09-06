"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

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
      return fetch(DBHelper.DATABASE_URL).then(function (response) {
        if (!response.ok) {
          var error = "Request failed. Returned status of ".concat(response.status);
          return Promise.reject(error);
        }

        return response.json();
      }).then(function (data) {
        return data.restaurants;
      });
    }
    /**
     * Fetch a restaurant by its ID.
     */

  }, {
    key: "fetchRestaurantById",
    value: function fetchRestaurantById(id, callback) {
      DBHelper.fetchRestaurants().then(function (restaurants) {
        var restaurant = restaurants.find(function (r) {
          return r.id == id;
        });

        if (restaurant) {
          // Got the restaurant
          callback(null, restaurant);
        } else {
          // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }).catch(function (error) {
        callback(error, null);
      });
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
      var port = 8000; // Change this to your server port

      return "http://localhost:".concat(port, "/data/restaurants.json");
    }
  }]);

  return DBHelper;
}();
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImRiaGVscGVyLmpzIl0sIm5hbWVzIjpbIkRCSGVscGVyIiwiZmV0Y2giLCJEQVRBQkFTRV9VUkwiLCJ0aGVuIiwicmVzcG9uc2UiLCJvayIsImVycm9yIiwic3RhdHVzIiwiUHJvbWlzZSIsInJlamVjdCIsImpzb24iLCJkYXRhIiwicmVzdGF1cmFudHMiLCJpZCIsImNhbGxiYWNrIiwiZmV0Y2hSZXN0YXVyYW50cyIsInJlc3RhdXJhbnQiLCJmaW5kIiwiciIsImNhdGNoIiwiY3Vpc2luZSIsInJlc3VsdHMiLCJmaWx0ZXIiLCJjdWlzaW5lX3R5cGUiLCJuZWlnaGJvcmhvb2QiLCJuZWlnaGJvcmhvb2RzIiwibWFwIiwidiIsImkiLCJ1bmlxdWVOZWlnaGJvcmhvb2RzIiwiaW5kZXhPZiIsImN1aXNpbmVzIiwidW5pcXVlQ3Vpc2luZXMiLCJvcHRpb25zIiwic2l6ZSIsInBob3RvZ3JhcGhfc21hbGxfMXgiLCJwaG90b2dyYXBoX3NtYWxsXzJ4IiwicGhvdG9ncmFwaF9tZWRpdW1fMXgiLCJwaG90b2dyYXBoX21lZGl1bV8yeCIsIndpZGUiLCJwaG90b2dyYXBoX2xhcmdlX3dpZGUiLCJwaG90b2dyYXBoX2xhcmdlIiwibWFya2VyIiwiTCIsImxhdGxuZyIsImxhdCIsImxuZyIsInRpdGxlIiwibmFtZSIsImFsdCIsInVybCIsInVybEZvclJlc3RhdXJhbnQiLCJhZGRUbyIsIm5ld01hcCIsInBvcnQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQUE7OztJQUdNQSxROzs7Ozs7Ozs7O0FBVUo7Ozt1Q0FHMEI7QUFDeEIsYUFBT0MsS0FBSyxDQUFDRCxRQUFRLENBQUNFLFlBQVYsQ0FBTCxDQUNKQyxJQURJLENBQ0MsVUFBQ0MsUUFBRCxFQUFjO0FBQ2xCLFlBQUksQ0FBQ0EsUUFBUSxDQUFDQyxFQUFkLEVBQWtCO0FBQ2hCLGNBQU1DLEtBQUssZ0RBQTBDRixRQUFRLENBQUNHLE1BQW5ELENBQVg7QUFDQSxpQkFBT0MsT0FBTyxDQUFDQyxNQUFSLENBQWVI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N0IsVUFBVSxDQUFDNEIsTUFBWCxDQUFrQkUsR0FBMUMsQ0FBYixFQUNiO0FBQ0VDLFFBQUFBLEtBQUssRUFBRS9CLFVBQVUsQ0FBQ2dDLElBRHBCO0FBRUVDLFFBQUFBLEdBQUcsRUFBRWpDLFVBQVUsQ0FBQ2dDLElBRmxCO0FBR0VFLFFBQUFBLEdBQUcsRUFBRWxELFFBQVEsQ0FBQ21ELGdCQUFULENBQTBCbkMsVUFBMUI7QUFIUCxPQURhLENBQWY7QUFNQTBCLE1BQUFBLE1BQU0sQ0FBQ1UsS0FBUCxDQUFhQyxNQUFiO0FBQ0EsYUFBT1gsTUFBUDtBQUNEOzs7O0FBM0pEOzs7O3dCQUkwQjtBQUN4QixVQUFNWSxJQUFJLEdBQUcsSUFBYixDQUR3QixDQUNMOztBQUNuQix3Q0FBMkJBLElBQTNCO0FBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvbW1vbiBkYXRhYmFzZSBoZWxwZXIgZnVuY3Rpb25zLlxuICovXG5jbGFzcyBEQkhlbHBlciB7XG4gIC8qKlxuICAgKiBEYXRhYmFzZSBVUkwuXG4gICAqIENoYW5nZSB0aGlzIHRvIHJlc3RhdXJhbnRzLmpzb24gZmlsZSBsb2NhdGlvbiBvbiB5b3VyIHNlcnZlci5cbiAgICovXG4gIHN0YXRpYyBnZXQgREFUQUJBU0VfVVJMKCkge1xuICAgIGNvbnN0IHBvcnQgPSA4MDAwOyAvLyBDaGFuZ2UgdGhpcyB0byB5b3VyIHNlcnZlciBwb3J0XG4gICAgcmV0dXJuIGBodHRwOi8vbG9jYWxob3N0OiR7cG9ydH0vZGF0YS9yZXN0YXVyYW50cy5qc29uYDtcbiAgfVxuXG4gIC8qKlxuICAgKiBGZXRjaCBhbGwgcmVzdGF1cmFudHMuXG4gICAqL1xuICBzdGF0aWMgZmV0Y2hSZXN0YXVyYW50cygpIHtcbiAgICByZXR1cm4gZmV0Y2goREJIZWxwZXIuREFUQUJBU0VfVVJMKVxuICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgIGlmICghcmVzcG9uc2Uub2spIHtcbiAgICAgICAgICBjb25zdCBlcnJvciA9IChgUmVxdWVzdCBmYWlsZWQuIFJldHVybmVkIHN0YXR1cyBvZiAke3Jlc3BvbnNlLnN0YXR1c31gKTtcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoZXJyb3IpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXNwb25zZS5qc29uKCk7XG4gICAgICB9KVxuICAgICAgLnRoZW4oZGF0YSA9PiBkYXRhLnJlc3RhdXJhbnRzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGZXRjaCBhIHJlc3RhdXJhbnQgYnkgaXRzIElELlxuICAgKi9cbiAgc3RhdGljIGZldGNoUmVzdGF1cmFudEJ5SWQoaWQsIGNhbGxiYWNrKSB7XG4gICAgREJIZWxwZXIuZmV0Y2hSZXN0YXVyYW50cygpLnRoZW4oKHJlc3RhdXJhbnRzKSA9PiB7XG4gICAgICBjb25zdCByZXN0YXVyYW50ID0gcmVzdGF1cmFudHMuZmluZChyID0+IHIuaWQgPT0gaWQpO1xuICAgICAgaWYgKHJlc3RhdXJhbnQpIHsgLy8gR290IHRoZSByZXN0YXVyYW50XG4gICAgICAgIGNhbGxiYWNrKG51bGwsIHJlc3RhdXJhbnQpO1xuICAgICAgfSBlbHNlIHsgLy8gUmVzdGF1cmFudCBkb2VzIG5vdCBleGlzdCBpbiB0aGUgZGF0YWJhc2VcbiAgICAgICAgY2FsbGJhY2soJ1Jlc3RhdXJhbnQgZG9lcyBub3QgZXhpc3QnLCBudWxsKTtcbiAgICAgIH1cbiAgICB9KS5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgIGNhbGxiYWNrKGVycm9yLCBudWxsKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGZXRjaCByZXN0YXVyYW50cyBieSBhIGN1aXNpbmUgdHlwZSB3aXRoIHByb3BlciBlcnJvciBoYW5kbGluZy5cbiAgICovXG4gIHN0YXRpYyBmZXRjaFJlc3RhdXJhbnRCeUN1aXNpbmUoY3Vpc2luZSwgY2FsbGJhY2spIHtcbiAgICAvLyBGZXRjaCBhbGwgcmVzdGF1cmFudHMgIHdpdGggcHJvcGVyIGVycm9yIGhhbmRsaW5nXG4gICAgREJIZWxwZXIuZmV0Y2hSZXN0YXVyYW50cygpLnRoZW4oKHJlc3RhdXJhbnRzKSA9PiB7XG4gICAgICAvLyBGaWx0ZXIgcmVzdGF1cmFudHMgdG8gaGF2ZSBvbmx5IGdpdmVuIGN1aXNpbmUgdHlwZVxuICAgICAgY29uc3QgcmVzdWx0cyA9IHJlc3RhdXJhbnRzLmZpbHRlcihyID0+IHIuY3Vpc2luZV90eXBlID09IGN1aXNpbmUpO1xuICAgICAgY2FsbGJhY2sobnVsbCwgcmVzdWx0cyk7XG4gICAgfSkuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICBjYWxsYmFjayhlcnJvciwgbnVsbCk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogRmV0Y2ggcmVzdGF1cmFudHMgYnkgYSBuZWlnaGJvcmhvb2Qgd2l0aCBwcm9wZXIgZXJyb3IgaGFuZGxpbmcuXG4gICAqL1xuICBzdGF0aWMgZmV0Y2hSZXN0YXVyYW50QnlOZWlnaGJvcmhvb2QobmVpZ2hib3Job29kLCBjYWxsYmFjaykge1xuICAgIC8vIEZldGNoIGFsbCByZXN0YXVyYW50c1xuICAgIERCSGVscGVyLmZldGNoUmVzdGF1cmFudHMoKS50aGVuKChyZXN0YXVyYW50cykgPT4ge1xuICAgICAgLy8gRmlsdGVyIHJlc3RhdXJhbnRzIHRvIGhhdmUgb25seSBnaXZlbiBuZWlnaGJvcmhvb2RcbiAgICAgIGNvbnN0IHJlc3VsdHMgPSByZXN0YXVyYW50cy5maWx0ZXIociA9PiByLm5laWdoYm9yaG9vZCA9PSBuZWlnaGJvcmhvb2QpO1xuICAgICAgY2FsbGJhY2sobnVsbCwgcmVzdWx0cyk7XG4gICAgfSkuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICBjYWxsYmFjayhlcnJvciwgbnVsbCk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogRmV0Y2ggcmVzdGF1cmFudHMgYnkgYSBjdWlzaW5lIGFuZCBhIG5laWdoYm9yaG9vZCB3aXRoIHByb3BlciBlcnJvciBoYW5kbGluZy5cbiAgICovXG4gIHN0YXRpYyBmZXRjaFJlc3RhdXJhbnRCeUN1aXNpbmVBbmROZWlnaGJvcmhvb2QoY3Vpc2luZSwgbmVpZ2hib3Job29kLCBjYWxsYmFjaykge1xuICAgIC8vIEZldGNoIGFsbCByZXN0YXVyYW50c1xuICAgIERCSGVscGVyLmZldGNoUmVzdGF1cmFudHMoKS50aGVuKChyZXN0YXVyYW50cykgPT4ge1xuICAgICAgbGV0IHJlc3VsdHMgPSByZXN0YXVyYW50cztcbiAgICAgIGlmIChjdWlzaW5lICE9ICdhbGwnKSB7IC8vIGZpbHRlciBieSBjdWlzaW5lXG4gICAgICAgIHJlc3VsdHMgPSByZXN1bHRzLmZpbHRlcihyID0+IHIuY3Vpc2luZV90eXBlID09IGN1aXNpbmUpO1xuICAgICAgfVxuICAgICAgaWYgKG5laWdoYm9yaG9vZCAhPSAnYWxsJykgeyAvLyBmaWx0ZXIgYnkgbmVpZ2hib3Job29kXG4gICAgICAgIHJlc3VsdHMgPSByZXN1bHRzLmZpbHRlcihyID0+IHIubmVpZ2hib3Job29kID09IG5laWdoYm9yaG9vZCk7XG4gICAgICB9XG4gICAgICBjYWxsYmFjayhudWxsLCByZXN1bHRzKTtcbiAgICB9KS5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgIGNhbGxiYWNrKGVycm9yLCBudWxsKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGZXRjaCBhbGwgbmVpZ2hib3Job29kcyB3aXRoIHByb3BlciBlcnJvciBoYW5kbGluZy5cbiAgICovXG4gIHN0YXRpYyBmZXRjaE5laWdoYm9yaG9vZHMoY2FsbGJhY2spIHtcbiAgICAvLyBGZXRjaCBhbGwgcmVzdGF1cmFudHNcbiAgICBEQkhlbHBlci5mZXRjaFJlc3RhdXJhbnRzKCkudGhlbigocmVzdGF1cmFudHMpID0+IHtcbiAgICAgIC8vIEdldCBhbGwgbmVpZ2hib3Job29kcyBmcm9tIGFsbCByZXN0YXVyYW50c1xuICAgICAgY29uc3QgbmVpZ2hib3Job29kcyA9IHJlc3RhdXJhbnRzLm1hcCgodiwgaSkgPT4gcmVzdGF1cmFudHNbaV0ubmVpZ2hib3Job29kKTtcbiAgICAgIC8vIFJlbW92ZSBkdXBsaWNhdGVzIGZyb20gbmVpZ2hib3Job29kc1xuICAgICAgY29uc3QgdW5pcXVlTmVpZ2hib3Job29kcyA9IG5laWdoYm9yaG9vZHMuZmlsdGVyKCh2LCBpKSA9PiBuZWlnaGJvcmhvb2RzLmluZGV4T2YodikgPT0gaSk7XG4gICAgICBjYWxsYmFjayhudWxsLCB1bmlxdWVOZWlnaGJvcmhvb2RzKTtcbiAgICB9KS5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgIGNhbGxiYWNrKGVycm9yLCBudWxsKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGZXRjaCBhbGwgY3Vpc2luZXMgd2l0aCBwcm9wZXIgZXJyb3IgaGFuZGxpbmcuXG4gICAqL1xuICBzdGF0aWMgZmV0Y2hDdWlzaW5lcyhjYWxsYmFjaykge1xuICAgIC8vIEZldGNoIGFsbCByZXN0YXVyYW50c1xuICAgIERCSGVscGVyLmZldGNoUmVzdGF1cmFudHMoKS50aGVuKChyZXN0YXVyYW50cykgPT4ge1xuICAgICAgLy8gR2V0IGFsbCBjdWlzaW5lcyBmcm9tIGFsbCByZXN0YXVyYW50c1xuICAgICAgY29uc3QgY3Vpc2luZXMgPSByZXN0YXVyYW50cy5tYXAoKHYsIGkpID0+IHJlc3RhdXJhbnRzW2ldLmN1aXNpbmVfdHlwZSk7XG4gICAgICAvLyBSZW1vdmUgZHVwbGljYXRlcyBmcm9tIGN1aXNpbmVzXG4gICAgICBjb25zdCB1bmlxdWVDdWlzaW5lcyA9IGN1aXNpbmVzLmZpbHRlcigodiwgaSkgPT4gY3Vpc2luZXMuaW5kZXhPZih2KSA9PSBpKTtcbiAgICAgIGNhbGxiYWNrKG51bGwsIHVuaXF1ZUN1aXNpbmVzKTtcbiAgICB9KS5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgIGNhbGxiYWNrKGVycm9yLCBudWxsKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXN0YXVyYW50IHBhZ2UgVVJMLlxuICAgKi9cbiAgc3RhdGljIHVybEZvclJlc3RhdXJhbnQocmVzdGF1cmFudCkge1xuICAgIHJldHVybiAoYC4vcmVzdGF1cmFudC5odG1sP2lkPSR7cmVzdGF1cmFudC5pZH1gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXN0YXVyYW50IGltYWdlIFVSTC5cbiAgICovXG4gIHN0YXRpYyBpbWFnZVVybEZvclJlc3RhdXJhbnQocmVzdGF1cmFudCwgb3B0aW9ucykge1xuICAgIGlmIChvcHRpb25zKSB7XG4gICAgICBpZiAob3B0aW9ucy5zaXplID09PSAnc21hbGwnKSB7XG4gICAgICAgIHJldHVybiBgaW1nLyR7cmVzdGF1cmFudC5waG90b2dyYXBoX3NtYWxsXzF4fSAxeCwgaW1nLyR7cmVzdGF1cmFudC5waG90b2dyYXBoX3NtYWxsXzJ4fSAyeGA7XG4gICAgICB9IGlmIChvcHRpb25zLnNpemUgPT09ICdtZWRpdW0nKSB7XG4gICAgICAgIHJldHVybiBgaW1nLyR7cmVzdGF1cmFudC5waG90b2dyYXBoX21lZGl1bV8xeH0gMXgsIGltZy8ke3Jlc3RhdXJhbnQucGhvdG9ncmFwaF9tZWRpdW1fMnh9IDJ4YDtcbiAgICAgIH0gaWYgKG9wdGlvbnMuc2l6ZSA9PT0gJ2xhcmdlJyAmJiBvcHRpb25zLndpZGUpIHtcbiAgICAgICAgcmV0dXJuIGBpbWcvJHtyZXN0YXVyYW50LnBob3RvZ3JhcGhfbGFyZ2Vfd2lkZX1gO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gKGBpbWcvJHtyZXN0YXVyYW50LnBob3RvZ3JhcGhfbGFyZ2V9YCk7XG4gIH1cblxuICAvKipcbiAgICogTWFwIG1hcmtlciBmb3IgYSByZXN0YXVyYW50LlxuICAgKi9cbiAgc3RhdGljIG1hcE1hcmtlckZvclJlc3RhdXJhbnQocmVzdGF1cmFudCwgbWFwKSB7XG4gICAgLy8gaHR0cHM6Ly9sZWFmbGV0anMuY29tL3JlZmVyZW5jZS0xLjMuMC5odG1sI21hcmtlclxuICAgIGNvbnN0IG1hcmtlciA9IG5ldyBMLm1hcmtlcihbcmVzdGF1cmFudC5sYXRsbmcubGF0LCByZXN0YXVyYW50LmxhdGxuZy5sbmddLFxuICAgICAge1xuICAgICAgICB0aXRsZTogcmVzdGF1cmFudC5uYW1lLFxuICAgICAgICBhbHQ6IHJlc3RhdXJhbnQubmFtZSxcbiAgICAgICAgdXJsOiBEQkhlbHBlci51cmxGb3JSZXN0YXVyYW50KHJlc3RhdXJhbnQpLFxuICAgICAgfSk7XG4gICAgbWFya2VyLmFkZFRvKG5ld01hcCk7XG4gICAgcmV0dXJuIG1hcmtlcjtcbiAgfVxufVxuIl0sImZpbGUiOiJkYmhlbHBlci5qcyJ9
