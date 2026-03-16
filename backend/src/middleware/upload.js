const multer = require('multer');
const { ValidationError, NotFoundError, ServiceUnavailableError } = require('../errors');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(new ValidationError('Invalid file type. Only JPEG and PNG are accepted.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

const imageUpload = upload.single('image');

module.exports = { imageUpload, ValidationError, NotFoundError, ServiceUnavailableError };
