require('dotenv').config();
const express = require("express");
const https = require("https");
const bodyParser = require("body-parser");
const {Client, Status} = require("@googlemaps/google-maps-services-js");
const app = express();
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));

app.get("/", function(req, res) {

  res.sendFile(__dirname + "/index.html")

  var autocomplete;
  function initAutocomplete() {
    autocomplete = new google.maps.places.Autocomplete(
      $('#autocomplete'),
      {
        types: ['(cities)'],
        // fields:
      });

      autocomplete.addListener('')
  }

  // Post request made when user selects location for which to get weather data
  app.post("/", function(postReq, postRes) {
    console.log("Post request received");

    const location = postReq.body.location;
    const units = "imperial";
    const apiCall = "https://api.openweathermap.org/data/2.5/weather?q=" +
      location + "&units=" + units + "&appid=" +
      process.env.OPENWEATHERMAP_API_KEY;

    https.get(apiCall, function(response) {
      console.log(response.statusCode);
      response.on("data", function(data) {
        const weatherData = JSON.parse(data)
        const temp = weatherData.main.temp;
        const weatherDescription = weatherData.weather[0].description;
        console.log(temp);
        console.log(weatherDescription);
        postRes.write("<html><body><h1>The temperature in " + location + " is " + temp +
          " degrees Fahrenheit.</h1>");
        postRes.write("<p>Right now, the weather is " + weatherDescription + ".</p>");
        postRes.write("<p><img src=\"http://openweathermap.org/img/wn/" +
          weatherData.weather[0].icon + "@2x.png\"</p></body></html>");
        postRes.send();
      })
    })
  })
})



app.listen(3000, function() {
  console.log("Server is running on port 3000.");
})
