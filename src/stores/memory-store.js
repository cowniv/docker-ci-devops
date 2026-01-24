// In-memory store for tests and quick local runs. Nothing is saved.
import { randomUUID } from "node:crypto";

export function createMemoryStore(seed = []) {
  const notes = seed.map((n) => ({ ...n }));
  const clone = (n) => (n ? { ...n, tags: [...n.tags] } : null);

  return {
    async all() {
      return notes.map(clone);
    },
    async get(id) {
      return clone(notes.find((n) => n.id === id));
    },
    async create(data) {
      const now = new Date().toISOString();
      const note = { id: randomUUID(), content: "", tags: [], ...data, pinned: data.pinned ?? false, createdAt: now, updatedAt: now };
      notes.push(note);
      return clone(note);
    },
    async update(id, data) {
      const i = notes.findIndex((n) => n.id === id);
