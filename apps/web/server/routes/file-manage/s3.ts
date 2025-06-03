import { zValidator } from "@hono/zod-validator";
import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import type { HonoEnv } from "load-context";
import {
  CreateMultipartUpload,
  getmultipartSign,
  multipartComplete,
} from "server/lib/aws";
import { getS3LinkEtag } from "server/services/file";
import { FileService } from "server/services/file-service";
import type { fileMeta } from "server/types/file";
import { z } from "zod";
import { db } from "~/db/db.server";
import { file, userFiles } from "~/db/schema";

export const S3Server = new Hono<HonoEnv>();

const S3_KEY_PREFIX = "uploads/";

S3Server.post(
  "/check/multipart",
  zValidator(
    "json",
    z.object({
      hash: z.string(),
      filename: z.string(),
      type: z.string(),
      metadata: z.object({
        name: z.string(),
        type: z.string(),
      }),
      parentId: z.string().nullable(),
      uploadId: z.string().optional(),
      size: z.number(),
    }),
  ),
  async (c) => {
    const user = c.get("user");
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    const { hash, filename, size, type, parentId } = c.req.valid("json");
    const existingFile = await db.query.file.findFirst({
      where: and(eq(file.hash, hash), eq(file.size, size)),
    });

    if (existingFile) {
      const currentUserFile = await db
        .insert(userFiles)
        .values({
          userId: user.id,
          fileId: existingFile.id,
          parentId: parentId,
          name: filename,
          isDir: false,
          deletedAt: new Date(),
          createdAt: new Date(),
        })
        .returning();
      return c.json({
        exists: true,
        location: existingFile.storagePath,
        data: {
          id: currentUserFile[0].id,
        },
      });
    }

    console.log("existingFile", existingFile);
    const newuploadId = await CreateMultipartUpload(hash, type);
    console.log("newuploadId", newuploadId);
  },
);

S3Server.post(
  "/create/multipart/signed",
  zValidator(
    "json",
    z.object({
      type: z.string(),
      name: z.string(),
      hash: z.string(),
      uploadId: z.string().optional(),
      size: z.number(),
      parentId: z.string().nullable(),
    }),
  ),
  async (c) => {
    const { name, size, type, uploadId, hash, parentId } = c.req.valid("json");
    if (uploadId) {
      return c.json({ uploadId: uploadId });
    }
    const key = `${S3_KEY_PREFIX}${hash}/${name}`;
    const newuploadId = await CreateMultipartUpload(key, type);
    console.log(newuploadId);
    if (newuploadId) {
      await c.env.APP_KV.put(
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
    return c.json({ uploadId: newuploadId, key });
  },
);

S3Server.get(
  "/multipart/:uploadId/:partNumber",
  zValidator(
    "query",
    z.object({
      key: z.string(),
    }),
  ),
  async (c) => {
    const { key } = c.req.valid("query");
    if (key) {
      const { uploadId, partNumber } = c.req.param();
      const { key } = c.req.query();
      const SignUrl = await getmultipartSign(key, uploadId, partNumber);
      return c.json({
        url: SignUrl,
      });
    }
  },
);

S3Server.post(
  "/multipart/:uploadId/complete",
  zValidator(
    "query",
    z.object({
      key: z.string(),
    }),
  ),
  zValidator(
    "json",
    z.object({
      parts: z.array(
        z.object({
          ETag: z.string(),
          PartNumber: z.number(),
        }),
      ),
    }),
  ),
  async (c) => {
    const user = c.get("user");
    const { key } = c.req.query();
    const { parts } = await c.req.json();
    const { uploadId } = c.req.param();
    const location = await multipartComplete(key, uploadId, parts);
    const filemate = (await c.env.APP_KV.get(uploadId, "json")) as fileMeta;
    if (location && filemate && user) {
      const fileRecord = await FileService.addFile({
        userId: user.id,
        name: filemate.name,
        size: filemate.size,
        mime: filemate.type,
        hash: filemate.hash,
        storagePath: location,
        parentId: filemate.parentId,
      });
      await c.env.APP_KV.delete(uploadId);
      return c.json({
        location: location,
        data: fileRecord,
      });
    }
    return c.json({
      error: "server error",
    });
  },
);

S3Server.put(
  "/link",
  zValidator(
    "json",
    z.object({
      location: z.string(),
      "user-file-id": z.string(),
    }),
  ),
  async (c) => {
    const user = c.get("user");
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    c.header("Access-Control-Expose-Headers", "ETag");
    const reqJson = c.req.valid("json");
    const location = reqJson.location;
    const userFileId = reqJson["user-file-id"];

    const etag = await getS3LinkEtag({
      location,
      userFileId,
      userId: user.id,
    });

    if (etag) {
      return new Response(JSON.stringify({ location: location }), {
        headers: {
          "Content-Type": "application/json",
          ETag: etag,
          ignore: "true",
        },
        status: 200,
      });
    }

    return c.json(
      {
        error: "file missing!",
      },
      401,
    );
  },
);

export type AppType = typeof S3Server;
