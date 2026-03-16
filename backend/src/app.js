require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cropDiseaseRouter = require('./routes/cropDisease');
const soilTypeRouter = require('./routes/soilType');
const weatherRouter = require('./routes/weather');
const cropRecommendRouter = require('./routes/cropRecommend');
const marketAlertsRouter = require('./routes/marketAlerts');
const voiceAdvisoryRouter = require('./routes/voiceAdvisory');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/predict-crop-disease', cropDiseaseRouter);
app.use('/predict-soil-type', soilTypeRouter);
app.use('/weather', weatherRouter);
app.use('/recommend-crop', cropRecommendRouter);
app.use('/market-alerts', marketAlertsRouter);
app.use('/voice-advisory', voiceAdvisoryRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use(errorHandler);

module.exports = app;
