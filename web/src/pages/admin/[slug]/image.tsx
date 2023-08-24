import dynamic from 'next/dynamic';
import { twMerge } from 'tailwind-merge';
import { db } from '@/utils/db';
import { InferGetServerSidePropsType } from 'next';
import { ParsedUrlQuery } from 'querystring';
const SimpleMDE = dynamic(() => import('react-simplemde-editor'), {
  ssr: false,
});
import 'easymde/dist/easymde.min.css';
import { useState } from 'react';
import { z } from 'zod';
import Link from 'next/link';
import { api } from '@/utils/api';
import { toast } from 'react-toastify';
import { searchFlickrPhotos } from '@/server/utils/helpers';
import { useRouter } from 'next/router';

interface IParams extends ParsedUrlQuery {
  slug: string;
}

const articleSchema = z.object({
  id: z.number(),
  title: z.string(),
  body: z.string(),
  slug: z.string(),
  sverigesRadioLink: z.string(),
  sverigesRadioTitle: z.string(),
  imageUrl: z.string(),
  imageIsAiGenerated: z.boolean(),
  audioUrl: z.string(),
  imagePrompt: z.string(),
  createdAt: z.date(),
});

export async function getServerSideProps({ params }: { params: IParams }) {
  const { slug } = params;

  const article = await db
    .selectFrom('articles')
    .select([
      'id',
      'title',
      'body',
      'slug',
      'sverigesRadioLink',
      'sverigesRadioTitle',
      'imageUrl',
      'imageIsAiGenerated',
      'audioUrl',
      'imagePrompt',
      'createdAt',
    ])
    .where('slug', '=', slug)
    .where('isRelatedToSweden', '=', true)
    .executeTakeFirst();

  const parsedArticle = articleSchema.safeParse(article);

  if (!parsedArticle.success) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      article: parsedArticle.data,
    },
  };
}

export default function Page(
  props: InferGetServerSidePropsType<typeof getServerSideProps>,
) {
  const { article } = props;
  const router = useRouter();

  const [service, setService] = useState<
    'su' | 'flickr' | 'unsplash' | 'regeringskansliet'
  >('unsplash');

  const [query, setQuery] = useState('');
  const [querySubmitted, setQuerySubmitted] = useState('');

  console.log({ query, querySubmitted });

  const imagesQuery = api.images.get.useQuery(
    {
      articleId: article.id,
      service,
      query: querySubmitted,
    },
    {
      refetchOnWindowFocus: false,
    },
  );

  const updateImageMutation = api.images.update.useMutation();

  console.log(imagesQuery);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    console.log('set query submitted to: ', query);
    setQuerySubmitted(query);
  }

  function handleOnImageClick(imageUrl: string) {
    console.log('handleOnImageClick', imageUrl);

    toast('Updating image...');
    updateImageMutation.mutate(
      {
        articleId: article.id,
        imageUrl,
      },
      {
        onSuccess: () => {
          toast.success('Image updated');
          router.push(`/admin/${article.slug}`);
        },
      },
    );
  }

  const buttonBase = `rounded-md px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600 hover:border-gray-400 border border-transparent transition-all duration-150 ease-in-out`;

  const buttonActive = `bg-cyan-600 text-white hover:border-transparent`;

  const aiButtonClasses = twMerge(buttonBase, service === 'su' && buttonActive);

  const flickrButtonClasses = twMerge(
    buttonBase,
    service === 'flickr' && buttonActive,
  );

  const unsplashButtonClasses = twMerge(
    buttonBase,
    service === 'unsplash' && buttonActive,
  );

  const rkbildButtonClasses = twMerge(
    buttonBase,
    service === 'regeringskansliet' && buttonActive,
  );

  return (
    <div className="py-4 px-4">
      <div className="my-2">
        <Link href={`/admin/${article.slug}`}>← Go back</Link>
      </div>
      <div className="flex space-x-4 items-center">
        <div>
          <img src={article.imageUrl} className="h-32" />
        </div>
        <div>
          <h1 className="text-2xl">{article.title}</h1>
        </div>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 py-4">
          <div className="sm:col-span-full flex gap-x-2">
            <button
              type="button"
              className={aiButtonClasses}
              onClick={() => setService('su')}
            >
              AI
            </button>
            <button
              type="button"
              className={flickrButtonClasses}
              onClick={() => setService('flickr')}
            >
              Flickr
            </button>
            <button
              type="button"
              className={unsplashButtonClasses}
              onClick={() => setService('unsplash')}
            >
              Unsplash
            </button>
            <button
              type="button"
              className={rkbildButtonClasses}
              onClick={() => setService('regeringskansliet')}
            >
              Regeringskansliet
            </button>
          </div>
          <div className="sm:col-span-full flex space-x-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="text"
              name="first-name"
              id="first-name"
              autoComplete="given-name"
              placeholder="Search for images..."
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-cyan-600 sm:text-sm sm:leading-6"
            />
            <button className={twMerge(buttonBase, buttonActive)}>
              Search
            </button>
          </div>
        </div>
      </form>

      {imagesQuery.isLoading && <div>Loading...</div>}

      <div className="grid gid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4">
        {imagesQuery.data?.images.map((image) => {
          return (
            <img
              className="cursor-pointer hover:shadow-2xl"
              key={image}
              src={image}
              onClick={() => handleOnImageClick(image)}
            />
          );
        })}
      </div>
    </div>
  );
}
