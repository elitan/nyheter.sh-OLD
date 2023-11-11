import slugify from 'slugify';
import { db } from './utils/db';
import { translate } from './utils/helpers';

async function main() {
  // get all articles that are not yet translated
  const articlesToTranslate = await db
    .selectFrom('articles')
    .select(['id', 'audioUrl'])
    .where('audioUrl', 'is not', null)
    .execute();

  for (const articleToTranslate of articlesToTranslate) {
    console.log({ articleToTranslate });

    const { id, audioUrl } = articleToTranslate;

    if (!audioUrl) {
      console.log('audioUrl is null');
      continue;
    }

    await db
      .updateTable('articleTranslations')
      .set({
        audioUrl,
      })
      .where('articleId', '=', id)
      .where('language', '=', 'en')
      .execute();
  }

  // insert the en version

  //   await db
  //     .insertInto('articleTranslations')
  //     .values({
  //       articleId: id,
  //       language: 'en',
  //       title,
  //       slug,
  //       body,
  //       category,
  //       isPublished: true,
  //     })
  //     .execute();

  //   const languages = [
  //     'fi',
  //     'ar',
  //     'ckb',
  //     'so',
  //     'ru',
  //     'uk',
  //     'fa',
  //     'es',
  //     'de',
  //     'fr',
  //   ];
  //   for (const language of languages) {
  //     console.log(`generate article in ${language}`);

  //     const headlineTranslated = await translate({
  //       from: 'en',
  //       to: language,
  //       text: title,
  //     });

  //     const bodyTranslated = await translate({
  //       from: 'en',
  //       to: language,
  //       text: body,
  //     });

  //     const categoryTranslated = await translate({
  //       from: 'en',
  //       to: language,
  //       text: category,
  //     });

  //     await db
  //       .insertInto('articleTranslations')
  //       .values({
  //         articleId: id,
  //         language: language,
  //         title: headlineTranslated,
  //         slug: slugify(headlineTranslated, {
  //           lower: true,
  //           strict: true,
  //         }),
  //         body: bodyTranslated,
  //         category: categoryTranslated,
  //         isPublished: true,
  //       })
  //       .execute();
  //   }
  // }

  console.log(articlesToTranslate.length);
}

main();
