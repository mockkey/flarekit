import * as schema from "@/schema";
import { eq } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";

type CreateUserStorageParams = Omit<
  schema.UserStorage,
  "id" | "usedStorage" | "status" | "createdAt" | "updatedAt"
>;
type UpdateUserStorageParams = Partial<
  Omit<schema.UserStorage, "id" | "userId" | "createdAt" | "updatedAt">
>;
type CreateStorageUsageLogParams = Omit<
  schema.StorageUsageLogs,
  "id" | "createdAt"
>;

export class StorageDbService {
  constructor(private db: DrizzleD1Database<typeof schema>) {}

  // Get user storage information
  async getUserStorage(userId: string) {
    return await this.db
      .select()
      .from(schema.userStorage)
      .where(eq(schema.userStorage.userId, userId))
      .get();
  }

  // Create user storage
  async createUserStorage(params: CreateUserStorageParams) {
    return await this.db
      .insert(schema.userStorage)
      .values({
        ...params,
        usedStorage: 0,
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()
      .get();
  }

  // Update user storage
  async updateUserStorage(userId: string, params: UpdateUserStorageParams) {
    return await this.db
      .update(schema.userStorage)
      .set({
        ...params,
        updatedAt: new Date(),
      })
      .where(eq(schema.userStorage.userId, userId))
      .returning()
      .get();
  }

  // Delete user storage
  async deleteUserStorage(userId: string) {
    return await this.db
      .delete(schema.userStorage)
      .where(eq(schema.userStorage.userId, userId))
      .returning()
      .get();
  }

  // Get storage usage logs
  async getStorageUsageLogs(userId: string, limit = 10) {
    return await this.db
      .select()
      .from(schema.storageUsageLogs)
      .where(eq(schema.storageUsageLogs.userId, userId))
      .orderBy(schema.storageUsageLogs.createdAt)
      .limit(limit);
  }

  // Add storage usage log
  async addStorageUsageLog(params: CreateStorageUsageLogParams) {
    return await this.db
      .insert(schema.storageUsageLogs)
      .values({
        ...params,
        createdAt: new Date(),
      })
      .returning()
      .get();
  }

  // Check user storage quota
  async checkUserStorageQuota(userId: string, fileSizeBytes: number) {
    const storage = await this.getUserStorage(userId);
    if (!storage) {
      return false;
    }
    return storage.usedStorage + fileSizeBytes <= storage.storage;
  }
}
