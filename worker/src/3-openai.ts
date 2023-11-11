import slugify from 'slugify';

import { db } from './utils/db';
import {
  articleNewsValue,
  generateArticle,
  generateTranslation,
  textIsRelatedToSweden,
} from './utils/openai';
import { translate } from './utils/helpers';

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

    // check if the article is related to sweden or not
    console.log('Check if the source information is related to sweden');
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
      })
      .where('id', '=', article.id)
      .execute();

    if (!isRelatedToSweden) {
      console.log(`skipping this article because it's not related to Sweden`);
      continue;
    }

    // check what's the news value of the article
    console.log('Check the articles news value');
    let newsValue = -1;
    try {
      newsValue = await articleNewsValue(article.transcribedText as string);
    } catch (e) {
      console.error('error: ', e);
      continue;
    }

    console.log('newsValue: ', newsValue);

    if (newsValue < 7) {
      console.log(
        `skipping this article because it's news value is too low: ${newsValue}`,
      );
      continue;
    }

    console.log('Generate article...');

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
      socialMediaHook,
    } = generatedArticle;

    // update main article with the image prompt
    await db
      .updateTable('articles')
      .set({
        imagePrompt,
      })
      .where('id', '=', article.id)
      .execute();

    console.log('replace optional quotes in the title');

    // remove optional quotes in the beginnning and end of the title
    title = title?.replace(/^"/, '');
    title = title?.replace(/"$/, '');

    console.log('slugify the title');
    const slug = slugify(title, {
      lower: true,
      strict: true,
    });

    console.log('insert the article translations');
    await db
      .insertInto('articleTranslations')
      .values({
        articleId: article.id,
        language: 'en',
        title,
        slug,
        body,
        category,
        socialMediaHook: socialMediaHook,
        isPublished: true,
      })
      .execute();

    const languages = ['fi', 'ar', 'ckb', 'so', 'ru', 'uk', 'fa'];
    for (const language of languages) {
      console.log(`generate article in ${language}`);

      const headlineTranslated = await translate({
        from: 'en',
        to: language,
        text: title,
      });

      const bodyTranslated = await translate({
        from: 'en',
        to: language,
        text: body,
      });

      const categoryTranslated = await translate({
        from: 'en',
        to: language,
        text: category,
      });

      await db
        .insertInto('articleTranslations')
        .values({
          articleId: article.id,
          language: language,
          title: headlineTranslated,
          slug: slugify(headlineTranslated, {
            lower: true,
            strict: true,
          }),
          body: bodyTranslated,
          category: categoryTranslated,
          isPublished: true,
        })
        .execute();
    }
  }

  console.log('done');

  process.exit(0);
})();
