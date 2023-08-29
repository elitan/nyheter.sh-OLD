import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { Transformer } from '@napi-rs/image';
import { createTRPCRouter, protectedProcedure } from '@/server/trpc';
import { db } from '@/utils/db';
import {
  FlickrPhoto,
  constructFlickrPhotoUrl,
  getImageAsBuffer,
  put,
  searchFlickrPhotos,
  searchRkbildPhotos,
} from '../utils/helpers';
import { createApi } from 'unsplash-js';
import * as nodeFetch from 'node-fetch';

export const imagesRouter = createTRPCRouter({
  get: protectedProcedure
    .input(
      z.object({
        articleId: z.number(),
        service: z.enum([
          'su',
          'flickr',
          'unsplash',
          'regeringskansliet',
          'wikimedia',
          'upload',
        ]),
        query: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const { articleId, service, query } = input;

      if (!query || service === 'upload') {
        return {
          images: [],
        };
      }

      const images: string[] = [];

      if (service === 'su') {
        // get AI generated (and previously associated images) for this news article
        const images = await db
          .selectFrom('articleImages')
          .select(['id', 'imageUrl'])
          .execute();

        return {
          images: images.map((i) => {
            return i.imageUrl;
          }),
        };
      } else if (service === 'flickr') {
        const res = await searchFlickrPhotos(query);

        res.photos.photo.forEach((photo: any) => {
          images.push(constructFlickrPhotoUrl(photo as FlickrPhoto));
        });
      } else if (service === 'unsplash') {
        const unsplash = createApi({
          accessKey: process.env.UNSPLASH_ACCESS_KEY as string,
          fetch: nodeFetch.default as unknown as typeof fetch,
        });

        const res = await unsplash.search.getPhotos({
          query,
          perPage: 100,
        });

        res.response?.results.forEach((photo) => {
          images.push(photo.urls.regular);
        });
      } else if (service === 'regeringskansliet') {
        const res = await searchRkbildPhotos(query);

        res.assets.data.forEach((photo: any) => {
          // todo: return an image with a good size, current one is usually too small.
          images.push(`https://rkbild.se/${photo.previews[0].href}`);
        });
      }

      return {
        images,
      };
    }),

  upload: protectedProcedure
    .input(
      z.object({
        articleId: z.number(),
        imageBase64: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const { articleId, imageBase64 } = input;

      const rawImage = Buffer.from(imageBase64.split(',')[1], 'base64');

      const imageBinary = await new Transformer(rawImage).webp(75);

      const fileName = `images/${articleId}-${uuidv4()}.webp`;

      // upload image to spaces
      const params = {
        Bucket: 'nyheter',
        Key: fileName,
        Body: imageBinary,
        ContentType: 'image/webp',
        ACL: 'public-read',
      };

      await put(params);

      const insertedArticleImage = await db
        .insertInto('articleImages')
        .values({
          articleId,
          imageUrl: `https://nyheter.ams3.cdn.digitaloceanspaces.com/images/${fileName}`,
          imageIsAiGenerated: false,
        })
        .returning(['id'])
        .executeTakeFirstOrThrow();

      await db
        .updateTable('articles')
        .set({
          articleImageId: insertedArticleImage.id,
        })
        .where('id', '=', articleId)
        .execute();

      return {
        ok: true,
      };
    }),

  update: protectedProcedure
    .input(
      z.object({
        articleId: z.number(),
        imageUrl: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const { articleId, imageUrl } = input;

      const rawImage = await getImageAsBuffer(imageUrl);
      const imageBinary = await new Transformer(rawImage).webp(75);

      const fileName = `images/${articleId}-${uuidv4()}.webp`;

      // upload image to spaces
      const params = {
        Bucket: 'nyheter',
        Key: fileName,
        Body: imageBinary,
        ContentType: 'image/webp',
        ACL: 'public-read',
      };

      await put(params);

      const insertedArticleImage = await db
        .insertInto('articleImages')
        .values({
          articleId,
          imageUrl: `https://nyheter.ams3.cdn.digitaloceanspaces.com/images/${fileName}`,
          imageIsAiGenerated: false,
        })
        .returning(['id'])
        .executeTakeFirstOrThrow();

      await db
        .updateTable('articles')
        .set({
          articleImageId: insertedArticleImage.id,
        })
        .where('id', '=', articleId)
        .execute();

      return {
        ok: true,
      };
    }),
});
