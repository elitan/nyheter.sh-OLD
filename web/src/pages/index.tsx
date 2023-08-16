import { ArticleSummaryLarge } from '@/components/ArticleSummaryLarge';
import { ArticleSummarySmall } from '@/components/ArticleSummarySmall';
import { MainContainer } from '@/components/MainContainer';
import { db } from '@/utils/db';
import { sv } from 'date-fns/locale';
import type { InferGetServerSidePropsType } from 'next';
import Link from 'next/link';

export const getServerSideProps = async () => {
  const articles = await db
    .selectFrom('articles')
    .select(['id', 'createdAt', 'title', 'slug', 'body', 'imageUrl'])
    .where('title', 'is not', null)
    .where('isRelatedToSweden', '=', true)
    .orderBy('createdAt', 'desc')
    .limit(45)
    .execute();

  return {
    props: {
      articles,
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
  const firstThreeArticles = props.articles.slice(0, 3);

  const remainingArticles = props.articles.slice(3);

  return (
    <MainContainer>
      <HeaderIndex articles={firstThreeArticles} />
      <div className="grid grid-cols-10">
        <div className="col-span-10 lg:col-span-7 bg-gray-50 shadow-md p-4 mb-12">
          {remainingArticles.map((article, i) => {
            if (i !== 0 && i % 5 === 0) {
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

        <div className="hidden">asd</div>
      </div>
    </MainContainer>
  );
};

export default Page;
