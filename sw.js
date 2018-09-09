/* service worker script */

//declare caches
const  Reviews = 'reviews';

//install the service worker and cache files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('reviews').then(function(cache) {
      return cache.addAll(
        [
          '/',
          '/img',
          '/index.html',
          '/restaurant.html',
          '/css/styles.css',
          '/js/main.js',
          '/js/restaurant_info.js',
          '/js/dbhelper.js',
          '/js/idb.js'
        ]
      );
    })
  )
})

//get from the cache if possible, if not check the network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      //if you have a match in the cache you are returning it
      if (response) {
        return response;
      }

      //clone the request since it cannot be used more than once
      let fetchRequest = event.request.clone();

      return fetch(fetchRequest).then(response => {
        //Check if we are getting a valid response. Basic means that the request is from our origin and third part items are not cached at all.
        if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
          }

      //clone request again
      let responseToCache = response.clone();

      //open the cache and put the items into it
      caches.open('reviews').then(cache => {
        cache.put(event.request, responseToCache);
      })
      return response;
      })
    })
  )
})

//delete old service workers
self.addEventListener('activate', event => {
  //console.log('service worker is activating');
  let cacheWhitelist = ['reviews'];

    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheNames => {
            if (cacheWhitelist.indexOf('reviews') === -1){
              return caches.delete('reviews');
            }
          })
        )
      })
  )
})
