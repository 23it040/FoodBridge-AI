const ApiError = require('../utils/ApiError');

module.exports = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const response = {
    success: false,
    message: err.message || 'Internal Server Error',
  };

  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  if (!(err instanceof ApiError) && err.name === 'ValidationError') {
    response.message = Object.values(err.errors).map((item) => item.message).join(', ');
  }

  res.status(statusCode).json(response);
};
