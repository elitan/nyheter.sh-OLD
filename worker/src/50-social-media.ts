import { db } from './utils/db';
import { getFirstTwoSentences, postToFacebook } from './utils/helpers';
import { bestArticleToPublish } from './utils/openai';

(async () => {
  const currentDate = new Date();

  const articles = await db
    .selectFrom('articles as a')
    .select(['a.id', 'a.title', 'a.body', 'a.slug'])
    .where('isPublishedOnSocialMedia', '=', false)
    .where(
      'createdAt',
      '>',
      new Date(currentDate.getTime() - 12 * 60 * 60 * 1000),
    ) // 12 hours ago
    .orderBy('createdAt', 'desc')
    .limit(10)
    .execute();

  const articlesTmp: any[] = [];

  for (const article of articles) {
    console.log(article);

    const articleSocialMediaHooks = await db
      .selectFrom('articleSocialMediaHooks')
      .select(['hook'])
      .where('articleId', '=', article.id)
      .execute();

    let articleTmp: any = article;

    for (let i = 0; i < articleSocialMediaHooks.length; i++) {
      const { hook } = articleSocialMediaHooks[i];

      articleTmp = {
        ...articleTmp,
        body: getFirstTwoSentences(articleTmp.body),
        [`socialMediaHook${i}`]: hook,
      };
    }
    articlesTmp.push(articleTmp);
  }

  console.log(articlesTmp);

  const r = await bestArticleToPublish(JSON.stringify(articlesTmp));

  console.log(r);

  const article = articles.find((a) => a.id === r.articleId);

  if (!article) {
    throw new Error('article not found');
  }

  // r.socialMediaHook
  const url = `https://nyheter.sh/nyheter/${article.slug}`;

  // publish
  const postToFacebookResult = await postToFacebook(r.socialMediaHook, url);

  console.log({ postToFacebookResult });

  await db
    .updateTable('articles')
    .set({
      isPublishedOnSocialMedia: true,
    })
    .where('id', '=', r.articleId)
    .execute();

  process.exit(0);
})();
