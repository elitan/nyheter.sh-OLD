import 'dotenv/config';
import { postToFacebook } from './utils/helpers';
import { twitterClient } from './utils/twitter';

(async () => {
  // const r = await postToFacebook(
  //   'test123 hejhjh',
  //   'https://google.se/teetetest',
  // );

  const title = 'test title';
  const linkToArticle = `https://nyheter.sh/nyheter/123123`;
  const post = `${title}\n\n${linkToArticle}`;

  const r = await twitterClient.v2.tweet(post);

  console.log({ r });
})();
