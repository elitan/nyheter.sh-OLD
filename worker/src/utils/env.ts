import { z } from 'zod';
import 'dotenv/config';

const envSchema = z.object({
  GOOGLE_API_TRANSLATION_KEY: z.string(),
});

const env = envSchema.parse(process.env);

export { env };
