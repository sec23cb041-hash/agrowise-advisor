const express = require('express');
const axios = require('axios');
const router = express.Router();

const API_KEY = '579b464db66ec23bdd000001cdd3946e44ce4aad38d07d09a624f9b';
const BASE_URL = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';

const FALLBACK = [
  { commodity: 'Rice',      market: 'Coimbatore Mandi', state: 'Tamil Nadu', modal_price: '2150', min_price: '2050', max_price: '2250', arrival_date: 'Today' },
  { commodity: 'Wheat',     market: 'Chennai Market',   state: 'Tamil Nadu', modal_price: '2350', min_price: '2280', max_price: '2420', arrival_date: 'Today' },
  { commodity: 'Cotton',    market: 'Erode Mandi',      state: 'Tamil Nadu', modal_price: '6200', min_price: '6100', max_price: '6350', arrival_date: 'Today' },
  { commodity: 'Tomato',    market: 'Mettupalayam',     state: 'Tamil Nadu', modal_price: '980',  min_price: '900',  max_price: '1050', arrival_date: 'Today' },
  { commodity: 'Onion',     market: 'Oddanchatram',     state: 'Tamil Nadu', modal_price: '1800', min_price: '1700', max_price: '1900', arrival_date: 'Today' },
  { commodity: 'Sugarcane', market: 'Coimbatore',       state: 'Tamil Nadu', modal_price: '3100', min_price: '3000', max_price: '3200', arrival_date: 'Today' },
];

// GET /market-prices?commodity=Rice
router.get('/', async (req, res) => {
  const commodity = req.query.commodity;
  if (!commodity) {
    return res.status(400).json({ error: 'commodity query param required' });
  }

  try {
    const url = `${BASE_URL}?api-key=${API_KEY}&format=json&limit=5&filters[commodity]=${encodeURIComponent(commodity)}`;
    const { data } = await axios.get(url);
    if (!data.records || data.records.length === 0) throw new Error('No records');
    return res.json({ records: data.records, source: 'live' });
  } catch (err) {
    // Serve fallback so the app never breaks
    const fallback = FALLBACK.filter(
      (r) => r.commodity.toLowerCase() === commodity.toLowerCase()
    );
    return res.json({ records: fallback, source: 'fallback' });
  }
});

module.exports = router;
