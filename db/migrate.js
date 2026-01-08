// Tiny migration runner: applies db/migrations/*.sql in order, once each,
// and records them in a schema_migrations table. Safe to run on every deploy.
import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import pg from "pg";

const dir = fileURLToPath(new URL("./migrations/", import.meta.url));

export async function migrate(client, log = console.log) {
  await client.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
