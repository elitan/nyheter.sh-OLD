import { db } from './utils/db';
import 'dotenv/config';
import { put } from './utils/blob';
import fs from 'fs';
import { runCommand } from './utils/helpers';

(async () => {
  const articlesToRefine = await db
    .selectFrom('articles')
    .select(['id', 'title', 'body'])
    .where('title', 'is not', null)
    .where('body', 'is not', null)
    .where('audioUrl', 'is', null)
    .execute();

  for (const article of articlesToRefine) {
    console.log('article: ', article);

    const jsonInput = {
      text: article.body,
      output_file: '/tmp/raw.wav',
    };

    fs.writeFileSync('/tmp/input.json', JSON.stringify(jsonInput));

    await runCommand(
      `cd /home/elitan/code/piper && cat /tmp/input.json | ./piper --model piper-voices/en/en_US/joe/medium/en_US-joe-medium.onnx --json-input`,
    );

    await runCommand(
      `ffmpeg -i /tmp/raw.wav -codec:a libmp3lame -qscale:a 2 /tmp/output.mp3`,
    );

    const audioBuffer = fs.readFileSync('/tmp/output.mp3');
    const fileName = `audio/${article.id}.mp3`;

    await put({
      Key: fileName,
      Body: audioBuffer,
      ContentType: 'audio/mpeg',
      ACL: 'public-read',
    });

    const audioUrl = `https://nyheter.ams3.cdn.digitaloceanspaces.com/${fileName}`;

    await db
      .updateTable('articles')
      .set({
        audioUrl,
      })
      .where('id', '=', article.id)
      .execute();
  }

  console.log('done');

  process.exit(0);
})();
