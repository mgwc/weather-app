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
// const { Client, Status } = require("@googlemaps/google-maps-services-js");
const app = express();
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");

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

// Post request made when user selects location for which to get weather data
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

    // Handle successful API call
    if (status == 200) {
      response.on("data", function (data) {
        const weatherData = JSON.parse(data);
        const temp = weatherData.main.temp;
        const weatherDescription = weatherData.weather[0].description;
        console.log(temp);
        console.log(weatherDescription);

        // TODO: Update response to send user to new page or update page content
        // postRes.write(
        //   "<html><body><h1>The temperature in " +
        //     location +
        //     " is " +
        //     temp +
        //     " degrees Fahrenheit.</h1>"
        // );
        // postRes.write(
        //   "<p>Right now, the weather is " + weatherDescription + ".</p>"
        // );
        // postRes.write(
        //   '<p><img src="http://openweathermap.org/img/wn/' +
        //     weatherData.weather[0].icon +
        //     '@2x.png"</p></body></html>'
        // );
        //
        // postRes.send();
      });
    } else {  // Handle unsuccessful API call
        // Add error text to page
        $('.error-text').text("Place not found; please enter location as a zip code or city in \"City, State\" format");
    }
  });
});


app.listen(3000, function () {
  console.log("Server is running on port 3000.");
});
