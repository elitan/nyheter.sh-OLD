import 'dotenv/config';
import { postToFacebook } from './utils/helpers';

(async () => {
  console.log('okok');
  const content = 'test';
  const url = 'https://nyheter.sh/';

  const r = await postToFacebook(content, url);

  console.log({ r });
})();
