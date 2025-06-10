import * as schema from "@/schema";
import { and, desc, eq, isNull } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";

type CreateFileParams = Omit<schema.File, "id" | "createdAt">;
type CreateUserFileParams = Omit<
  schema.UserFiles,
  "id" | "createdAt" | "isLatestVersion"
>;
type UpdateUserFileParams = Partial<
  Omit<schema.UserFiles, "id" | "userId" | "fileId" | "createdAt">
>;
type CreateFileThumbnailParams = Omit<schema.FileThumbnail, "id" | "createdAt">;
type CreateShareParams = Omit<schema.Share, "id" | "createdAt">;

export class FileDbService {
  constructor(private db: DrizzleD1Database<typeof schema>) {
    this.db = db;
  }

  async getFileById(fileId: string) {
    return this.db
      .select()
      .from(schema.file)
      .where(eq(schema.file.id, fileId))
      .get();
  }

  async getFileByHash(hash: string) {
    return this.db
      .select()
      .from(schema.file)
      .where(eq(schema.file.hash, hash))
      .get();
  }

  async getUserFileById(userFileId: string, userId: string) {
    console.log("run");
    return this.db
      .select({
        userFile: schema.userFiles,
        file: schema.file,
      })
      .from(schema.userFiles)
      .leftJoin(schema.file, eq(schema.userFiles.fileId, schema.file.id))
      .where(
        and(
          eq(schema.userFiles.id, userFileId),
          eq(schema.userFiles.userId, userId),
        ),
      )
      .get();
  }

  async insertFileRecord(
    data: Omit<typeof schema.file.$inferInsert, "id" | "createdAt">,
  ) {
    return this.db
      .insert(schema.file)
      .values({
        ...data,
        createdAt: new Date(),
      })
      .returning()
      .get();
  }

  async getFilesByParent(userId: string, parentId: string | null) {
    return this.db
      .select()
      .from(schema.userFiles)
      .where(
        and(
          eq(schema.userFiles.userId, userId),
          parentId
            ? eq(schema.userFiles.parentId, parentId)
            : isNull(schema.userFiles.parentId),
          isNull(schema.userFiles.deletedAt),
        ),
      )
      .all();
  }

  async markUserFileAsDeleted(userFileId: string, userId: string) {
    return this.db
      .update(schema.userFiles)
      .set({ deletedAt: new Date(), isLatestVersion: false })
      .where(
        and(
          eq(schema.userFiles.id, userFileId),
          eq(schema.userFiles.userId, userId),
        ),
      )
      .returning()
      .get();
  }

  async restoreUserFile(userFileId: string, userId: string) {
    return this.db
      .update(schema.userFiles)
      .set({ deletedAt: null, isLatestVersion: true })
      .where(
        and(
          eq(schema.userFiles.id, userFileId),
          eq(schema.userFiles.userId, userId),
        ),
      )
      .returning()
      .get();
  }

  async addFileThumbnail(
    data: Omit<typeof schema.fileThumbnail.$inferInsert, "id" | "createdAt">,
  ) {
    return this.db
      .insert(schema.fileThumbnail)
      .values({
        createdAt: new Date(),
        ...data,
      })
      .returning()
      .get();
  }

  async createShareLink(
    data: Omit<typeof schema.share.$inferInsert, "id" | "createdAt">,
  ) {
    return this.db
      .insert(schema.share)
      .values({
        createdAt: new Date(),
        ...data,
      })
      .returning()
      .get();
  }

  async createFolder(
    params: Omit<CreateFileParams, "mime" | "storageProvider">,
  ) {
    return this.db
      .insert(schema.file)
      .values({
        ...params,
        createdAt: new Date(),
        mime: "floder",
        storageProvider: "local",
        size: 0,
      })
      .returning()
      .get();
  }

  async createFile(params: CreateFileParams) {
    return this.db
      .insert(schema.file)
      .values({
        ...params,
        createdAt: new Date(),
      })
      .returning()
      .get();
  }

  async createUserFile(params: CreateUserFileParams) {
    return this.db
      .insert(schema.userFiles)
      .values({
        ...params,
        isLatestVersion: true,
        createdAt: new Date(),
      })
      .returning()
      .get();
  }

  async updateUserFile(
    userFileId: string,
    userId: string,
    params: UpdateUserFileParams,
  ) {
    return this.db
      .update(schema.userFiles)
      .set(params)
      .where(
        and(
          eq(schema.userFiles.id, userFileId),
          eq(schema.userFiles.userId, userId),
        ),
      )
      .returning()
      .get();
  }

  async deleteUserFile(userFileId: string, userId: string) {
    return this.db
      .update(schema.userFiles)
      .set({
        deletedAt: new Date(),
      })
      .where(
        and(
          eq(schema.userFiles.id, userFileId),
          eq(schema.userFiles.userId, userId),
        ),
      )
      .returning()
      .get();
  }

  async getUserFilesInDirectory(userId: string, parentId: string | null) {
    return this.db
      .select({
        userFile: schema.userFiles,
        file: schema.file,
      })
      .from(schema.userFiles)
      .leftJoin(schema.file, eq(schema.userFiles.fileId, schema.file.id))
      .where(
        and(
          eq(schema.userFiles.userId, userId),
          parentId === null
            ? isNull(schema.userFiles.parentId)
            : eq(schema.userFiles.parentId, parentId),
          isNull(schema.userFiles.deletedAt),
        ),
      )
      .orderBy(desc(schema.userFiles.createdAt));
  }

  async createFileThumbnail(params: CreateFileThumbnailParams) {
    return this.db
      .insert(schema.fileThumbnail)
      .values({
        ...params,
        createdAt: new Date(),
      })
      .returning()
      .get();
  }

  async getFileThumbnails(fileId: string) {
    return this.db
      .select()
      .from(schema.fileThumbnail)
      .where(eq(schema.fileThumbnail.fileId, fileId));
  }

  async deleteFileThumbnail(thumbnailId: string) {
    return this.db
      .delete(schema.fileThumbnail)
      .where(eq(schema.fileThumbnail.id, thumbnailId))
      .returning()
      .get();
  }

  async createShare(params: CreateShareParams) {
    return this.db
      .insert(schema.share)
      .values({
        ...params,
        createdAt: new Date(),
      })
      .returning()
      .get();
  }

  async getShareById(shareId: string) {
    return this.db
      .select({
        share: schema.share,
        userFile: schema.userFiles,
        file: schema.file,
      })
      .from(schema.share)
      .leftJoin(
        schema.userFiles,
        eq(schema.share.userFileId, schema.userFiles.id),
      )
      .leftJoin(schema.file, eq(schema.userFiles.fileId, schema.file.id))
      .where(eq(schema.share.id, shareId))
      .get();
  }

  async deleteShare(shareId: string) {
    return this.db
      .delete(schema.share)
      .where(eq(schema.share.id, shareId))
      .returning()
      .get();
  }

  async searchUserFiles(userId: string) {
    return this.db
      .select({
        userFile: schema.userFiles,
        file: schema.file,
      })
      .from(schema.userFiles)
      .leftJoin(schema.file, eq(schema.userFiles.fileId, schema.file.id))
      .where(
        and(
          eq(schema.userFiles.userId, userId),
          isNull(schema.userFiles.deletedAt),
        ),
      )
      .orderBy(desc(schema.userFiles.createdAt));
  }
}
