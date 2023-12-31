import { ChevronRightIcon } from '@heroicons/react/20/solid';
import { MainContainer } from '@/components/MainContainer';
import { db } from '@/utils/db';
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import Link from 'next/link';
import {
  getFirstTwoSentences,
  isAllowedAdminUserId,
  renderAgo,
} from '@/utils/helpers';
import { AdminMenu } from '@/components/AdminMenu';
import { getAuth } from '@clerk/nextjs/server';

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const { userId }: { userId: string | null } = getAuth(ctx.req);

  if (!userId || !isAllowedAdminUserId(userId)) {
    throw new Error('Unauthorized');
  }

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
      'articles.isPublished',
      'articles.isPublishedOnSocialMedia',
      'articleImages.imageUrl',
    ])
    .where('title', 'is not', null)
    .where('isRelatedToSweden', '=', true)
    .orderBy('createdAt', 'desc')
    .limit(200)
    .execute();

  return {
    props: {
      articles,
    },
  };
};

export default function Page(
  props: InferGetServerSidePropsType<typeof getServerSideProps>,
) {
  return (
    <MainContainer className="my-6">
      <AdminMenu />
      <div className="max-w-4xl mx-auto">
        <ul
          role="list"
          className="divide-y divide-gray-100 overflow-hidden bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl my-4"
        >
          {props.articles.map((article) => {
            if (
              !article.title ||
              !article.body ||
              !article.createdAt ||
              !article.slug
            ) {
              return;
            }

            const summary = getFirstTwoSentences(article.body);

            return (
              <li
                key={article.id}
                className="relative flex justify-between py-5 hover:bg-slate-50 transition-all duration-150 ease-in-out px-4"
              >
                <div className="flex flex-grow items-center gap-x-4 pr-6">
                  <img
                    className="h-16 w-24 flex-none rounded-sm bg-gray-50 object-cover"
                    src={article.imageUrl ?? ''}
                    alt=""
                  />
                  <div className="min-w-0 flex-grow">
                    <p className="text-lg font-semibold leading-6 text-gray-900">
                      <Link href={`/admin/${article.slug}`}>
                        <span className="absolute inset-x-0 -top-px bottom-0" />
                        {article.title}
                      </Link>
                    </p>
                    <div className="flex gap-x-6">
                      <div className="mt-1 flex items-center gap-x-1.5">
                        {article.isPublished ? (
                          <>
                            <div className="flex-none rounded-full bg-emerald-500/20 p-1">
                              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            </div>
                            <p className="text-xs leading-5 text-gray-500">
                              Published
                            </p>
                          </>
                        ) : (
                          <>
                            <div className="flex-none rounded-full bg-rose-500/20 p-1">
                              <div className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                            </div>
                            <p className="text-xs leading-5 text-gray-500">
                              Not published
                            </p>
                          </>
                        )}
                      </div>

                      <div className="mt-1 hidden flex items-center gap-x-1.5">
                        {article.isPublishedOnSocialMedia ? (
                          <>
                            <div className="flex-none rounded-full bg-emerald-500/20 p-1">
                              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            </div>
                            <p className="text-xs leading-5 text-gray-500">
                              Published on social media
                            </p>
                          </>
                        ) : (
                          <>
                            <div className="flex-none rounded-full bg-rose-500/20 p-1">
                              <div className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                            </div>
                            <p className="text-xs leading-5 text-gray-500">
                              Not published on social media
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-x-4 flex-shrink-0">
                  <div className="hidden sm:block">
                    {article.createdAt ? (
                      <p className="mt-1 text-xs leading-5 text-gray-500">
                        {renderAgo(article.createdAt as Date)}
                      </p>
                    ) : (
                      <div className="mt-1 flex items-center gap-x-1.5">
                        <div className="flex-none rounded-full bg-emerald-500/20 p-1">
                          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        </div>
                        <p className="text-xs leading-5 text-gray-500">
                          Online
                        </p>
                      </div>
                    )}
                  </div>
                  <ChevronRightIcon
                    className="h-5 w-5 flex-none text-gray-400"
                    aria-hidden="true"
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </MainContainer>
  );
}
