CREATE TABLE IF NOT EXISTS notes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title       varchar(120) NOT NULL,
  content     text NOT NULL DEFAULT '',
  tags        text[] NOT NULL DEFAULT '{}',
  pinned      boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notes_tags_idx ON notes USING gin (tags);
CREATE INDEX IF NOT EXISTS notes_updated_at_idx ON notes (updated_at DESC);
