import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import type { HonoEnv } from "load-context";
import { FileTrashService } from "server/services/file-trash-service";
import { trashFileListquerySchema } from "server/types/file";
import { requireAuth } from "../middleware/auth";

const trashApi = new Hono<HonoEnv>();

trashApi.get(
  "/",
  requireAuth({ trash: ["read"] }),
  zValidator("query", trashFileListquerySchema),
  async (c) => {
    try {
      const query = c.req.valid("query");
      const userId = c.get("userId");
      const files = await FileTrashService.getList(query, userId);
      return c.json(files);
    } catch (_error) {
      return c.json({ error: "Failed to fetch files" }, 500);
    }
  },
);

trashApi.delete("/:id", requireAuth({ trash: ["delete"] }), async (c) => {
  const { id } = c.req.param();
  const userId = c.get("userId");
  const currentFile = await FileTrashService.permanentDelete(id, userId);
  return c.json(currentFile);
});

trashApi.post(
  "/restore/:id",
  requireAuth({ trash: ["restore"] }),
  async (c) => {
    const { id } = c.req.param();
    const userId = c.get("userId");
    const currentFile = await FileTrashService.restore(id, userId);
    return c.json(currentFile);
  },
);

export default trashApi;
