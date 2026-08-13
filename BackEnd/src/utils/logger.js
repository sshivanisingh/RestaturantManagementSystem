import { createLogger, format, transports } from "winston";
import { fileURLToPath }                    from "url";
import { dirname, join }                    from "path";
import fs                                   from "fs";

// ─── Directory Setup ──────────────────────────────────────────────────────────
const __dirname  = dirname(fileURLToPath(import.meta.url));
const LOG_DIR    = join(__dirname, "../../logs");

// Auto-create logs/ folder if it doesn't exist
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// ─── Log Levels ───────────────────────────────────────────────────────────────
//  error: 0  warn: 1  info: 2  http: 3  verbose: 4  debug: 5  silly: 6
const LOG_LEVEL = process.env.LOG_LEVEL
  ?? (process.env.NODE_ENV === "production" ? "warn" : "debug");

// ═════════════════════════════════════════════════════════════════════════════
//  FORMATS
// ═════════════════════════════════════════════════════════════════════════════

// ─── Console Format (colourful, human-readable) ───────────────────────────────
const consoleFormat = format.combine(
  format.colorize({ all: true }),
  format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  format.errors({ stack: true }),
  format.printf(({ timestamp, level, message, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length
      ? `\n  ${JSON.stringify(meta, null, 2)}`
      : "";
    return stack
      ? `[${timestamp}] ${level}: ${message}\n${stack}${metaStr}`
      : `[${timestamp}] ${level}: ${message}${metaStr}`;
  })
);

// ─── File Format (clean JSON, machine-readable) ───────────────────────────────
const fileFormat = format.combine(
  format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  format.errors({ stack: true }),
  format.json()
);

// ═════════════════════════════════════════════════════════════════════════════
//  TRANSPORTS
// ═════════════════════════════════════════════════════════════════════════════

const logTransports = [
  // ── Console ─────────────────────────────────────────────────────────────────
  new transports.Console({
    format: consoleFormat,
    silent: process.env.NODE_ENV === "test", // quiet during unit tests
  }),

  // ── Combined log (everything) ────────────────────────────────────────────────
  new transports.File({
    filename: join(LOG_DIR, "combined.log"),
    format:   fileFormat,
    maxsize:  10 * 1024 * 1024, // 10 MB per file
    maxFiles: 5,                // keep last 5 rotations
    tailable: true,
  }),

  // ── Error-only log ───────────────────────────────────────────────────────────
  new transports.File({
    filename: join(LOG_DIR, "error.log"),
    level:    "error",
    format:   fileFormat,
    maxsize:  10 * 1024 * 1024,
    maxFiles: 5,
    tailable: true,
  }),

  // ── HTTP access log ──────────────────────────────────────────────────────────
  new transports.File({
    filename: join(LOG_DIR, "http.log"),
    level:    "http",
    format:   fileFormat,
    maxsize:  10 * 1024 * 1024,
    maxFiles: 3,
    tailable: true,
  }),
];

// ═════════════════════════════════════════════════════════════════════════════
//  LOGGER INSTANCE
// ═════════════════════════════════════════════════════════════════════════════

export const logger = createLogger({
  level:             LOG_LEVEL,
  levels:            { error: 0, warn: 1, info: 2, http: 3, verbose: 4, debug: 5, silly: 6 },
  exitOnError:       false,   // don't crash on logged errors
  handleExceptions:  true,    // catch uncaughtException
  handleRejections:  true,    // catch unhandledRejection
  transports:        logTransports,
});

// ═════════════════════════════════════════════════════════════════════════════
//  HELPER — structured context logging
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Log with extra context object attached.
 *
 * @example
 * logWithContext("info", "User logged in", { userId: "abc123", ip: "1.2.3.4" });
 */
export const logWithContext = (level, message, context = {}) => {
  logger[level](message, context);
};

/**
 * Log an incoming HTTP request (use in custom morgan stream or middleware).
 *
 * @example
 * logRequest(req);
 */
export const logRequest = (req) => {
  logger.http(`${req.method} ${req.originalUrl}`, {
    ip:        req.ip,
    userAgent: req.get("user-agent"),
    userId:    req.user?._id ?? "guest",
  });
};

/**
 * Log a database query (useful for debugging slow queries).
 *
 * @example
 * logQuery("User.findOne", 42);
 */
export const logQuery = (queryName, durationMs) => {
  logger.debug(`DB Query: ${queryName}`, { durationMs });
};

export default logger;