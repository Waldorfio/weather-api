// apiRouter.js

require('dotenv').config(); // Import and configure dotenv

const express = require('express');
const axios = require('axios'); 
const router = express.Router();

const WEATHER_KEY = process.env.WEATHER_KEY; // Import weather api key from .env file
const GIPHY_KEY = process.env.GIPHY_API_KEY; // Import giphy api key from .env file

async function getLocationKey(city, extended) {
    console.log('flag 1')
    const response = await axios.get(
        `http://dataservice.accuweather.com/locations/v1/cities/search?apikey=${WEATHER_KEY}&q=${encodeURIComponent(city)}`
    );
    const data = response.data;

    if (data && data.length > 0) {
        return data[0].Key;
    } else {
        return null;
    }
}

//! Accuweather API Route
router.post('/weather', async (req, res, next) => {
    console.log('flag 2')
  try {
    const { city, extended } = req.body;
    const locationKey = await getLocationKey(city, extended); // Fetch Location Key, based on input location

    let accuweatherResponse
    if (extended) {
    // Fetch extended forecast
        accuweatherResponse = await axios.get(
            `http://dataservice.accuweather.com/forecasts/v1/${extended}/1day/${locationKey}?apikey=${WEATHER_KEY}`
        );
    } else {
    // Fetch current weather
        accuweatherResponse = await axios.get(
            `http://dataservice.accuweather.com/currentconditions/v1/${locationKey}?apikey=${WEATHER_KEY}`
        );
    }
    const weatherData = accuweatherResponse.data;
    res.json({ weather: weatherData });
  } catch (error) {
    console.error('Error returning weather data')
    res.status(500).send('Error returning weather data', error);
  }
});

//! GIPHY API Route
router.get('/giphy', async (req, res, next) => {
  try {
    // Make request to GIPHY API
    const giphyResponse = await axios.get('YOUR_GIPHY_API_ENDPOINT');
    const giphyData = giphyResponse.data; // Assuming GIPHY response contains necessary GIF data
    res.json({ gif: giphyData });
  } catch (error) {
    console.error('Error returning GIPHY')
    res.status(500).send('Error returning GIPHY', error);
  }
});

module.exports = router;
