import { test } from "node:test";
import assert from "node:assert/strict";
import { loadConfig } from "../src/config.js";
import { createLogger } from "../src/logger.js";

test("config picks postgres when DATABASE_URL is set", () => {
  const c = loadConfig({ DATABASE_URL: "postgres://u:p@localhost/db", PORT: "8080" });
  assert.equal(c.storeDriver, "postgres");
  assert.equal(c.port, 8080);
});

test("config falls back to the json store", () => {
  assert.equal(loadConfig({}).storeDriver, "json");
});

test("config rejects postgres without a url", () => {
  assert.throws(() => loadConfig({ STORE_DRIVER: "postgres" }), /DATABASE_URL/);
});
