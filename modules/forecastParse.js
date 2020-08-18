exports.getForecastData = function(weatherData) {

  // Get current weather data
  let currTemp = Math.round(weatherData.current.temp);
  let currDesc = weatherData.current.weather[0].main;
  let currIconLink = "http://openweathermap.org/img/w/" +
    weatherData.current.weather[0].icon + ".png";

  // Determine next two time intervals for weather data and get their data
  const currTime = weatherData.current.dt;
  const utc_offset = weatherData.timezone_offset;
  const currTimeInLocation = currTime + utc_offset;
  const dateObj = new Date(currTimeInLocation * 1000);

  let nextTime = "";
  let nextTemp = 0;
  let nextDesc = "";
  let nextIconLink = "";
  let followingTime = "";
  let followingTemp = 0;
  let followingDesc = "";
  let followingIconLink = "";

  const hour = dateObj.getUTCHours();
  switch(dateObj.getUTCDay()) {
    case 0:
      day = "Sunday";
      break;
    case 1:
      day = "Monday";
      break;
    case 2:
      day = "Tuesday";
      break;
    case 3:
      day = "Wednesday";
      break;
    case 4:
      day = "Thursday";
      break;
    case 5:
      day = "Friday";
      break;
    case 6:
      day = "Saturday";
  };

  if (hour <= 12) {            // show forecast for today and tomorrow
    nextTime = "Today";
    followingTime = "Tomorrow";
    nextTemp = Math.round(weatherData.daily[0].temp.day);
    nextDesc = weatherData.daily[0].weather[0].main;
    nextIconLink = "http://openweathermap.org/img/w/" +
      weatherData.daily[0].weather[0].icon + ".png";
    followingTemp = Math.round(weatherData.daily[1].temp.day);
    followingDesc = weatherData.daily[1].weather[0].main;
    followingIconLink = "http://openweathermap.org/img/w/" +
      weatherData.daily[1].weather[0].icon + ".png";
  } else {                  // show forecast for tomorrow and the next day
    nextTime = "Tomorrow";
    followingTime = day;
    nextTemp = Math.round(weatherData.daily[1].temp.day);
    nextDesc = weatherData.daily[1].weather[0].main;
    nextIconLink = "http://openweathermap.org/img/w/" +
      weatherData.daily[1].weather[0].icon + ".png";
    followingTemp = Math.round(weatherData.daily[2].temp.day);
    followingDesc = weatherData.daily[2].weather[0].main;
    followingIconLink = "http://openweathermap.org/img/w/" +
      weatherData.daily[2].weather[0].icon + ".png";
  }

  const forecast = [currTemp, currDesc, currIconLink, nextTime, nextTemp,
    nextDesc, nextIconLink, followingTime, followingTemp, followingDesc,
    followingIconLink];

  return forecast;
}
