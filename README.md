# Mobile Web Specialist Certification Course

---
## Restaurant Stage 3
*My Project Thus Far*
I expanded the app even further than in stage 2 which can be found [here](https://github.com/Sommerariel/MWSStage2). At this stage a new server for the data was introduced using Sails. The information on how to install and further resources for the server can be found below. Following that the data is still put into a database using the indexDB Promise Library from Jake Archibald which can be found [here](https://github.com/jakearchibald/idb).
I have added a form for users to submit their own reviews to each restaurant. The data is submitted straight to the database and server and displayed on the UI. The form updates to a queue even if the user is offline so that there is a seamless offline experience. The app does alert the user that they have lost connection so that they know not to fully exit the application, but that their data will be saved. Once reconnected the data submitted offline is submitted back to the server.
In addition I have added the ability fo the user to favorite a restaurant on the main page and they can toggle each individual restaurant.
If the app is offline, all content that was visited while online is cached and accessible. All content is still responsive with some added improvements on accessibility including to the form.
The following are my lighthouse scores that I get running my project locally with Simulated Fast 3G, 4x CPU Slowdown on Mobile and Clearing Storage.
For the Main page:
(/lighthouse-1.png)
For the Restaurants Page:
(/lighthouse-1.png)

---
#### _Three Stage Course Material Project - Restaurant Reviews_

## Project Overview: Stage 3
In order to get started you need to go here and fork the [server repository](https://github.com/udacity/mws-restaurant-stage-3) and then place both this and the server repository in one master folder side by side. Follow the code for the set up of the server within the README.md file within the repository. All credit goes to the creators of the repository and contributors and I in no way take credit.


### Note about ES6

Most of the code in this project has been written to the ES6 JavaScript specification for compatibility with modern web browsers and future proofing JavaScript code. As much as possible, try to maintain use of ES6 in any additional JavaScript you write.
## Project ADDENDUM:
 This repository is using [leafletjs](https://leafletjs.com/) with [Mapbox](https://www.mapbox.com/) jpg tiles optimized with quality:70.
You need to replace <your MAPBOX API KEY HERE> with token from [Mapbox](https://www.mapbox.com/), and you can check the [pricing](https://www.mapbox.com/pricing/): free and no credit card required.
all leaflet mapbox code was written by https://github.com/Focus3D
