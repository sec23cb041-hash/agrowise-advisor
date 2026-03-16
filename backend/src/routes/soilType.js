const express = require('express');
const { imageUpload } = require('../middleware/upload');
const mlService = require('../services/mlService');

const router = express.Router();

router.post('/', imageUpload, async (req, res, next) => {
  try {
    const lat = req.query.lat ? parseFloat(req.query.lat) : undefined;
    const lon = req.query.lon ? parseFloat(req.query.lon) : undefined;
    const result = await mlService.predictSoilType(req.file.buffer, req.file.mimetype, lat, lon);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
