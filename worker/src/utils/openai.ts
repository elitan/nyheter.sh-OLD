import { OpenAI } from 'openai';
import { z } from 'zod';

import 'dotenv/config';
import { removeLastSentence } from './helpers';

const openai = new OpenAI({
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
        socialMediaHook1: {
          type: 'string',
          description: `A short engaging facebook post with a hook for the article. The hook should start with an emoji followed by a space. No other emojis should be used.`,
        },
        socialMediaHook2: {
          type: 'string',
          description: `An engaging facebook post with a hook for the article. The hook should start with an emoji followed by a space. No other emojis should be used.`,
        },
        socialMediaHook3: {
          type: 'string',
          description: `An engaging facebook post with a hook for the article. The hook should start with an emoji followed by a space. No other emojis should be used.`,
        },
      },
      required: [
        'body',
        'headline',
        'category',
        'imagePrompt',
        'socialMediaHook1',
        'socialMediaHook2',
        'socialMediaHook3',
      ],
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
    model: 'gpt-3.5-turbo',
    temperature: 0.7,
    max_tokens: 500,
  });

  const body = openAiBodyResponse.choices[0].message?.function_call?.arguments;

  const bodyObject = JSON.parse(body as string);
  return bodyObject.isRelatedToSweden;
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
    model: 'gpt-4',
    temperature: 0.7,
    max_tokens: 1200,
  });

  const jsonString = openAiBodyResponse.choices[0].message?.function_call
    ?.arguments as string;

  console.log(openAiBodyResponse.choices[0].message);
  console.log(jsonString);

  const sanitizedJsonString = jsonString.replace(/\t/g, '\\t');

  const resJson = JSON.parse(sanitizedJsonString);

  const articleResponseSchema = z.object({
    body: z.string(),
    headline: z.string(),
    category: z.string(),
    imagePrompt: z.string(),
    socialMediaHook1: z.string(),
    socialMediaHook2: z.string(),
    socialMediaHook3: z.string(),
  });

  return articleResponseSchema.parse(resJson);
}

export async function bestArticleToPublish(
  content: any,
): Promise<{ articleId: number; socialMediaHook: string }> {
  const bodyContent = `INFORMATION:\n${content}\nEND OF INFORMATION.\nHelp me decide what news article to publish based on the title, body and social media hook. I want you to pick the news article that has the best potential to engage users on social media.`;

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
    functions: [FUNCTIONS.bestArticleToPublish],
    function_call: {
      name: FUNCTIONS.bestArticleToPublish.name,
    },
    model: 'gpt-3.5-turbo',
    temperature: 0.7,
    max_tokens: 1200,
  });

  const body = openAiBodyResponse.choices[0].message?.function_call?.arguments;

  const resJson = JSON.parse(body as string);

  const responseSchema = z.object({
    articleId: z.number(),
    socialMediaHook: z.string(),
  });

  return responseSchema.parse(resJson);
}
