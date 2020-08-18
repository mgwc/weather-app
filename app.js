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
const forecastParse = require(__dirname + "/modules/forecastParse.js");
const app = express();
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set("view engine", "ejs");

// Initialize Google Places Node.js Library Client
const client = new Client({});

app.get("/", function (req, res) {
  res.render("main");
});

// Handle POST request for location selected by user
app.post("/", function (postReq, postRes) {
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
      console.log("r.data.predictions: " + prediction.description +
        ", r.data.place_id:" + prediction.place_id);
      predictionsArr.push({location:"" + prediction.description,
        placeId:prediction.place_id});
    })
    console.log("Predictions array:");
    predictionsArr.forEach(function(prediction) {
      console.log("Next prediction = " + prediction.location);
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

app.post("/selected", function(postReq, postRes) {
  console.log(postReq.body);
  const placeId = postReq.body.placeId;

    client.placeDetails({
      params: {
        key: GOOGLE_PLACES_API_KEY,
        place_id: placeId,
        fields: ["geometry/location", "utc_offset", "name"]
      },
      timeout: 1000,
    })
    .then((r) => {
      console.log(r.data);
      console.log(r.data.result);
      console.log(r.data.result.geometry);
      console.log(r.data.result.utc_offset);
      const lat = r.data.result.geometry.location.lat;
      const lon = r.data.result.geometry.location.lng;
      const locationName = r.data.result.name;
      console.log(r.data.result.geometry.location.lat);
      console.log(r.data.result.geometry.location.lng);

      // Make API call to OpenWeatherMap One-Call API
      const units = "imperial";
      const apiCall =
        "https://api.openweathermap.org/data/2.5/onecall?" +
        "lat=" + lat +
        "&lon=" + lon +
        "&units=" +
        units +
        "&exclude=minutely,hourly" +
        "&appid=" +
        OPENWEATHERMAP_API_KEY;
      console.log(apiCall);

      https.get(apiCall, function (response) {
        let status = response.statusCode;
        console.log("Response code = " + status);
        console.log("headers: ", response.headers);

      // Handle successful API call
        response.on("data", (d) => {
            process.stdout.write(d);
            const dataStr = "" + d;
            const dataObj = JSON.parse(dataStr);

            const forecastData = forecastParse.getForecastData(dataObj);
            console.log(forecastData);
            console.log(locationName);

            postRes.render("results", {locationName: locationName,
              currIconLink: forecastData[2], currTemp: forecastData[0],
              currWeatherType: forecastData[1], nextTime: forecastData[3],
              nextIconLink: forecastData[6], nextWeatherType: forecastData[5],
              nextTemp: forecastData[4], followingTime: forecastData[7],
              followingIconLink: forecastData[10],
              followingWeatherType: forecastData[9],
              followingTemp: forecastData[8]});
        });
      }).on('error', (e) => {
        console.error(e);
      });
    })
    .catch((e) => {
      console.log(e.response.data.error_message);
    });

});


app.listen(3000, function () {
  console.log("Server is running on port 3000.");
});
