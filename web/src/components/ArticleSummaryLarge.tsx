import { format } from 'date-fns';
import { sv } from 'date-fns/locale';
import { getFirstTwoSentences, renderAgo } from '@/utils/helpers';
import Link from 'next/link';
import { Article } from '@/utils/types';

export function ArticleSummaryLarge({ article }: { article: any }) {
  console.log(article);
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
      className={`flex my-2 space-x-4 md:col-span-1 col-span-2 border-b-2 border-gray-200 py-2`}
    >
      <Link
        className="w-full rounded-lg p-1 "
        href={`/nyheter/${article.slug}`}
      >
        <div
          className={`border border-gray-200 rounded-md h-64`}
          style={{
            backgroundImage: `url(${article.imageUrl})`,
            backgroundPosition: 'center',
            backgroundSize: 'cover',
          }}
        />

        <div className="py-3">
          <h1 className="w-full text-4xl mb-1 font-semibold font-serif">
            {article.title}
          </h1>
          <p className="text-gray-700 line-clamp-2 font-serif">{summary}</p>
          <p className="text-xs text-gray-500 pt-3">
            {renderAgo(article.createdAt as Date)}
          </p>
        </div>
        <div></div>
      </Link>
    </div>
  );
}
