import { db } from './utils/db';
import 'dotenv/config';
import { openai } from './utils/openai';
import { S3, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

const GPT_PROMPT_ASSISTANT = `You are a helpful assistant`;

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
    .select(['id', 'title', 'body'])
    .where('title', 'is not', null)
    .where('body', 'is not', null)
    .where('imageUrl', 'is', null)
    .orderBy('id', 'desc')
    .execute();

  for (const article of articlesToRefine) {
    console.log('article: ', article);

    /**
     * GET IMAGE PROMPT
     */

    const imageQueryContent = `ARTICLE:\n ${article.title}\n${article.body}\nEND OF ARTICLE.\n\nWrite an image description that visually represents the main theme of the news article above. The image description should be simple and generic, without text, and should incorporate elements related to Sweden if relevant to the article's content. Be specific describing the image, instead of what it represent.`;

    const openAiImageQueryResponse = await openai.createChatCompletion({
      messages: [
        {
          role: 'system',
          content: GPT_PROMPT_ASSISTANT,
        },
        {
          role: 'user',
          content: imageQueryContent,
        },
      ],
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      max_tokens: 1200,
    });

    let imagePrompt = openAiImageQueryResponse.data.choices[0].message
      ?.content as string;

    // remove possible "Image description" prefix (case insensitive)
    imagePrompt = imagePrompt
      .replace(/image description/i, '')
      .replace(':', '')
      .trim();
    console.log('imagePrompt: ', imagePrompt);

    /**
     * GENERATE AND INSERT IMAGE
     */

    const url = 'http://100.101.51.53:7860/sdapi/v1/txt2img';
    const headers = {
      accept: 'application/json',
      'Content-Type': 'application/json',
    };
    const suBody = JSON.stringify({
      prompt: imagePrompt,
      negative_prompt: 'BadDream, UnrealisticDream',
      steps: 50,
      cfg_scale: 6,
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
  }

  console.log('done');

  process.exit(0);
})();
