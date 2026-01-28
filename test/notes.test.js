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

const json = (method, body) => ({
  method,
  headers: { "Content-Type": "application/json" },
  body: body && JSON.stringify(body),
});

test("health and readiness", async () => {
  assert.equal((await fetch(`${base}/health`)).status, 200);
  assert.equal((await fetch(`${base}/ready`)).status, 200);
});

test("creates, reads, updates and deletes a note", async () => {
  const created = await fetch(`${base}/notes`, json("POST", { title: "Study React", tags: ["School", "school"] }));
  assert.equal(created.status, 201);
  assert.ok(created.headers.get("x-request-id"));
  const note = await created.json();
  assert.deepEqual(note.tags, ["school"]);

  const patched = await (await fetch(`${base}/notes/${note.id}`, json("PATCH", { pinned: true }))).json();
  assert.equal(patched.pinned, true);
  assert.equal(patched.title, "Study React"); // partial update keeps other fields

  assert.equal((await fetch(`${base}/notes/${note.id}`, { method: "DELETE" })).status, 204);
  assert.equal((await fetch(`${base}/notes/${note.id}`)).status, 404);
});

test("unknown id returns 404, not 500", async () => {
  assert.equal((await fetch(`${base}/notes/not-a-uuid`)).status, 404);
});
