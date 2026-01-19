// All settings come from environment variables (12-factor style).
// Defaults are for local development only.
const env = process.env;

function int(value, fallback) {
  const n = Number.parseInt(value ?? "", 10);
  return Number.isNaN(n) ? fallback : n;
}

export function loadConfig(source = env) {
  const config = {
    env: source.NODE_ENV || "development",
    port: int(source.PORT, 4000),
    logLevel: source.LOG_LEVEL || "info",
    // "postgres" in production, "json" or "memory" for local dev and tests
    storeDriver: source.STORE_DRIVER || (source.DATABASE_URL ? "postgres" : "json"),
    databaseUrl: source.DATABASE_URL || "",
    dataFile: source.DATA_FILE || "data/notes.json",
    shutdownTimeoutMs: int(source.SHUTDOWN_TIMEOUT_MS, 10_000),
    corsOrigin: source.CORS_ORIGIN || "*",
  };

