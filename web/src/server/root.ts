import { createTRPCRouter } from '@/server/trpc';
import { articlesRouter } from './routers/articles';
import { imagesRouter } from './routers/images';

export const appRouter = createTRPCRouter({
  articles: articlesRouter,
  images: imagesRouter,
});

export type AppRouter = typeof appRouter;
