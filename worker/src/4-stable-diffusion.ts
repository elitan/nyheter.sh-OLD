import { db } from './utils/db';
import 'dotenv/config';
import { S3, PutObjectCommand } from '@aws-sdk/client-s3';
import { Transformer, pngQuantize } from '@napi-rs/image';

const s3Client = new S3({
  endpoint: 'https://ams3.digitaloceanspaces.com',
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.SPACES_KEY as string,
    secretAccessKey: process.env.SPACES_SECRET as string,
  },
});

(async () => {
  const articlesToRefine = await db
    .selectFrom('articles')
    .select(['id', 'title', 'slug', 'imagePrompt'])
    .where('imagePrompt', 'is not', null)
    .where('articleImageId', 'is', null)
    .orderBy('id', 'desc')
    .execute();

  for (const article of articlesToRefine) {
    console.log('article: ', article);

    const { imagePrompt } = article;

    console.log('imagePrompt: ', imagePrompt);

    /**
     * GENERATE AND INSERT IMAGE
     */

    const url = process.env.STABLE_DIFFUSION_TEXT2IMG_ENDPOINT as string;
    const headers = {
      accept: 'application/json',
      'Content-Type': 'application/json',
    };
    const suBody = JSON.stringify({
      prompt: imagePrompt,
      negative_prompt: 'BadDream, UnrealisticDream',
      steps: 65,
      cfg_scale: 8,
      sampler_index: 'Euler a',
      restore_faces: true,
      width: 800,
      height: 500,
      batch_size: 4,
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: suBody,
    });

    const data = await response.json();

    for (const [index, imageData] of data.images.entries()) {
      // base64 encoded imageData

      // generate unique filename
      const fileName = `images/${article.id}-${index}.webp`;

      const rawImage = Buffer.from(imageData, 'base64');

      const imageBinary = await new Transformer(rawImage).webp(75);

      // upload image to spaces
      const params = {
        Bucket: 'nyheter',
        Key: fileName,
        Body: imageBinary,
        ContentType: 'image/webp',
        ACL: 'public-read',
      };

      await s3Client.send(new PutObjectCommand(params));

      const insertedArticleImage = await db
        .insertInto('articleImages')
        .values({
          articleId: article.id,
          imageUrl: `https://nyheter.ams3.cdn.digitaloceanspaces.com/images/${article.id}-${index}.webp`,
          imagePrompt,
        })
        .returning(['id'])
        .executeTakeFirstOrThrow();

      await db
        .updateTable('articles')
        .set({
          articleImageId: insertedArticleImage.id,
        })
        .where('id', '=', article.id)
        .execute();
    }
  }

  process.exit(0);
})();
