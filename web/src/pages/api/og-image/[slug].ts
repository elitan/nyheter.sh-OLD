import { getImageAsBuffer } from '@/server/utils/helpers';
import { db } from '@/utils/db';
import { Transformer } from '@napi-rs/image';
import { NextRequest, NextResponse } from 'next/server';

export default async function handler(req: NextRequest, res: NextResponse) {
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

  return;
}
