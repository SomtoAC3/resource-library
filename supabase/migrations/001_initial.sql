-- Extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Resources table
CREATE TABLE resources (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  url            TEXT        NOT NULL,
  title          TEXT,
  description    TEXT,
  ai_summary     TEXT,
  domain         TEXT,
  favicon_url    TEXT,
  og_image_url   TEXT,
  screenshot_url TEXT,
  status         TEXT        NOT NULL DEFAULT 'processing'
                             CHECK (status IN ('processing', 'ready', 'failed')),
  tags           TEXT[]      NOT NULL DEFAULT '{}',
  categories     TEXT[]      NOT NULL DEFAULT '{}',
  source         TEXT,
  submitted_by   TEXT,
  search_vector  TSVECTOR,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Full-text search vector trigger
CREATE OR REPLACE FUNCTION resources_search_vector_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    SETWEIGHT(TO_TSVECTOR('english', COALESCE(NEW.title, '')),       'A') ||
    SETWEIGHT(TO_TSVECTOR('english', ARRAY_TO_STRING(NEW.tags, ' ')), 'B') ||
    SETWEIGHT(TO_TSVECTOR('english', ARRAY_TO_STRING(NEW.categories, ' ')), 'B') ||
    SETWEIGHT(TO_TSVECTOR('english', COALESCE(NEW.ai_summary, '')),  'C') ||
    SETWEIGHT(TO_TSVECTOR('english', COALESCE(NEW.description, '')), 'C') ||
    SETWEIGHT(TO_TSVECTOR('english', COALESCE(NEW.domain, '')),      'D');
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER resources_search_vector_trigger
  BEFORE INSERT OR UPDATE ON resources
  FOR EACH ROW EXECUTE FUNCTION resources_search_vector_update();

-- Indexes
CREATE INDEX resources_search_idx  ON resources USING GIN(search_vector);
CREATE INDEX resources_tags_idx    ON resources USING GIN(tags);
CREATE INDEX resources_cats_idx    ON resources USING GIN(categories);
CREATE INDEX resources_domain_idx  ON resources (domain);
CREATE INDEX resources_status_idx  ON resources (status);
CREATE INDEX resources_created_idx ON resources (created_at DESC);

-- Row-Level Security
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_select" ON resources
  FOR SELECT TO anon
  USING (true);

CREATE POLICY "anon_insert" ON resources
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "anon_update" ON resources
  FOR UPDATE TO anon
  USING (true)
  WITH CHECK (true);

-- Search RPC (weighted FTS + optional category filter)
CREATE OR REPLACE FUNCTION search_resources(
  query_text      TEXT,
  filter_category TEXT    DEFAULT NULL,
  result_limit    INTEGER DEFAULT 20,
  result_offset   INTEGER DEFAULT 0
)
RETURNS SETOF resources
LANGUAGE sql STABLE AS $$
  SELECT *
  FROM resources
  WHERE
    status = 'ready'
    AND search_vector @@ WEBSEARCH_TO_TSQUERY('english', query_text)
    AND (filter_category IS NULL OR categories @> ARRAY[filter_category])
  ORDER BY
    TS_RANK_CD(search_vector, WEBSEARCH_TO_TSQUERY('english', query_text)) DESC,
    created_at DESC
  LIMIT result_limit
  OFFSET result_offset;
$$;
