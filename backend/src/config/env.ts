import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters'),
  PORT: z.coerce.number().int().positive().default(3001),
  AWS_REGION: z.string().min(1, 'AWS_REGION is required'),
  AWS_ACCESS_KEY_ID: z.string().min(1, 'AWS_ACCESS_KEY_ID is required'),
  AWS_SECRET_ACCESS_KEY: z.string().min(1, 'AWS_SECRET_ACCESS_KEY is required'),
  S3_BUCKET_NAME: z.string().min(1, 'S3_BUCKET_NAME is required'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

const _parsed = envSchema.safeParse(process.env);

if (!_parsed.success) {
  console.error('Invalid environment variables:');
  console.error(_parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = _parsed.data;
