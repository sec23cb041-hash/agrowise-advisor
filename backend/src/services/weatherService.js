const axios = require('axios');
const { ValidationError, NotFoundError, ServiceUnavailableError } = require('../errors');

// Support two API keys with automatic fallback
const API_KEYS = [
  process.env.OPENWEATHER_API_KEY,
  process.env.OPENWEATHER_API_KEY_1,
  process.env.OPENWEATHER_API_KEY_2,
].filter(Boolean);

function getWeatherAdvice(temperature, humidity, description, windSpeed) {
  const advice = [];
  const desc = (description || '').toLowerCase();

  if (humidity > 80) {
    advice.push('High humidity increases risk of fungal diseases — consider preventive fungicide spray.');
  } else if (humidity < 40) {
    advice.push('Low humidity — monitor crops for drought stress and increase irrigation frequency.');
  }

  if (temperature > 35) {
    advice.push('Extreme heat — irrigate early morning or evening to reduce evaporation and heat stress.');
  } else if (temperature < 15) {
    advice.push('Cool temperatures may slow crop growth — protect sensitive crops from cold stress.');
  } else if (temperature >= 25 && temperature <= 32) {
    advice.push('Optimal temperature range for most field crops.');
  }

  if (desc.includes('rain') || desc.includes('drizzle')) {
    advice.push('Rain expected — delay pesticide application to avoid washoff.');
    advice.push('Ensure field drainage is clear to prevent waterlogging.');
  } else if (desc.includes('clear') || desc.includes('sunny')) {
    advice.push('Clear conditions — good day for pesticide or fertilizer application.');
  }

  if (windSpeed > 20) {
    advice.push('High winds — avoid spraying pesticides to prevent drift.');
  } else if (windSpeed < 5) {
    advice.push('Low wind speed — ideal conditions for foliar spray application.');
  }

  if (advice.length === 0) {
    advice.push('Weather conditions are moderate — continue normal farming activities.');
  }

  return advice;
}

async function getWeather(city) {
  if (!city || city.trim() === '') {
    throw new ValidationError('City parameter is required.');
  }

  let lastError = null;

  for (const apiKey of API_KEYS) {
    try {
      const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
        params: { q: city.trim(), units: 'metric', appid: apiKey },
        timeout: 8000,
      });

      const data = response.data;
      const temperature = data.main.temp;
      const humidity = data.main.humidity;
      const description = data.weather[0].description;
      const windSpeed = data.wind?.speed ?? 0;
      const rainfall = data.rain?.['1h'] ?? 0;

      return {
        city: data.name,
        temperature,
        humidity,
        description,
        wind_speed: windSpeed,
        rainfall,
        advice: getWeatherAdvice(temperature, humidity, description, windSpeed),
      };
    } catch (err) {
      if (err.response?.status === 404) {
        throw new NotFoundError('City not found.');
      }
      if (err.response?.status === 401) {
        lastError = new ServiceUnavailableError('Weather service unavailable.');
        continue; // try next key
      }
      lastError = err;
    }
  }

  throw lastError instanceof ServiceUnavailableError
    ? lastError
    : new ServiceUnavailableError('Weather service unavailable.');
}

async function getWeatherByCoords(lat, lon) {
  if (lat === undefined || lat === null || lon === undefined || lon === null) {
    throw new ValidationError('lat and lon parameters are required.');
  }

  let lastError = null;
  for (const apiKey of API_KEYS) {
    try {
      const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
        params: { lat, lon, units: 'metric', appid: apiKey },
        timeout: 8000,
      });
      const data = response.data;
      const temperature = data.main.temp;
      const humidity = data.main.humidity;
      const description = data.weather[0].description;
      const windSpeed = data.wind?.speed ?? 0;
      const rainfall = data.rain?.['1h'] ?? 0;
      return {
        city: data.name,
        temperature,
        humidity,
        description,
        wind_speed: windSpeed,
        rainfall,
        advice: getWeatherAdvice(temperature, humidity, description, windSpeed),
      };
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 400) {
        lastError = new ServiceUnavailableError('Weather service unavailable.');
        continue;
      }
      lastError = err;
    }
  }
  throw lastError instanceof ServiceUnavailableError ? lastError : new ServiceUnavailableError('Weather service unavailable.');
}

module.exports = { getWeather, getWeatherByCoords };
