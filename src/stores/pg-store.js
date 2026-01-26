// PostgreSQL store. Same interface as the JSON store, so the routes didn't change.
import pg from "pg";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function toNote(row) {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    tags: row.tags,
    pinned: row.pinned,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

export function createPgStore({ connectionString, pool = new pg.Pool({ connectionString, max: 10 }) }) {
  return {
    pool,
    async all() {
      const { rows } = await pool.query("SELECT * FROM notes ORDER BY updated_at DESC");
      return rows.map(toNote);
    },
    async get(id) {
      if (!UUID_RE.test(id)) return null; // avoid a 500 from an invalid uuid cast
