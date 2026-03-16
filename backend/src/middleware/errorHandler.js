const multer = require('multer');
const { ValidationError, NotFoundError, ServiceUnavailableError } = require('../errors');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof ValidationError) {
    return res.status(400).json({ error: err.message });
  }

  if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'File too large. Maximum size is 10MB.' });
  }

  if (err instanceof NotFoundError) {
    return res.status(404).json({ error: err.message });
  }

  if (err instanceof ServiceUnavailableError) {
    return res.status(503).json({ error: err.message });
  }

  return res.status(500).json({ error: err.message || 'Internal server error' });
}

module.exports = errorHandler;
