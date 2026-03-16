const axios = require('axios');
const FormData = require('form-data');
const { ServiceUnavailableError } = require('../errors');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

async function predictCropDisease(imageBuffer, mimetype) {
  const form = new FormData();
  form.append('file', imageBuffer, { contentType: mimetype, filename: 'image' });

  try {
    const response = await axios.post(`${ML_SERVICE_URL}/predict-disease`, form, {
      headers: form.getHeaders(),
      timeout: 15000,
    });
    return response.data;
  } catch (err) {
    if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND' || !err.response) {
      throw new ServiceUnavailableError('ML service unavailable.');
    }
    throw err;
  }
}

async function predictSoilType(imageBuffer, mimetype, lat, lon) {
  const form = new FormData();
  form.append('file', imageBuffer, { contentType: mimetype, filename: 'image' });

  const params = {};
  if (lat !== undefined && lon !== undefined) {
    params.lat = lat;
    params.lon = lon;
  }

  try {
    const response = await axios.post(`${ML_SERVICE_URL}/predict-soil`, form, {
      headers: form.getHeaders(),
      params,
      timeout: 15000,
    });
    return response.data;
  } catch (err) {
    if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND' || !err.response) {
      throw new ServiceUnavailableError('ML service unavailable.');
    }
    throw err;
  }
}

module.exports = { predictCropDisease, predictSoilType };
