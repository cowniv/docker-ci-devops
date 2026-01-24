// In-memory store for tests and quick local runs. Nothing is saved.
import { randomUUID } from "node:crypto";

export function createMemoryStore(seed = []) {
  const notes = seed.map((n) => ({ ...n }));
  const clone = (n) => (n ? { ...n, tags: [...n.tags] } : null);

  return {
