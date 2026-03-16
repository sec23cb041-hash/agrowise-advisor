class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
  }
}

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404;
  }
}

class ServiceUnavailableError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ServiceUnavailableError';
    this.statusCode = 503;
  }
}

module.exports = { ValidationError, NotFoundError, ServiceUnavailableError };
