import fetch from 'node-fetch';
import { S3, PutObjectCommand } from '@aws-sdk/client-s3';
import { TwitterApi } from 'twitter-api-v2';

export const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_APP_KEY as string,
  appSecret: process.env.TWITTER_APP_SECRET as string,
  accessToken: process.env.TWITTER_ACCESS_TOKEN as string,
  accessSecret: process.env.TWITTER_ACCESS_SECRET as string,
});

interface rkbildSearchParams {
  q: string;
}

export async function searchRkbildPhotos(query: string): Promise<any> {
  const params: rkbildSearchParams = {
    q: query,
  };

  // Convert each property to a string
  const stringifiedParams: Record<string, string> = Object.fromEntries(
    Object.entries(params).map(([key, value]) => [key, String(value)]),
  );

  const queryString = new URLSearchParams(stringifiedParams).toString();
  const url =
    queryString !== 'q='
      ? `https://rkbild.se/fotoweb/archives/5000-Bildbank/?${queryString}`
      : 'https://rkbild.se/fotoweb/archives/5000-Bildbank/;p=97';

  const headers =
    queryString !== 'q='
      ? {
          Accept: 'application/vnd.fotoware.collection+json, */*; q=0.01',
        }
      : {
          Accept: 'application/vnd.fotoware.assetlist+json, */*; q=0.01',
        };

  console.log('url', url);
  console.log('queryString', queryString);
  try {
    const response = await fetch(url, {
      headers,
    });
    console.log('response', response.ok);
    if (!response.ok) {
      throw new Error(`Fotoweb API returned an error: ${response.statusText}`);
    }
    console.log('get json');
    const jsonResponse = (await response.json()) as any;
    console.log('json print:');
    console.log(jsonResponse.data);

    if (queryString !== 'q=') {
      return jsonResponse?.assets?.data;
    } else {
      return jsonResponse.data;
    }
  } catch (error) {
    console.error('Error fetching from Fotoweb:', error);
    throw error;
  }
}

interface FlickrSearchParams {
  method: string;
  api_key: string;
  text: string;
  format: string;
  nojsoncallback: number;
  sort: string;
  license: string;
  extras: string;
}

export async function searchFlickrPhotos(query: string): Promise<any> {
  const params: FlickrSearchParams = {
    method: 'flickr.photos.search',
    api_key: process.env.FLICKR_API_KEY as string,
    text: query,
    format: 'json',
    nojsoncallback: 1,
    sort: 'interestingness-desc',
    license: '4,5,6,9,10',
    extras: 'owner_name',
  };

  // Convert each property to a string
  const stringifiedParams: Record<string, string> = Object.fromEntries(
    Object.entries(params).map(([key, value]) => [key, String(value)]),
  );

  const queryString = new URLSearchParams(stringifiedParams).toString();
  const url = `${process.env.FLICKR_API_ENDPOINT}?${queryString}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Flickr API returned an error: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching from Flickr:', error);
    throw error;
  }
}

export interface FlickrPhoto {
  farm: number;
  server: string;
  id: string;
  secret: string;
}

export function constructFlickrPhotoUrl(photo: FlickrPhoto) {
  return `https://farm${photo.farm}.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}.jpg`;
}

export async function getImageAsBuffer(url: string) {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch the image. Status: ${response.status} ${response.statusText}`,
      );
    }

    const buffer = await response.buffer();

    return buffer;
  } catch (error) {
    console.error('Error fetching the image:', error);
    throw error;
  }
}

const s3Client = new S3({
  endpoint: 'https://ams3.digitaloceanspaces.com',
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.SPACES_KEY as string,
    secretAccessKey: process.env.SPACES_SECRET as string,
  },
});

export async function put(params: any) {
  return await s3Client.send(new PutObjectCommand(params));
}

export async function postToFacebook(
  post: string,
  link: string,
): Promise<void> {
  console.log('post on fb');
  console.log(process.env.FACEBOOK_ACCESS_TOKEN);

  const url = `https://graph.facebook.com/v17.0/nyheter.sh/feed?message=${encodeURIComponent(
    post,
  )}&link=${encodeURIComponent(link)}&access_token=${
    process.env.FACEBOOK_ACCESS_TOKEN
  }`;

  try {
    const response = await fetch(url, {
      method: 'POST',
    });

    const data = await response.json();
    console.log('Successfully posted:', data);
  } catch (error) {
    console.log('Error posting to facebook:', error);
    throw error;
  }
}
