import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { ItemImage } from "../types.js";

const s3Client = new S3Client({
  endpoint: `http://${process.env.MINIO_ENDPOINT}`,
  region: "us-east-1", // MinIO defaults to us-east-1
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY || "minioadmin",
    secretAccessKey: process.env.MINIO_SECRET_KEY || "minioadmin",
  },
  forcePathStyle: true, // Required for MinIO
});

const BUCKET_NAME = process.env.MINIO_BUCKET || "gloria-items";

export async function generatePresignedUrl(key: string): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  return getSignedUrl(s3Client, command, { expiresIn: 3600 });
}

export async function getImageUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  return getSignedUrl(s3Client, command, { expiresIn: 3600 });
}

export async function deleteImage(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  await s3Client.send(command);
}

export async function generateImageUrls(
  images: ItemImage[] | null
): Promise<ItemImage[]> {
  if (!images) return [];

  return Promise.all(
    images.map(async (image) => ({
      ...image,
      url: await getImageUrl(image.key),
    }))
  );
}

export function generateImageKey(userId: string, filename: string): string {
  const timestamp = Date.now();
  const extension = filename.split(".").pop();
  return `${userId}/${timestamp}.${extension}`;
}
