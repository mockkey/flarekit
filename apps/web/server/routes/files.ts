import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import type { HonoEnv } from "load-context";
import { FileService } from "server/services/file-service";
import { StorageService } from "server/services/storage-service";
import {
  changeNameSchema,
  createFolderSchema,
  fileIdSchema,
  fileListquerySchema,
  transhFileIdsSchema,
} from "server/types/file";

export const filesServer = new Hono<HonoEnv>();

filesServer.get("/storage", async (c) => {
  const userId = c.get("userId");
  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const storage = await StorageService.ensureStorage(userId);
  return c.json({
    usedStorage: storage.usedStorage,
    totalStorage: storage.storage,
    isPro: storage.metadata
      ? JSON.parse(storage.metadata).type !== "free"
      : false,
  });
});

filesServer.get("/", zValidator("query", fileListquerySchema), async (c) => {
  try {
    const query = c.req.valid("query");
    const userId = c.get("userId");
    if (!userId) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    const files = await FileService.getList(query, userId);

    return c.json(files);
  } catch (error) {
    console.error("Error fetching files:", error);
    return c.json({ error: "Failed to fetch files" }, 500);
  }
});

filesServer.get("/:id", async (c) => {
  const { id } = c.req.param();
  const userId = c.get("userId");
  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const file = await FileService.getFileById(id, userId);
  return c.json(file);
});

filesServer.post(
  "/folder/create",
  zValidator("json", createFolderSchema),
  async (c) => {
    const userId = c.get("userId");
    if (!userId) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    const { name, parentId } = c.req.valid("json");
    const newFolder = await FileService.createFolder(userId, name, parentId);
    return c.json(
      {
        success: true,
        folder: newFolder,
      },
      201,
    );
  },
);

//delete
filesServer.post("/delete", zValidator("json", fileIdSchema), async (c) => {
  const userId = c.get("userId");
  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const { id } = c.req.valid("json");
  await FileService.delete(id, userId);
  return c.json({ success: true });
});

filesServer.delete(
  "/batch",
  zValidator("json", transhFileIdsSchema),
  async (c) => {
    const userId = c.get("userId");
    if (!userId) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    const { ids } = c.req.valid("json");
    await FileService.batchDeleteFiles(ids, userId);
    return c.json({ success: true });
  },
);

filesServer.delete(
  "/batch/permanent-delete",
  zValidator("json", transhFileIdsSchema),
  async (c) => {
    const userId = c.get("userId");
    if (!userId) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    const { ids } = c.req.valid("json");
    await FileService.batchDeleteFiles(ids, userId, true);
    return c.json({ success: true });
  },
);

//change-name
filesServer.post(
  "/change-name",
  zValidator("json", changeNameSchema),
  async (c) => {
    const userId = c.get("userId");
    if (!userId) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    const { id, name } = c.req.valid("json");
    if (!id || !name) {
      return c.json({ error: "ID and name are required" }, 400);
    }
    const currentFIles = await FileService.renameFile(id, userId, name);
    return c.json({
      message: "ok",
      data: currentFIles,
    });
  },
);

filesServer.get("/breadcrumbs/:parentId", async (c) => {
  const { parentId } = c.req.param();
  const userId = c.get("userId");
  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const breadcrumbs = await FileService.getBreadcrumbs(parentId, userId);

  return c.json(breadcrumbs);
});

filesServer.get("/download/:id", async (c) => {
  const { id } = c.req.param();
  const userId = c.get("userId");
  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const presignedUrl = await FileService.downloadUserFile(userId, id);
  return c.json({ url: presignedUrl });
});

filesServer.get("/:id/download", async (c) => {
  const { id } = c.req.param();
  const userId = c.get("userId");
  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const presignedUrl = await FileService.downloadUserFile(userId, id);
  return c.redirect(presignedUrl);
});
