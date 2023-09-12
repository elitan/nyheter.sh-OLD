CREATE OR REPLACE FUNCTION update_updated_at_column()
  RETURNS TRIGGER
  AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$
LANGUAGE plpgsql;

CREATE TABLE article_images(
  id serial PRIMARY KEY,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  article_id integer,
  image_url text NOT NULL,
  image_prompt text,
  image_is_ai_generated boolean DEFAULT FALSE,
  credit_info text
);

CREATE TABLE articles(
  id serial PRIMARY KEY,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  title varchar(255),
  slug varchar(255),
  body text,
  sveriges_radio_title varchar(255) NOT NULL,
  sveriges_radio_link varchar(255) NOT NULL,
  transcribed_text text,
  article_image_id integer REFERENCES article_images(id),
  image_url text, -- deprecated
  image_prompt text, -- deprecated
  image_is_ai_generated boolean DEFAULT TRUE, -- deprecated
  audio_url text,
  is_related_to_sweden boolean,
  is_published boolean DEFAULT FALSE,
  is_published_on_social_media boolean DEFAULT FALSE,
  category text,
  page_views integer DEFAULT 0
);

CREATE TABLE article_social_media_hooks(
  id serial PRIMARY KEY,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  article_id integer,
  hook text
);

-- articles
CREATE OR REPLACE TRIGGER articles_update_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- article_images
ALTER TABLE article_images
  ADD CONSTRAINT fk_article_images_article_id FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE;

COMMENT ON COLUMN article_images.article_id IS 'The article this image belongs to if the image was AI generated';

CREATE OR REPLACE TRIGGER article_images_update_updated_at
  BEFORE UPDATE ON article_images
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- article_social_media_hooks
CREATE OR REPLACE TRIGGER article_social_media_hooks_update_updated_at
  BEFORE UPDATE ON article_social_media_hooks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE article_social_media_hooks
  ADD CONSTRAINT fk_article_social_media_hooks_article_id FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE;

