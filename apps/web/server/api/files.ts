import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import type { HonoEnv } from "load-context";
import { FileService } from "server/services/file-service";
import {
  changeNameSchema,
  createFolderSchema,
  fileListquerySchema,
} from "server/types/file";
import { z } from "zod";
import { requireAuth } from "../middleware/auth";

const filesApi = new Hono<HonoEnv>();

filesApi.get(
  "/",
  requireAuth({
    files: ["read"],
  }),
  zValidator("query", fileListquerySchema),
  async (c) => {
    const query = c.req.valid("query");
    const userId = c.get("userId");
    const files = await FileService.getList(query, userId);
    return c.json(files);
  },
);

filesApi.get(
  "/:id",
  requireAuth({
    files: ["read"],
  }),
  async (c) => {
    const { id } = c.req.param();
    const userId = c.get("userId");
    const file = await FileService.getFileById(id, userId);
    return c.json(file);
  },
);

filesApi.post(
  "/folder/create",
  requireAuth({
    files: ["write"],
  }),
  zValidator("json", createFolderSchema),
  async (c) => {
    const userId = c.get("userId");
    const { name, parentId } = c.req.valid("json");
    const newFolder = await FileService.createFolder(userId, name, parentId);
    return c.json(newFolder, 201);
  },
);

filesApi.delete(
  "/delete",
  requireAuth({
    files: ["delete"],
  }),
  zValidator(
    "json",
    z.object({
      ids: z.array(z.string()).min(1),
    }),
  ),
  async (c) => {
    const userId = c.get("userId");
    if (!userId) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    const { ids } = c.req.valid("json");
    if (ids.length !== 1) {
      return c.json(
        { error: "Permanent delete only supports one file at a time." },
        400,
      );
    }
    // Handle batch delete
    await FileService.delete(ids[0], userId);
    return c.json({ success: true });
  },
);

filesApi.delete(
  "/permanent-delete",
  requireAuth({
    files: ["delete"],
  }),
  zValidator(
    "json",
    z.object({
      ids: z.array(z.string()).min(1),
    }),
  ),
  async (c) => {
    const userId = c.get("userId");
    if (!userId) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { ids } = c.req.valid("json");
    if (ids.length !== 1) {
      return c.json(
        { error: "Permanent delete only supports one file at a time." },
        400,
      );
    }
    await FileService.delete(ids[0], userId, true);
    return c.json({ success: true });
  },
);

filesApi.post(
  "/rename",
  requireAuth({
    files: ["write"],
  }),
  zValidator("json", changeNameSchema),
  async (c) => {
    const userId = c.get("userId");
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

filesApi.get(
  "/breadcrumbs/:parentId",
  requireAuth({ files: ["write"] }),
  async (c) => {
    const { parentId } = c.req.param();
    const userId = c.get("userId");
    const breadcrumbs = await FileService.getBreadcrumbs(parentId, userId);
    return c.json(breadcrumbs);
  },
);

filesApi.get("/download/:id", requireAuth({ files: ["write"] }), async (c) => {
  const { id } = c.req.param();
  const userId = c.get("userId");
  console.log("/download", userId);
  const presignedUrl = await FileService.downloadUserFile(userId, id);
  return c.json({ url: presignedUrl });
});

filesApi.get("/:id/download", requireAuth({ files: ["write"] }), async (c) => {
  const { id } = c.req.param();
  const userId = c.get("userId");
  const presignedUrl = await FileService.downloadUserFile(userId, id);
  return c.redirect(presignedUrl);
});

export default filesApi;
