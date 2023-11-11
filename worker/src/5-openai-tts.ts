import { db } from './utils/db';
import 'dotenv/config';
import { put } from './utils/blob';
import { openai } from './utils/openai';

const SUPPORTED_LANGUAGES = ['en'];

async function main() {
  const articlesToRefine = await db
    .selectFrom('articleTranslations')
    .select(['id', 'body'])
    .where('body', 'is not', null)
    .where('audioUrl', 'is', null)
    .where('language', 'in', SUPPORTED_LANGUAGES)
    .orderBy('id', 'desc')
    .execute();

  console.log(`Found ${articlesToRefine.length} articles to refine`);
  for (const article of articlesToRefine) {
    console.log(`Generate audio for article ${article.id}`);

    if (!article.body) {
      console.log(`No body found for article ${article.id}`);
      continue;
    }

    const voices = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];
    const randomIndex = Math.floor(Math.random() * voices.length);

    const voice = voices[randomIndex] as any;
    console.log(article.body);
    console.log({ voice });

    const mp3 = await openai.audio.speech.create({
      model: 'tts-1-hd',
      voice: 'alloy',
      input: article.body,
      response_format: 'mp3',
      speed: 1,
    });

    console.log('mp3');
    console.log(mp3);

    const fileName = `audio/${article.id}.mp3`;
    const buffer = Buffer.from(await mp3.arrayBuffer());

    console.log(`Uploading...`);

    await put({
      Key: fileName,
      Body: buffer,
      ContentType: 'audio/mpeg',
      ACL: 'public-read',
    });

    const audioUrl = `https://nyheter.ams3.cdn.digitaloceanspaces.com/${fileName}`;

    console.log({ audioUrl });

    await db
      .updateTable('articleTranslations')
      .set({
        audioUrl,
      })
      .where('id', '=', article.id)
      .execute();
  }

  process.exit(0);
}

main();
