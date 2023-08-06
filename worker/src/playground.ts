import { sendDiscordMessage } from './utils/discord';

(async () => {
  await sendDiscordMessage('test 123');

  console.log('done');
})();
