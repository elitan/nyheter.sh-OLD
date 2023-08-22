CREATE TABLE articles(
  id serial PRIMARY KEY,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  title varchar(255),
  slug varchar(255),
  body text,
  sveriges_radio_title varchar(255) NOT NULL,
  sveriges_radio_link varchar(255) NOT NULL,
  transcribed_text text,
  image_url text,
  image_prompt text,
  image_is_ai_generated boolean DEFAULT TRUE,
  audio_summary_url text,
  is_related_to_sweden boolean,
  category text
);

