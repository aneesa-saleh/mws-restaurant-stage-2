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
      return fetch("".concat(DBHelper.DATABASE_URL, "/restaurants")).then(function (response) {
        if (!response.ok) {
          var error = "Request failed. Returned status of ".concat(response.status);
          return Promise.reject(error);
        }

        return response.json();
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
      var port = 1337; // Change this to your server port

      return "http://localhost:".concat(port);
    }
  }]);

  return DBHelper;
}();
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImRiaGVscGVyLmpzIl0sIm5hbWVzIjpbIkRCSGVscGVyIiwiZmV0Y2giLCJEQVRBQkFTRV9VUkwiLCJ0aGVuIiwicmVzcG9uc2UiLCJvayIsImVycm9yIiwic3RhdHVzIiwiUHJvbWlzZSIsInJlamVjdCIsImpzb24iLCJpZCIsImNhbGxiYWNrIiwiZmV0Y2hSZXN0YXVyYW50cyIsInJlc3RhdXJhbnRzIiwicmVzdGF1cmFudCIsImZpbmQiLCJyIiwiY2F0Y2giLCJjdWlzaW5lIiwicmVzdWx0cyIsImZpbHRlciIsImN1aXNpbmVfdHlwZSIsIm5laWdoYm9yaG9vZCIsIm5laWdoYm9yaG9vZHMiLCJtYXAiLCJ2IiwiaSIsInVuaXF1ZU5laWdoYm9yaG9vZHMiLCJpbmRleE9mIiwiY3Vpc2luZXMiLCJ1bmlxdWVDdWlzaW5lcyIsIm9wdGlvbnMiLCJzaXplIiwicGhvdG9ncmFwaF9zbWFsbF8xeCIsInBob3RvZ3JhcGhfc21hbGxfMngiLCJwaG90b2dyYXBoX21lZGl1bV8xeCIsInBob3RvZ3JhcGhfbWVkaXVtXzJ4Iiwid2lkZSIsInBob3RvZ3JhcGhfbGFyZ2Vfd2lkZSIsInBob3RvZ3JhcGhfbGFyZ2UiLCJtYXJrZXIiLCJMIiwibGF0bG5nIiwibGF0IiwibG5nIiwidGl0bGUiLCJuYW1lIiwiYWx0IiwidXJsIiwidXJsRm9yUmVzdGF1cmFudCIsImFkZFRvIiwibmV3TWFwIiwicG9ydCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBQTs7O0lBR01BLFE7Ozs7Ozs7Ozs7QUFVSjs7O3VDQUcwQjtBQUN4QixhQUFPQyxLQUFLLFdBQUlELFFBQVEsQ0FBQ0UsWUFBYixrQkFBTCxDQUNKQyxJQURJLENBQ0MsVUFBQ0MsUUFBRCxFQUFjO0FBQ2xCLFlBQUksQ0FBQ0EsUUFBUSxDQUFDQyxFQUFkLEVBQWtCO0FBQ2hCLGNBQU1DLEtBQUssZ0RBQTBDRixRQUFRLENBQUNHLE1BQW5ELENBQVg7QUFDQSxpQkFBT0MsT0FBTyxDQUFDQyxNQUFSLENBQWVILEtBQWYs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QUFDZ0MsSUFEcEI7QUFFRUMsUUFBQUEsR0FBRyxFQUFFakMsVUFBVSxDQUFDZ0MsSUFGbEI7QUFHRUUsUUFBQUEsR0FBRyxFQUFFakQsUUFBUSxDQUFDa0QsZ0JBQVQsQ0FBMEJuQyxVQUExQjtBQUhQLE9BRGEsQ0FBZjtBQU1BMEIsTUFBQUEsTUFBTSxDQUFDVSxLQUFQLENBQWFDLE1BQWI7QUFDQSxhQUFPWCxNQUFQO0FBQ0Q7Ozs7QUExSkQ7Ozs7d0JBSTBCO0FBQ3hCLFVBQU1ZLElBQUksR0FBRyxJQUFiLENBRHdCLENBQ0w7O0FBQ25CLHdDQUEyQkEsSUFBM0I7QUFDRCIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29tbW9uIGRhdGFiYXNlIGhlbHBlciBmdW5jdGlvbnMuXG4gKi9cbmNsYXNzIERCSGVscGVyIHtcbiAgLyoqXG4gICAqIERhdGFiYXNlIFVSTC5cbiAgICogQ2hhbmdlIHRoaXMgdG8gcmVzdGF1cmFudHMuanNvbiBmaWxlIGxvY2F0aW9uIG9uIHlvdXIgc2VydmVyLlxuICAgKi9cbiAgc3RhdGljIGdldCBEQVRBQkFTRV9VUkwoKSB7XG4gICAgY29uc3QgcG9ydCA9IDEzMzc7IC8vIENoYW5nZSB0aGlzIHRvIHlvdXIgc2VydmVyIHBvcnRcbiAgICByZXR1cm4gYGh0dHA6Ly9sb2NhbGhvc3Q6JHtwb3J0fWA7XG4gIH1cblxuICAvKipcbiAgICogRmV0Y2ggYWxsIHJlc3RhdXJhbnRzLlxuICAgKi9cbiAgc3RhdGljIGZldGNoUmVzdGF1cmFudHMoKSB7XG4gICAgcmV0dXJuIGZldGNoKGAke0RCSGVscGVyLkRBVEFCQVNFX1VSTH0vcmVzdGF1cmFudHNgKVxuICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgIGlmICghcmVzcG9uc2Uub2spIHtcbiAgICAgICAgICBjb25zdCBlcnJvciA9IChgUmVxdWVzdCBmYWlsZWQuIFJldHVybmVkIHN0YXR1cyBvZiAke3Jlc3BvbnNlLnN0YXR1c31gKTtcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoZXJyb3IpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXNwb25zZS5qc29uKCk7XG4gICAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIEZldGNoIGEgcmVzdGF1cmFudCBieSBpdHMgSUQuXG4gICAqL1xuICBzdGF0aWMgZmV0Y2hSZXN0YXVyYW50QnlJZChpZCwgY2FsbGJhY2spIHtcbiAgICBEQkhlbHBlci5mZXRjaFJlc3RhdXJhbnRzKCkudGhlbigocmVzdGF1cmFudHMpID0+IHtcbiAgICAgIGNvbnN0IHJlc3RhdXJhbnQgPSByZXN0YXVyYW50cy5maW5kKHIgPT4gci5pZCA9PSBpZCk7XG4gICAgICBpZiAocmVzdGF1cmFudCkgeyAvLyBHb3QgdGhlIHJlc3RhdXJhbnRcbiAgICAgICAgY2FsbGJhY2sobnVsbCwgcmVzdGF1cmFudCk7XG4gICAgICB9IGVsc2UgeyAvLyBSZXN0YXVyYW50IGRvZXMgbm90IGV4aXN0IGluIHRoZSBkYXRhYmFzZVxuICAgICAgICBjYWxsYmFjaygnUmVzdGF1cmFudCBkb2VzIG5vdCBleGlzdCcsIG51bGwpO1xuICAgICAgfVxuICAgIH0pLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgY2FsbGJhY2soZXJyb3IsIG51bGwpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEZldGNoIHJlc3RhdXJhbnRzIGJ5IGEgY3Vpc2luZSB0eXBlIHdpdGggcHJvcGVyIGVycm9yIGhhbmRsaW5nLlxuICAgKi9cbiAgc3RhdGljIGZldGNoUmVzdGF1cmFudEJ5Q3Vpc2luZShjdWlzaW5lLCBjYWxsYmFjaykge1xuICAgIC8vIEZldGNoIGFsbCByZXN0YXVyYW50cyAgd2l0aCBwcm9wZXIgZXJyb3IgaGFuZGxpbmdcbiAgICBEQkhlbHBlci5mZXRjaFJlc3RhdXJhbnRzKCkudGhlbigocmVzdGF1cmFudHMpID0+IHtcbiAgICAgIC8vIEZpbHRlciByZXN0YXVyYW50cyB0byBoYXZlIG9ubHkgZ2l2ZW4gY3Vpc2luZSB0eXBlXG4gICAgICBjb25zdCByZXN1bHRzID0gcmVzdGF1cmFudHMuZmlsdGVyKHIgPT4gci5jdWlzaW5lX3R5cGUgPT0gY3Vpc2luZSk7XG4gICAgICBjYWxsYmFjayhudWxsLCByZXN1bHRzKTtcbiAgICB9KS5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgIGNhbGxiYWNrKGVycm9yLCBudWxsKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGZXRjaCByZXN0YXVyYW50cyBieSBhIG5laWdoYm9yaG9vZCB3aXRoIHByb3BlciBlcnJvciBoYW5kbGluZy5cbiAgICovXG4gIHN0YXRpYyBmZXRjaFJlc3RhdXJhbnRCeU5laWdoYm9yaG9vZChuZWlnaGJvcmhvb2QsIGNhbGxiYWNrKSB7XG4gICAgLy8gRmV0Y2ggYWxsIHJlc3RhdXJhbnRzXG4gICAgREJIZWxwZXIuZmV0Y2hSZXN0YXVyYW50cygpLnRoZW4oKHJlc3RhdXJhbnRzKSA9PiB7XG4gICAgICAvLyBGaWx0ZXIgcmVzdGF1cmFudHMgdG8gaGF2ZSBvbmx5IGdpdmVuIG5laWdoYm9yaG9vZFxuICAgICAgY29uc3QgcmVzdWx0cyA9IHJlc3RhdXJhbnRzLmZpbHRlcihyID0+IHIubmVpZ2hib3Job29kID09IG5laWdoYm9yaG9vZCk7XG4gICAgICBjYWxsYmFjayhudWxsLCByZXN1bHRzKTtcbiAgICB9KS5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgIGNhbGxiYWNrKGVycm9yLCBudWxsKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGZXRjaCByZXN0YXVyYW50cyBieSBhIGN1aXNpbmUgYW5kIGEgbmVpZ2hib3Job29kIHdpdGggcHJvcGVyIGVycm9yIGhhbmRsaW5nLlxuICAgKi9cbiAgc3RhdGljIGZldGNoUmVzdGF1cmFudEJ5Q3Vpc2luZUFuZE5laWdoYm9yaG9vZChjdWlzaW5lLCBuZWlnaGJvcmhvb2QsIGNhbGxiYWNrKSB7XG4gICAgLy8gRmV0Y2ggYWxsIHJlc3RhdXJhbnRzXG4gICAgREJIZWxwZXIuZmV0Y2hSZXN0YXVyYW50cygpLnRoZW4oKHJlc3RhdXJhbnRzKSA9PiB7XG4gICAgICBsZXQgcmVzdWx0cyA9IHJlc3RhdXJhbnRzO1xuICAgICAgaWYgKGN1aXNpbmUgIT0gJ2FsbCcpIHsgLy8gZmlsdGVyIGJ5IGN1aXNpbmVcbiAgICAgICAgcmVzdWx0cyA9IHJlc3VsdHMuZmlsdGVyKHIgPT4gci5jdWlzaW5lX3R5cGUgPT0gY3Vpc2luZSk7XG4gICAgICB9XG4gICAgICBpZiAobmVpZ2hib3Job29kICE9ICdhbGwnKSB7IC8vIGZpbHRlciBieSBuZWlnaGJvcmhvb2RcbiAgICAgICAgcmVzdWx0cyA9IHJlc3VsdHMuZmlsdGVyKHIgPT4gci5uZWlnaGJvcmhvb2QgPT0gbmVpZ2hib3Job29kKTtcbiAgICAgIH1cbiAgICAgIGNhbGxiYWNrKG51bGwsIHJlc3VsdHMpO1xuICAgIH0pLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgY2FsbGJhY2soZXJyb3IsIG51bGwpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEZldGNoIGFsbCBuZWlnaGJvcmhvb2RzIHdpdGggcHJvcGVyIGVycm9yIGhhbmRsaW5nLlxuICAgKi9cbiAgc3RhdGljIGZldGNoTmVpZ2hib3Job29kcyhjYWxsYmFjaykge1xuICAgIC8vIEZldGNoIGFsbCByZXN0YXVyYW50c1xuICAgIERCSGVscGVyLmZldGNoUmVzdGF1cmFudHMoKS50aGVuKChyZXN0YXVyYW50cykgPT4ge1xuICAgICAgLy8gR2V0IGFsbCBuZWlnaGJvcmhvb2RzIGZyb20gYWxsIHJlc3RhdXJhbnRzXG4gICAgICBjb25zdCBuZWlnaGJvcmhvb2RzID0gcmVzdGF1cmFudHMubWFwKCh2LCBpKSA9PiByZXN0YXVyYW50c1tpXS5uZWlnaGJvcmhvb2QpO1xuICAgICAgLy8gUmVtb3ZlIGR1cGxpY2F0ZXMgZnJvbSBuZWlnaGJvcmhvb2RzXG4gICAgICBjb25zdCB1bmlxdWVOZWlnaGJvcmhvb2RzID0gbmVpZ2hib3Job29kcy5maWx0ZXIoKHYsIGkpID0+IG5laWdoYm9yaG9vZHMuaW5kZXhPZih2KSA9PSBpKTtcbiAgICAgIGNhbGxiYWNrKG51bGwsIHVuaXF1ZU5laWdoYm9yaG9vZHMpO1xuICAgIH0pLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgY2FsbGJhY2soZXJyb3IsIG51bGwpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEZldGNoIGFsbCBjdWlzaW5lcyB3aXRoIHByb3BlciBlcnJvciBoYW5kbGluZy5cbiAgICovXG4gIHN0YXRpYyBmZXRjaEN1aXNpbmVzKGNhbGxiYWNrKSB7XG4gICAgLy8gRmV0Y2ggYWxsIHJlc3RhdXJhbnRzXG4gICAgREJIZWxwZXIuZmV0Y2hSZXN0YXVyYW50cygpLnRoZW4oKHJlc3RhdXJhbnRzKSA9PiB7XG4gICAgICAvLyBHZXQgYWxsIGN1aXNpbmVzIGZyb20gYWxsIHJlc3RhdXJhbnRzXG4gICAgICBjb25zdCBjdWlzaW5lcyA9IHJlc3RhdXJhbnRzLm1hcCgodiwgaSkgPT4gcmVzdGF1cmFudHNbaV0uY3Vpc2luZV90eXBlKTtcbiAgICAgIC8vIFJlbW92ZSBkdXBsaWNhdGVzIGZyb20gY3Vpc2luZXNcbiAgICAgIGNvbnN0IHVuaXF1ZUN1aXNpbmVzID0gY3Vpc2luZXMuZmlsdGVyKCh2LCBpKSA9PiBjdWlzaW5lcy5pbmRleE9mKHYpID09IGkpO1xuICAgICAgY2FsbGJhY2sobnVsbCwgdW5pcXVlQ3Vpc2luZXMpO1xuICAgIH0pLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgY2FsbGJhY2soZXJyb3IsIG51bGwpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlc3RhdXJhbnQgcGFnZSBVUkwuXG4gICAqL1xuICBzdGF0aWMgdXJsRm9yUmVzdGF1cmFudChyZXN0YXVyYW50KSB7XG4gICAgcmV0dXJuIChgLi9yZXN0YXVyYW50Lmh0bWw/aWQ9JHtyZXN0YXVyYW50LmlkfWApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlc3RhdXJhbnQgaW1hZ2UgVVJMLlxuICAgKi9cbiAgc3RhdGljIGltYWdlVXJsRm9yUmVzdGF1cmFudChyZXN0YXVyYW50LCBvcHRpb25zKSB7XG4gICAgaWYgKG9wdGlvbnMpIHtcbiAgICAgIGlmIChvcHRpb25zLnNpemUgPT09ICdzbWFsbCcpIHtcbiAgICAgICAgcmV0dXJuIGBpbWcvJHtyZXN0YXVyYW50LnBob3RvZ3JhcGhfc21hbGxfMXh9IDF4LCBpbWcvJHtyZXN0YXVyYW50LnBob3RvZ3JhcGhfc21hbGxfMnh9IDJ4YDtcbiAgICAgIH0gaWYgKG9wdGlvbnMuc2l6ZSA9PT0gJ21lZGl1bScpIHtcbiAgICAgICAgcmV0dXJuIGBpbWcvJHtyZXN0YXVyYW50LnBob3RvZ3JhcGhfbWVkaXVtXzF4fSAxeCwgaW1nLyR7cmVzdGF1cmFudC5waG90b2dyYXBoX21lZGl1bV8yeH0gMnhgO1xuICAgICAgfSBpZiAob3B0aW9ucy5zaXplID09PSAnbGFyZ2UnICYmIG9wdGlvbnMud2lkZSkge1xuICAgICAgICByZXR1cm4gYGltZy8ke3Jlc3RhdXJhbnQucGhvdG9ncmFwaF9sYXJnZV93aWRlfWA7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiAoYGltZy8ke3Jlc3RhdXJhbnQucGhvdG9ncmFwaF9sYXJnZX1gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNYXAgbWFya2VyIGZvciBhIHJlc3RhdXJhbnQuXG4gICAqL1xuICBzdGF0aWMgbWFwTWFya2VyRm9yUmVzdGF1cmFudChyZXN0YXVyYW50LCBtYXApIHtcbiAgICAvLyBodHRwczovL2xlYWZsZXRqcy5jb20vcmVmZXJlbmNlLTEuMy4wLmh0bWwjbWFya2VyXG4gICAgY29uc3QgbWFya2VyID0gbmV3IEwubWFya2VyKFtyZXN0YXVyYW50LmxhdGxuZy5sYXQsIHJlc3RhdXJhbnQubGF0bG5nLmxuZ10sXG4gICAgICB7XG4gICAgICAgIHRpdGxlOiByZXN0YXVyYW50Lm5hbWUsXG4gICAgICAgIGFsdDogcmVzdGF1cmFudC5uYW1lLFxuICAgICAgICB1cmw6IERCSGVscGVyLnVybEZvclJlc3RhdXJhbnQocmVzdGF1cmFudCksXG4gICAgICB9KTtcbiAgICBtYXJrZXIuYWRkVG8obmV3TWFwKTtcbiAgICByZXR1cm4gbWFya2VyO1xuICB9XG59XG4iXSwiZmlsZSI6ImRiaGVscGVyLmpzIn0=
