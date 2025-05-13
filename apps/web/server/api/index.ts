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

//test
api.get("/ping", async (c) => {
  return c.json({
    message: "pong",
  });
});

export default api;
