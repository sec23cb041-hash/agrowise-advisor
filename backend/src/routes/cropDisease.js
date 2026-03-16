const express = require('express');
const { imageUpload } = require('../middleware/upload');
const mlService = require('../services/mlService');

const router = express.Router();

router.post('/', imageUpload, async (req, res, next) => {
  try {
    const result = await mlService.predictCropDisease(req.file.buffer, req.file.mimetype);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
