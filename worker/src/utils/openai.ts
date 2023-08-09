import { Configuration, OpenAIApi } from 'openai';
import 'dotenv/config';
import { z } from 'zod';
import { removeLastSentence } from './helpers';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

export const openai = new OpenAIApi(configuration);

export const GPT_PROMPT_JOURNALIST = `You are a journalist who writes independent news articles. The news articles you write follow journalistic standards and are informative and engaging for the reader.`;
export const GPT_PROMPT_ASSISTANT = `You are a helpful assistant`;

export async function textIsRelatedToSweden(text: string): Promise<boolean> {
  const bodyContent = `INFORMATION:\n${text}\nEND OF INFORMATION.\nHelp me with classifying this. I want to know the following:

- Is the information related to Sweden or not?

Respond in the following JSON format:

{
  "isRelatedToSweden": <BOOLEAN>
}`;

  const openAiBodyResponse = await openai.createChatCompletion({
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
    model: 'gpt-3.5-turbo',
    temperature: 0.7,
    max_tokens: 500,
  });

  const body = openAiBodyResponse.data.choices[0].message?.content;

  const bodyObject = JSON.parse(body as string);
  return bodyObject.isRelatedToSweden;
}

export async function generateArticle(transcribedText: string) {
  // body
  const bodyContent = `INFORMATION: ${removeLastSentence(
    transcribedText,
  )} END OF INFORMATION. 

Help me with the following: Answer ONLY using the JSON format below. The instructions are inside the json format for you to complete. Format line breaks correctly inside the json format.

{
  "body": "Write a short, informative, and simple news article without a headline and without mentioning your name. Make the article easy to read by adding paragraphs where needed. Don't mention Ekot, Sveriges Radio or P4. The information is real and complete. Don't write that the article you're writing is fictional. No more information will be provided. Don't write that no more information will be provided. Write in English"
  "headline": "Write a very short and engaging headline of a maximum of 8 words",
  "category": "a single category the article can be associated with",
  "imagePrompt": "description of an image to be associated with the news article. Make the description detailed"
}`;
  const openAiBodyResponse = await openai.createChatCompletion({
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
    model: 'gpt-4',
    temperature: 0.7,
    max_tokens: 1200,
  });

  console.log(openAiBodyResponse.data.choices[0].message?.content as string);

  const response = JSON.parse(
    openAiBodyResponse.data.choices[0].message?.content as string,
  );

  console.log('response', response);

  const articleResponseSchema = z.object({
    body: z.string(),
    headline: z.string(),
    category: z.string(),
    imagePrompt: z.string(),
  });

  return articleResponseSchema.parse(response);
}
