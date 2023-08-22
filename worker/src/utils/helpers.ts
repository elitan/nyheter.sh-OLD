import * as child_process from 'child_process';

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
