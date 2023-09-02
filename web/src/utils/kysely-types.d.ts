import type { ColumnType } from "kysely";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export interface ArticleImages {
  id: Generated<number>;
  createdAt: Generated<Timestamp | null>;
  updatedAt: Generated<Timestamp | null>;
  imagePrompt: string | null;
  imageIsAiGenerated: Generated<boolean | null>;
  imageUrl: string;
  articleId: number | null;
  creditInfo: string | null;
}

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
  isRelatedToSweden: boolean | null;
  category: string | null;
  imageIsAiGenerated: Generated<boolean | null>;
  audioUrl: string | null;
  updatedAt: Generated<Timestamp | null>;
  isPublished: Generated<boolean | null>;
  isPublishedOnSocialMedia: Generated<boolean | null>;
  pageViews: Generated<number | null>;
  articleImageId: number | null;
}

export interface DB {
  articleImages: ArticleImages;
  articles: Articles;
}
