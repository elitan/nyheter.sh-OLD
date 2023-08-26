import dynamic from 'next/dynamic';
import { MainContainer } from '@/components/MainContainer';
const SimpleMDE = dynamic(() => import('react-simplemde-editor'), {
  ssr: false,
});
import 'easymde/dist/easymde.min.css';
import { useState } from 'react';
import { z } from 'zod';
import Link from 'next/link';
import { api } from '@/utils/api';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
import { articleSchema } from '@/utils/types';

export default function Page() {
  const router = useRouter();

  const { slug } = router.query as { slug: string };

  const articleQuery = api.articles.getOne.useQuery(
    {
      slug,
    },
    {
      enabled: !!slug,
    },
  );

  if (articleQuery.isLoading) {
    return <div>Loading...</div>;
  }

  if (articleQuery.isError) {
    return <div>Error</div>;
  }

  console.log(articleQuery.data.article);

  const article = articleSchema.parse(articleQuery.data.article);

  return <ArticleEdit article={article} />;
}

function ArticleEdit({ article }: { article: z.infer<typeof articleSchema> }) {
  console.log(article);

  const [title, setTitle] = useState(article.title);
  const [body, setBody] = useState(article.body);

  const apiContext = api.useContext();
  const updateMutation = api.articles.update.useMutation();
  const setIsPublishedMutation = api.articles.setIsPublished.useMutation();
  const publishOnSocialMediaMutation =
    api.articles.publishOnSocialMedia.useMutation();

  function handleTogglePublished() {
    setIsPublishedMutation.mutate(
      {
        id: article.id,
        isPublished: !article.isPublished,
      },
      {
        onSuccess: () => {
          toast.success('Saved');
          apiContext.articles.invalidate();
        },
      },
    );
  }

  function handlePublishOnSocialMedia() {
    publishOnSocialMediaMutation.mutate(
      {
        id: article.id,
      },
      {
        onSuccess: () => {
          toast.success('Published on social media!');
          apiContext.articles.invalidate();
        },
        onError: (error) => {
          console.error({ error });
          toast.error(error.message);
        },
      },
    );
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    console.log({ title, body });

    updateMutation.mutate(
      {
        id: article.id,
        title,
        body,
      },
      {
        onError: (error) => {
          console.log({ error });
        },
        onSuccess: (data) => {
          console.log('success!');
          console.log({ data });
          toast.success('Saved');
        },
      },
    );
  }

  return (
    <MainContainer className="py-2">
      <div>
        <div className="my-2">
          <Link href={`/admin`}>← Go back</Link>
        </div>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
          <div className="sm:col-span-full">
            <label
              htmlFor="username"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Image
            </label>
            <div className="mt-2">
              <div className="mt-2">
                <img
                  src={article.imageUrl}
                  className="max-h-96"
                  alt={article.imagePrompt}
                />
                <Link href={`/admin/${article.slug}/image`}>Change image</Link>
              </div>
            </div>
          </div>

          <div className="sm:col-span-full">
            <label
              htmlFor="username"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Headline
            </label>
            <div className="mt-2">
              <div className="mt-2">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  type="text"
                  name="first-name"
                  id="first-name"
                  autoComplete="given-name"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-cyan-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>
          </div>

          <div className="sm:col-span-full">
            <SimpleMDE value={article.body} onChange={(v) => setBody(v)} />
          </div>
          {/* <div className="prose">
          <ReactMarkdown>{body as string}</ReactMarkdown>
        </div> */}
        </div>

        {!article.isPublishedOnSocialMedia && (
          <div>
            <button
              type="button"
              className="rounded-md bg-cyan-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-cyan-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600"
              onClick={handlePublishOnSocialMedia}
            >
              Publish on social media (X (Twitter) and Linkedin)
            </button>
          </div>
        )}

        <div>
          <button
            type="button"
            className="rounded-md bg-cyan-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-cyan-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600"
            onClick={handleTogglePublished}
          >
            {article.isPublished ? 'Unpublish article' : 'Publish article'}
          </button>
        </div>

        <div className="mt-6 flex items-center justify-end gap-x-6">
          <Link
            type="button"
            className="text-sm font-semibold leading-6 text-gray-900"
            href={`/admin`}
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="rounded-md bg-cyan-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-cyan-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600"
          >
            Save
          </button>
        </div>
      </form>
    </MainContainer>
  );
}
