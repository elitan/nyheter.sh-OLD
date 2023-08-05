import { db } from './utils/db';
import 'dotenv/config';
import { openai } from './utils/openai';
import slugify from 'slugify';
import { createApi } from 'unsplash-js';

const GPT_PROMPT_ASSISTANT = `You are a helpful assistant`;

(async () => {
  const articlesToRefine = await db
    .selectFrom('articles')
    .select(['id', 'title', 'body'])
    .where('title', 'is not', null)
    .where('body', 'is not', null)
    .where('imageData', 'is', null)
    .orderBy('id', 'asc')
    .execute();

  for (const article of articlesToRefine) {
    console.log('article: ', article);

    /**
     * GET IMAGE PROMPT
     */

    const imageQueryContent = `ARTICLE:\n ${article.title}\n${article.body}\nEND OF ARTICLE.\n\nWrite an image description that visually represents the main theme of the news article above. The image description should be simple and generic, without text, and should incorporate elements related to Sweden if relevant to the article's content.`;

    // Write a  description for an image for the news article above. Make the image description short and simple. Also make the image description generic. Don't include any text in the image you're prompting. Please include references to Sweden if you're able to.`;

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
      temperature: 0.5,
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

    const url = 'http://192.168.1.12:7860/sdapi/v1/txt2img';
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

    const imageData = `data:image/png;base64,${data.images[0]}`;

    await db
      .updateTable('articles')
      .set({
        imagePrompt,
        imageData,
      })
      .where('id', '=', article.id)
      .execute();
  }

  console.log('done');

  process.exit(0);
})();
