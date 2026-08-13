import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";
import hpp from "hpp";
import compression from "compression";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { createServer } from "http";
 

// ─── Route Imports ────────────────────────────────────────────────────────────
import authRoutes       from "./routes/auth.routes.js";
import menuCategoryRoutes from "./routes/menuCategory.routes.js";
import menuItemRoutes   from "./routes/menuItem.routes.js";
import tableRoutes      from "./routes/table.routes.js";
import userRouter        from "./routes/user.routes.js";
import deleveryBoyRouter from "./routes/deliveryboy.routes.js";
import inventoryRoutes from "./routes/inventory.routes.js";
import invoiceRoutes from "./routes/invoice.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
 

// ─── Utility Imports ──────────────────────────────────────────────────────────
import connectDB from "./db/index.js";
import { ApiError }       from "./utils/ApiError.js";
import { ApiResponse }    from "./utils/ApiResponse.js";
import { logger }         from "./utils/logger.js";
import orderRoutes       from "./routes/order.routes.js";


// ─── App Initialization ───────────────────────────────────────────────────────
const app    = express();
const server = createServer(app);
const PORT   = process.env.PORT || 8000;
const API_V1 = "/api/v1";

// ─── Trust Proxy (for Nginx / Load Balancer) ──────────────────────────────────
app.set("trust proxy", 1);

// ═════════════════════════════════════════════════════════════════════════════
//  SECURITY MIDDLEWARES
// ═════════════════════════════════════════════════════════════════════════════

// 1. HTTP Security Headers (XSS, Clickjacking, MIME-sniffing, etc.)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc:  ["'self'"],
        styleSrc:   ["'self'", "'unsafe-inline'"],
        imgSrc:     ["'self'", "data:", "https:"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// 2. CORS — whitelist only allowed origins
const ALLOWED_ORIGINS = (process.env.CORS_ORIGIN ?? "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, cb) {
      // Allow server-to-server / Postman in development
      if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
      cb(new ApiError(403, `CORS policy: origin '${origin}' not allowed`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    exposedHeaders: ["X-Total-Count"],
    maxAge: 600,  
  })
);

// 3. Global Rate Limiter — brute-force & DDoS protection
const globalLimiter = rateLimit({
  windowMs:         15 * 60 * 1000, // 15 minutes
  max:              200,
  standardHeaders:  true,
  legacyHeaders:    false,
  message: { success: false, message: "Too many requests. Please try again later." },
  skip: (req) => process.env.NODE_ENV === "development",
});

// 4. Strict Rate Limiter — auth endpoints
const authLimiter = rateLimit({
  windowMs:  15 * 60 * 1000,
  max:       20,
  message: { success: false, message: "Too many auth attempts. Please try again in 15 minutes." },
});

app.use(globalLimiter);

// 5. NoSQL Injection Prevention (disabled due to Express 5 compatibility issue with mongoSanitize 2.2.0)
// app.use(mongoSanitize({ allowDots: true, replaceWith: "_" }));

// 6. XSS Sanitization (disabled due to Express 5 compatibility issue with xss-clean)
// app.use(xss());

// 7. HTTP Parameter Pollution Prevention
app.use(hpp());

// ═════════════════════════════════════════════════════════════════════════════
//  STANDARD MIDDLEWARES
// ═════════════════════════════════════════════════════════════════════════════

app.use(express.json({ limit: "10kb" }));             
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());
app.use(compression());                              

// HTTP Request Logging
if (process.env.NODE_ENV !== "test") {
  app.use(
    morgan(process.env.NODE_ENV === "production" ? "combined" : "dev", {
      stream: { write: (msg) => logger.http(msg.trim()) },
    })
  );
}

// ═════════════════════════════════════════════════════════════════════════════
//  HEALTH CHECK
// ═════════════════════════════════════════════════════════════════════════════

app.get("/health", (_req, res) => {
  res.status(200).json(
    new ApiResponse(200, {
      status:    "healthy",
      uptime:    process.uptime(),
      timestamp: new Date().toISOString(),
      env:       process.env.NODE_ENV,
    }, "Server is up and running")
  );
});

// ═════════════════════════════════════════════════════════════════════════════
//  API ROUTES  (v1)
// ═════════════════════════════════════════════════════════════════════════════

app.use(`${API_V1}/auth`,           authLimiter, authRoutes);
app.use(`${API_V1}/menu-categories`, menuCategoryRoutes);
app.use(`${API_V1}/menu-items`,      menuItemRoutes);
app.use(`${API_V1}/table`,          tableRoutes);
app.use(`${API_V1}/user`,           userRouter);
app.use(`${API_V1}/orders`,          orderRoutes);
app.use(`${API_V1}/inventory`,      inventoryRoutes);
app.use(`${API_V1}/invoices`,       invoiceRoutes);
app.use(`${API_V1}/dashboard`,      dashboardRoutes);
app.use(`${API_V1}/delivery`,    deleveryBoyRouter);

// ─── 404 — Unknown Routes ─────────────────────────────────────────────────────
// app.all("*", (req, _res, next) => {
//   next(new ApiError(404, `Route '${req.originalUrl}' not found`));
// });

// ═════════════════════════════════════════════════════════════════════════════
//  GLOBAL ERROR HANDLER
// ═════════════════════════════════════════════════════════════════════════════

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const message    = err.message    || "Internal Server Error";

  // Never leak stack traces in production
  if (process.env.NODE_ENV !== "production") {
    logger.error(`[${statusCode}] ${message}\n${err.stack}`);
  } else {
    logger.error(`[${statusCode}] ${message}`);
  }

  res.status(statusCode).json(
    new ApiResponse(statusCode, null, message, false)
  );
});

// ═════════════════════════════════════════════════════════════════════════════
//  GRACEFUL SHUTDOWN
// ═════════════════════════════════════════════════════════════════════════════

const gracefulShutdown = (signal) => {
  logger.warn(`\n${signal} received — shutting down gracefully...`);
  server.close(() => {
    logger.info("HTTP server closed.");
    process.exit(0);
  });

  // Force shutdown after 10 s if something hangs
  setTimeout(() => {
    logger.error("Forced shutdown — connections took too long to close.");
    process.exit(1);
  }, 10_000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT",  () => gracefulShutdown("SIGINT"));

// Catch unhandled promise rejections & exceptions
process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled Rejection:", reason);
  gracefulShutdown("UNHANDLED_REJECTION");
});

process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception:", err);
  gracefulShutdown("UNCAUGHT_EXCEPTION");
});

// ═════════════════════════════════════════════════════════════════════════════
//  DATABASE + SERVER BOOT
// ═════════════════════════════════════════════════════════════════════════════

(async () => {
  try {
    await connectDB();
    logger.info("✅  Database connected successfully");

    server.listen(PORT, () => {
      logger.info(`🚀  Server running in [${process.env.NODE_ENV}] mode on port ${PORT}`);
      logger.info(`📡  API base URL : http://localhost:${PORT}${API_V1}`);
      logger.info(`❤️   Health check : http://localhost:${PORT}/health`);
    });
  } catch (err) {
    logger.error(`❌  Failed to start server: ${err.message || err}`);
    process.exit(1);
  }
})();

export { app };