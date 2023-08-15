import { TwitterApi } from 'twitter-api-v2';

(async () => {
  const twitterClient = new TwitterApi({
    appKey: 'YLgX0NHNEiLxZD8NsTwnxVuT6',
    appSecret: '1enlCFsAvbI1rI0tmMeIJCu1477tkDYgIi11oUPQvBSYiNEZ7G',
    accessToken: '1688793325610926080-KsOnQGX0THjFmtXSlsZcoJ3cv747Ws',
    accessSecret: 'qkIHLYPcZAq9FqJp8NCVCfbDJAghTeFpIChZxvJS5l9Ez',

    // clientId: 'Wk1aWnBQZWx5c0NtT0dQQncybWk6MTpjaQ',
    // clientSecret: 'wk4sX1-9GWIxWZk3I_YDGF9G7v1lf7Y391pJt70516y5gHlSGB',
  });

  await twitterClient.v2.tweet(
    `NATO's Major Reorganization: Sweden's Position Uncertain\n\nhttps://www.nyheter.sh/nyheter/natos-major-reorganization-swedens-position-uncertain`,
  );
})();
