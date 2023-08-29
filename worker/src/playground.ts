import 'dotenv/config';
import { Transformer, pngQuantize } from '@napi-rs/image';
import { S3, PutObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3({
  endpoint: 'https://ams3.digitaloceanspaces.com',
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.SPACES_KEY as string,
    secretAccessKey: process.env.SPACES_SECRET as string,
  },
});

(async () => {
  // const imagePrompt =
  //   'funny cartoon on a mountain with a glowing sun in the background';

  // const url = process.env.STABLE_DIFFUSION_TEXT2IMG_ENDPOINT as string;
  // const headers = {
  //   accept: 'application/json',
  //   'Content-Type': 'application/json',
  // };
  // const suBody = JSON.stringify({
  //   prompt: imagePrompt,
  //   negative_prompt: 'BadDream, UnrealisticDream',
  //   steps: 65,
  //   cfg_scale: 8,
  //   sampler_index: 'Euler a',
  //   restore_faces: true,
  //   width: 1200,
  //   height: 800,
  // });

  // const response = await fetch(url, {
  //   method: 'POST',
  //   headers: headers,
  //   body: suBody,
  // });

  // const data = await response.json();

  // console.log('data from SU:');
  // console.log(data);

  // // base64 encoded image data
  // const imageData = `${data.images[0]}`;

  // console.log(imageData);

  // const outputTextPath = 'output.txt';
  // fs.writeFileSync(outputTextPath, imageData, 'utf8');

  // Read txt file content
  const url = process.env.STABLE_DIFFUSION_TEXT2IMG_ENDPOINT as string;
  const headers = {
    accept: 'application/json',
    'Content-Type': 'application/json',
  };
  const suBody = JSON.stringify({
    prompt: 'sexy sport car driving fast on a road',
    negative_prompt: 'BadDream, UnrealisticDream',
    steps: 65,
    cfg_scale: 8,
    sampler_index: 'Euler a',
    restore_faces: true,
    width: 500,
    height: 500,
    batch_size: 2,
  });

  const response = await fetch(url, {
    method: 'POST',
    headers: headers,
    body: suBody,
  });

  const data = await response.json();

  for (const [index, imageData] of data.images.entries()) {
    console.log(`transform image ${index}`);
    // const imageData = `${data.images[0]}`;

    const rawImage = Buffer.from(imageData, 'base64');

    const imageBinary = await new Transformer(rawImage).webp(85);
    // const imageBinary = await pngQuantize(
    //   await new Transformer(rawImage).png(),
    //   {
    //     maxQuality: 75,
    //     speed: 10,
    //   },
    // );

    // upload image to spaces
    const params = {
      Bucket: 'nyheter',
      Key: `test-${index}.webp`,
      Body: imageBinary,
      ContentType: 'image/webp',
      ACL: 'public-read',
    };

    console.log('uploading...');

    try {
      await s3Client.send(new PutObjectCommand(params));
    } catch (e) {
      console.error('error: ');
      console.error(e);
    }
  }

  console.log('done');
})();
