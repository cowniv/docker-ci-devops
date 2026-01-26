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
      const { rows } = await pool.query("SELECT * FROM notes WHERE id = $1", [id]);
      return rows[0] ? toNote(rows[0]) : null;
    },
    async create(data) {
      const { rows } = await pool.query(
        `INSERT INTO notes (title, content, tags, pinned)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [data.title, data.content ?? "", data.tags ?? [], data.pinned ?? false]
      );
      return toNote(rows[0]);
    },
    async update(id, data) {
      if (!UUID_RE.test(id)) return null;
      // COALESCE keeps the old value when a field wasn't sent (partial update)
      const { rows } = await pool.query(
        `UPDATE notes SET
           title      = COALESCE($2, title),
           content    = COALESCE($3, content),
           tags       = COALESCE($4, tags),
           pinned     = COALESCE($5, pinned),
           updated_at = now()
         WHERE id = $1 RETURNING *`,
        [id, data.title ?? null, data.content ?? null, data.tags ?? null, data.pinned ?? null]
      );
      return rows[0] ? toNote(rows[0]) : null;
    },
