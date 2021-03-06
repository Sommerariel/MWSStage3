/**
 * Common database helper functions.
 */
'use strict';

 const dbPromise = idb.open('resturant-reviews', 4, upgradeDb => {
   switch(upgradeDb.oldVersion) {
     case 0:
       console.log('creating a id index');
       const store = upgradeDb.createObjectStore('restaurants', {keyPath: "id"});
       store.createIndex('ID', 'id');
     case 1:
        //console.log('creating a review store');
        const reviewsStore = upgradeDb.createObjectStore('reviews', {keyPath: "id"});
        reviewsStore.createIndex( 'Restaurant_id', 'restaurant_id');
     case 2:
         const queueStore = upgradeDb.createObjectStore('queue', {keyPath: "id", autoIncrement: true});
         queueStore.createIndex( 'Restaurant_id', 'restaurant_id');
   }
 });

class DBHelper {
  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337; // Change this to your server port
    return `http://localhost:${port}/restaurants/`;
  }

  static get DATABASE_REVIEW_URL() {
    const port = 1337;
    return `http://localhost:${port}/reviews/?restaurant_id=`;
  }

  /**
   * Fetch all restaurants from the JSON file that is served at the port
   */
   static fetchRestaurants(callback) {
     //using the fetch api to pull data from the server
     //the json method on a response object returns a promise
     fetch(DBHelper.DATABASE_URL)
     .then(response => response.json()) //return json from sever
     .then(restaurants =>
       {
             dbPromise.then(db => {
               const tx = db.transaction('restaurants', 'readwrite');
               const store = tx.objectStore('restaurants');
               restaurants.forEach(restaurant => {
                 store.put(restaurant);
               });
               return tx.complete;
           });
          callback(null, restaurants);
       }
     ).catch(function () {
       console.log(`You seem to be offline.Please check your internet`);
       dbPromise.then(db => {
         const tx = db.transaction('restaurants', 'readwrite');
         const store = tx.objectStore('restaurants');
         return store.getAll();
     }).then(restaurants => {
         callback(null, restaurants);
     })
     });
   }

   static fetchReviews(id, callback) {
     //using the fetch api to pull data from the server
     //the json method on a response object returns a promise
     const urlToFetch = DBHelper.DATABASE_REVIEW_URL + id;
     fetch(urlToFetch)
     .then(response => response.json()) //return json from server
     .then(reviews =>
       {
             dbPromise.then(db => {
               const tx = db.transaction('reviews', 'readwrite');
               const store = tx.objectStore('reviews');
               reviews.forEach(review => {
                 store.add(review);
               });
               return tx.complete;
           });
          callback(reviews);
       }
     ).catch(function () {
       console.log(`You seem to be offline. Please check your internet`);
       dbPromise.then(db => {
         const tx = db.transaction('reviews', 'readwrite');
         const store = tx.objectStore('reviews');
         return store.getAll();
     }).then(reviews => {
         callback(reviews);
     })
     });
   }


  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */

  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */

  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return (`/img/${restaurant.id}`);
  }

  /**
   * Map marker for a restaurant.
   */
   static mapMarkerForRestaurant(restaurant, map) {
   // https://leafletjs.com/reference-1.3.0.html#marker
   const marker = new L.marker([restaurant.latlng.lat, restaurant.latlng.lng],
     {title: restaurant.name,
     alt: restaurant.name,
     url: DBHelper.urlForRestaurant(restaurant)
     })
     marker.addTo(newMap);
   return marker;
 }

  static favoriteStatus(id, status) {
    //put new values into the database -> server
    DBHelper.fetchRestaurants((error, restaurant) => {
      if (error) {
        callback(error, null);
      } else {
        //console.log('status:', status);
        const urltoPUT = DBHelper.DATABASE_URL + id + `/?is_favorite=` + status;
        fetch(urltoPUT , {
          method: 'PUT'
        })
        .then(() =>
          {
                this.dbPromise(db => {
                  //get the database
                  const tx = db.transaction('restaurants', 'readwrite');
                  const store = tx.objectStore('restaurants');
                  //go through each restaurant available and for each one submit the status into the Database
                  restaurants.forEach(restaurant => {
                    //let status = (restaurant.is_favorite == true) ? false : true;
                    restaurant.is_favorite = status;
                    store.put(restaurant);
                  });
                  return tx.complete;
              });
          }
        ).catch(function () {
          dbPromise.then(db => {
            //grab the database
            const tx = db.transaction('restaurants', 'readwrite');
            const store = tx.objectStore('restaurants');
            //get everything within that object store and return out
            return store.getAll();
        })
        });
      }
    });
  }
  static addReviewQueue(review) {
      dbPromise.then(db => {
        console.log('adding review in offline', review);
        //grab the database
        const tx = db.transaction('queue', 'readwrite');
        const store = tx.objectStore('queue');
        //put that particular review into the store
        store.put(review);
        //return the transaction as complete
        return tx.complete;
      });
  }

  static addReviewServer(review) {
    const port = 1337;
    fetch(`http://localhost:${port}/reviews/`, {
      //send the data (POST) to the server
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type' : 'application/json; charset=utf-8',
      },
      body: JSON.stringify(review),
    }).catch(err => {
      console.log('no review', err);
    });
  }
  static addReviewFromQueue() {
    dbPromise.then (db => {
      const tx = db.transaction('queue', 'readwrite');
      tx.objectStore('queue').iterateCursor(cursor => {
        if(!cursor) return;
        //go through all of the values in the queue and then add them to the server
        DBHelper.addReviewServer(cursor.value);
        cursor.delete();
        //continue if more than one has been submitted
        cursor.continue();
      });
      tx.complete;
    });
  }

}


//Check if browser supports service worker. If so regsiter it!
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js').then(function(registration) {
      // Registration was successful
      console.log('ServiceWorker registration successful within scope: ', registration.scope);
    }, function(err) {
      // registration failed :(
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}
