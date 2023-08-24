import { z } from 'zod';

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from '@/server/trpc';
import { db } from '@/utils/db';

export const articlesRouter = createTRPCRouter({
  update: protectedProcedure
    .input(z.object({ id: z.number(), title: z.string(), body: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx.auth;

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
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(async ({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),
});
