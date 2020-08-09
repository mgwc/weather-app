require("dotenv").config();

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const OPENWEATHERMAP_API_KEY = process.env.OPENWEATHERMAP_API_KEY;

if (!GOOGLE_PLACES_API_KEY || !OPENWEATHERMAP_API_KEY) {
  console.error(
    "ERROR! \nThe api keys are missing from the environment." +
      "Please ensure presence of the GOOGLE_PLACES_API_KEY and" +
      " OPENWEATHERMAP_API_KEY variables in your environment."
  );
  process.exit(1);
}

const express = require("express");
const https = require("https");
const bodyParser = require("body-parser");
const { Client, Status } = require("@googlemaps/google-maps-services-js");
const path = require("path");
const app = express();
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set("view engine", "ejs");

app.get("/", function (req, res) {
  res.render("main");

  // On text entry in HTML input, query Google Places Autocomplete API
  // let location;
  // // TODO: Get location from HTML input element as it is typed
  // const client = new Client({});
  // client
  //   .placeAutocomplete({
  //     // See https://googlemaps.github.io/google-maps-services-js/globals.html
  //     params: {
  //       input: location,
  //       key: GOOGLE_PLACES_API_KEY,
  //       types: ["(cities)"],
  //     },
  //     timeout: 1000, // milliseconds
  //   })
  //   .then((r) => {
  //     console.log(r.predictions[0].location);
  //   })
  //   .catch((e) => {
  //     console.log(e.response.data.error_message);
  //   });
});
  // TODO: Get location once user selects an autocomplete option

// Handle POST request for location selected by user
app.post("/", function (postReq, postRes) {
  console.log("Post request received");

  const location = postReq.body.location;
  console.log(location);

  // Distinguish between ZIP code entry and city entry
  let type = "zip";
  let i;
  for (i = 0; i < 5; i++) {
    if (location.charAt(i) > '9') {
      type = "city";
    }
  }

  let typeParam = "";
  if (type == "zip") {
    typeParam = "zip="
  } else {
    typeParam = "q="
  }

  /* TODO: Consider formatting location string further; this will depend on
  implementation of autocomplete feature */

  const units = "imperial";
  const apiCall =
    "https://api.openweathermap.org/data/2.5/weather?" +
    typeParam +
    location +
    "&units=" +
    units +
    "&appid=" +
    OPENWEATHERMAP_API_KEY;
  console.log(apiCall);

  https.get(apiCall, function (response) {
    let status = response.statusCode;
    console.log("Response code = " + status);

    const options = {
      root: path.join(__dirname, 'public'),
    }

    // Handle successful API call
    if (status == 200) {
      response.on("data", function (data) {
        const weatherData = JSON.parse(data);
        const temp = Math.round(weatherData.main.temp);
        const weatherDescription = weatherData.weather[0].description;
        const iconLink = "http://openweathermap.org/img/wn/" + weatherData.weather[0].icon + "@2x.png";
        console.log(temp);
        console.log(weatherDescription);

        postRes.render("results", {locationName: location,
          weatherType: weatherDescription, currentTemp: temp,
          weatherIconLink: iconLink});
      });
    } else {  // Handle unsuccessful API call
        postRes.render("error");
    }
  });
});

// Handle POST requests for autosuggestion results
app.post("/query/*", function(postReq, postRes) {
  console.log("Received POST request for an autosuggest query:");
  const userQuery = postReq.body.userTyped;
  console.log(userQuery);

  // const apiCall =
  //   "https://maps.googleapis.com/maps/api/place/autocomplete/json?" +
  //   "key=" + GOOGLE_PLACES_API_KEY +
  //   "input=" + userQuery +
  //   "types=(cities)" +
  //   "location=40.5672531,-112.6428853" +
  //   "radius=2500000"

  const client = new Client({});
  client.placeAutocomplete({
    params: {
      key: GOOGLE_PLACES_API_KEY,
      input: userQuery,
      types: "(cities)",
      location: "40.5672531,-112.6428853",
      radius: 2500000
    },
    timeout: 1000,
  })
  .then((r) => {
    // TODO: Check response status and handle errors?
    const predictionsArr = [];
    console.log(r.data.status);
    r.data.predictions.forEach(function(prediction) {
      console.log("r.data.predictions: " + prediction.description);
      predictionsArr.push("" + prediction.description);
    })
    console.log("Predictions array:");
    predictionsArr.forEach(function(prediction) {
      console.log("Next prediction = " + prediction);
    });

    // Send predictions in EJS template
    // postRes.render("suggestions", {predictionsArr: predictionsArr});

    // Send predictions back as JSON
    postRes.status(200).send({predictions: predictionsArr});
  })
  .catch((e) => {
    console.log(e.response.data.error_message);
  });
});


app.listen(3000, function () {
  console.log("Server is running on port 3000.");
});
