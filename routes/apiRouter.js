// apiRouter.js

require('dotenv').config(); // Import and configure dotenv

const express = require('express');
const axios = require('axios'); 
const router = express.Router();

const WEATHER_KEY = process.env.WEATHER_KEY; // Import weather api key from .env file
const GIPHY_KEY = process.env.GIPHY_API_KEY; // Import giphy api key from .env file

async function getLocationKey(city, extended) {
    const response = await axios.get(
        `http://dataservice.accuweather.com/locations/v1/cities/search?apikey=${WEATHER_KEY}&q=${encodeURIComponent(city)}`
    );
    const data = response.data;

    if (data && data.length > 0) {
        return { key: data[0].Key, cityReturned: data[0].EnglishName, country: data[0].Country.EnglishName };
    } else {
        return null;
    }
}

//! Weather API Route
router.post('/weather', async (req, res, next) => {
  try {
    const { city, extended, celsius } = req.body;
    const { key, cityReturned, country } = await getLocationKey(city, extended); // Fetch Location Key, based on input location
    let accuweatherResponse
    if (extended.length > 0) {
    // Fetch extended forecast
        accuweatherResponse = await axios.get(
            `http://dataservice.accuweather.com/forecasts/v1/${extended}/5day/${key}?apikey=${WEATHER_KEY}&metric=${celsius}&details=true`
        );
    } else {
    // Fetch current weather
        accuweatherResponse = await axios.get(
            `http://dataservice.accuweather.com/currentconditions/v1/${key}?apikey=${WEATHER_KEY}&details=true`
        );
    }
    const weatherData = extended.length > 0 ? accuweatherResponse.data : accuweatherResponse.data[0];
    res.json({ weather: weatherData, city: cityReturned, country: country });
  } catch (error) {
    const errorCode = error?.code || 'UNKNOWN_ERROR';
    const errorMessage = error?.message || 'An unknown error occurred.';
    const status = error?.response ? error?.response?.status : 500;
    const statusText = error?.response ? error?.response?.statusText : 'Internal Server Error';
    res.status(status).send({
        error: {
          code: errorCode,
          message: errorMessage,
          status: status,
          statusText: statusText
        }
    });
  }
});

//! GIPHY API Route
router.post('/giphy', async (req, res, next) => {
  try {
    const { query } = req.body;
    const giphyResponse = await axios.get(
      `http://api.giphy.com/v1/gifs/search?q=${query}&api_key=${GIPHY_KEY}&limit=1`
      );
    const giphyData = giphyResponse.data; // Assuming GIPHY response contains necessary GIF data
    res.json({ gif: giphyData });
  } catch (error) {
    const errorCode = error?.code || 'UNKNOWN_ERROR';
    const errorMessage = error?.message || 'An unknown error occurred.';
    const status = error?.response ? error?.response?.status : 500;
    const statusText = error?.response ? error?.response?.statusText : 'Internal Server Error';
    res.status(status).send({
        error: {
          code: errorCode,
          message: errorMessage,
          status: status,
          statusText: statusText
        }
    });
  }
});

module.exports = router;
