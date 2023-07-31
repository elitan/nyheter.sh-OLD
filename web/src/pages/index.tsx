import { db } from "@/utils/db";
import { getFirstTwoSentences } from "@/utils/helpers";
import { formatDistanceToNowStrict } from "date-fns";
import { sv } from "date-fns/locale";

import type { InferGetServerSidePropsType, GetServerSideProps } from "next";

export const getServerSideProps = async () => {
  const articles = await db
    .selectFrom("articles")
    .select(["id", "createdAt", "title", "slug", "body"])
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
  console.log(props.articles);
  return (
    <main className='max-w-3xl mx-auto '>
      <div className='text-center py-12 text-3xl font-semibold uppercase'>
        Nyheter
      </div>
      <div className=''>
        {props.articles.map((article) => {
          if (
            !article.title ||
            !article.body ||
            !article.createdAt ||
            !article.slug
          ) {
            return;
          }

          const ago = formatDistanceToNowStrict(article.createdAt, {
            addSuffix: true,
          });

          const summary = getFirstTwoSentences(article.body);

          return (
            <div
              key={article.id}
              className='flex border-b border-gray-200 py-8'
            >
              <div className='w-56 text-xs text-gray-400'>{ago}</div>
              <div className='w-full'>
                <div className='w-full text-xl mb-1'>
                  <a href={`/nyheter/${article.slug}`}>{article.title}</a>
                </div>
                <div className='text-gray-700'>{summary}</div>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
};

export default Page;
