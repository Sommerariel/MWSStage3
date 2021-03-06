let restaurant,
    newMap2;

/**
 * Initialize map as soon as the page is loaded.
 */
 document.addEventListener('DOMContentLoaded', (event) => {
  initMap();
});
 /**
 * Initialize leaflet map
 */

 initMap = () => {
   fetchRestaurantFromURL((error, restaurant) => {
     if (error) { // Got an error!
       console.error(error);
     } else {
       self.newMap = L.map('map', {
         center: [restaurant.latlng.lat, restaurant.latlng.lng],
         zoom: 16,
         scrollWheelZoom: false
       });
       L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
         mapboxToken: 'pk.eyJ1Ijoic29tbWVlciIsImEiOiJjamxiNjlveWMweGR1M3BvMG80cmdpZ2wxIn0.29c7j8XCjbqvyQeLza_Y4Q',
         maxZoom: 18,
         attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
           '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
           'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
         id: 'mapbox.streets'
       }).addTo(newMap);
       fillBreadcrumb();
       //networkConnection(e);
       DBHelper.mapMarkerForRestaurant(self.restaurant, self.newMap);
     }
   });
 }
/*window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
}*/

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img'
  image.alt = `An image taken at ${restaurant.name} Restaurant in ${restaurant.neighborhood} in New York City, NY.`;
  /*image.src = DBHelper.imageUrlForRestaurant(restaurant);*/
  image.src = `/img/${restaurant.id}-small_1x.jpg`;
  image.setAttribute('srcset', `/img/${restaurant.id}-small_1x.jpg 1x, /img/${restaurant.id}-small_2x.jpg 2x, /img/${restaurant.id}-med_1x.jpg 1x, /img/${restaurant.id}-small_2x.jpg 2x, /img/${restaurant.id}-large_1x.jpg 1x, /img/${restaurant.id}-small_2x.jpg 2x`);

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }

  // fill reviews
  DBHelper.fetchReviews(restaurant.id, fillReviewsHTML);
  //console.log("filled Reviews");
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.reviews) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h2');
  title.innerHTML = 'Reviews';
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  li.className = 'reviewBlock';
  const name = document.createElement('p');
  name.innerHTML = review.name;
  name.className = 'reviewerName';
  li.appendChild(name);

  const date = document.createElement('p');
  date.innerHTML = ' ';
  date.className ='reviewDate';
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  rating.className = 'reviewRating';
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  comments.className = 'reviewComments';
  li.appendChild(comments);

  return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}
//check to see if we are online. if we are not let the user know
//code adapted from https://developer.mozilla.org/en-US/docs/Web/API/NavigatorOnLine/Online_and_offline_events
//listen for when the user is online and close the offline popup and submit reviews from queue to server
window.addEventListener('load', function(){
  window.addEventListener('online', function(event) {
    console.log('you are back online');
    document.getElementById('offlineContainer');
    offlineContainer.classList.add('online-popup');
    //post new review that was submitted into queue
    DBHelper.addReviewFromQueue();

  });
  //listen for when the user if offline and change the popup for offline to warn user
  window.addEventListener('offline', function(event) {
    const offlineWarning = document.getElementById('offlineWarning');
    offlineWarning.innerHTML = 'Warning: Lost Connection';
    const warningMessage = document.getElementById('warningMessage');
    warningMessage.innerHTML = 'It appears you have lost connection to the network. Everything will still be saved.';
    document.getElementById('offlineContainer');
    offlineContainer.classList.add('offline-popup');
    console.log('you appear to be offline');
  });
});
/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

/**
 * Submit the Form to the Database
 */
addReview = () => {
  //if the event is not explicitly handles its default action should not be taken
  event.preventDefault();
  //get values from the Form
  const restaurant_id = parseInt(getParameterByName('id'));
  const name = document.querySelector('input[name="name"]');
  const rating = document.querySelector('input[name="rating"]:checked');
  const review = document.querySelector('textarea[name="review"]');
  //put all values into one complex variable
  const data = {
    restaurant_id: restaurant_id,
    name: name.value,
    createdAt: new Date(),
    updatedAt: new Date(),
    rating: rating.value,
    comments: review.value,
  };
  //reset the form so the user understands they submitted it
  document.getElementById('reviews-form').reset();
  //if the browser goes offline alert the user and put the data into a queue for storage
  if(!navigator.onLine) {
  //alert the user that they are offline and that the form might not save if they close
  const offlineMessage = document.createElement('p');
  offlineMessage.className = 'offline';
  offlineMessage.innerHTML = 'It appears you have lost connection to the network. Your review is pending. Please do not exit.';
  document.getElementById('review-form-container').appendChild(offlineMessage);
  //if offline then submit the form instead to a different addReviewQueue
  DBHelper.addReviewQueue(data, restaurant_id);
  document.getElementById('reviews-list').appendChild(createReviewHTML(data));

} else {
  //if online submit the review to the server
  DBHelper.addReviewServer(data);
  document.getElementById('reviews-list').appendChild(createReviewHTML(data));
}

}
