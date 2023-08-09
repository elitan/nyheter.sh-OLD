import { AxiosError } from 'axios';
import { Configuration, OpenAIApi } from 'openai';
import 'dotenv/config';

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
