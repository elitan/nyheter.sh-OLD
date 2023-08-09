import { MainContainer } from '@/components/MainContainer';
import { db } from '@/utils/db';
import { getFirstTwoSentences } from '@/utils/helpers';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';

import type { InferGetServerSidePropsType } from 'next';
import Link from 'next/link';
import { twMerge } from 'tailwind-merge';

export const getServerSideProps = async () => {
  const articles = await db
    .selectFrom('articles')
    .select(['id', 'createdAt', 'title', 'slug', 'body', 'imageUrl'])
    .where('title', 'is not', null)
    .where('isRelatedToSweden', '=', true)
    .orderBy('createdAt', 'desc')
    .limit(50)
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
    <div className="grid grid-cols-2 h-96 my-8" style={{ height: 600 }}>
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
          <p className="absolute bottom-5 text-white text-5xl font-semibold drop-shadow-xl ">
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
            <p className="absolute bottom-5 text-white text-5xl font-semibold drop-shadow-xl ">
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
            <p className="absolute bottom-5 text-white text-5xl font-semibold drop-shadow-xl ">
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
      <div className="grid grid-cols-2 gap-8">
        {remainingArticles.map((article, i) => {
          if (
            !article.title ||
            !article.body ||
            !article.createdAt ||
            !article.slug
          ) {
            return;
          }

          const formattedDate = format(article.createdAt, 'yyyy-MM-dd HH:mm', {
            locale: sv,
          });

          const summary = getFirstTwoSentences(article.body);

          const mainContainerClasses = twMerge(
            `flex my-4 space-x-4 md:col-span-1 col-span-2`,
            i < 2 && `col-span-2`,
          );

          const imageContainerClasses = twMerge(
            `border border-gray-200 rounded-lg h-56`,
            i < 2 && `h-96 md:h-56`,
          );

          return (
            <div key={article.id} className={mainContainerClasses}>
              <Link
                className="w-full rounded-lg p-1"
                href={`/nyheter/${article.slug}`}
              >
                <div
                  className={imageContainerClasses}
                  style={{
                    backgroundImage: `url(${article.imageUrl})`,
                    backgroundPosition: 'center',
                    backgroundSize: 'cover',
                  }}
                />
                <div className="py-3">
                  <h1 className="w-full text-xl mb-1 prose-h1:">
                    {article.title}
                  </h1>
                  <p className="text-gray-700 line-clamp-2 prose-lg">
                    {summary}
                  </p>
                  <div className="flex justify-between mt-2 items-baseline">
                    <div className="flex items-center space-x-1 mt-2 font-semibold text-gray-800">
                      <div>Read more</div>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={3}
                        stroke="currentColor"
                        className="w-3 h-3"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8.25 4.5l7.5 7.5-7.5 7.5"
                        />
                      </svg>
                    </div>
                    {/* <div className='text-xs text-gray-400'>AI</div> */}
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </MainContainer>
  );
};

export default Page;
