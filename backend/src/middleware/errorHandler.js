module.exports = function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = err.publicMessage || "Internal server error";
  const timestamp = new Date().toISOString();
  const requestId = req.id || "no-id";

  // Structured logging for monitoring
  const logEntry = {
    level: statusCode >= 500 ? "error" : "warn",
    timestamp,
    requestId,
    method: req.method,
    url: req.originalUrl,
    statusCode,
    error: {
      message: err.message,
      name: err.name,
      stack: process.env.NODE_ENV === "production" ? undefined : err.stack
    },
    userAgent: req.get("user-agent"),
    ip: req.ip || req.connection?.remoteAddress
  };

  console.error(JSON.stringify(logEntry));

  res.status(statusCode).json({
    success: false,
    error: message,
    requestId,
    timestamp
  });
};
