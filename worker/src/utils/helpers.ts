import * as child_process from 'child_process';

export function getFirstTwoSentences(text: string): string {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  return sentences.slice(0, 2).join(' ');
}

/**
 * Removes the last sentence from a string.
 */
export function removeLastSentence(str: string) {
  let sentences = str.match(/[^.!?]+[.!?]*/g); // matches sentences ending with ., ! or ?
  if (sentences) {
    sentences.pop(); // removes the last sentence
    return sentences.join('');
  }
  return str;
}

/**
 * Executes a shell command and return it as a Promise.
 * @param cmd {string}
 * @return {Promise<string>}
 */
export async function runCommand(cmd: string, timeout = 5000): Promise<string> {
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

export async function postToFacebook(
  post: string,
  link: string,
): Promise<void> {
  console.log(process.env.FACEBOOK_ACCESS_TOKEN);

  const url = `https://graph.facebook.com/v17.0/nyheter.sh/feed?message=${encodeURIComponent(
    post,
  )}&link=${encodeURIComponent(link)}&access_token=${
    process.env.FACEBOOK_ACCESS_TOKEN
  }`;

  const response = await fetch(url, {
    method: 'POST',
  });

  return await response.json();
}
