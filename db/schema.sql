-- CREATE OR REPLACE FUNCTION update_updated_at_column()
--   RETURNS TRIGGER
--   AS $$
-- BEGIN
--   NEW.updated_at = NOW();
--   RETURN NEW;
-- END;
-- $$
-- LANGUAGE plpgsql;
CREATE TABLE articles(
  id serial PRIMARY KEY,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  -- updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  title varchar(255),
  slug varchar(255),
  body text,
  sveriges_radio_title varchar(255) NOT NULL,
  sveriges_radio_link varchar(255) NOT NULL,
  transcribed_text text,
  image_url text,
  image_prompt text,
  image_is_ai_generated boolean DEFAULT TRUE,
  audio_url text,
  is_related_to_sweden boolean,
  category text
);

-- CREATE TRIGGER articles_update_updated_at
--   BEFORE UPDATE ON articles
--   FOR EACH ROW
--   EXECUTE FUNCTION update_updated_at_column();
