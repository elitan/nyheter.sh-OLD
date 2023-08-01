import type { ColumnType } from "kysely";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export interface Articles {
  id: Generated<number>;
  createdAt: Generated<Timestamp | null>;
  title: string | null;
  slug: string | null;
  body: string | null;
  sverigesRadioTitle: string;
  sverigesRadioLink: string;
  transcribedText: string | null;
}

export interface ArticleTags {
  id: Generated<number>;
  createdAt: Generated<Timestamp | null>;
  articleId: number;
  tagId: number;
}

export interface Tags {
  id: Generated<number>;
  createdAt: Generated<Timestamp | null>;
  name: string;
  slug: string;
}

export interface DB {
  articles: Articles;
  articleTags: ArticleTags;
  tags: Tags;
}
