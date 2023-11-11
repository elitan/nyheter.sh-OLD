import 'dotenv/config';
import { db } from './utils/db';
import { S3, PutObjectCommand } from '@aws-sdk/client-s3';
import { Transformer } from '@napi-rs/image';
import { openai } from './utils/openai';

const s3Client = new S3({
  endpoint: 'https://ams3.digitaloceanspaces.com',
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.SPACES_KEY as string,
    secretAccessKey: process.env.SPACES_SECRET as string,
  },
});

async function main() {
  const articlesToRefine = await db
    .selectFrom('articles')
    .select(['id', 'title', 'slug', 'imagePrompt'])
    .where('imagePrompt', 'is not', null)
    .where('articleImageId', 'is', null)
    .orderBy('id', 'desc')
    .execute();

  console.log(`Found ${articlesToRefine.length} articles to refine`);
  for (const article of articlesToRefine) {
    if (!article.imagePrompt) {
      console.log('No image prompt found for article', article.id);
      continue;
    }

    console.log('Generating image for article', article.id);

    const image = await openai.images
      .generate({
        model: 'dall-e-3',
        prompt: `${article.imagePrompt}. This is related to Sweden`,
        response_format: 'b64_json',
        n: 1,
        quality: 'standard',
        size: '1792x1024',
        style: 'vivid',
      })
      .catch((e) => {
        console.log('Failed to generate image', e);
        return null;
      });

    if (!image?.data[0].b64_json) {
      console.log('No image found for article', article.id);
      continue;
    }

    // generate unique filename
    const fileName = `images/${article.id}.webp`;

    const rawImage = Buffer.from(image.data[0].b64_json, 'base64');
    const imageBinary = await new Transformer(rawImage).webp(75);

    console.log('Uploading image to spaces');

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
        imageUrl: `https://nyheter.ams3.cdn.digitaloceanspaces.com/${fileName}`,
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

main();
