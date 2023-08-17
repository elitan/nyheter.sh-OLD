import * as child_process from 'child_process';
import { db, pool } from './utils/db';
import 'dotenv/config';

/**
 * Executes a shell command and return it as a Promise.
 * @param cmd {string}
 * @return {Promise<string>}
 */
function runCommand(cmd: string, timeout = 5000): Promise<string> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      if (child) {
        child.kill('SIGKILL'); // Force kill if still running
      }
      reject(new Error(`Command timed out after ${timeout} ms`));
    }, timeout);

    const child = child_process.exec(cmd, (error, stdout, stderr) => {
      clearTimeout(timeoutId);
      if (error) {
        console.warn(error);
        reject();
      }
      resolve(stdout ? stdout : stderr);
    });
  });
}

(async () => {
  const articlesToTranscribe = await db
    .selectFrom('articles')
    .select(['id', 'sverigesRadioLink', 'sverigesRadioTitle'])
    .where('transcribedText', 'is', null)
    .execute();

  for (const article of articlesToTranscribe) {
    try {
      console.log(
        `Transcribing article id: ${article.id} (${article.sverigesRadioTitle})`,
      );

      if (article.sverigesRadioTitle.startsWith('Just nu:')) {
        console.log('starting with Just nu, skipping');
        continue;
      }

      console.log(`Downloading episode...`);
      try {
        await runCommand(
          `svtplay-dl ${article.sverigesRadioLink} --force -o /tmp/whisper/raw`,
        );
      } catch (error) {
        console.error(`Failed to download episode: ${error}`);
        // await db.deleteFrom('articles').where('id', '=', article.id).execute();
        continue;
      }

      console.log(`Encoding episode...`);
      await runCommand(
        'ffmpeg -y -i /tmp/whisper/raw.mp4 -ar 16000 /tmp/whisper/converted.wav',
      );

      console.log(`Transcribing episode...`);
      await runCommand(
        'whisper -m ../models/ggml-large.bin -l sv -nt -f /tmp/whisper/converted.wav --output-txt --output-file output',
        600_000,
      ); // 10 min timeout
    } catch (error) {
      console.error(`Failed to execute script: ${error}`);
      continue;
    }

    console.log(`Getting the output`);
    const transcribedText = await runCommand('cat output.txt');

    console.log(`Storing the transcribed text in the database`);
    await db
      .updateTable('articles')
      .set({
        transcribedText,
      })
      .where('id', '=', article.id)
      .execute();
  }

  console.log('Done');
  pool.end();
  process.exit(0);
})();
