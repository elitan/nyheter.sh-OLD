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
  imageUrl: string | null;
  imagePrompt: string | null;
  audioSummaryUrl: string | null;
  isRelatedToSweden: boolean | null;
}

export interface DB {
  articles: Articles;
}
