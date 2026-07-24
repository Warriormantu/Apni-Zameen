const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Server error';
  console.error(err);
  res.status(statusCode).json({
    success: false,
    error: message,
    details: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
};

export default errorHandler;
