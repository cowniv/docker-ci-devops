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
    } catch {
      cache = [];
    }
    return cache;
  }

  async function persist() {
    await mkdir(dirname(file), { recursive: true });
    await writeFile(file, JSON.stringify(cache, null, 2));
  }

  return {
    async all() {
      return [...(await load())];
    },
    async get(id) {
      return (await load()).find((n) => n.id === id) ?? null;
    },
    async create(data) {
      const notes = await load();
      const now = new Date().toISOString();
      const note = { id: randomUUID(), ...data, pinned: data.pinned ?? false, createdAt: now, updatedAt: now };
      notes.push(note);
