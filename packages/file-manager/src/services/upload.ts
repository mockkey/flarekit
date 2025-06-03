import { postData, putDate } from "@flarekit/common/fetch";

export async function checkFileExists(prorps: {
  hash: string;
  size: number;
  type: string;
  name: string;
  parentId: null | string;
}) {
  const res = await postData<{
    exists: boolean;
    error: string;
    data:
      | undefined
      | {
          location: string;
          id: string;
        };
  }>("/rpc/upload/check", prorps);
  return res;
}

export async function createSigned(prorps: {
  hash: string;
  size: number;
  type: string;
  parentId: string | null;
  name: string;
}) {
  const res = await postData<{
    url: string;
  }>("/rpc/s3/create/signed", prorps);
  return res;
}

export async function createMultipartSigned(prorps: {
  hash: string;
  size: number;
  type: string;
  parentId: string | null;
  name: string;
}) {
  const res = await postData<{
    key: string;
    uploadId: string;
  }>("/rpc/s3/create/multipart/signed", prorps);
  return res;
}

export async function linkS3(prorps: {
  location: string;
  "user-file-id": string;
}) {
  const res = await putDate("/rpc/s3/link", prorps);
  return res;
}
