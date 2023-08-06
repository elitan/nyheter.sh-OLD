import { db } from "@/utils/db";
import { InferGetServerSidePropsType } from "next";
import { type ParsedUrlQuery } from "querystring";
import dynamic from "next/dynamic";
import { useState } from "react";
const ReactPlayer = dynamic(() => import("react-player/lazy"), { ssr: false });

interface IParams extends ParsedUrlQuery {
  slug: string;
}

export async function getServerSideProps({ params }: { params: IParams }) {
  const { slug } = params;

  const article = await db
    .selectFrom("articles")
    .select([
      "id",
      "title",
      "body",
      "sverigesRadioLink",
      "sverigesRadioTitle",
      "imageUrl",
      "audioSummaryUrl",
    ])
    .where("slug", "=", slug)
    .executeTakeFirst();

  if (!article) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      article,
    },
  };
}

function AudioPlayer({ audioSummaryUrl }: { audioSummaryUrl: string | null }) {
  const [playing, setPlaying] = useState(false);

  if (!audioSummaryUrl) {
    return null;
  }

  return (
    <div className='my-4 py-4 border-b rounded-md flex items-center flex-col'>
      <p className='text-gray-700 text-sm pb-2 text-center font-semibold'>
        Listen to a summary
      </p>
      <ReactPlayer
        url={audioSummaryUrl}
        controls={true}
        height={50}
        playing={playing}
      />
    </div>
  );
}

export default function Page(
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) {
  const { article } = props;

  return (
    <main className='max-w-2xl mx-auto '>
      <article className='py-24'>
        <div className='mb-6'>
          <img
            src={article.imageUrl ?? ""}
            alt={article.title ?? ""}
            className='h-80 w-full border border-gray-200 rounded-lg'
            style={{
              display: "block",
              objectFit: "cover",
            }}
          />
          <div>
            <p className='text-gray-500 text-xs mt-1'>
              Note: The image was generated using AI and might not fully reflect
              the news article.
            </p>
          </div>
        </div>
        <div>
          <AudioPlayer audioSummaryUrl={article.audioSummaryUrl} />
        </div>
        <div className='prose'>
          <h1 className='text-3xl mb-6 text-gray-950'>{article.title}</h1>
          {article.body?.split("\n").map((paragraph, index) => {
            return <p key={index}>{paragraph}</p>;
          })}
        </div>
        <div className='mt-3'>
          <p className='text-gray-500 text-sm'>
            This article was inspired by:{" "}
            <a
              href={article.sverigesRadioLink}
              className='underline hover:text-gray-700'
              target='_blank'
              rel='noopener noreferrer'
            >
              {article.sverigesRadioTitle}
            </a>{" "}
          </p>
        </div>
      </article>
    </main>
  );
}
