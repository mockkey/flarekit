import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import type { HonoEnv } from "load-context";
import { FileTrashService } from "server/services/file-trash-service";
import {
  transhFileIdsSchema,
  trashFileListquerySchema,
} from "server/types/file";

export const trashServer = new Hono<HonoEnv>();

trashServer.get(
  "/",
  zValidator("query", trashFileListquerySchema),
  async (c) => {
    try {
      const query = c.req.valid("query");
      const user = c.get("user");
      if (!user) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const files = await FileTrashService.getList(query, user.id);

      return c.json(files);
    } catch (error) {
      console.error("Error fetching files:", error);
      return c.json({ error: "Failed to fetch files" }, 500);
    }
  },
);

trashServer.delete(
  "/batch",
  zValidator("json", transhFileIdsSchema),
  async (c) => {
    const { ids } = c.req.valid("json");
    const user = c.get("user");
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    await FileTrashService.permanentDeleteBatch(ids, user.id);
    return c.json({ success: true });
  },
);

trashServer.delete("/:id", async (c) => {
  const { id } = c.req.param();
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const currentFile = await FileTrashService.permanentDelete(id, user.id);

  return c.json(currentFile);
});

trashServer.post(
  "/restore/batch",
  zValidator("json", transhFileIdsSchema),
  async (c) => {
    const { ids } = c.req.valid("json");
    const user = c.get("user");
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    await FileTrashService.restoreBatch(ids, user.id);
    return c.json({ success: true });
  },
);

trashServer.post("/restore/:id", async (c) => {
  const { id } = c.req.param();
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const currentFile = await FileTrashService.restore(id, user.id);
  return c.json(currentFile);
});
