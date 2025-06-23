import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import type { HonoEnv } from "load-context";
import { FileTrashService } from "server/services/file-trash-service";
import { trashFileListquerySchema } from "server/types/file";

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

trashServer.delete("/:id", async (c) => {
  const { id } = c.req.param();
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const currentFile = await FileTrashService.permanentDelete(id, user.id);

  return c.json(currentFile);
});

trashServer.post("/restore/:id", async (c) => {
  const { id } = c.req.param();
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const currentFile = await FileTrashService.restore(id, user.id);
  return c.json(currentFile);
});
