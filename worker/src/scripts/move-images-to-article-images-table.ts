import { db } from '../utils/db';

(async () => {
  const articles = await db
    .selectFrom('articles')
    .select(['id', 'imageUrl', 'imageIsAiGenerated', 'imagePrompt'])
    .where('articleImageId', 'is', null)
    .where('imageUrl', 'is not', null)
    .execute();

  for (const article of articles) {
    console.log('article: ', article);

    const { imageUrl, imageIsAiGenerated, imagePrompt } = article;

    const articleImage = await db
      .insertInto('articleImages')
      .values({
        articleId: article.id,
        imageUrl: imageUrl as string, // we know this is not null from the where statment above
        imageIsAiGenerated,
        imagePrompt,
      })
      .returning('id')
      .executeTakeFirstOrThrow();

    console.log('articleImage: ', articleImage);

    await db
      .updateTable('articles')
      .set({
        articleImageId: articleImage.id,
      })
      .where('id', '=', article.id)
      .execute();
  }

  console.log('done');
})();
