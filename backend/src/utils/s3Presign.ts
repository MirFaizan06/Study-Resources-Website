import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client } from '../config/s3';
import { env } from '../config/env';

export async function generateUploadPresignedUrl(
  key: string,
  contentType: string
): Promise<{ uploadUrl: string; fileUrl: string }> {
  const command = new PutObjectCommand({
    Bucket: env.S3_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(s3Client, command, {
    expiresIn: 300, // 5 minutes
  });

  const fileUrl = `https://${env.S3_BUCKET_NAME}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;

  return { uploadUrl, fileUrl };
}
