import { ArticleSummaryLarge } from '@/components/ArticleSummaryLarge';
import { ArticleSummarySmall } from '@/components/ArticleSummarySmall';
import { MainContainer } from '@/components/MainContainer';
import { db } from '@/utils/db';
import type { InferGetServerSidePropsType } from 'next';
import { type ParsedUrlQuery } from 'querystring';
import Link from 'next/link';
import { MostRead } from '@/components/MostRead';

interface IParams extends ParsedUrlQuery {
  lang: string;
}

export async function getServerSideProps({ params }: { params: IParams }) {
  const { lang } = params;

  if (lang === 'en') {
    return {
      redirect: {
        destination: '/',
        permanent: true,
      },
    };
  }

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
      lang,
    },
  };
}

const Page = (
  props: InferGetServerSidePropsType<typeof getServerSideProps>,
) => {
  // get first three articles
  // const firstThreeArticles = props.articles.slice(0, 3);

  const { articles, popularArticles, lang } = props;

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
