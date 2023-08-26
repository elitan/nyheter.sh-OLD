import { z } from 'zod';

export interface Article {
  id: number;
  createdAt: Date | null;
  title: string | null;
  slug: string | null;
  body: string | null;
  imageUrl: string | null;
  category: string | null;
}

export const articleSchema = z.object({
  id: z.number(),
  title: z.string(),
  body: z.string(),
  slug: z.string(),
  sverigesRadioLink: z.string(),
  sverigesRadioTitle: z.string(),
  imageUrl: z.string().nullable(),
  imageIsAiGenerated: z.boolean(),
  audioUrl: z.string(),
  imagePrompt: z.string(),
  createdAt: z.date(),
  isPublished: z.boolean(),
  isPublishedOnSocialMedia: z.boolean(),
});
