import { getImageAsBuffer } from '@/server/utils/helpers';
import { db } from '@/utils/db';
import { Transformer } from '@napi-rs/image';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // get slug (or something)

  const { slug } = req.query as any;

  const article = await db
    .selectFrom('articles')
    .innerJoin('articleImages', 'articles.articleImageId', 'articleImages.id')
    .select(['articleImages.imageUrl'])
    .where('slug', '=', slug)
    .executeTakeFirstOrThrow();

  // fetch current imageUrl

  const rawImage = await getImageAsBuffer(article.imageUrl);
  const imageBinary = await new Transformer(rawImage).png();

  res.setHeader('Content-Type', 'image/png');
  res.status(200).send(imageBinary);
}
