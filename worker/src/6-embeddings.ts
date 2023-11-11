import { db } from './utils/db';
import { openai } from './utils/openai';

async function main() {
  const articles = await db
    .selectFrom('articleTranslations as at')
    .innerJoin('articles as a', 'a.id', 'at.articleId')
    .select(['a.id as articleId', 'at.title', 'at.body'])
    .where('a.embedding', 'is', null)
    .where('at.language', '=', 'en')
    .orderBy('a.id', 'desc')
    .execute();

  for (const article of articles) {
    console.log(`Generate embedding for ${article.title}`);

    const text = article.title + ' ' + article.body;

    const res = await openai.embeddings.create({
      input: text,
      model: 'text-embedding-ada-002',
    });

    if (res.data.length === 0) {
      console.log('no embeddings received from openai');
      continue;
    }

    const { embedding } = res.data[0];

    await db
      .updateTable('articles')
      .set({
        embedding: `[${embedding.toString()}]`,
      })
      .where('id', '=', article.articleId)
      .execute();
  }
}

main();
