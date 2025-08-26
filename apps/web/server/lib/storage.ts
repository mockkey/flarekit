import { env } from "cloudflare:workers";
import { createStorage } from "@flarekit/storage";

// Create storage provider with configuration
export const storage = createStorage({
  provider: "r2", // Using Cloudflare R2
  region: env.AWS_REGION || "auto",
  bucket: env.AWS_BUCKET,
  accessKeyId: env.ACCESS_KEY_ID,
  secretAccessKey: env.SECRET_KEY_ID,
  accountId: env.ACCOUNT_ID,
  imageUrl: env.IMAGE_URL,
});

// Export legacy functions for backward compatibility
export const upload = storage.upload.bind(storage);
export const createPresignedPutUrl =
  storage.createPresignedPutUrl.bind(storage);
export const getUrl = storage.getUrl.bind(storage);
export const getKey = storage.getKey.bind(storage);
export const getLocalstion = storage.getLocation.bind(storage);
export const getS3Resource = storage.getResource.bind(storage);
export const getResource = storage.getResource.bind(storage);
export const getDownloadPresignedUrl =
  storage.getDownloadPresignedUrl.bind(storage);

// Multipart upload functions
export const CreateMultipartUpload =
  storage.createMultipartUpload.bind(storage);
export const getmultipartSign = storage.getMultipartUploadUrl.bind(storage);
export const getMultipart = storage.getMultipart.bind(storage);
export const multipartComplete = storage.completeMultipartUpload.bind(storage);
export const deleteMultipart = storage.abortMultipartUpload.bind(storage);
