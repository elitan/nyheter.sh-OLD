import { db } from './utils/db';
import 'dotenv/config';
import { S3, PutObjectCommand } from '@aws-sdk/client-s3';
import { twitterClient } from './utils/twitter';

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
    .where('imageUrl', 'is', null)
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
      width: 1200,
      height: 800,
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: suBody,
    });

    const data = await response.json();

    console.log('data from SU:');
    console.log(data);

    // base64 encoded image data
    const imageData = `${data.images[0]}`;

    console.log(imageData);

    // generate unique filename
    const fileName = `images/${article.id}-main.png`;

    const base64Data = Buffer.from(imageData, 'base64');

    // upload image to spaces
    const params = {
      Bucket: 'nyheter',
      Key: fileName,
      Body: base64Data,
      ContentEncoding: 'base64', // required
      ContentType: 'image/png', // required
      ACL: 'public-read',
    };

    await s3Client.send(new PutObjectCommand(params));

    await db
      .updateTable('articles')
      .set({
        imagePrompt,
        imageUrl: `https://nyheter.ams3.cdn.digitaloceanspaces.com/${fileName}`,
      })
      .where('id', '=', article.id)
      .execute();

    // the image is now uploaded, let's tweet about it!
    const { title } = article;
    const linkToArticle = `https://nyheter.sh/nyheter/${article.slug}`;
    await twitterClient.v2.tweet(`${title}\n\n${linkToArticle}`);
  }

  console.log('done');

  process.exit(0);
})();
