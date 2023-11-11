import { format } from 'date-fns';
import { sv } from 'date-fns/locale';
import { getFirstTwoSentences, renderAgo } from '@/utils/helpers';
import Link from 'next/link';
import { Article } from '@/utils/types';

export function ArticleSummaryLarge({ article }: { article: any }) {
  if (!article.title || !article.body || !article.createdAt || !article.slug) {
    return;
  }

  article = article as Article;

  const formattedDate = format(article.createdAt, 'yyyy-MM-dd HH:mm', {
    locale: sv,
  });

  const summary = getFirstTwoSentences(article.body);

  return (
    <div
      key={article.id}
      className={`flex space-x-4 md:col-span-1 col-span-2 border-b-1 border-gray-200 my-0 py-0 `}
    >
      <Link className="w-full" href={`/${article.language}/${article.slug}`}>
        <div
          className={`border border-gray-200 h-80`}
          style={{
            backgroundImage: `url(${article.imageUrl})`,
            backgroundPosition: 'center',
            backgroundSize: 'cover',
          }}
        />

        <div className="p-4">
          <h1 className="w-full text-2xl lg:text-4xl mb-1 font-semibold font-serif">
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
        <div></div>
      </Link>
    </div>
  );
}
