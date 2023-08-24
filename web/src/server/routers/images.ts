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
        service: z.enum(['su', 'flickr', 'unsplash', 'regeringskansliet']),
        query: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const { articleId, service, query } = input;

      if (!query) {
        return {
          images: [],
        };
      }

      console.log(service, query);

      const images: string[] = [];

      if (service === 'flickr') {
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

        console.log(res);

        console.log(JSON.stringify(res.response?.results, null, 2));

        res.response?.results.forEach((photo) => {
          images.push(photo.urls.regular);
        });

        console.log(res.response?.results.length);
      } else if (service === 'regeringskansliet') {
        const res = await searchRkbildPhotos(query);

        res.assets.data.forEach((photo: any) => {
          images.push(`https://rkbild.se/${photo.previews[0].href}`);
        });
      }

      return {
        images,
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

      console.log('get image');
      const rawImage = await getImageAsBuffer(imageUrl);
      console.log('transform image');
      const imageBinary = await new Transformer(rawImage).webp(75);

      const fileName = `images/${articleId}-main.webp`;

      console.log('uploading image...');

      // upload image to spaces
      const params = {
        Bucket: 'nyheter',
        Key: fileName,
        Body: imageBinary,
        ContentType: 'image/webp',
        ACL: 'public-read',
      };

      await put(params);

      console.log('upload done.');

      await db
        .updateTable('articles')
        .set({
          imageUrl: `https://nyheter.ams3.digitaloceanspaces.com/${fileName}`,
        })
        .where('id', '=', articleId)
        .execute();

      return {
        ok: true,
      };
    }),
});
