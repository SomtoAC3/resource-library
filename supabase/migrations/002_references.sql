-- Add reference support columns
ALTER TABLE resources
  ADD COLUMN type TEXT NOT NULL DEFAULT 'resource'
             CHECK (type IN ('resource', 'reference')),
  ADD COLUMN why_i_like_this TEXT,
  ADD COLUMN inspiration_notes TEXT;

-- Index for type filtering
CREATE INDEX resources_type_idx ON resources (type);

-- Update FTS trigger to include reference-specific fields
CREATE OR REPLACE FUNCTION resources_search_vector_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    SETWEIGHT(TO_TSVECTOR('english', COALESCE(NEW.title, '')),                 'A') ||
    SETWEIGHT(TO_TSVECTOR('english', ARRAY_TO_STRING(NEW.tags, ' ')),          'B') ||
    SETWEIGHT(TO_TSVECTOR('english', ARRAY_TO_STRING(NEW.categories, ' ')),    'B') ||
    SETWEIGHT(TO_TSVECTOR('english', COALESCE(NEW.ai_summary, '')),            'C') ||
    SETWEIGHT(TO_TSVECTOR('english', COALESCE(NEW.description, '')),           'C') ||
    SETWEIGHT(TO_TSVECTOR('english', COALESCE(NEW.why_i_like_this, '')),       'C') ||
    SETWEIGHT(TO_TSVECTOR('english', COALESCE(NEW.inspiration_notes, '')),     'C') ||
    SETWEIGHT(TO_TSVECTOR('english', COALESCE(NEW.domain, '')),                'D');
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update search RPC with optional type filter
CREATE OR REPLACE FUNCTION search_resources(
  query_text      TEXT,
  filter_category TEXT    DEFAULT NULL,
  result_limit    INTEGER DEFAULT 20,
  result_offset   INTEGER DEFAULT 0,
  filter_type     TEXT    DEFAULT NULL
)
RETURNS SETOF resources
LANGUAGE sql STABLE AS $$
  SELECT *
  FROM resources
  WHERE
    status = 'ready'
    AND search_vector @@ WEBSEARCH_TO_TSQUERY('english', query_text)
    AND (filter_category IS NULL OR categories @> ARRAY[filter_category])
    AND (filter_type IS NULL OR type = filter_type)
  ORDER BY
    TS_RANK_CD(search_vector, WEBSEARCH_TO_TSQUERY('english', query_text)) DESC,
    created_at DESC
  LIMIT result_limit
  OFFSET result_offset;
$$;
