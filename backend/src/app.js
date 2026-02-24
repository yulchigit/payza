const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const { ZodError } = require("zod");
const env = require("./config/env");
const healthRoutes = require("./routes/healthRoutes");
const authRoutes = require("./routes/authRoutes");
const walletRoutes = require("./routes/walletRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const paymentMethodRoutes = require("./routes/paymentMethodRoutes");
const recipientRoutes = require("./routes/recipientRoutes");
const errorHandler = require("./middleware/errorHandler");
const { apiLimiter } = require("./middleware/rateLimiters");

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);

// Request ID middleware for request tracing
let requestCounter = 0;
app.use((req, res, next) => {
  req.id = `${Date.now()}-${++requestCounter}`;
  req.startTime = Date.now();
  next();
});

// Request/response logging middleware (structured for production)
app.use((req, res, next) => {
  const originalSend = res.send;
  res.send = function (data) {
    const duration = Date.now() - req.startTime;
    if (res.statusCode >= 400) {
      const logEntry = {
        level: res.statusCode >= 500 ? "error" : "warn",
        timestamp: new Date().toISOString(),
        requestId: req.id,
        method: req.method,
        path: req.path,
        status: res.statusCode,
        duration: `${duration}ms`,
        ip: req.ip
      };
      console.log(JSON.stringify(logEntry));
    }
    return originalSend.call(this, data);
  };
  next();
});

// HTTPS redirect in production
if (env.nodeEnv === "production") {
  app.use((req, res, next) => {
    // Do not redirect preflight requests - allow CORS middleware to handle them
    if (req.method === "OPTIONS") {
      return next();
    }

    if (req.header("x-forwarded-proto") !== "https") {
      return res.redirect(`https://${req.header("host")}${req.url}`);
    }

    return next();
  });
}
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
  })
);
app.use(express.json({ limit: "100kb" }));

// CORS FIRST (before rate limiting)
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      if (env.corsOrigins.includes(origin)) {
        return callback(null, true);
      }

      if (env.nodeEnv !== "production" && env.corsOrigins.length === 0) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Idempotency-Key"],
    credentials: false,
    maxAge: 600
  })
);

// Then rate limiting
app.use(apiLimiter);

app.use("/api", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/payment-methods", paymentMethodRoutes);
app.use("/api/recipients", recipientRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found"
  });
});

app.use((err, req, res, next) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: err.issues?.[0]?.message || "Invalid request payload"
    });
  }

  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({
      success: false,
      error: "Origin is not allowed"
    });
  }

  return errorHandler(err, req, res, next);
});

module.exports = app;
