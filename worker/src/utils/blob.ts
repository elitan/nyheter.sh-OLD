import { S3, PutObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3({
  endpoint: 'https://ams3.digitaloceanspaces.com',
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.SPACES_KEY as string,
    secretAccessKey: process.env.SPACES_SECRET as string,
  },
});

const BUCKET = 'nyheter';

interface PutProps {
  Key: string;
  Body: Buffer;
  ContentType: string;
  ACL: 'public-read' | 'private';
}

export async function put(props: PutProps) {
  const params = {
    ...props,
    Bucket: BUCKET,
  };

  return await s3Client.send(new PutObjectCommand(params));
}
