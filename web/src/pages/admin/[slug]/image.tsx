import dynamic from 'next/dynamic';
import { twMerge } from 'tailwind-merge';
import { db } from '@/utils/db';
import { InferGetServerSidePropsType } from 'next';
import { ParsedUrlQuery } from 'querystring';
const SimpleMDE = dynamic(() => import('react-simplemde-editor'), {
  ssr: false,
});
import 'easymde/dist/easymde.min.css';
import { useEffect, useRef, useState } from 'react';
import { z } from 'zod';
import Link from 'next/link';
import { api } from '@/utils/api';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
import { MainContainer } from '@/components/MainContainer';

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
  imageUrl: z.string().nullable(),
  imageIsAiGenerated: z.boolean(),
  audioUrl: z.string(),
  imagePrompt: z.string(),
  createdAt: z.date(),
});

export async function getServerSideProps({ params }: { params: IParams }) {
  const { slug } = params;

  const article = await db
    .selectFrom('articles')
    .innerJoin('articleImages', 'articles.articleImageId', 'articleImages.id')
    .select([
      'articles.id',
      'articles.title',
      'articles.createdAt',
      'articles.body',
      'articles.slug',
      'articles.sverigesRadioLink',
      'articles.sverigesRadioTitle',
      'articles.audioUrl',
      'articles.imagePrompt',
      'articleImages.imageUrl',
      'articleImages.imageIsAiGenerated',
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

  const imgRef = useRef<HTMLDivElement>(null);

  const [service, setService] = useState<
    'su' | 'flickr' | 'unsplash' | 'regeringskansliet' | 'wikimedia' | 'upload'
  >('unsplash');

  const [query, setQuery] = useState('');
  const [querySubmitted, setQuerySubmitted] = useState('');
  const [imageBase64, setImageBase64] = useState<string | null>(null);

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
  const uploadImageMutation = api.images.upload.useMutation();

  async function handlePaste(e: ClipboardEvent) {
    const clipboardData = e.clipboardData || (window as any).clipboardData;

    // Check if we have a file in clipboard data
    for (let i = 0; i < clipboardData.items.length; i++) {
      const item = clipboardData.items[i];

      if (item.kind === 'file' && item.type.startsWith('image')) {
        // Handle image file paste
        const blob = item.getAsFile();
        if (!blob) return;

        const reader = new FileReader();

        reader.onloadend = async function () {
          const base64String = reader.result as string;

          // Create an image element and set the data URL as its source
          const img = new Image();
          img.src = base64String;

          // Display the image
          if (imgRef.current) {
            imgRef.current.innerHTML = '';
            imgRef.current.appendChild(img);
          }

          setImageBase64(base64String);
        };

        reader.readAsDataURL(blob);
        return;
      }
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setQuerySubmitted(query);
  }

  function handleOnImageClick(imageUrl: string) {
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

  function handleUpload() {
    if (!imageBase64) {
      toast.error('No image...');
      return;
    }

    toast('Updating image...');
    uploadImageMutation.mutate(
      {
        articleId: article.id,
        imageBase64,
      },
      {
        onSuccess: () => {
          toast.success('Image updated');
          router.push(`/admin/${article.slug}`);
        },
      },
    );
  }

  useEffect(() => {
    // Attach the paste event listener to the document
    document.addEventListener('paste', handlePaste);

    // Cleanup: remove the event listener when the component is unmounted
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, []);

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
          <img src={article.imageUrl ?? ''} className="h-32" />
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
            {/* <button
              type="button"
              disabled={true}
              className={twMerge(
                rkbildButtonClasses,
                'opacity-60 cursor-not-allowed',
              )}
              onClick={() => setService('wikimedia')}
            >
              Wiki Media
            </button> */}
            <button
              type="button"
              className={twMerge(
                buttonBase,
                service === 'upload' && buttonActive,
              )}
              onClick={() => setService('upload')}
            >
              Upload
            </button>
          </div>
          {service !== 'upload' && (
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
          )}
        </div>
      </form>

      {service !== 'upload' ? (
        <>
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
        </>
      ) : (
        <div>
          <h1>Paste an Image Here</h1>
          <div ref={imgRef} className="max-w-7xl"></div>

          <div className="mt-6 flex items-center justify-end gap-x-6">
            <button
              type="button"
              className="rounded-md bg-cyan-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-cyan-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600"
              onClick={handleUpload}
            >
              Upload
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
