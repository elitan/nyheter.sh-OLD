import type { ColumnType } from "kysely";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export interface Articles {
  id: Generated<number>;
  createdAt: Generated<Timestamp | null>;
  title: string | null;
  body: string | null;
  sverigesRadioTitle: string;
  sverigesRadioLink: string;
  transcribedText: string | null;
  slug: string | null;
}

export interface DB {
  articles: Articles;
}
