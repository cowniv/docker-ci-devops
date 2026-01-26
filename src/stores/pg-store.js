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
