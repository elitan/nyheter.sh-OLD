import { ArticleSummaryLarge } from '@/components/ArticleSummaryLarge';
import { ArticleSummarySmall } from '@/components/ArticleSummarySmall';
import { MainContainer } from '@/components/MainContainer';
import { db } from '@/utils/db';
import type { InferGetServerSidePropsType } from 'next';
import Link from 'next/link';

export const getServerSideProps = async () => {
  const articles = await db
    .selectFrom('articles')
    .innerJoin('articleImages', 'articles.articleImageId', 'articleImages.id')
    .select([
      'articles.id',
      'articles.createdAt',
      'articles.title',
      'articles.slug',
      'articles.body',
      'articles.category',
      'articleImages.imageUrl',
    ])
    .where('title', 'is not', null)
    .where('isPublished', '=', true)
    .orderBy('createdAt', 'desc')
    .limit(25)
    .execute();

  let today = new Date(); // get the current date
  let sevenDaysAgo = new Date(today); // create a copy of the current date

  sevenDaysAgo.setDate(today.getDate() - 7); // subtract 7 days

  const popularArticles = await db
    .selectFrom('articles')
    .innerJoin('articleImages', 'articles.articleImageId', 'articleImages.id')
    .select([
      'articles.id',
      'articles.createdAt',
      'articles.title',
      'articles.slug',
      'articles.body',
      'articles.category',
      'articleImages.imageUrl',
    ])
    .where('title', 'is not', null)
    .where('isPublished', '=', true)
    .where('articles.createdAt', '>', sevenDaysAgo)
    .orderBy('pageViews', 'desc')
    .limit(8)
    .execute();

  console.log(articles);

  return {
    props: {
      articles,
      popularArticles,
    },
  };
};

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
        <div className="lg:col-span-4 mt-12 bg-gray-50 shadow-md p-4 self-start">
          <div className="font-bold text-xl">Mest lästa</div>
          <div className="space-y-4 mt-4 pt-4 border-t">
            {popularArticles.map((article) => {
              return (
                <Link
                  href={`/nyheter/${article.slug}`}
                  key={article.id}
                  className="space-x-4 flex"
                >
                  <div
                    className={`border border-gray-200 rounded-md w-20 h-20 flex-shrink-0 `}
                    style={{
                      backgroundImage: `url(${article.imageUrl})`,
                      backgroundPosition: 'center',
                      backgroundSize: 'cover',
                    }}
                  />
                  <div>
                    <div className="font-semibold font-serif group-hover:text-gray-500 text-sm">
                      {article.title}
                    </div>
                    <div className="flex mr-6 mt-3">
                      <p className="text-cyan-700 text-xs">
                        {article.category}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </MainContainer>
  );
};

export default Page;
