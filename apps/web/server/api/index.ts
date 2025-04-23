import { Hono } from "hono";
import { requireAuth } from "../middleware/auth";

const api = new Hono();

api.get(
  "/files",
  requireAuth({
    files: ["read"],
  }),
  async (c) => {
    return c.json({ files: [] });
  },
);

export default api;
