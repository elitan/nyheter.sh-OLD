import { db } from './utils/db';
import { generateArticle, textIsRelatedToSweden } from './utils/openai';
import slugify from 'slugify';

(async () => {
  const articlesToRefine = await db
    .selectFrom('articles')
    .select(['id', 'transcribedText'])
    .where('isRelatedToSweden', 'is', null)
    .orderBy('id', 'asc')
    .execute();

  for (const article of articlesToRefine) {
    console.log('article: ', article);

    if (!article.transcribedText) {
      throw new Error('article.transcribedText is null');
    }

    console.log('check if the source information is related to sweden');

    // check if the article is related to sweden or not
    const isRelatedToSweden = await textIsRelatedToSweden(
      article.transcribedText as string,
    );

    console.log({ isRelatedToSweden });

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

    console.log('generate article...');

    const generatedArticle = await generateArticle(article.transcribedText);

    let { headline: title, body, category, imagePrompt } = generatedArticle;

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
        category,
        imagePrompt,
      })
      .where('id', '=', article.id)
      .executeTakeFirst();
  }

  console.log('done');

  process.exit(0);
})();
