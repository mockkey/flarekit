import { Hono } from "hono";
import type { HonoEnv } from "load-context";
import { requireAuth } from "server/middleware/auth";
import { StorageService } from "server/services/storage-service";

const storageApi = new Hono<HonoEnv>();

storageApi.get(
  "/remaining",
  requireAuth({
    storage: ["read"],
  }),
  async (c) => {
    const userId = c.get("userId");
    const storage = await StorageService.ensureStorage(userId);
    return c.json({
      usedStorage: storage.usedStorage,
      totalStorage: storage.storage,
      isPro: storage.metadata
        ? JSON.parse(storage.metadata).type !== "free"
        : false,
    });
  },
);

export default storageApi;
