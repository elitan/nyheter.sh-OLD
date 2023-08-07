import { db } from "@/utils/db";
import { getFirstTwoSentences } from "@/utils/helpers";
import { format } from "date-fns";
import { sv } from "date-fns/locale";

import type { InferGetServerSidePropsType } from "next";
import { twMerge } from "tailwind-merge";

export const getServerSideProps = async () => {
  const articles = await db
    .selectFrom("articles")
    .select(["id", "createdAt", "title", "slug", "body", "imageUrl"])
    .where("title", "is not", null)
    .orderBy("createdAt", "desc")
    .limit(50)
    .execute();

  return {
    props: {
      articles,
    },
  };
};

const Page = (
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) => {
  return (
    <main className='max-w-4xl mx-auto px-2 '>
      <div className='text-center py-12 text-2xl prose-lg'>
        <h1>Swedish news in English</h1>
      </div>
      <div className='grid grid-cols-2 gap-8'>
        {props.articles.map((article, i) => {
          if (
            !article.title ||
            !article.body ||
            !article.createdAt ||
            !article.slug
          ) {
            return;
          }

          const formattedDate = format(article.createdAt, "yyyy-MM-dd HH:mm", {
            locale: sv,
          });

          const summary = getFirstTwoSentences(article.body);

          const mainContainerClasses = twMerge(
            `flex my-4 space-x-4 md:col-span-1 col-span-2`,
            i < 2 && `col-span-2`
          );

          const imageContainerClasses = twMerge(
            `border border-gray-200 rounded-lg h-56`,
            i < 2 && `h-96 md:h-56`
          );

          return (
            <div key={article.id} className={mainContainerClasses}>
              <a
                className='w-full hover:bg-slate-50 rounded-lg p-1'
                href={`/nyheter/${article.slug}`}
              >
                <div
                  className={imageContainerClasses}
                  style={{
                    backgroundImage: `url(${article.imageUrl})`,
                    backgroundPosition: "center",
                    backgroundSize: "cover",
                  }}
                />
                <div className='py-3'>
                  <h1 className='w-full text-xl mb-1 prose-h1:'>
                    {article.title}
                  </h1>
                  <p className='text-gray-700 line-clamp-2 prose-lg'>
                    {summary}
                  </p>
                  <div className='flex justify-between mt-2 items-baseline'>
                    <div className='flex items-center space-x-1 mt-2 font-semibold text-gray-800'>
                      <div>Read more</div>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        fill='none'
                        viewBox='0 0 24 24'
                        strokeWidth={3}
                        stroke='currentColor'
                        className='w-3 h-3'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          d='M8.25 4.5l7.5 7.5-7.5 7.5'
                        />
                      </svg>
                    </div>
                    <div className='text-xs text-gray-400'>{formattedDate}</div>
                  </div>
                </div>
              </a>
            </div>
          );
        })}
      </div>
    </main>
  );
};

export default Page;
