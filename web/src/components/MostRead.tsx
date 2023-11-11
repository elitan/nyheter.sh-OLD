import { getServerSideProps } from '@/pages';
import { languages } from '@/utils/helpers';
import { InferGetServerSidePropsType } from 'next';
import Link from 'next/link';

interface Props {
  popularArticles: InferGetServerSidePropsType<
    typeof getServerSideProps
  >['popularArticles'];
}

export function MostRead(props: Props) {
  const { popularArticles } = props;

  const mostReadTranslation = languages[popularArticles[0].language].mostRead;

  return (
    <div className="lg:col-span-4 mt-12 bg-gray-50 shadow-md p-4 self-start">
      <div className="font-bold text-xl">{mostReadTranslation}</div>
      <div className="space-y-4 mt-4 pt-4 border-t">
        {popularArticles.map((article) => {
          return (
            <Link
              href={`/${article.language}/${article.slug}`}
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
                  <p className="text-cyan-700 text-xs">{article.category}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
