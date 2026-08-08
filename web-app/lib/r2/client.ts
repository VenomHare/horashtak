import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export const BUCKET_NAME = process.env.R2_BUCKET_NAME!;

export async function uploadToR2(key: string, body: Buffer, contentType: string) {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: body,
    ContentType: contentType,
  });

  await r2Client.send(command);
  return key;
}

export async function getPresignedUrl(key: string, expiresIn: number = 600) {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  return await getSignedUrl(r2Client, command, { expiresIn });
}

export async function deleteFromR2(key: string) {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  await r2Client.send(command);
}
