require("dotenv").config();

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const OPENWEATHERMAP_API_KEY = process.env.OPENWEATHERMAP_API_KEY;
const PORT = process.env.PORT || 3000;

if (!GOOGLE_PLACES_API_KEY || !OPENWEATHERMAP_API_KEY) {
  console.error(
    "ERROR! \nThe api keys are missing from the environment." +
      "Please ensure presence of the GOOGLE_PLACES_API_KEY and" +
      " OPENWEATHERMAP_API_KEY variables in your environment."
  );
  process.exit(1);
}

const express = require("express");
const app = express();

const https = require("https");
const bodyParser = require("body-parser");
const { Client, Status } = require("@googlemaps/google-maps-services-js");
const path = require("path");
const forecastParse = require(__dirname + "/modules/forecastParse.js");
const cors = require("cors");
// Uncomment if separating routes into their own folder and files
// const home = require("./routes/home");
// const results = require("./routes/results");

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors({origin:"https://autosuggest-weather.herokuapp.com"}));
app.set("view engine", "ejs");

// Set up routing modules
// app.use('/', home);
// app.use('/query/*', query);

// Initialize Google Places Node.js Library Client
const client = new Client({});

app.get("/", function (req, res) {
  res.render("main");
});

// Handle POST request for location selected by user
app.post("/", function (postReq, postRes) {
  console.log("Received post request to '/'");
  console.log(postReq);
  const placeId = postReq.body.locationBtn;

    client.placeDetails({
      params: {
        key: GOOGLE_PLACES_API_KEY,
        place_id: placeId,
        fields: ["geometry/location", "utc_offset", "name"]
      },
      timeout: 1000,
    })
    .then((r) => {
      console.log(r.data.result);
      const lat = r.data.result.geometry.location.lat;
      const lon = r.data.result.geometry.location.lng;
      const locationName = r.data.result.name;

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

// Handle POST requests for autosuggestion results
app.post("/query/*", function(postReq, postRes) {
  console.log("Received POST request for an autosuggest query:");
  const userQuery = postReq.body.userTyped;
  console.log(userQuery);

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
      predictionsArr.push({location:"" + prediction.description,
        placeId:prediction.place_id});
    })

    predictionsArr.forEach(function(prediction) {
      console.log("Next prediction = " + prediction.location);
    });

    // Send predictions back as JSON
    postRes.status(200).send({predictions: predictionsArr});
  })
  .catch((e) => {
    console.log(e.response.data.error_message);
  });
});

app.get("/about", function(req, res) {
  res.render("about");
})

app.listen(PORT, function () {
  console.log("Server is running on port " + PORT + ".");
});
