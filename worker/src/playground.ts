import 'dotenv/config';
import { openai } from './utils/openai';
import { Transformer } from '@napi-rs/image';
import { S3, PutObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3({
  endpoint: 'https://ams3.digitaloceanspaces.com',
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.SPACES_KEY as string,
    secretAccessKey: process.env.SPACES_SECRET as string,
  },
});

async function main() {
  const prompt =
    'A Swedish flag fluttering against a backdrop of a city skyline, symbolizing the Swedish labor market. In the foreground, a contract is laid out on a table, an ink pen resting on top of it. The contract represents the collective agreement signed by Klarna.';

  const image = await openai.audio.transcriptions.create({
    model: 'whisper-1',
    response_format: 'text',
    prompt: 'asd',
  });

  console.log(image.data[0]);

  const rawImage = Buffer.from(image.data[0]!.b64_json as string, 'base64');
  const imageBinary = await new Transformer(rawImage).webp(75);

  const params = {
    Bucket: 'nyheter',
    Key: 'test.webp',
    Body: imageBinary,
    ContentType: 'image/webp',
    ACL: 'public-read',
  };

  await s3Client.send(new PutObjectCommand(params));
}

main();
