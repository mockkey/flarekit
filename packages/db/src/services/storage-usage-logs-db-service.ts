import { desc, eq } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from "../schema";

type CreateStorageUsageLogParams = Omit<
  schema.StorageUsageLogs,
  "id" | "createdAt"
>;
type UpdateStorageUsageLogParams = Partial<
  Omit<schema.StorageUsageLogs, "id" | "userId" | "fileId" | "createdAt">
>;

export class StorageUsageLogsDbService {
  constructor(private db: DrizzleD1Database<typeof schema>) {}

  // Get storage usage log by ID
  async getStorageUsageLogById(id: string) {
    return this.db
      .select()
      .from(schema.storageUsageLogs)
      .where(eq(schema.storageUsageLogs.id, id))
      .get();
  }

  // Get storage usage logs by user ID
  async getStorageUsageLogsByUserId(userId: string, limit = 10) {
    return this.db
      .select()
      .from(schema.storageUsageLogs)
      .where(eq(schema.storageUsageLogs.userId, userId))
      .orderBy(desc(schema.storageUsageLogs.createdAt))
      .limit(limit);
  }

  // Get storage usage logs by file ID
  async getStorageUsageLogsByFileId(fileId: string) {
    return this.db
      .select()
      .from(schema.storageUsageLogs)
      .where(eq(schema.storageUsageLogs.fileId, fileId))
      .orderBy(desc(schema.storageUsageLogs.createdAt));
  }

  // Create storage usage log
  async createStorageUsageLog(params: CreateStorageUsageLogParams) {
    return this.db
      .insert(schema.storageUsageLogs)
      .values({
        ...params,
        createdAt: new Date(),
      })
      .returning()
      .get();
  }

  // Update storage usage log
  async updateStorageUsageLog(id: string, params: UpdateStorageUsageLogParams) {
    return this.db
      .update(schema.storageUsageLogs)
      .set(params)
      .where(eq(schema.storageUsageLogs.id, id))
      .returning()
      .get();
  }

  // Delete storage usage log
  async deleteStorageUsageLog(id: string) {
    return this.db
      .delete(schema.storageUsageLogs)
      .where(eq(schema.storageUsageLogs.id, id))
      .returning()
      .get();
  }

  // Get total storage usage by user
  async getTotalStorageUsageByUser(userId: string) {
    const result = await this.db
      .select({
        totalUsage: schema.storageUsageLogs.newUsage,
      })
      .from(schema.storageUsageLogs)
      .where(eq(schema.storageUsageLogs.userId, userId))
      .orderBy(desc(schema.storageUsageLogs.createdAt))
      .limit(1)
      .get();

    return result?.totalUsage || 0;
  }

  // Get storage usage statistics by user
  async getStorageUsageStatsByUser(userId: string) {
    const logs = await this.getStorageUsageLogsByUserId(userId, 100);

    const stats = {
      totalUploads: 0,
      totalDeletes: 0,
      totalRestores: 0,
      totalSizeUploaded: 0,
      totalSizeDeleted: 0,
      totalSizeRestored: 0,
    };

    logs.forEach((log) => {
      switch (log.action) {
        case "upload":
          stats.totalUploads++;
          stats.totalSizeUploaded += log.size;
          break;
        case "delete":
          stats.totalDeletes++;
          stats.totalSizeDeleted += log.size;
          break;
        case "restore":
          stats.totalRestores++;
          stats.totalSizeRestored += log.size;
          break;
      }
    });

    return stats;
  }

  // Get recent storage activities
  async getRecentStorageActivities(userId: string, limit = 10) {
    return this.db
      .select()
      .from(schema.storageUsageLogs)
      .where(eq(schema.storageUsageLogs.userId, userId))
      .orderBy(desc(schema.storageUsageLogs.createdAt))
      .limit(limit);
  }
}
