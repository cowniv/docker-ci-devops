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
      if (i === -1) return null;
      notes[i] = { ...notes[i], ...data, id, updatedAt: new Date().toISOString() };
      return clone(notes[i]);
    },
    async remove(id) {
      const i = notes.findIndex((n) => n.id === id);
      if (i === -1) return false;
      notes.splice(i, 1);
      return true;
    },
    async ping() {},
    async close() {},
  };
}
