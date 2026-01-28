// API tests. Runs against the in-memory store by default.
// Set TEST_DATABASE_URL to run the exact same tests against Postgres (CI does this).
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../src/app.js";
import { createMemoryStore } from "../src/stores/memory-store.js";

let server, base, store;

before(async () => {
  if (process.env.TEST_DATABASE_URL) {
    const pg = (await import("pg")).default;
    const { migrate } = await import("../db/migrate.js");
    const { createPgStore } = await import("../src/stores/pg-store.js");
    const client = new pg.Client({ connectionString: process.env.TEST_DATABASE_URL });
    await client.connect();
    await migrate(client, () => {});
    await client.query("TRUNCATE notes");
    await client.end();
    store = createPgStore({ connectionString: process.env.TEST_DATABASE_URL });
  } else {
    store = createMemoryStore();
  }
  server = createApp(store).listen(0);
  base = `http://localhost:${server.address().port}`;
});

after(async () => {
  server.close();
  await store.close();
});
