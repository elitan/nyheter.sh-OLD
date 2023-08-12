import { TwitterApi } from 'twitter-api-v2';

(async () => {
  const twitterClient = new TwitterApi({
    appKey: 'Ajbgb2cG9RkemlEH23FpkXCGc',
    appSecret: 'T53db7hEvNodJUUpDHMrPzYDE0lf2xvTc0LPZNKK19FgDtPESG',
    accessToken: '1688793325610926080-ZYLk0hyFlrbxj8ZSVChFlux7zBF4sl',
    accessSecret: 'j4Twdkcb3Se9gTgZdc6oE3ZBrz5n5HIwijadmuV9Q8Ety',
    // clientId: 'Wk1aWnBQZWx5c0NtT0dQQncybWk6MTpjaQ',
    // clientSecret: 'wk4sX1-9GWIxWZk3I_YDGF9G7v1lf7Y391pJt70516y5gHlSGB',
  });

  const appOnlyClient = new TwitterApi(
    'AAAAAAAAAAAAAAAAAAAAAGVwpQEAAAAAUeM6oVFLUt%2Fg9v7hhhfSuFV%2FeGs%3D0sRHBasJ6IBlASEcVSbXZA6mm5kRXEWpk4m209iaykyMxWYcBd',
  );

  await appOnlyClient.v2.tweet('Hello, this is a test.');
})();
