import { loadConfig } from "./config.js";
import { createLogger } from "./logger.js";
import { createApp } from "./app.js";
import { createStoreFromConfig } from "./stores/index.js";

const config = loadConfig();
const logger = createLogger({ level: config.logLevel, base: { service: "notes-api" } });
const store = await createStoreFromConfig(config);
const app = createApp(store, { logger, corsOrigin: config.corsOrigin });

