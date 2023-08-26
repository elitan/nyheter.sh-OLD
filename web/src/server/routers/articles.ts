import { z } from 'zod';

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from '@/server/trpc';
import { db } from '@/utils/db';
import { articleSchema } from '@/utils/types';
import { twitterClient } from '../utils/helpers';

export const articlesRouter = createTRPCRouter({
  getOne: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const { slug } = input;

      const article = await db
        .selectFrom('articles')
        .select([
          'id',
          'title',
          'body',
          'slug',
          'sverigesRadioLink',
          'sverigesRadioTitle',
          'imageUrl',
          'imageIsAiGenerated',
          'audioUrl',
          'imagePrompt',
          'createdAt',
          'isPublished',
          'isPublishedOnSocialMedia',
        ])
        .where('slug', '=', slug)
        .where('isRelatedToSweden', '=', true)
        .executeTakeFirst();

      const parsedArticle = articleSchema.parse(article);

      return {
        article: parsedArticle,
      };
    }),

  update: protectedProcedure
    .input(z.object({ id: z.number(), title: z.string(), body: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id, title, body } = input;

      await db
        .updateTable('articles')
        .set({
          title,
          body,
        })
        .where('id', '=', id)
        .execute();

      return {
        ok: true,
      };
    }),

  setIsPublished: protectedProcedure
    .input(z.object({ id: z.number(), isPublished: z.boolean() }))
    .mutation(async ({ input }) => {
      const { id, isPublished } = input;

      await db
        .updateTable('articles')
        .set({
          isPublished,
        })
        .where('id', '=', id)
        .execute();

      return {
        ok: true,
      };
    }),

  publishOnSocialMedia: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const { id } = input;

      const article = await db
        .selectFrom('articles')
        .select(['id', 'title', 'body', 'imageUrl', 'slug'])
        .where('id', '=', id)
        .where('isPublishedOnSocialMedia', '=', false)
        .executeTakeFirst();

      if (!article) {
        console.log('article is already published on social media');
        return {
          ok: false,
        };
      }

      // the image is now uploaded, let's tweet about it!
      const { title } = article;
      const linkToArticle = `https://nyheter.sh/nyheter/${article.slug}`;
      await twitterClient.v2.tweet(`${title}\n\n${linkToArticle}`);

      await db
        .updateTable('articles')
        .set({
          isPublishedOnSocialMedia: true,
        })
        .execute();

      return {
        ok: true,
      };
    }),

  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(async ({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),
});
