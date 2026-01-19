import { loadConfig } from "./config.js";
import { createLogger } from "./logger.js";
import { createApp } from "./app.js";
import { createStoreFromConfig } from "./stores/index.js";

const config = loadConfig();
const logger = createLogger({ level: config.logLevel, base: { service: "notes-api" } });
const store = await createStoreFromConfig(config);
const app = createApp(store, { logger, corsOrigin: config.corsOrigin });

const server = app.listen(config.port, () => {
  logger.info("server started", { port: config.port, store: config.storeDriver, env: config.env });
});

// Graceful shutdown: stop accepting connections, let in-flight requests finish,
// close the DB pool, then exit. Docker sends SIGTERM on `docker stop`.
let shuttingDown = false;
async function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info("shutdown started", { signal });

  const force = setTimeout(() => {
    logger.error("shutdown timed out, forcing exit");
    process.exit(1);
  }, config.shutdownTimeoutMs);
  force.unref();

  server.close(async (err) => {
