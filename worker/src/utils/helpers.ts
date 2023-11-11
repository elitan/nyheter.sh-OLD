import * as child_process from 'child_process';
import { env } from './env';

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

export function getLanguageFromTwoLetters(language: string): string {
  const languageMap: Record<string, string> = {
    fi: 'Finnish',
    ar: 'Arabic',
    ru: 'Russian',
    uk: 'Ukrainian',
    kur: 'Kurdish (Sorani)',
    fa: 'Persian',
    so: 'Somali',
    es: 'Spanish',
    de: 'German',
    fr: 'French',
  };

  if (!languageMap[language]) {
    throw new Error('Language not found');
  }

  return languageMap[language];
}

function escapeNewLines(str: string) {
  return str.replace(/\n/g, '\\n');
}

function fixOpenAiNewLineResponse(str: string) {
  return str
    .split('"')
    .map((chunk, index) => {
      // Only replace \n inside the JSON string values, which are in every other index after splitting by "
      if (index % 2 === 1) {
        return escapeNewLines(chunk);
      } else {
        return chunk;
      }
    })
    .join('"');
}

export function parseOpenAiJson(str: string) {
  return JSON.parse(fixOpenAiNewLineResponse(str));
}

interface TranslateParmas {
  text: string;
  from: string;
  to: string;
}

export async function translate(params: TranslateParmas) {
  const { text, from, to } = params;

  const url = `https://translation.googleapis.com/language/translate/v2`;
  const request = {
    q: text,
    source: from,
    target: to,
    format: 'text',
  };

  // Run request
  const response = await fetch(`${url}?key=${env.GOOGLE_API_TRANSLATION_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  const jsonResponse = await response.json();

  console.log({ jsonResponse });

  if (!jsonResponse.data || !jsonResponse.data.translations) {
    throw new Error('Translation failed');
  }

  if (jsonResponse.data.translations.length === 0) {
    throw new Error('Translation failed');
  }

  console.log(jsonResponse.data.translations);

  return jsonResponse.data.translations[0].translatedText;
}
