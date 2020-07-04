const express = require("express");
const https = require("https");
const bodyParser = require("body-parser");

const app = express();
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));

app.get("/", function(req, res) {

  res.sendFile(__dirname + "/index.html")

  app.post("/", function(postReq, postRes) {
    console.log("Post request received");

    const location = postReq.body.location;
    const units = "imperial";
    const apiKey = "bd2721ae439b1928361495515847f8ce";
    const apiCall = "https://api.openweathermap.org/data/2.5/weather?q=" + location + "&units=" + units + "&appid=" + apiKey;

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
