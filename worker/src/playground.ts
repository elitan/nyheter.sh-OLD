import 'dotenv/config';
import { db } from './utils/db';
import { FUNCTIONS, GPT_PROMPT_JOURNALIST, openai } from './utils/openai';
import { AxiosError } from 'axios';
import { removeLastSentence } from './utils/helpers';

(async () => {
  try {
    const article = await db
      .selectFrom('articles')
      .select(['id', 'transcribedText'])
      .where('id', '=', 996)
      .executeTakeFirstOrThrow();

    const bodyContent = `INFORMATION: ${removeLastSentence(
      article.transcribedText as string,
    )} END OF INFORMATION.\n Help me extract article information based on the information above."
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
      functions: [FUNCTIONS.getNewsArticleInformation],
      function_call: {
        name: FUNCTIONS.getNewsArticleInformation.name,
      },
      model: 'gpt-4',
      temperature: 0.7,
      max_tokens: 1200,
    });

    const res = openAiBodyResponse.data.choices[0].message?.function_call
      ?.arguments as string;

    console.log(res);

    const resJson = JSON.parse(res);

    const r = console.log({ resJson });
    console.log('done');
  } catch (error) {
    console.log('ERROR!!!!');

    const e = error as AxiosError;
    console.log(e.cause);
    console.log(e.message);
    console.log(e.response?.data);
  }
})();
