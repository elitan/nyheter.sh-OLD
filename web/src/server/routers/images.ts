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
import { ImageInfo } from '@/utils/types';

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

      if (
        (!query && ['flickr', 'unsplash'].includes(service)) ||
        service === 'upload'
      ) {
        return {
          images: [],
        };
      }

      const images: ImageInfo[] = [];

      if (service === 'su') {
        // get AI generated (and previously associated images) for this news article
        const images = await db
          .selectFrom('articleImages')
          .select(['id', 'imageUrl', 'imageIsAiGenerated', 'creditInfo'])
          .where('articleId', '=', articleId)
          .execute();

        return {
          images: images.map((i) => {
            return {
              url: i.imageUrl,
              isAiGenerated: i.imageIsAiGenerated ?? false,
              creditInfo: i.creditInfo ?? '',
            };
          }),
        };
      } else if (service === 'flickr') {
        const res = await searchFlickrPhotos(query);

        res.photos.photo.forEach((photo: any) => {
          images.push({
            url: constructFlickrPhotoUrl(photo as FlickrPhoto),
            isAiGenerated: false,
            creditInfo: `${photo.ownername}/Flickr`,
          });
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
          images.push({
            url: photo.urls.regular,
            isAiGenerated: false,
            creditInfo: `${photo.user.name}/Unsplash`,
          });
        });
      } else if (service === 'regeringskansliet') {
        const rkPhotos = await searchRkbildPhotos(query);

        rkPhotos.forEach((photo: any) => {
          console.log(photo.previews);
          // todo: return an photo with a good size, current one is usually too small.
          // console.log(photo);
          images.push({
            url: `https://rkbild.se/${photo.previews[0].href}`,
            isAiGenerated: false,
            creditInfo: photo.metadata['80'].value[0],
          });
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
          imageUrl: `https://nyheter.ams3.cdn.digitaloceanspaces.com/${fileName}`,
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
        imageIsAiGenerated: z.boolean(),
        creditInfo: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const { articleId, imageUrl, imageIsAiGenerated, creditInfo } = input;

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
          imageUrl: `https://nyheter.ams3.cdn.digitaloceanspaces.com/${fileName}`,
          imageIsAiGenerated,
          creditInfo,
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
