import type { MultipartUploadPart, StorageConfig, StorageProvider, UploadResult } from "../types";
export declare class S3StorageProvider implements StorageProvider {
    private aws;
    private s3Path;
    private config;
    constructor(config: StorageConfig);
    getDownloadPresignedUrl(storagePath: string, finalFileName?: string): Promise<string>;
    createPresignedPutUrl(key: string): Promise<string>;
    upload(key: string, file: Blob | ArrayBuffer): Promise<UploadResult>;
    getUrl(path: string): string;
    getKey(url: string): string;
    getLocation(key: string): string;
    createMultipartUpload(key: string, contentType: string): Promise<string>;
    getMultipart(key: string, uploadId: string): Promise<string[]>;
    getMultipartUploadUrl(key: string, uploadId: string, partNumber: string): Promise<string>;
    completeMultipartUpload(key: string, uploadId: string, parts: MultipartUploadPart[]): Promise<string>;
    abortMultipartUpload(key: string, uploadId: string): Promise<void>;
    getResource(url: string): Promise<{
        size: string | null;
        type: string;
        key: string;
        etag: string | null;
        url: string;
        body: ArrayBuffer;
    } | null>;
}
//# sourceMappingURL=s3.d.ts.map