import { env } from "cloudflare:workers";
import { AwsClient } from "aws4fetch";
import { XMLParser } from "fast-xml-parser";
import { parseXmlTag, stripEtag } from "./utils";

export const aws = new AwsClient({
  accessKeyId: env.ACCESS_KEY_ID,
  secretAccessKey: env.SECRET_KEY_ID,
  service: "s3",
  region: env.AWS_REGION,
});

export const S3Path = `https://${env.ACCOUNT_ID}.r2.cloudflarestorage.com/${env.AWS_BUCKET}`;

export async function createPresignedPutUrl(key: string) {
  const url = `${S3Path}/${key}`;
  const r2Url = new URL(url);
  //checksum 256
  r2Url.searchParams.set("X-Amz-Checksum-Algorithm", "SHA256");
  const res = await aws.sign(
    new Request(r2Url, {
      method: "PUT",
    }),
    {
      aws: { signQuery: true },
    },
  );
  return res.url;
}

export async function upload(key: string, file: Blob | ArrayBuffer) {
  const url = `${S3Path}/${key}`;
  const res = await aws.fetch(url, {
    method: "PUT",
    headers: {
      "Content-Length":
        file instanceof Blob
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
  };
}

export function getUrl(url: string) {
  try {
    const url2 = new URL(url);
    const pathArr = url2.pathname.split(env.AWS_BUCKET);
    const pathname = pathArr[pathArr.length - 1];
    return env.IMAGE_URL
      ? `${env.IMAGE_URL}${pathname}`
      : `${S3Path}${pathname}`;
  } catch {
    return env.IMAGE_URL ? `${env.IMAGE_URL}/${url}` : `${S3Path}/${url}`;
  }
}

export function getKey(url: string) {
  try {
    const url2 = new URL(url);
    const pathArr = url2.pathname.split(`${env.AWS_BUCKET}/`);
    return pathArr[pathArr.length - 1];
  } catch {
    return url;
  }
}

export function getLocalstion(key: string) {
  return `${S3Path}/${key}`;
}

export async function getS3Resource(url: string) {
  const preUrl = `https://${env.ACCOUNT_ID}.r2.cloudflarestorage.com/${env.AWS_BUCKET}/`;
  const key = url.split(preUrl)[1];
  const signed = await aws.sign(
    new Request(url, {
      method: "GET",
    }),
    {
      aws: { signQuery: true },
    },
  );

  if (signed) {
    const res = await fetch(signed.url, signed);
    const headers = res.headers;
    const etag = headers.get("etag");
    const size = headers.get("content-length");
    const type = headers.get("content-type");
    return {
      size,
      type,
      key,
      etag,
      url: res.url,
    };
  }
  return null;
}

export async function CreateMultipartUpload(key: string, type: string) {
  const url = `${S3Path}/${key}?uploads`;
  const r2Url = new URL(url);
  r2Url.searchParams.set("X-Amz-Checksum-Algorithm", "SHA256");
  const request = new Request(r2Url.toString(), {
    method: "POST",
    headers: {
      "Content-Type": type || "application/octet-stream",
    },
    body: undefined,
  });
  const signedRequest = await aws.sign(request);
  const response = await fetch(signedRequest);
  const responseText = await response.text();
  const uploadIdMatch = responseText.match(/<UploadId>(.+)<\/UploadId>/);
  const uploadId = uploadIdMatch ? uploadIdMatch[1] : null;
  return uploadId;
}

export async function getmultipartSign(
  key: string,
  uploadId: string,
  partNumber: string,
) {
  const url = `${S3Path}/${key}`;
  const r2Url = new URL(url);
  r2Url.searchParams.set("partNumber", partNumber);
  r2Url.searchParams.set("uploadId", uploadId);
  const request = new Request(r2Url.toString(), {
    method: "PUT",
  });
  const signedRequest = await aws.sign(request, {
    aws: { signQuery: true },
  });

  return signedRequest.url;
}

export interface S3Parts {
  ETag: string;
  PartNumber: number;
}

export async function multipartComplete(
  key: string,
  uploadId: string,
  parts: S3Parts[],
) {
  const url = `${S3Path}/${key}?uploadId=${uploadId}`;

  const partsXml = parts
    .map(
      (part: { PartNumber: number; ETag: string }) =>
        `<Part><PartNumber>${part.PartNumber}</PartNumber><ETag>${part.ETag}</ETag></Part>`,
    )
    .join("");
  const xmlBody = `<CompleteMultipartUpload>${partsXml}</CompleteMultipartUpload>`;

  const request = new Request(url.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/xml",
    },
    body: xmlBody,
  });

  const signedRequest = await aws.sign(request);
  const response = await fetch(signedRequest);
  const responseText = await response.text();
  const locationFromXml = parseXmlTag(responseText, "Location");
  return locationFromXml;
}

export async function getMultipart(key: string, uploadId: string) {
  try {
    const s3Host = `https://${env.ACCOUNT_ID}.r2.cloudflarestorage.com`;
    const url = new URL(`${S3Path}/${key}`);
    url.searchParams.set("uploadId", uploadId);
    url.searchParams.set("list-parts", "");
    const request = new Request(url.toString(), {
      method: "GET",
      headers: {
        Host: s3Host,
      },
    });
    const signedRequest = await aws.sign(request);
    const response = await fetch(signedRequest);
    const responseText = await response.text();
    const parser = new XMLParser({
      ignoreAttributes: false,
      ignoreDeclaration: true,
      removeNSPrefix: true,
    });
    const json = parser.parse(responseText);
    return json.ListPartsResult.Part ? json.ListPartsResult.Part : [];
  } catch {
    throw new Error("Failed to sign request.");
  }
}

export async function deleteMultipart(key: string, uploadId: string) {
  try {
    const s3Host = `https://${env.ACCOUNT_ID}.r2.cloudflarestorage.com`;
    const url = new URL(`${s3Host}/${env.AWS_BUCKET}/${key}`);
    url.searchParams.set("uploadId", uploadId);
    const request = new Request(url.toString(), {
      method: "DELETE",
      headers: {
        Host: s3Host,
      },
    });
    const signedRequest = await aws.sign(request);
    const response = await fetch(signedRequest);
    const responseText = await response.text();
    const parser = new XMLParser({
      ignoreAttributes: false,
      ignoreDeclaration: true,
      removeNSPrefix: true,
    });
    const json = parser.parse(responseText);

    return {
      parts: json.Part,
      isTruncated: json.IsTruncated,
      nextPartNumberMarker: json.NextPartNumberMarker,
    };
  } catch {
    throw new Error("Failed to sign request.");
  }
}

export async function getDownloadPresignedUrl(
  storagePath: string,
  finalFileName = "unknown",
) {
  const url = new URL(storagePath);
  url.searchParams.set(
    "response-content-disposition",
    `attachment; filename="${encodeURIComponent(finalFileName)}"`,
  );
  url.searchParams.set("response-content-type", "application/octet-stream");
  url.searchParams.set("X-Amz-Expires", "3600");
  const signed = await aws.sign(
    new Request(url.toString(), {
      method: "GET",
    }),
    {
      aws: { signQuery: true },
    },
  );
  return signed.url;
}
