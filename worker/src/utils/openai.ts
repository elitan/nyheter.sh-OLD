import { OpenAI } from 'openai';
import { z } from 'zod';

import 'dotenv/config';
import {
  getLanguageFromTwoLetters,
  parseOpenAiJson,
  removeLastSentence,
} from './helpers';

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const FUNCTIONS = {
  informationIsRelatedToSweden: {
    name: 'informationIsRelatedToSweden',
    description: 'Check if the information is related to Sweden or not',
    parameters: {
      type: 'object',
      properties: {
        isRelatedToSweden: {
          type: 'boolean',
          description: 'Weather the information is related to Sweden or not',
        },
      },
      required: ['isRelatedToSweden'],
    },
  },
  classifyNewValue: {
    name: 'classifyNewsValue',
    description: 'Classify the news value of a news article',
    parameters: {
      type: 'object',
      properties: {
        newsValue: {
          type: 'number',
          description: 'THe news value of the news article',
        },
      },
      required: ['newsValue'],
    },
  },
  getNewsArticleInformation: {
    name: 'getNewsArticleInformation',
    description: 'Gets information about the news article',
    parameters: {
      type: 'object',
      properties: {
        body: {
          type: 'string',
          description: `Write a short, informative, and simple news article without a headline and without mentioning your name. Make the article easy to read by adding paragraphs where needed. Also make the article engaging as if it's written by the best journalist in the world. Don't mention Ekot, Sveriges Radio or P4. The information is real and complete. Don't write that the article you're writing is fictional. No more information will be provided. Don't write that no more information will be provided. Write in English.`,
        },
        headline: {
          type: 'string',
          description: `Write a very short and engaging headline of a maximum of 8 words to hook the reader.`,
        },
        category: {
          type: 'string',
          description: `a single category the article can be associated with`,
        },
        imagePrompt: {
          type: 'string',
          description: `Description of an image to be associated with the news article. Make the description detailed. Don't make the image about a specific person. Try to be as objective as possible.`,
        },
        socialMediaHook: {
          type: 'string',
          description: `A short engaging facebook post with a hook for the article. The hook should start with an emoji followed by a space. No other emojis should be used.`,
        },
      },
      required: [
        'body',
        'headline',
        'category',
        'imagePrompt',
        'socialMediaHook',
      ],
    },
  },
  getTranslation: {
    name: 'getTranslation',
    description:
      'Translate a news article. Be very accurate in your translation.',
    parameters: {
      type: 'object',
      properties: {
        headline: {
          type: 'string',
          description: `The translated headline`,
        },
        category: {
          type: 'string',
          description: `The translated category`,
        },
        body: {
          type: 'string',
          description: `The translated article`,
        },
      },
      required: ['body', 'headline', 'category'],
    },
  },
  bestArticleToPublish: {
    name: 'bestArticleToPublish',
    description:
      'The article to publish that has the highest news value and the best social media hook to engage readers',
    parameters: {
      type: 'object',
      properties: {
        articleId: {
          type: 'number',
          description: 'The id of the article to publish',
        },
        socialMediaHook: {
          type: 'string',
          description:
            'The best social media hook to use for the current article',
        },
      },
      required: ['articleId', 'socialMediaHook'],
    },
  },
};

export const GPT_PROMPT_JOURNALIST = `You are a journalist who writes independent news articles. The news articles you write follow journalistic standards and are informative and engaging for the reader.`;
export const GPT_PROMPT_ASSISTANT = `You are a helpful assistant`;
export const GPT_PROMPT_TRANSLATOR = `You are an expert translator`;

export async function textIsRelatedToSweden(text: string): Promise<boolean> {
  const bodyContent = `INFORMATION:\n${text}\nEND OF INFORMATION.\nHelp me with classifying the information above. Is the information related to Sweden or not?`;

  const openAiBodyResponse = await openai.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: GPT_PROMPT_ASSISTANT,
      },
      {
        role: 'user',
        content: bodyContent,
      },
    ],
    functions: [FUNCTIONS.informationIsRelatedToSweden],
    function_call: {
      name: FUNCTIONS.informationIsRelatedToSweden.name,
    },
    model: 'gpt-3.5-turbo-1106',
    temperature: 0.7,
    max_tokens: 500,
  });

  const body = openAiBodyResponse.choices[0].message?.function_call?.arguments;

  const bodyObject = parseOpenAiJson(body as string);
  return bodyObject.isRelatedToSweden;
}

export async function articleNewsValue(text: string): Promise<number> {
  const bodyContent = `ARTICLE:\n${text}\nEND OF ARTICLE.\n Help me ditermin the news value of the article above from a scale of 0 to 10 where 10 means the article has the highest news value possible.`;

  const openAiBodyResponse = await openai.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: GPT_PROMPT_ASSISTANT,
      },
      {
        role: 'user',
        content: bodyContent,
      },
    ],
    functions: [FUNCTIONS.classifyNewValue],
    function_call: {
      name: FUNCTIONS.classifyNewValue.name,
    },
    model: 'gpt-3.5-turbo-1106',
    temperature: 0.7,
    max_tokens: 500,
  });

  const body = openAiBodyResponse.choices[0].message?.function_call?.arguments;

  const bodyObject = parseOpenAiJson(body as string);
  return bodyObject.newsValue;
}

export async function generateArticle(transcribedText: string) {
  // body
  const bodyContent = `INFORMATION: ${removeLastSentence(
    transcribedText,
  )} END OF INFORMATION. 

  Help me extract article information based on the information above.
  `;

  const openAiBodyResponse = await openai.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: GPT_PROMPT_JOURNALIST,
      },
      {
        role: 'user',
        content: bodyContent,
      },
    ],
    functions: [FUNCTIONS.getNewsArticleInformation],
    function_call: {
      name: FUNCTIONS.getNewsArticleInformation.name,
    },
    model: 'gpt-4-0613',
    temperature: 0.7,
    max_tokens: 1200,
  });

  const jsonString = openAiBodyResponse.choices[0].message?.function_call
    ?.arguments as string;

  const resJson = parseOpenAiJson(jsonString);

  const articleResponseSchema = z.object({
    body: z.string(),
    headline: z.string(),
    category: z.string(),
    imagePrompt: z.string(),
    socialMediaHook: z.string(),
  });

  return articleResponseSchema.parse(resJson);
}

type GenerateTranslation = {
  headline: string;
  body: string;
  category: string;
  language: string;
};

export async function generateTranslation({
  headline,
  body,
  category,
  language,
}: GenerateTranslation) {
  const bodyContent = `I require you to translate some text for me. Translate the following news article from English to ${getLanguageFromTwoLetters(
    language,
  )}. Be very accurate in your translation.

HEADLINE
${headline}
END OF HEADLINE

CATEGORY
${category}
END OF CATEGORY

ARTICLE:
${body}
END OF ARTICLE`;

  const openAiBodyResponse = await openai.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: GPT_PROMPT_TRANSLATOR,
      },
      {
        role: 'user',
        content: bodyContent,
      },
    ],
    functions: [FUNCTIONS.getTranslation],
    function_call: {
      name: FUNCTIONS.getTranslation.name,
    },
    model: 'gpt-3.5-turbo',
    temperature: 0.7,
    max_tokens: 1800,
  });

  const jsonString = openAiBodyResponse.choices[0].message?.function_call
    ?.arguments as string;

  // const sanitizedJsonString = jsonString.replace(/\t/g, '\\t');

  const resJson = parseOpenAiJson(jsonString);

  const translationResponseSchema = z.object({
    headline: z.string(),
    category: z.string(),
    body: z.string(),
  });

  return translationResponseSchema.parse(resJson);
}
