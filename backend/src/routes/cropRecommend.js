const express = require('express');
const axios = require('axios');
const { ServiceUnavailableError, ValidationError } = require('../errors');

const router = express.Router();
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

router.get('/dataset-stats', async (req, res, next) => {
  try {
    const response = await axios.get(`${ML_SERVICE_URL}/dataset-stats`);
    res.status(200).json(response.data);
  } catch (err) {
    if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND' || !err.response) {
      return next(new ServiceUnavailableError('ML service unavailable.'));
    }
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { nitrogen, phosphorus, potassium, ph, moisture, temperature, rainfall, humidity, last_crop } = req.body;

    const required = { nitrogen, phosphorus, potassium, ph, moisture, temperature, rainfall };
    for (const [key, val] of Object.entries(required)) {
      if (val === undefined || val === null || val === '') {
        return next(new ValidationError(`Missing required field: ${key}`));
      }
    }

    const response = await axios.post(`${ML_SERVICE_URL}/recommend-crop`, {
      nitrogen: Number(nitrogen),
      phosphorus: Number(phosphorus),
      potassium: Number(potassium),
      ph: Number(ph),
      moisture: Number(moisture),
      temperature: Number(temperature),
      rainfall: Number(rainfall),
      humidity: humidity !== undefined ? Number(humidity) : 50,
      last_crop: last_crop || '',
    });

    res.status(200).json(response.data);
  } catch (err) {
    if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND' || !err.response) {
      return next(new ServiceUnavailableError('ML service unavailable.'));
    }
    next(err);
  }
});

module.exports = router;
