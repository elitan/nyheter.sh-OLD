import { db } from '@/utils/db';
import { InferGetServerSidePropsType } from 'next';
import { type ParsedUrlQuery } from 'querystring';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { NextSeo } from 'next-seo';
import Balancer from 'react-wrap-balancer';
import Head from 'next/head';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
const ReactPlayer = dynamic(() => import('react-player/lazy'), { ssr: false });

interface IParams extends ParsedUrlQuery {
  slug: string;
}

export async function getServerSideProps({ params }: { params: IParams }) {
  const { slug } = params;

  const article = await db
    .selectFrom('articles')
    .innerJoin('articleImages', 'articles.articleImageId', 'articleImages.id')
    .select([
      'articles.id',
      'articles.createdAt',
      'articles.updatedAt',
      'articles.title',
      'articles.body',
      'articles.slug',
      'articles.sverigesRadioLink',
      'articles.sverigesRadioTitle',
      'articles.audioUrl',
      'articleImages.imageUrl',
      'articleImages.imageIsAiGenerated',
      'articleImages.imagePrompt',
    ])
    .where('slug', '=', slug)
    .where('isPublished', '=', true)
    .executeTakeFirst();

  if (!article) {
    return {
      notFound: true,
    };
  }

  await db
    .updateTable('articles')
    .set((eb) => ({
      pageViews: eb.bxp('pageViews', '+', 1),
    }))
    .where('id', '=', article.id)
    .execute();

  return {
    props: {
      article,
    },
  };
}

function AudioPlayer({ audioUrl }: { audioUrl: string | null }) {
  const [playing, setPlaying] = useState(false);

  if (!audioUrl) {
    return null;
  }

  return (
    <div className="my-4 py-4 border-b rounded-md flex items-center flex-col">
      <p className="text-gray-700 text-sm pb-2 text-center font-semibold">
        Listen to the article
      </p>
      <ReactPlayer
        url={audioUrl}
        controls={true}
        height={50}
        width={`100%`}
        playing={playing}
      />
    </div>
  );
}

export default function Page(
  props: InferGetServerSidePropsType<typeof getServerSideProps>,
) {
  const { article } = props;

  const { isSignedIn, user, isLoaded } = useUser();

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    image: [`https://nyheter.sh/api/og-image/${article.slug}`],
    datePublished: article.createdAt,
    dateModified: article.updatedAt,
    // author: {
    //   '@type': 'Person',
    //   name: 'Johan article.authorName,
    // },
    publisher: {
      '@type': 'Organization',
      name: 'Nyheter.sh',
      logo: {
        '@type': 'ImageObject',
        url: 'https://nyheter.sh/logo.png',
      },
    },
    description: article.body?.slice(0, 255),
  };

  return (
    <div className="py-6 lg:py-24">
      <Head>
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Head>
      <NextSeo
        title={article.title as string}
        description={article.body?.slice(0, 255)}
        openGraph={{
          title: article.title as string,
          description: article.body?.slice(0, 255),
          images: [
            {
              url: `https://nyheter.sh/api/og-image/${article.slug}`,
              alt: article.title as string,
              type: 'image/png',
            },
          ],
          siteName: 'Nyheter.sh',
        }}
        twitter={{
          handle: '@elitasson',
          site: '@nyheter.sh',
          cardType: 'summary_large_image',
        }}
      />
      <div>
        <div className="mx-auto md:w-[750px]">
          {isSignedIn && (
            <div>
              <Link href={`/admin/${article.slug}`}>Edit this article</Link>
            </div>
          )}
        </div>
        <div className="mx-auto lg:h-[400px] md:w-[750px]">
          <img
            src={article.imageUrl ?? ''}
            alt={article.imagePrompt ?? ''}
            className="w-full h-full border border-gray-200 rounded-lg  object-cover"
            style={{
              display: 'block',
              objectFit: 'cover',
            }}
          />
        </div>
        <div className="mx-auto md:w-[750px] pt-2 pb-4">
          <p className="text-gray-500 text-xs mt-1 my-4">
            {!article.imageIsAiGenerated && (
              <>This image was generated by a human.</>
            )}
          </p>
        </div>
      </div>

      <div className="prose md:prose-xl max-w-5xl mx-auto text-center">
        <h1 className="mb-6 text-gray-950 font-serif">
          <Balancer>{article.title}</Balancer>
        </h1>
      </div>
      <div className="mb-6  max-w-2xl mx-auto px-2">
        <article>
          <div>
            <AudioPlayer audioUrl={article.audioUrl} />
          </div>
          <p className="text-gray-500 text-sm py-2 lg:py-4 mb-4">
            This news was first reported by:{' '}
            <a
              href={article.sverigesRadioLink}
              className="underline hover:text-gray-700"
              target="_blank"
              rel="noopener noreferrer"
            >
              Sveriges Radio: {article.sverigesRadioTitle}
            </a>{' '}
          </p>
          <div className="prose lg:prose-xl font-serif">
            {article.body?.split('\n').map((paragraph, index) => {
              return <p key={index}>{paragraph}</p>;
            })}
          </div>
          <div className="mt-3"></div>
        </article>
      </div>
    </div>
  );
}
