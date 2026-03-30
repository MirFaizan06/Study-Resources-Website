/**
 * Cloudflare R2 client — S3-compatible, so we reuse @aws-sdk/client-s3.
 *
 * Required env vars:
 *   R2_ACCOUNT_ID       — from Cloudflare dashboard (R2 → Overview)
 *   R2_ACCESS_KEY_ID    — R2 API token (with Object Read & Write permission)
 *   R2_SECRET_ACCESS_KEY— R2 API token secret
 *   R2_BUCKET_NAME      — your R2 bucket name
 *   R2_PUBLIC_URL       — your bucket's public URL (custom domain or r2.dev subdomain)
 *                         e.g. https://assets.noteshubkashmir.in
 *                         or   https://pub-xxxx.r2.dev
 */
import { S3Client } from '@aws-sdk/client-s3';
import { env } from './env';

export const r2Client = new S3Client({
  // R2 endpoint format: https://<account-id>.r2.cloudflarestorage.com
  endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  // R2 requires region = 'auto'
  region: 'auto',
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
  // Prevent SDK v3 from sending checksum headers that R2 does not support.
  // Without this, PutObject and presigned PUT requests fail with
  // "InvalidArgument: x-amz-checksum-crc32 is not supported" on some SDK versions.
  requestChecksumCalculation: 'WHEN_REQUIRED',
  responseChecksumValidation: 'WHEN_REQUIRED',
});
