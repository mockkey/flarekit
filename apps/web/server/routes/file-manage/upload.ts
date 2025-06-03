import { zValidator } from "@hono/zod-validator";
import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import type { HonoEnv } from "load-context";
import { z } from "zod";
import { db } from "~/db/db.server";
import { file, userFiles } from "~/db/schema";

import { StorageService } from "server/services/storage-service";

export const uploadServer = new Hono<HonoEnv>();

async function checkFileExists({
  hash,
  size,
  type,
}: {
  hash: string;
  size: number;
  type: string;
}) {
  const existingFile = await db.query.file.findFirst({
    where: and(eq(file.hash, hash), eq(file.size, size), eq(file.mime, type)),
  });
  return existingFile;
}

uploadServer.post(
  "/check",
  zValidator(
    "json",
    z.object({
      name: z.string(),
      hash: z.string(),
      size: z.number(),
      type: z.string(),
      parentId: z.string().nullable(),
    }),
  ),
  async (c) => {
    const user = c.get("user");
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    const { hash, size, type, parentId, name } = c.req.valid("json");
    //check limit
    const isLimit = await StorageService.checkStorageLimit(user.id, size);
    if (!isLimit) {
      return c.json({
        error: "Storage limit exceeded",
        code: "STORAGE_LIMIT_EXCEEDED",
        details: {
          requiredSize: size,
        },
      });
    }

    const currentFile = await checkFileExists({
      hash,
      size,
      type,
    });
    if (currentFile) {
      const currentUserFile = await db
        .insert(userFiles)
        .values({
          userId: user.id,
          fileId: currentFile.id,
          parentId: parentId,
          name: name,
          isDir: false,
          deletedAt: new Date(),
          createdAt: new Date(),
        })
        .returning();
      return c.json({
        exists: true,
        data: {
          id: currentUserFile[0].id,
          location: currentFile.storagePath,
        },
      });
    }
    return c.json({
      exists: false,
    });
  },
);
