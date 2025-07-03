import { env } from "cloudflare:workers";
import { desc, eq } from "drizzle-orm";
import { db } from "~/db/db.server";
import { storageUsageLogs, userStorage } from "~/db/schema";

const FREE_STORAGE_LIMIT = Number(env.FREE_STORAGE_LIMIT) * 1024 * 1024;

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class StorageService {
  static async initializeUserStorage(userId: string) {
    const existingStorage = await db
      .select()
      .from(userStorage)
      .where(eq(userStorage.userId, userId))
      .get();

    if (existingStorage) {
      return {
        storage: existingStorage.storage,
        type: JSON.parse(existingStorage.metadata || "{}").type || "free",
      };
    }
    await db.insert(userStorage).values({
      userId,
      storage: FREE_STORAGE_LIMIT,
      usedStorage: 0,
      status: "active",
      metadata: JSON.stringify({
        type: "free",
        activatedAt: new Date().toISOString(),
      }),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return {
      storage: FREE_STORAGE_LIMIT,
      type: "free",
    };
  }

  static async ensureStorage(userId: string) {
    const storage = await db
      .select()
      .from(userStorage)
      .where(eq(userStorage.userId, userId))
      .get();

    if (storage) return storage;

    // Initialize new storage record
    const newStorage = {
      userId,
      storage: FREE_STORAGE_LIMIT,
      usedStorage: 0,
      status: "active",
      metadata: JSON.stringify({
        type: "free",
        activatedAt: new Date().toISOString(),
      }),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.insert(userStorage).values(newStorage);
    return newStorage;
  }

  static async checkStorageLimit(userId: string, fileSize: number) {
    const storage = await db
      .select()
      .from(userStorage)
      .where(eq(userStorage.userId, userId))
      .get();

    if (!storage) return false;
    return storage.usedStorage + fileSize <= storage.storage;
  }

  static async updateUsedStorage(userId: string, newSize: number) {
    await db
      .update(userStorage)
      .set({
        usedStorage: newSize,
        updatedAt: new Date(),
      })
      .where(eq(userStorage.userId, userId));
  }

  static async updateStorageWithLog(params: {
    userId: string;
    fileId: string;
    action:
      | "upload"
      | "delete"
      | "restore"
      | "create_folder"
      | "permanent_delete";
    size: number;
    metadata?: Record<string, string | number | boolean | null>;
  }) {
    const storage = await db
      .select()
      .from(userStorage)
      .where(eq(userStorage.userId, params.userId))
      .get();

    if (!storage) throw new Error("Storage record not found");
    const oldUsage = storage.usedStorage;
    let newUsage = oldUsage;

    switch (params.action) {
      case "upload":
        newUsage = oldUsage + params.size;
        break;
      case "permanent_delete":
        newUsage = Math.max(0, oldUsage - params.size);
        break;
      case "restore":
        newUsage = oldUsage;
        break;
      case "create_folder":
        newUsage = oldUsage;
        break;
    }

    if (params.action === "create_folder") {
      await db.insert(storageUsageLogs).values({
        userId: params.userId,
        fileId: params.fileId || "",
        action: params.action,
        size: 0,
        oldUsage,
        newUsage,
        metadata: params.metadata ? JSON.stringify(params.metadata) : null,
        createdAt: new Date(),
      });
    } else {
      await db
        .update(userStorage)
        .set({
          usedStorage: newUsage,
          updatedAt: new Date(),
        })
        .where(eq(userStorage.userId, params.userId));
      await db.insert(storageUsageLogs).values({
        userId: params.userId,
        fileId: params.fileId,
        action: params.action,
        size: params.size,
        oldUsage,
        newUsage,
        metadata: params.metadata ? JSON.stringify(params.metadata) : null,
        createdAt: new Date(),
      });
    }

    return { oldUsage, newUsage };
  }

  static async getStorageUsageLogs(userId: string, limit = 10) {
    return await db
      .select()
      .from(storageUsageLogs)
      .where(eq(storageUsageLogs.userId, userId))
      .orderBy(desc(storageUsageLogs.createdAt))
      .limit(limit);
  }
}
