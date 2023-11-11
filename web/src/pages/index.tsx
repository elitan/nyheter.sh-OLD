import { ArticleSummaryLarge } from '@/components/ArticleSummaryLarge';
import { ArticleSummarySmall } from '@/components/ArticleSummarySmall';
import { MainContainer } from '@/components/MainContainer';
import { MostRead } from '@/components/MostRead';
import { db } from '@/utils/db';
import type { InferGetServerSidePropsType } from 'next';
import Link from 'next/link';

export async function getServerSideProps() {
  const lang = 'en';

  const articles = await db
    .selectFrom('articleTranslations as at')
    .innerJoin('articles as a', 'a.id', 'at.articleId')
    .innerJoin('articleImages as ai', 'a.articleImageId', 'ai.id')
    .select([
      'a.id',
      'a.createdAt',
      'at.title',
      'at.slug',
      'at.body',
      'at.category',
      'at.language',
      'ai.imageUrl',
    ])
    .where('at.title', 'is not', null)
    .where('at.isPublished', '=', true)
    .where('at.language', '=', lang)
    .orderBy('a.createdAt', 'desc')
    .limit(25)
    .execute();

  console.log({ articles });

  let today = new Date(); // get the current date
  let sevenDaysAgo = new Date(today); // create a copy of the current date

  sevenDaysAgo.setDate(today.getDate() - 7); // subtract 7 days

  const popularArticles = await db
    .selectFrom('articleTranslations as at')
    .innerJoin('articles as a', 'a.id', 'at.articleId')
    .innerJoin('articleImages as ai', 'a.articleImageId', 'ai.id')
    .select([
      'a.id',
      'a.createdAt',
      'at.title',
      'at.slug',
      'at.body',
      'at.category',
      'at.language',
      'ai.imageUrl',
    ])
    .where('at.title', 'is not', null)
    .where('at.isPublished', '=', true)
    .where('at.language', '=', lang)
    .where('at.createdAt', '>', sevenDaysAgo)
    .orderBy('at.pageViews', 'desc')
    .limit(8)
    .execute();

  return {
    props: {
      articles,
      popularArticles,
    },
  };
}

function HeaderIndex({
  articles,
}: {
  articles: InferGetServerSidePropsType<typeof getServerSideProps>['articles'];
}) {
  return (
    <div
      className="grid grid-cols-1 lg:grid-cols-2 lg:h-96 my-8"
      style={{ height: 600 }}
    >
      <div
        style={{
          backgroundImage: `url(${articles[0].imageUrl})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
        }}
      >
        <Link
          className="block relative bg-gradient-to-t from-gray-900 to-70%  w-full h-full p-5"
          href={`/nyheter/${articles[0].slug}`}
        >
          <p className="absolute bottom-5 text-white text-3xl lg:text-5xl drop-shadow-xl font-serif">
            {articles[0].title}
          </p>
        </Link>
      </div>
      <div className="grid grid-cols-1 h-full">
        <div
          style={{
            backgroundImage: `url(${articles[1].imageUrl})`,
            backgroundPosition: 'center',
            backgroundSize: 'cover',
          }}
        >
          <Link
            className="block relative bg-gradient-to-t from-gray-900 to-70%  w-full h-full p-5"
            href={`/nyheter/${articles[1].slug}`}
          >
            <p className="absolute bottom-5 text-white text-2xl lg:text-4xl drop-shadow-xl font-serif ">
              {articles[1].title}
            </p>
          </Link>
        </div>
        <div
          style={{
            backgroundImage: `url(${articles[2].imageUrl})`,
            backgroundPosition: 'center',
            backgroundSize: 'cover',
          }}
        >
          <Link
            className="block relative bg-gradient-to-t from-gray-900 to-70%  w-full h-full p-5"
            href={`/nyheter/${articles[2].slug}`}
          >
            <p className="absolute bottom-5 text-white text-2xl lg:text-4xl drop-shadow-xl font-serif ">
              {articles[2].title}
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}

const Page = (
  props: InferGetServerSidePropsType<typeof getServerSideProps>,
) => {
  // get first three articles
  // const firstThreeArticles = props.articles.slice(0, 3);

  const { articles, popularArticles } = props;

  return (
    <MainContainer>
      {/* <HeaderIndex articles={firstThreeArticles} /> */}
      <div className="grid grid-cols-11 gap-6">
        <div className="col-span-11 lg:col-span-7 bg-gray-50 shadow-md mb-12 divide-y divide-slate-200 last:pb-0 mt-12">
          {articles.map((article, i) => {
            if (i % 5 === 0) {
              return (
                <ArticleSummaryLarge article={article} key={article.slug} />
              );
            } else {
              return (
                <ArticleSummarySmall article={article} key={article.slug} />
              );
            }
          })}
        </div>
        <MostRead popularArticles={popularArticles} />
      </div>
    </MainContainer>
  );
};

export default Page;
