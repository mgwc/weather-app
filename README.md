# weather-app

Basic weather app built for practice using Node + Express and querying APIs.

Uses Google Places Autocomplete API to get standardized location inputs
from the user. Queries OpenWeather API for weather forecast data.

## setup

After cloning the repository, create a .env file with your Google Places API key
and OpenWeatherMap API key, and update the client.js file to fetch from
the localhost (see comments in client.js). Run `npm install` and `npm start`
to start the server. The app will start on `localhost:3000`, and
you'll be able to use it via your browser.
