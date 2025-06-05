import { env } from "cloudflare:workers";
import { AwsClient } from "aws4fetch";
import { XMLParser } from "fast-xml-parser";
import { parseXmlTag } from "./utils";

export const aws = new AwsClient({
  accessKeyId: env.ACCESS_KEY_ID,
  secretAccessKey: env.SECRET_KEY_ID,
  service: "s3",
  region: env.AWS_REGION,
});

export async function createPresignedPutUrl(key: string) {
  const url = `https://${env.ACCOUNT_ID}.r2.cloudflarestorage.com/${env.AWS_BUCKET}/${key}`;
  const res = await aws.sign(
    new Request(url, {
      method: "PUT",
    }),
    {
      aws: { signQuery: true },
    },
  );
  return res.url;
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
  const url = `https://${env.ACCOUNT_ID}.r2.cloudflarestorage.com/${env.AWS_BUCKET}/${key}?uploads`;
  const request = new Request(url.toString(), {
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
  const url = `https://${env.ACCOUNT_ID}.r2.cloudflarestorage.com/${env.AWS_BUCKET}/${key}`;
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
  const url = `https://${env.ACCOUNT_ID}.r2.cloudflarestorage.com/${env.AWS_BUCKET}/${key}?uploadId=${uploadId}`;

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
    const url = new URL(`${s3Host}/${env.AWS_BUCKET}/${key}`);
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
