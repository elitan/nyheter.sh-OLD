import { db } from './utils/db';
import 'dotenv/config';
import { openai } from './utils/openai';
import { v4 as uuidv4 } from 'uuid';
import { put } from './utils/blob';

const GPT_PROMPT_ASSISTANT = `You are a helpful assistant`;

(async () => {
  const articlesToRefine = await db
    .selectFrom('articles')
    .select(['id', 'title', 'body'])
    .where('title', 'is not', null)
    .where('body', 'is not', null)
    .where('audioSummaryUrl', 'is', null)
    .orderBy('id', 'desc')
    .execute();

  for (const article of articlesToRefine) {
    console.log('article: ', article);

    /**
     * GET SUMMARY
     */

    const articleSummaryPrompt = `ARTICLE:\n ${article.title}\n${article.body}\nEND OF ARTICLE.\n\nWrite an short summary of the article using 3-5 sentences.`;

    const articleSummaryPromptResponse = await openai.createChatCompletion({
      messages: [
        {
          role: 'system',
          content: GPT_PROMPT_ASSISTANT,
        },
        {
          role: 'user',
          content: articleSummaryPrompt,
        },
      ],
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      max_tokens: 1200,
    });

    let articleSummary = articleSummaryPromptResponse.data.choices[0].message
      ?.content as string;

    console.log('articleSummary: ', articleSummary);

    /**
     * GENERATE AUDIO
     */

    const url =
      'https://api.elevenlabs.io/v1/text-to-speech/ZQe5CZNOzWyzPSCn5a3c';
    const headers = {
      Accept: 'audio/mpeg',
      'xi-api-key': process.env.ELEVEN_LABS_API_KEY as string,
      'Content-Type': 'application/json',
    };
    const elevenLabsBody = JSON.stringify({
      model_id: 'eleven_monolingual_v1',
      text: articleSummary,
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: elevenLabsBody,
    });

    const audioBuffer = await response.arrayBuffer();

    const fileName = `audio/${article.id}-summary.mp3`;

    /**
     * UPLOAD AUDIO
     */
    await put({
      Key: fileName,
      Body: Buffer.from(audioBuffer),
      ContentType: 'audio/mpeg',
      ACL: 'public-read',
    });

    /**
     * UPDATE ARTICLE
     */
    const audioSummaryUrl = `https://nyheter.ams3.cdn.digitaloceanspaces.com/${fileName}`;

    await db
      .updateTable('articles')
      .set({
        audioSummaryUrl,
      })
      .where('id', '=', article.id)
      .execute();
  }

  console.log('done');

  process.exit(0);
})();
