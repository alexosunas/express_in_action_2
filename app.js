var path = require("path");
var express = require("express");
var zipdb = require("zippity-do-dah");
var ForecastIo = require("forecastio");
var config = require('./config/config.js');

var app = express();

console.log('config.darksky.secretKey :', config.darksky.secretKey);
var weather = new ForecastIo(config.darksky.secretKey);

app.use(express.static(path.resolve(__dirname, "public")));

app.set("views", path.resolve(__dirname, "views"));
app.set("view engine", "ejs");

app.get("/", function(req, res) {
  res.render("index");
});

app.get(/^\/(\d{5})$/, function(req, res, next) {
  var zipcode = req.params[0];

  console.log('zipcode :', zipcode);

  var location = zipdb.zipcode(zipcode);

  console.log('location :', location);

  if (!location.zipcode) {
    next();
    return;
  }

  var latitude = location.latitude;
  var longitude = location.longitude;

  console.log('weather :', weather);
  weather.forecast(latitude, longitude)
  .then(function(err, data) {

    console.log('err :', err);
    console.log('data :', data);
    if (err) {
      next();
      return;
    }
    res.json({
      zipcode: zipcode,
      temperature: data.currently.temperature
    });
  });

});

app.use(function(req, res) {
  res.status(404).render("404");
});

app.listen(3030);