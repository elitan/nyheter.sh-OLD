export interface Article {
  id: number;
  createdAt: Date | null;
  title: string | null;
  slug: string | null;
  body: string | null;
  imageUrl: string | null;
}
