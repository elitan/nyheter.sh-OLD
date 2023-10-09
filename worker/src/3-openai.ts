import slugify from 'slugify';

import { db } from './utils/db';
import { generateArticle, textIsRelatedToSweden } from './utils/openai';

(async () => {
  const articlesToRefine = await db
    .selectFrom('articles')
    .select(['id', 'transcribedText'])
    .where('isRelatedToSweden', 'is', null)
    .where('transcribedText', 'is not', null)
    .orderBy('id', 'asc')
    .execute();

  for (const article of articlesToRefine) {
    console.log('article: ', article);

    if (!article.transcribedText) {
      throw new Error('article.transcribedText is null');
    }

    console.log('check if the source information is related to sweden');

    // check if the article is related to sweden or not
    let isRelatedToSweden = false;
    try {
      isRelatedToSweden = await textIsRelatedToSweden(
        article.transcribedText as string,
      );
    } catch (e) {
      console.error('error: ', e);
      continue;
    }

    await db
      .updateTable('articles')
      .set({
        isRelatedToSweden,
        isPublished: true,
      })
      .where('id', '=', article.id)
      .execute();

    if (!isRelatedToSweden) {
      console.log(`skipping this article because it's not related to Sweden`);
      continue;
    }

    console.log('generate article...');

    let generatedArticle = null;
    try {
      generatedArticle = await generateArticle(article.transcribedText);
    } catch (e) {
      console.error(e);
      continue;
    }

    console.log('article generation compelted');

    let {
      headline: title,
      body,
      category,
      imagePrompt,
      socialMediaHook1,
      socialMediaHook2,
      socialMediaHook3,
    } = generatedArticle;

    console.log('replace optional quotes in the title');

    // remove optional quotes in the beginnning and end of the title
    title = title?.replace(/^"/, '');
    title = title?.replace(/"$/, '');

    console.log('slugify the title');
    const slug = slugify(title, {
      lower: true,
      strict: true,
    });

    console.log('insert the article');
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

    console.log('insert the hooks');
    await db
      .insertInto('articleSocialMediaHooks')
      .values([
        {
          articleId: article.id,
          hook: socialMediaHook1,
        },
        {
          articleId: article.id,
          hook: socialMediaHook2,
        },
        {
          articleId: article.id,
          hook: socialMediaHook3,
        },
      ])
      .execute();
  }

  console.log('done');

  process.exit(0);
})();
