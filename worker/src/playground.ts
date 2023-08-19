import 'dotenv/config';
import fs from 'fs';
import path from 'path';
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
  const filePath = path.join(__dirname, '../output.txt');
  const base64png = await fs.promises.readFile(filePath, { encoding: 'utf-8' });

  // Prepare the base64 data
  const base64Data = base64png; //.replace(/^data:image\/png;base64,/, '');
  const fileName = 'image.webp';
  const fileLocation = path.join(__dirname, '../', fileName);

  const PNG = Buffer.from(base64Data, 'base64');

  console.log(PNG.length);

  const imageBinary = await new Transformer(PNG).webp(85);

  console.log(imageBinary.length);

  // Decode base64 string and write the image to the file system
  fs.writeFileSync(path.join(__dirname, '../', 'original.png'), PNG);
  fs.writeFileSync(fileLocation, imageBinary);

  console.log(`Image saved to ${fileLocation}`);

  // get file size in bytes
  const stats = fs.statSync(fileLocation);
  const fileSizeInBytes = stats.size;
  console.log(`File size: ${fileSizeInBytes} bytes`);

  // upload image to spaces
  const params = {
    Bucket: 'nyheter',
    Key: `test.webp`,
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
  console.log('done');
})();
