module.exports = function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = err.publicMessage || "Internal server error";

  if (process.env.NODE_ENV !== "production") {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    error: message
  });
};
