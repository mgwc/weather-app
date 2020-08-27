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

  if (hour <= 12) {            // show forecast for today and tomorrow
    nextTime = "Today";
    nextTemp = Math.round(weatherData.daily[0].temp.max);
    nextDesc = weatherData.daily[0].weather[0].main;
    nextIconLink = "http://openweathermap.org/img/w/" +
      weatherData.daily[0].weather[0].icon + ".png";
    followingTime = "Tomorrow";
    followingTemp = Math.round(weatherData.daily[1].temp.max);
    followingDesc = weatherData.daily[1].weather[0].main;
    followingIconLink = "http://openweathermap.org/img/w/" +
      weatherData.daily[1].weather[0].icon + ".png";
  } else {                  // show forecast for tomorrow and the next day
    nextTime = "Tomorrow";
    nextTemp = Math.round(weatherData.daily[1].temp.max);
    nextDesc = weatherData.daily[1].weather[0].main;
    nextIconLink = "http://openweathermap.org/img/w/" +
      weatherData.daily[1].weather[0].icon + ".png";

    // Add number of seconds in 48 hours to currTime to get dayAfterTomorrowTime
    const dayAfterTomorrowTime = currTimeInLocation + utc_offset + 172800;
    const dayAfterTomorrowObj = new Date(dayAfterTomorrowTime * 1000);
    followingTime = day(dayAfterTomorrowObj.getUTCDay());
    followingTemp = Math.round(weatherData.daily[2].temp.max);
    followingDesc = weatherData.daily[2].weather[0].main;
    followingIconLink = "http://openweathermap.org/img/w/" +
      weatherData.daily[2].weather[0].icon + ".png";
  }

  const forecast = [currTemp, currDesc, currIconLink, nextTime, nextTemp,
    nextDesc, nextIconLink, followingTime, followingTemp, followingDesc,
    followingIconLink];

  return forecast;
}


function day(time) {
  let day = "";

  switch(time) {
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

    return day;
};
