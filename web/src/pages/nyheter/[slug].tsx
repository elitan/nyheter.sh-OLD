import { db } from "@/utils/db";
import { InferGetServerSidePropsType } from "next";
import { type ParsedUrlQuery } from "querystring";

interface IParams extends ParsedUrlQuery {
  slug: string;
}

export async function getServerSideProps({ params }: { params: IParams }) {
  const { slug } = params;

  console.log({ slug });

  const article = await db
    .selectFrom("articles")
    .selectAll()
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

export default function Page(
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) {
  const { article } = props;

  return (
    <main className='max-w-2xl mx-auto '>
      <article className='py-24 prose'>
        <div
          className='h-80 border border-gray-200 rounded-lg mb-6'
          style={{
            backgroundImage: `url(${article.imageUrl})`,
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
        />
        <h1 className='text-3xl mb-6 text-gray-950'>{article.title}</h1>
        {article.body?.split("\n").map((paragraph, index) => {
          return <p key={index}>{paragraph}</p>;
        })}
      </article>
    </main>
  );
}
