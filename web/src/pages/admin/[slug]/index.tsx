import dynamic from 'next/dynamic';
import { MainContainer } from '@/components/MainContainer';
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

  const [title, setTitle] = useState(article.title);
  const [body, setBody] = useState(article.body);

  const updateMutation = api.articles.update.useMutation();

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
    <MainContainer className="py-12">
      <form onSubmit={handleSubmit}>
        <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
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
