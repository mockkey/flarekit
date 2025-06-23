import { env } from "cloudflare:workers";
import { DbService } from "@flarekit/db";
import {
  CreateMultipartUpload,
  type S3Parts,
  createPresignedPutUrl,
  getLocalstion,
  getUrl,
  multipartComplete,
  upload,
} from "server/lib/aws";
import { ConflictError } from "server/lib/error";
import { setThumbnailFileId } from "server/routes/viewer";
import { FileService } from "./file-service";
import { StorageService } from "./storage-service";

const S3_KEY_PREFIX = "uploads";

export interface fileMeta {
  name: string;
  hash: string;
  type: string;
  size: number;
  parentId: null | string;
}

const dbService = DbService(env.DB);
// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class UploadService {
  static async checkFile(
    {
      hash,
      size,
      type,
      parentId,
      name,
    }: {
      hash: string;
      size: number;
      type: string;
      parentId: string | null;
      name: string;
    },
    userId: string,
  ) {
    const isLimit = await StorageService.checkStorageLimit(userId, size);
    if (!isLimit) {
      throw new ConflictError("Storage limit exceeded");
    }
    const currentFile = await dbService?.files.getFileByHash(hash);
    if (
      currentFile &&
      currentFile.file.size === size &&
      currentFile.file.type === type
    ) {
      //
      const file = await dbService?.files.createUserFile({
        userId: userId,
        fileId: currentFile.file.id,
        parentId: parentId,
        name: name,
        isDir: false,
        deletedAt: new Date(),
        createdAt: new Date(),
      });

      return {
        id: file.id,
        location: file.location,
      };
    }
    return false;
  }

  static async upload({
    userId,
    body,
    contentType,
    size,
    name,
    parentId,
    hash,
  }: {
    userId: string;
    body: Blob;
    contentType: string;
    size: number;
    name: string;
    parentId: string | null;
    hash: string;
  }) {
    const isLimit = await StorageService.checkStorageLimit(userId, size);
    if (!isLimit) {
      throw new ConflictError("Storage limit exceeded");
    }

    const currentFile = await dbService?.files.getFileByHash(hash);

    if (currentFile?.file) {
      const file = await dbService?.files.createUserFile({
        userId: userId,
        fileId: currentFile.file.id,
        parentId: parentId,
        name: name,
        isDir: false,
      });
      await StorageService.updateStorageWithLog({
        userId,
        fileId: file.id,
        action: "upload",
        size: currentFile.file.size || 0,
        metadata: {
          location: currentFile.file.storagePath,
          hash: currentFile.file.hash,
          etag: hash,
        },
      });

      return {
        name,
        fileId: file.id,
        type: "file",
        parentId: parentId,
        size: size,
        mime: contentType,
        thumbnail:
          currentFile.thumbnail?.storagePath &&
          getUrl(currentFile.thumbnail?.storagePath),
        url:
          currentFile.file.mime?.startsWith("image/") &&
          currentFile.file.mime !== "image/svg+xml"
            ? currentFile.thumbnail?.storagePath
              ? `${getUrl(currentFile.file?.storagePath)}`
              : `${getUrl(currentFile.file?.storagePath)}`
            : `/viewer/${currentFile.file.id}`,
      };
    }

    const key = `${hash}/${crypto.randomUUID()}`;
    const { hash: etag } = await upload(key, body);
    if (etag !== hash) {
      //logs
      throw new ConflictError(
        "File hash mismatch: upload corrupted or tampered.",
      );
    }
    const location = getLocalstion(key);
    const fileRecord = await FileService.addFile({
      userId: userId,
      name: name,
      size: size,
      mime: contentType,
      hash: hash,
      storagePath: location,
      parentId: parentId || null,
    });

    // add qm
    if (contentType.includes("image") && contentType !== "image/svg+xml") {
      if (env.THUMBNAIL_QUEUE) {
        await env.THUMBNAIL_QUEUE.send({
          fileId: fileRecord.id,
          userId: userId,
        });
      } else {
        await setThumbnailFileId(fileRecord.id);
      }
    }

    return {
      name,
      fileId: fileRecord.id,
      type: "file",
      parentId: parentId,
      size: size,
      mime: contentType,
      url: getUrl(location),
    };
  }

  static async createSigned({
    hash,
    key,
    userId,
    parentId,
    name,
  }: {
    hash: string;
    key: string;
    userId: string;
    parentId: string | null;
    name: string;
  }) {
    const currentFile = await dbService?.files.getFileByHash(hash);
    if (currentFile) {
      await dbService?.files.createUserFile({
        userId: userId,
        fileId: currentFile.file.id,
        parentId: parentId,
        name: name,
        isDir: false,
      });
      return { location: getUrl(currentFile.file.storagePath) };
    }
    const url = `${S3_KEY_PREFIX}/${key}`;
    const preSignedUrl = await createPresignedPutUrl(url);
    await env.APP_KV.put(
      key,
      JSON.stringify({
        url: preSignedUrl,
        parentId: parentId,
      }),
      {
        expirationTtl: 3600,
      },
    );

    return {
      url: `/${key}`,
    };
  }

  static async CreateMultiSigned({
    hash,
    name,
    type,
    size,
    parentId,
  }: {
    hash: string;
    name: string;
    type: string;
    size: number;
    parentId: string | null;
  }) {
    const key = `${S3_KEY_PREFIX}/${hash}/${name}`;
    const newuploadId = await CreateMultipartUpload(key, type);
    if (newuploadId) {
      await env.APP_KV.put(
        newuploadId,
        JSON.stringify({
          hash: hash,
          type,
          size,
          parentId,
          name,
        }),
        {
          expirationTtl: 3600 * 24,
        },
      );
    }
    return {
      uploadId: newuploadId,
      key,
    };
  }

  static async complete({
    key,
    uploadId,
    parts,
    userId,
  }: {
    key: string;
    uploadId: string;
    parts: S3Parts[];
    userId: string;
  }) {
    const location = await multipartComplete(key, uploadId, parts);
    const filemate = (await env.APP_KV.get(uploadId, "json")) as fileMeta;
    if (location && filemate && userId) {
      const fileRecord = await FileService.addFile({
        userId: userId,
        name: filemate.name,
        size: filemate.size,
        mime: filemate.type,
        hash: filemate.hash,
        storagePath: location,
        parentId: filemate.parentId,
      });
      await env.APP_KV.delete(uploadId);
      //check if file is image and push queue to generate thumbnail
      if (
        filemate.type.includes("image") &&
        filemate.type !== "image/svg+xml"
      ) {
        if (env.THUMBNAIL_QUEUE) {
          await env.THUMBNAIL_QUEUE.send({
            fileId: fileRecord.id,
            userId: userId,
          });
        } else {
          await setThumbnailFileId(fileRecord.id);
        }
      }

      return {
        location: location,
        data: fileRecord,
      };
    }
  }
}
