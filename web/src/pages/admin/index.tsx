import { MainContainer } from '@/components/MainContainer';
import { db } from '@/utils/db';
import { InferGetServerSidePropsType } from 'next';
import Link from 'next/link';

export const getServerSideProps = async () => {
  const articles = await db
    .selectFrom('articles')
    .select([
      'id',
      'createdAt',
      'title',
      'slug',
      'body',
      'imageUrl',
      'category',
    ])
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

export default function Page(
  props: InferGetServerSidePropsType<typeof getServerSideProps>,
) {
  return (
    <MainContainer>
      <div>
        {props.articles.map((article) => {
          return (
            <Link
              href={`/admin/${article.slug}`}
              key={article.id}
              className="hover:bg-slate-50 p-1 flex space-x-4"
            >
              <img src={article.imageUrl} className="h-16" />
              <div>{article.title}</div>
            </Link>
          );
        })}
      </div>
    </MainContainer>
  );
}
