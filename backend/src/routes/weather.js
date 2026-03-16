const express = require('express');
const weatherService = require('../services/weatherService');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const { city, lat, lon } = req.query;
    const result = lat && lon
      ? await weatherService.getWeatherByCoords(parseFloat(lat), parseFloat(lon))
      : await weatherService.getWeather(city);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
