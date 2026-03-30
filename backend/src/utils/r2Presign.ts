/**
 * Generates a presigned PUT URL for Cloudflare R2.
 *
 * The client uploads directly to R2 using the presigned URL (no bandwidth
 * through our Railway server). After upload, the public fileUrl is returned
 * so the frontend can store it in the database.
 */
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { r2Client } from '../config/r2';
import { env } from '../config/env';

export async function generateUploadPresignedUrl(
  key: string,
  contentType: string
): Promise<{ uploadUrl: string; fileUrl: string }> {
  const command = new PutObjectCommand({
    Bucket: env.R2_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  // Presigned URL expires in 5 minutes — enough for any upload
  const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 300 });

  // Public URL uses the R2 public bucket domain (custom domain or r2.dev link)
  const fileUrl = `${env.R2_PUBLIC_URL.replace(/\/$/, '')}/${key}`;

  return { uploadUrl, fileUrl };
}
