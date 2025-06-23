import { z } from "zod";
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

export const checkFileSchema = z.object({
  name: z.string(),
  hash: z.string(),
  size: z.number(),
  type: z.string(),
  parentId: z.string().nullable(),
});

export const createSigned = z.object({
  type: z.string(),
  name: z.string(),
  hash: z.string(),
  uploadId: z.string().optional(),
  size: z.number(),
  parentId: z.string().nullable(),
});

export const uploadSchema = z.object({
  parentId: z.string().optional(),
  hash: z.string(),
  file: z.instanceof(File).refine((file) => file.size <= MAX_FILE_SIZE, {
    message: "File size must be less than 10MB",
  }),
});

export const uploadKey = z.object({
  key: z.string(),
});

export const putUploadSchema = z.object({
  "X-Amz-Checksum-Algorithm": z.string(),
  "X-Amz-Date": z.string(),
  "X-Amz-Expires": z.string(),
  "X-Amz-Algorithm": z.string(),
  "X-Amz-Credential": z.string(),
  "X-Amz-SignedHeaders": z.string(),
  "X-Amz-Signature": z.string(),
});

export const partItem = z.object({
  parts: z.array(
    z.object({
      ETag: z.string(),
      PartNumber: z.number(),
    }),
  ),
});
