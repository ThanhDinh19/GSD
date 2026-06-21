function notFoundHandler(req, res, next) {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(404).json({
      error: `API not found: ${req.originalUrl}`
    });
  }

  return next();
}

function errorHandler(err, req, res, next) {
  console.error(err);

  return res.status(err.statusCode || 500).json({
    error: err.message || 'Internal Server Error'
  });
}

module.exports = {
  notFoundHandler,
  errorHandler
};