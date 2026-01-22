// Every store implements the same interface, so app.js never knows which one it got:
//   all() · get(id) · create(data) · update(id, data) · remove(id) · ping() · close()
import { createJsonStore } from "./json-store.js";
import { createMemoryStore } from "./memory-store.js";

export async function createStoreFromConfig(config) {
  switch (config.storeDriver) {
    case "postgres": {
      // imported lazily so `pg` is only loaded when actually used
      const { createPgStore } = await import("./pg-store.js");
      return createPgStore({ connectionString: config.databaseUrl });
    }
    case "memory":
      return createMemoryStore();
    case "json":
      return createJsonStore(config.dataFile);
    default:
      throw new Error(`Unknown STORE_DRIVER "${config.storeDriver}"`);
  }
}
