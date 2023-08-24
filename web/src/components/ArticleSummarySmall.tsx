import { format } from 'date-fns';
import { sv } from 'date-fns/locale';
import { getFirstTwoSentences, renderAgo } from '@/utils/helpers';
import Link from 'next/link';
import { Article } from '@/utils/types';

export function ArticleSummarySmall({ article }: { article: any }) {
  if (!article.title || !article.body || !article.createdAt || !article.slug) {
    return;
  }

  article = article as Article;

  // const formattedDate = format(article.createdAt, 'yyyy-MM-dd HH:mm', {
  //   locale: sv,
  // });

  const summary = getFirstTwoSentences(article.body);

  return (
    <div
      key={article.id}
      className={`flex space-x-4 md:col-span-1 col-span-2 py-1 lg:py-4 group`}
    >
      <Link
        className="w-full rounded-lg p-1 flex justify-between space-x-4 items-start"
        href={`/nyheter/${article.slug}`}
      >
        <div className="py-1 lg:py-3">
          <h1 className="w-full text-lg lg:text-xl mb-1 font-semibold font-serif group-hover:text-gray-500">
            {article.title}
          </h1>
          <p className="text-gray-700 line-clamp-2 font-serif">{summary}</p>
          <div className="flex mr-6 mt-3 ">
            <div>
              <p className="text-gray-500 text-xs">
                {renderAgo(article.createdAt as Date)}
              </p>
            </div>

            <div className="mx-2 text-xs">·</div>
            <div>
              <p className="text-cyan-700 text-xs">{article.category}</p>
            </div>
          </div>
        </div>
        <div>
          <div
            className={`border border-gray-200 rounded-md w-28 h-28 md:w-36 md:h-36`}
            style={{
              backgroundImage: `url(${article.imageUrl})`,
              backgroundPosition: 'center',
              backgroundSize: 'cover',
            }}
          />
        </div>
      </Link>
    </div>
  );
}
