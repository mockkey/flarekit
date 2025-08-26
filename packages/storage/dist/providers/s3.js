import { AwsClient } from "aws4fetch";
import { XMLParser } from "fast-xml-parser";
import { parseXmlTag, stripEtag } from "../utils";
export class S3StorageProvider {
    aws;
    s3Path;
    config;
    constructor(config) {
        this.config = config;
        this.aws = new AwsClient({
            accessKeyId: config.accessKeyId,
            secretAccessKey: config.secretAccessKey,
            service: "s3",
            region: config.region || "auto",
        });
        if (config.provider === "r2" && config.accountId) {
            this.s3Path = `https://${config.accountId}.r2.cloudflarestorage.com/${config.bucket}`;
        }
        else {
            this.s3Path =
                config.endpoint ||
                    `https://s3.${config.region}.amazonaws.com/${config.bucket}`;
        }
    }
    async getDownloadPresignedUrl(storagePath, finalFileName) {
        const url = new URL(storagePath);
        url.searchParams.set("response-content-disposition", `attachment; filename="${encodeURIComponent(finalFileName || "unknown")}"`);
        url.searchParams.set("response-content-type", "application/octet-stream");
        url.searchParams.set("X-Amz-Expires", "3600");
        const signed = await this.aws.sign(new Request(url.toString(), {
            method: "GET",
        }), {
            aws: { signQuery: true },
        });
        return signed.url;
    }
    async createPresignedPutUrl(key) {
        const url = `${this.s3Path}/${key}`;
        const r2Url = new URL(url);
        r2Url.searchParams.set("X-Amz-Checksum-Algorithm", "SHA256");
        const res = await this.aws.sign(new Request(r2Url, {
            method: "PUT",
        }), {
            aws: { signQuery: true },
        });
        return res.url;
    }
    async upload(key, file) {
        const url = `${this.s3Path}/${key}`;
        const res = await this.aws.fetch(url, {
            method: "PUT",
            headers: {
                "Content-Length": file instanceof Blob
                    ? file.size.toString()
                    : file.byteLength.toString(),
            },
            body: file,
        });
        if (!res.ok) {
            throw new Error(`Upload failed: ${res.status} ${await res.text()}`);
        }
        const etag = res.headers.get("etag");
        if (!etag) {
            throw new Error("Failed to upload file");
        }
        const hash = stripEtag(etag);
        return {
            hash,
            url: res.url,
            location: this.getLocation(key),
            etag,
        };
    }
    getUrl(path) {
        try {
            const url2 = new URL(path);
            const pathArr = url2.pathname.split(this.config.bucket);
            const pathname = pathArr[pathArr.length - 1];
            return this.config.imageUrl
                ? `${this.config.imageUrl}${pathname}`
                : `${this.s3Path}${pathname}`;
        }
        catch {
            return this.config.imageUrl
                ? `${this.config.imageUrl}/${path}`
                : `${this.s3Path}/${path}`;
        }
    }
    getKey(url) {
        try {
            const url2 = new URL(url);
            const pathArr = url2.pathname.split(`${this.config.bucket}/`);
            return pathArr[pathArr.length - 1];
        }
        catch {
            return url;
        }
    }
    getLocation(key) {
        return `${this.s3Path}/${key}`;
    }
    async createMultipartUpload(key, contentType) {
        const url = `${this.s3Path}/${key}?uploads`;
        const r2Url = new URL(url);
        r2Url.searchParams.set("X-Amz-Checksum-Algorithm", "SHA256");
        const request = new Request(r2Url.toString(), {
            method: "POST",
            headers: {
                "Content-Type": contentType || "application/octet-stream",
            },
            body: undefined,
        });
        const signedRequest = await this.aws.sign(request);
        const response = await fetch(signedRequest);
        const responseText = await response.text();
        const uploadIdMatch = responseText.match(/<UploadId>(.+)<\/UploadId>/);
        const uploadId = uploadIdMatch ? uploadIdMatch[1] : null;
        if (!uploadId) {
            throw new Error("Failed to create multipart upload");
        }
        return uploadId;
    }
    async getMultipart(key, uploadId) {
        try {
            const url = `${this.s3Path}/${key}?uploadId=${uploadId}`;
            const signedRequest = await this.aws.sign(new Request(url, {
                method: "GET",
            }), {
                aws: { signQuery: true },
            });
            const response = await fetch(signedRequest);
            const responseText = await response.text();
            const parser = new XMLParser({
                ignoreAttributes: false,
                ignoreDeclaration: true,
                removeNSPrefix: true,
            });
            const json = parser.parse(responseText);
            return json.ListPartsResult.Part ? json.ListPartsResult.Part : [];
        }
        catch {
            throw new Error("Failed to sign request.");
        }
    }
    async getMultipartUploadUrl(key, uploadId, partNumber) {
        const url = `${this.s3Path}/${key}?partNumber=${partNumber}&uploadId=${uploadId}`;
        const signedRequest = await this.aws.sign(new Request(url, {
            method: "PUT",
        }), {
            aws: { signQuery: true },
        });
        return signedRequest.url;
    }
    async completeMultipartUpload(key, uploadId, parts) {
        const url = `${this.s3Path}/${key}?uploadId=${uploadId}`;
        const body = `<CompleteMultipartUpload>${parts
            .map((part) => `<Part><PartNumber>${part.PartNumber}</PartNumber><ETag>${part.ETag}</ETag></Part>`)
            .join("")}</CompleteMultipartUpload>`;
        const signedRequest = await this.aws.sign(new Request(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/xml",
            },
            body,
        }));
        const response = await fetch(signedRequest);
        const responseText = await response.text();
        if (!response.ok) {
            throw new Error(`Complete multipart upload failed: ${response.status} ${responseText}`);
        }
        const location = parseXmlTag(responseText, "Location");
        if (!location) {
            throw new Error("Failed to get location from complete multipart upload response");
        }
        return location;
    }
    async abortMultipartUpload(key, uploadId) {
        const url = `${this.s3Path}/${key}?uploadId=${uploadId}`;
        const signedRequest = await this.aws.sign(new Request(url, {
            method: "DELETE",
        }));
        const response = await fetch(signedRequest);
        if (!response.ok) {
            throw new Error(`Abort multipart upload failed: ${response.status}`);
        }
    }
    async getResource(url) {
        const preUrl = `https://${this.config.accountId}.r2.cloudflarestorage.com/${this.config.bucket}/`;
        const key = url.split(preUrl)[1];
        const signed = await this.aws.sign(new Request(url, {
            method: "GET",
        }), {
            aws: { signQuery: true },
        });
        if (signed) {
            const res = await fetch(signed.url, signed);
            const headers = res.headers;
            const etag = headers.get("etag");
            const size = headers.get("content-length");
            const type = headers.get("content-type");
            const body = await res.arrayBuffer();
            return {
                size,
                type: type || "application/octet-stream",
                key,
                etag,
                url: res.url,
                body,
            };
        }
        return null;
    }
}
//# sourceMappingURL=s3.js.map