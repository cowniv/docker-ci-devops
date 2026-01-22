// The original JSON-file "database" from project 21, kept for local dev without Postgres.
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { randomUUID } from "node:crypto";

export function createJsonStore(file) {
  let cache = null;

  async function load() {
    if (cache) return cache;
    try {
      cache = JSON.parse(await readFile(file, "utf8"));
