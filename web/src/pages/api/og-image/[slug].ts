import { getImageAsBuffer } from '@/server/utils/helpers';
import { db } from '@/utils/db';
import { Transformer } from '@napi-rs/image';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { slug } = req.query as any;

  const article = await db
    .selectFrom('articles')
    .innerJoin('articleImages', 'articles.articleImageId', 'articleImages.id')
    .select(['articleImages.imageUrl'])
    .where('slug', '=', slug)
    .executeTakeFirstOrThrow();

  const rawImage = await getImageAsBuffer(article.imageUrl);
  const imageRaw = await new Transformer(rawImage);

  const metadata = await imageRaw.metadata();

  if (metadata.width > 1200) {
    imageRaw.resize({
      width: 1200,
    });
  }

  const imagePng = await imageRaw.png();

  res.setHeader('Content-Type', 'image/png');
  res.status(200).send(imagePng);
}
