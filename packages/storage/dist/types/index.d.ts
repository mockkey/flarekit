export interface StorageConfig {
    provider: "s3" | "r2";
    region?: string;
    bucket: string;
    accessKeyId: string;
    secretAccessKey: string;
    endpoint?: string;
    accountId?: string;
    imageUrl?: string;
}
export interface UploadResult {
    hash: string;
    url: string;
    location: string;
    etag?: string;
}
export interface MultipartUploadPart {
    ETag: string;
    PartNumber: number;
}
export interface StorageProvider {
    upload(key: string, file: Blob | ArrayBuffer): Promise<UploadResult>;
    createPresignedPutUrl(key: string): Promise<string>;
    getUrl(path: string): string;
    getKey(url: string): string;
    getLocation(key: string): string;
    createMultipartUpload(key: string, contentType: string): Promise<string>;
    getMultipartUploadUrl(key: string, uploadId: string, partNumber: string): Promise<string>;
    getMultipart(key: string, uploadId: string): Promise<string[]>;
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
    getDownloadPresignedUrl(url: string, finalFileName?: string): Promise<string>;
}
//# sourceMappingURL=index.d.ts.map