import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import type { HonoEnv } from "load-context";
import { deleteMultipart, getMultipart } from "server/lib/aws";
import { UploadService } from "server/services/upload-service";
import {
  checkFileSchema,
  createSigned,
  partItem,
  uploadKey,
  uploadSchema,
} from "server/types/upload";
import { requireAuth } from "../middleware/auth";
const uploadApi = new Hono<HonoEnv>();

uploadApi.post(
  "/check",
  requireAuth({
    files: ["write"],
  }),
  zValidator("json", checkFileSchema),
  async (c) => {
    const userId = c.get("userId");
    const { hash, size, type, parentId, name } = c.req.valid("json");
    const currentFile = await UploadService.checkFile(
      {
        hash,
        size,
        type,
        name,
        parentId,
      },
      userId,
    );
    if (currentFile) {
      return c.json({
        exists: true,
        data: currentFile,
      });
    }
    return c.json({
      exists: false,
    });
  },
);

uploadApi.post(
  "/signed",
  requireAuth({
    files: ["write"],
  }),
  zValidator("json", createSigned),
  async (c) => {
    const userId = c.get("userId");
    const { uploadId, hash, name, parentId } = c.req.valid("json");
    if (uploadId) {
      return c.json({ uploadId: uploadId });
    }
    const baseUrl = c.req.url.split("/signed")[0];

    const NewuploadId = await UploadService.createSigned({
      hash: hash,
      key: `${userId}/${crypto.randomUUID()}`,
      userId,
      name,
      parentId,
    });
    return c.json({
      url: NewuploadId.url
        ? ` ${baseUrl}${NewuploadId.url}`
        : NewuploadId.location,
    });
  },
);

uploadApi.post(
  "/multipart/signed",
  requireAuth({
    files: ["write"],
  }),
  zValidator("json", createSigned),
  async (c) => {
    const { name, size, type, uploadId, hash, parentId } = c.req.valid("json");
    if (uploadId) {
      return c.json({ uploadId: uploadId });
    }
    const NewuploadId = await UploadService.CreateMultiSigned({
      hash,
      size,
      type,
      name,
      parentId,
    });
    return c.json(NewuploadId);
  },
);

uploadApi.post(
  "/:uploadId/complete",
  requireAuth({
    files: ["write"],
  }),
  zValidator("query", uploadKey),
  zValidator("json", partItem),
  async (c) => {
    const userId = c.get("userId");
    const { key } = c.req.query();
    const { parts } = await c.req.json();
    const { uploadId } = c.req.param();
    const data = await UploadService.complete({
      key,
      uploadId,
      parts,
      userId,
    });

    if (data) {
      return c.json(data);
    }

    return c.json({
      error: "server error",
    });
  },
);

uploadApi.get(
  "/multipart/:uploadId",
  requireAuth({
    files: ["write"],
  }),
  zValidator("query", uploadKey),
  async (c) => {
    const { key } = c.req.valid("query");
    if (key) {
      const { uploadId } = c.req.param();
      const { key } = c.req.query();
      const SignUrl = await getMultipart(key, uploadId);
      return c.json(SignUrl);
    }
  },
);

uploadApi.delete(
  "/multipart/:uploadId",
  requireAuth({
    files: ["write"],
  }),
  zValidator("query", uploadKey),
  async (c) => {
    const { key } = c.req.valid("query");
    if (key) {
      const { uploadId } = c.req.param();
      const { key } = c.req.query();
      const SignUrl = await deleteMultipart(key, uploadId);
      return c.json({
        url: SignUrl,
      });
    }
  },
);

uploadApi.put(
  "/",
  requireAuth({
    files: ["write"],
  }),
  zValidator("form", uploadSchema),
  async (c) => {
    const userId = c.get("userId");
    const contentLength = Number(c.req.header("Content-Length") || "0");
    const { parentId, file } = c.req.valid("form");
    const contentType = file.type;
    const blob = new Blob([file], { type: contentType });
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("MD5", arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const md5 = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    // if (hash !== md5) {
    //   throw new ConflictError(
    //     "File hash mismatch: upload corrupted or tampered.",
    //   );
    // }
    const fileRecord = await UploadService.upload({
      userId,
      size: contentLength,
      body: blob,
      contentType,
      name: file.name,
      parentId: parentId || null,
      hash: md5,
    });
    return c.json(fileRecord);
  },
);

export default uploadApi;
