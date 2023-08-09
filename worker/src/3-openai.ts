import { db } from './utils/db';
import {
  GPT_PROMPT_JOURNALIST,
  openai,
  textIsRelatedToSweden,
} from './utils/openai';
import slugify from 'slugify';

/**
 * Removes the last sentence from a string.
 */
function removeLastSentence(str: string) {
  let sentences = str.match(/[^.!?]+[.!?]*/g); // matches sentences ending with ., ! or ?
  if (sentences) {
    sentences.pop(); // removes the last sentence
    return sentences.join('');
  }
  return str;
}

(async () => {
  const articlesToRefine = await db
    .selectFrom('articles')
    .select(['id', 'transcribedText'])
    .where('isRelatedToSweden', 'is', null)
    .where('transcribedText', 'is not', null)
    .where('body', 'is', null)
    .orderBy('id', 'asc')
    .execute();

  for (const article of articlesToRefine) {
    console.log('article: ', article);

    // check if the article is related to sweden or not
    const isRelatedToSweden = await textIsRelatedToSweden(
      article.transcribedText as string,
    );

    await db
      .updateTable('articles')
      .set({
        isRelatedToSweden,
      })
      .where('id', '=', article.id)
      .execute();

    if (!isRelatedToSweden) {
      console.log(`skipping this article because it's not related to Sweden`);
      continue;
    }

    // body
    const bodyContent = `INFORMATION: ${removeLastSentence(
      article.transcribedText!,
    )} END OF INFORMATION. Write a short, informative and simple news article without a headline and without mentioning your name. Make the article easy to read by adding paragraphs where needed. Don't mention Ekot, Sveriges Radio or P4. The information is real and complete. Don't write that the article you're writing is fictional. No more information will be provided. Don't write that no more information will be provided. Write in English.`;

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
      model: 'gpt-3.5-turbo',
      temperature: 0.5,
      max_tokens: 1200,
    });

    const body = openAiBodyResponse.data.choices[0].message?.content;
    console.log('body: ', body);

    // title
    const titleContent = `Write a very short headline of a maximum of 8 words for the following news article:

    ${body}`;

    const openAiTitleResponse = await openai.createChatCompletion({
      messages: [
        {
          role: 'system',
          content: GPT_PROMPT_JOURNALIST,
        },
        {
          role: 'user',
          content: titleContent,
        },
      ],
      model: 'gpt-3.5-turbo',
      temperature: 0.5,
      max_tokens: 1200,
    });

    let title = openAiTitleResponse.data.choices[0].message?.content as string;

    // remove optional quotes in the beginnning and end of the title
    title = title?.replace(/^"/, '');
    title = title?.replace(/"$/, '');

    const slug = slugify(title, {
      lower: true,
      strict: true,
    });

    await db
      .updateTable('articles')
      .set({
        title,
        slug,
        body,
      })
      .where('id', '=', article.id)
      .executeTakeFirst();
  }

  console.log('done');

  process.exit(0);
})();
