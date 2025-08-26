# @flarekit/storage

FlareKit Storage Module - Simple and focused S3/R2 storage provider for file operations.

## Features

- 🔄 **Simple Interface**: Clean API for S3/R2 storage operations
- 📦 **Multiple Providers**: Support for AWS S3, Cloudflare R2
- 🚀 **Multipart Upload**: Large file upload support with resumable uploads
- 🔐 **Secure**: Pre-signed URLs and secure file handling
- 🎯 **Focused**: No business logic, just pure storage operations



## Quick Start

```typescript
import { createStorage } from "@flarekit/storage";

// Create storage provider
const storage = createStorage({
  provider: "r2", // or "s3"
  region: "auto",
  bucket: "my-bucket",
  accessKeyId: env.ACCESS_KEY_ID,
  secretAccessKey: env.SECRET_ACCESS_KEY,
  accountId: env.ACCOUNT_ID, // Required for R2
  imageUrl: env.IMAGE_URL, // Optional CDN URL
});

// Upload a file
const result = await storage.upload("path/to/file.jpg", fileBlob);
console.log(result.url); // File URL

// Create presigned URL for direct upload
const uploadUrl = await storage.createPresignedPutUrl("path/to/file.jpg");
```

## Configuration

### Storage Config

```typescript
interface StorageConfig {
  provider: "s3" | "r2";
  region?: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  endpoint?: string;
  accountId?: string; // Required for Cloudflare R2
  imageUrl?: string; // Optional CDN URL
}
```

### Environment Variables

```bash
# For Cloudflare R2
ACCESS_KEY_ID=your_r2_access_key
SECRET_ACCESS_KEY=your_r2_secret_key
ACCOUNT_ID=your_cloudflare_account_id
AWS_BUCKET=your_bucket_name
AWS_REGION=auto
IMAGE_URL=https://your-cdn-domain.com

# For AWS S3
ACCESS_KEY_ID=your_aws_access_key
SECRET_ACCESS_KEY=your_aws_secret_key
AWS_BUCKET=your_bucket_name
AWS_REGION=us-east-1
```

## Usage

### Direct Upload

```typescript
// Upload a file directly
const result = await storage.upload("uploads/photo.jpg", fileBlob);
console.log(result.url); // File URL
console.log(result.hash); // File hash
console.log(result.etag); // ETag
```

### Presigned URLs

```typescript
// Create presigned URL for client-side upload
const uploadUrl = await storage.createPresignedPutUrl("uploads/photo.jpg");
// Client can now upload directly to this URL
```

### Get File URLs

```typescript
// Get public URL for a file
const fileUrl = storage.getUrl("uploads/photo.jpg");

// Extract key from URL
const key = storage.getKey("https://bucket.s3.amazonaws.com/uploads/photo.jpg");
```

### Multipart Upload

```typescript
// 1. Create multipart upload
const uploadId = await storage.createMultipartUpload(
  "uploads/large-video.mp4",
  "video/mp4"
);

// 2. Get upload URLs for parts
const partUrl = await storage.getMultipartUploadUrl(
  "uploads/large-video.mp4",
  uploadId,
  "1" // Part number
);

// 3. Upload parts (client-side)
// Client uploads each part using the signed URLs

// 4. Complete upload
const location = await storage.completeMultipartUpload(
  "uploads/large-video.mp4",
  uploadId,
  [
    { ETag: "etag1", PartNumber: 1 },
    { ETag: "etag2", PartNumber: 2 }
  ]
);

// 5. Abort upload if needed
await storage.abortMultipartUpload("uploads/large-video.mp4", uploadId);
```

### Resource Information

```typescript
// Get file metadata
const resource = await storage.getResource("https://bucket.s3.amazonaws.com/uploads/file.jpg");
console.log(resource.size); // File size
console.log(resource.type); // Content type
console.log(resource.etag); // ETag
```

## API Reference

### StorageProvider Interface

```typescript
interface StorageProvider {
  // Basic file operations
  upload(key: string, file: Blob | ArrayBuffer): Promise<UploadResult>;
  createPresignedPutUrl(key: string): Promise<string>;
  getUrl(path: string): string;
  getKey(url: string): string;
  getLocation(key: string): string;

  // Multipart upload methods
  createMultipartUpload(key: string, contentType: string): Promise<string>;
  getMultipartUploadUrl(key: string, uploadId: string, partNumber: string): Promise<string>;
  completeMultipartUpload(key: string, uploadId: string, parts: MultipartUploadPart[]): Promise<string>;
  abortMultipartUpload(key: string, uploadId: string): Promise<void>;

  // Resource methods
  getResource(url: string): Promise<ResourceInfo | null>;
  getDownloadPresignedUrl(url: string, finalFileName?: string): Promise<string>;
}
```

## Architecture

```
@flarekit/storage
├── providers/          # Storage provider implementations
│   ├── s3.ts          # AWS S3 / Cloudflare R2 provider
│   └── index.ts       # Provider factory
├── types/             # TypeScript definitions
├── utils/             # Utility functions
└── index.ts           # Main entry point
```

## Why This Design?

- **Simple**: No business logic, just storage operations
- **Focused**: One responsibility - file storage
- **Flexible**: Easy to integrate into any application
- **Maintainable**: Clean separation of concerns

## License

ISC
