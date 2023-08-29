import 'dotenv/config';
import fs from 'fs';
import { S3, PutObjectCommand } from '@aws-sdk/client-s3';
import { runCommand } from './utils/helpers';

const s3Client = new S3({
  endpoint: 'https://ams3.digitaloceanspaces.com',
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.SPACES_KEY as string,
    secretAccessKey: process.env.SPACES_SECRET as string,
  },
});

(async () => {
  // backup databaase
  console.log('taking backup');
  console.log('generating sql file');
  await runCommand(
    `pg_dump "${process.env.DATABASE_URL}" -F c -b -v -f "/tmp/backup_file.sql"`,
  );
  console.log('generating sql file done');

  // read file
  const fileContent = fs.readFileSync(`/tmp/backup_file.sql`);

  // Date formatting
  const date = new Date();
  const formattedDate = `${date.getFullYear()}-${String(
    date.getMonth() + 1,
  ).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

  const params = {
    Bucket: 'nyheter',
    Key: `db-backup/${formattedDate}.sql`,
    Body: fileContent,
    ContentType: 'application/sql',
    ACL: 'private',
  };

  try {
    await s3Client.send(new PutObjectCommand(params));
  } catch (e) {
    console.error('error: ');
    console.error(e);
  }

  console.log('done');
})();
