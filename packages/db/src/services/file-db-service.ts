import {
  type SQL,
  and,
  asc,
  desc,
  eq,
  inArray,
  isNotNull,
  isNull,
  like,
  or,
  sql,
} from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from "../schema";
import type { UserFiles } from "../schema";
import { getOrderByClause } from "./lib";

type CreateFileParams = Omit<schema.File, "id" | "createdAt">;
type CreateUserFileParams = Omit<
  schema.UserFiles,
  "id" | "createdAt" | "isLatestVersion"
>;

type CreateFlolderParams = {
  name: string;
  userId: string;
  parentId: string | null;
};

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

  async getFileByHash(hash: string): Promise<
    | {
        file: typeof schema.file.$inferSelect | null;
        thumbnail: typeof schema.fileThumbnail.$inferSelect | null;
      }
    | undefined
  > {
    return this.db
      .select({
        file: schema.file,
        thumbnail: schema.fileThumbnail,
      })
      .from(schema.file)
      .leftJoin(
        schema.fileThumbnail,
        eq(schema.fileThumbnail.fileId, schema.file.id),
      )
      .where(eq(schema.file.hash, hash))
      .get();
  }

  async getTrashFileById(
    userFileId: string,
    userId: string,
  ): Promise<
    | {
        userFile: typeof schema.userFiles.$inferSelect;
        file: typeof schema.file.$inferSelect | null;
        thumbnail: typeof schema.fileThumbnail.$inferSelect | null;
      }
    | undefined
  > {
    return this.db
      .select({
        userFile: schema.userFiles,
        file: schema.file,
        thumbnail: schema.fileThumbnail,
      })
      .from(schema.userFiles)
      .leftJoin(schema.file, eq(schema.userFiles.fileId, schema.file.id))
      .leftJoin(
        schema.fileThumbnail,
        eq(schema.fileThumbnail.fileId, schema.userFiles.fileId),
      )
      .where(
        and(
          eq(schema.userFiles.id, userFileId),
          eq(schema.userFiles.userId, userId),
          isNotNull(schema.userFiles.deletedAt),
        ),
      )
      .get();
  }

  async getUserFileById(
    userFileId: string,
    userId: string,
  ): Promise<
    | {
        userFile: typeof schema.userFiles.$inferSelect;
        file: typeof schema.file.$inferSelect | null;
        thumbnail: typeof schema.fileThumbnail.$inferSelect | null;
      }
    | undefined
  > {
    return this.db
      .select({
        userFile: schema.userFiles,
        file: schema.file,
        thumbnail: schema.fileThumbnail,
      })
      .from(schema.userFiles)
      .leftJoin(schema.file, eq(schema.userFiles.fileId, schema.file.id))
      .leftJoin(
        schema.fileThumbnail,
        eq(schema.fileThumbnail.fileId, schema.userFiles.fileId),
      )
      .where(
        and(
          eq(schema.userFiles.id, userFileId),
          eq(schema.userFiles.userId, userId),
        ),
      )
      .get();
  }

  async getUserFileByName(
    name: string,
    userId: string,
    parentId: string | null,
  ): Promise<typeof schema.userFiles.$inferSelect | undefined> {
    return this.db
      .select()
      .from(schema.userFiles)
      .where(
        and(
          eq(schema.userFiles.name, name),
          eq(schema.userFiles.userId, userId),
          parentId
            ? eq(schema.userFiles.parentId, parentId)
            : isNull(schema.userFiles.parentId),
          isNull(schema.userFiles.deletedAt),
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

  async createFolder(params: CreateFlolderParams) {
    if (
      params.parentId !== null &&
      params.parentId !== undefined &&
      params.parentId !== "" &&
      params.parentId !== "null"
    ) {
      const parent = await this.db
        .select()
        .from(schema.userFiles)
        .where(
          and(
            eq(schema.userFiles.id, params.parentId),
            eq(schema.userFiles.userId, params.userId),
            eq(schema.userFiles.isDir, true),
          ),
        )
        .get();
      if (!parent) {
        throw new Error("Parent folder not found or not owned by user");
      }
    }

    const fileRecord = await this.db
      .insert(schema.file)
      .values({
        name: params.name,
        createdAt: new Date(),
        mime: "folder",
        storageProvider: "local",
        size: 0,
      })
      .returning()
      .get();

    return this.db
      .insert(schema.userFiles)
      .values({
        ...params,
        parentId: params.parentId,
        isDir: true,
        fileId: fileRecord.id,
        userId: params.userId,
        isLatestVersion: true,
        createdAt: new Date(),
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
    if (
      params.parentId !== null &&
      params.parentId !== undefined &&
      params.parentId !== "" &&
      params.parentId !== "null"
    ) {
      const parent = await this.db
        .select()
        .from(schema.userFiles)
        .where(
          and(
            eq(schema.userFiles.id, params.parentId),
            eq(schema.userFiles.userId, params.userId),
            eq(schema.userFiles.isDir, true),
          ),
        )
        .get();
      if (!parent) {
        throw new Error("Parent folder not found or not owned by user");
      }
    }

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

  async forceDeleteUserFile(userFileId: string, userId: string) {
    return this.db
      .delete(schema.userFiles)
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

  async searchUserFoldersWithPagination(
    {
      page = 1,
      limit = 10,
      sort = "createdAt",
      order = "desc",
      search,
      parentId,
    }: {
      page?: number;
      limit?: number;
      sort?: "name" | "size" | "createdAt";
      order?: "asc" | "desc";
      search?: string;
      parentId?: string | null;
    },
    userId: string,
  ): Promise<{
    folders: Array<{
      userFile: typeof schema.userFiles.$inferSelect;
      file: typeof schema.file.$inferSelect | null;
    }>;
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const offset = (page - 1) * limit;
    const baseQuery = this.db
      .select({
        userFile: schema.userFiles,
        file: schema.file,
      })
      .from(schema.userFiles)
      .leftJoin(schema.file, eq(schema.userFiles.fileId, schema.file.id))
      .where(
        and(
          eq(schema.userFiles.userId, userId),
          eq(schema.userFiles.isDir, true),
          isNull(schema.userFiles.deletedAt),
          search ? like(schema.userFiles.name, `%${search}%`) : undefined,
          parentId
            ? eq(schema.userFiles.parentId, parentId)
            : isNull(schema.userFiles.parentId),
        ),
      );

    const countResult = await baseQuery;
    const total = countResult.length;

    const sortColumn = {
      name: schema.userFiles.name,
      size: schema.file.size,
      createdAt: schema.userFiles.createdAt,
    }[sort];

    const orderByClause = order === "desc" ? desc(sortColumn) : asc(sortColumn);

    const folders = await baseQuery
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset);

    return {
      folders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async searchUserFilesWithPagination(
    {
      page = 1,
      limit = 10,
      sort = "createdAt",
      order = "desc",
      search,
      parentId,
    }: {
      page?: number;
      limit?: number;
      sort?: "name" | "size" | "createdAt";
      order?: "asc" | "desc";
      search?: string;
      parentId?: string | null;
    },
    userId: string,
  ): Promise<{
    files: Array<{
      userFile: typeof schema.userFiles.$inferSelect;
      file: typeof schema.file.$inferSelect | null;
      thumbnail: typeof schema.fileThumbnail.$inferSelect | null;
    }>;
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const offset = (page - 1) * limit;

    const baseQuery = this.db
      .select({
        userFile: schema.userFiles,
        file: schema.file,
        thumbnail: schema.fileThumbnail,
      })
      .from(schema.userFiles)
      .leftJoin(schema.file, eq(schema.userFiles.fileId, schema.file.id))
      .leftJoin(
        schema.fileThumbnail,
        eq(schema.fileThumbnail.fileId, schema.userFiles.fileId),
      )
      .where(
        and(
          eq(schema.userFiles.userId, userId),
          isNull(schema.userFiles.deletedAt),
          search
            ? or(
                like(schema.userFiles.name, `%${search}%`),
                like(schema.file.name, `%${search}%`),
              )
            : undefined,
          parentId
            ? eq(schema.userFiles.parentId, parentId)
            : isNull(schema.userFiles.parentId),
        ),
      );

    const countResult = await baseQuery;
    const total = countResult.length;

    const sortColumn = {
      name: schema.userFiles.name,
      size: schema.file.size,
      createdAt: schema.userFiles.createdAt,
    }[sort];

    const orderByClause = order === "desc" ? desc(sortColumn) : asc(sortColumn);

    const files = await baseQuery
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset);

    return {
      files,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async searchTrashFilesWithPagination(
    query: {
      page?: number;
      limit?: number;
      sort?: "name" | "size" | "deletedAt";
      order?: "asc" | "desc";
      search?: string;
    },
    userId: string,
  ) {
    const {
      page = 1,
      limit = 10,
      sort = "deletedAt",
      order = "desc",
      search,
    } = query;
    const offset = (page - 1) * limit;

    const conditions: SQL[] = [
      eq(schema.userFiles.userId, userId),
      isNotNull(schema.userFiles.deletedAt),
    ];

    if (search) {
      conditions.push(like(schema.userFiles.name, `%${search}%`));
    }

    conditions.push(sql`
      NOT EXISTS (
        SELECT 1 FROM ${schema.userFiles} AS parent
        WHERE parent.id = ${schema.userFiles.parentId}
          AND parent.deletedAt IS NOT NULL
      )
    `);

    const totalResult = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(schema.userFiles)
      .where(and(...conditions));

    const total = totalResult[0].count;

    const files = await this.db
      .select({
        userFile: schema.userFiles,
        file: schema.file,
        thumbnail: schema.fileThumbnail,
      })
      .from(schema.userFiles)
      .leftJoin(schema.file, eq(schema.userFiles.fileId, schema.file.id))
      .leftJoin(
        schema.fileThumbnail,
        eq(schema.userFiles.fileId, schema.fileThumbnail.fileId),
      )
      .where(and(...conditions))
      .orderBy(getOrderByClause(sort, order))
      .limit(limit)
      .offset(offset);

    return {
      files,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getTrashFilesByParentId(parentId: string, userId: string) {
    return this.db
      .select({
        userFile: schema.userFiles,
        file: schema.file,
        thumbnail: schema.fileThumbnail,
      })
      .from(schema.userFiles)
      .leftJoin(schema.file, eq(schema.userFiles.fileId, schema.file.id))
      .leftJoin(
        schema.fileThumbnail,
        eq(schema.userFiles.fileId, schema.fileThumbnail.fileId),
      )
      .where(
        and(
          eq(schema.userFiles.userId, userId),
          eq(schema.userFiles.parentId, parentId),
          isNotNull(schema.userFiles.deletedAt),
        ),
      );
  }

  async getTrashFolderSize(folderId: string, userId: string) {
    const result = await this.db
      .select({
        totalSize: sql<number>`COALESCE(SUM(${schema.file.size}), 0)`,
        fileIds: sql<string>`GROUP_CONCAT(${schema.file.id})`,
        userFileIds: sql<string>`GROUP_CONCAT(${schema.userFiles.id})`,
      })
      .from(schema.userFiles)
      .leftJoin(schema.file, eq(schema.userFiles.fileId, schema.file.id))
      .where(
        and(
          eq(schema.userFiles.userId, userId),
          isNotNull(schema.userFiles.deletedAt),
          sql`EXISTS (
            WITH RECURSIVE folder_tree AS (
              SELECT id, parentId
              FROM ${schema.userFiles}
              WHERE id = ${folderId}
              UNION ALL
              SELECT f.id, f.parentId
              FROM ${schema.userFiles} f
              INNER JOIN folder_tree ft ON f.parentId = ft.id
            )
            SELECT 1
            FROM folder_tree
            WHERE folder_tree.id = ${schema.userFiles.id}
          )`,
        ),
      );

    if (!result || result.length === 0) {
      return null;
    }

    const { totalSize, fileIds, userFileIds } = result[0];
    return {
      totalSize: totalSize || 0,
      fileIds: fileIds ? fileIds.split(",") : [],
      userFileIds: userFileIds ? userFileIds.split(",") : [],
    };
  }

  async batchUpdateUserFiles(
    userFileIds: string[],
    userId: string,
    data: Partial<UserFiles>,
  ) {
    return this.db
      .update(schema.userFiles)
      .set({
        ...data,
      })
      .where(
        and(
          eq(schema.userFiles.userId, userId),
          inArray(schema.userFiles.id, userFileIds),
        ),
      );
  }

  async getBreadcrumbs(folderId: string | null, userId: string) {
    const breadcrumbs = [];
    const currentId = folderId;

    // 如果当前是根目录，直接返回根目录信息
    if (!currentId) {
      return [
        {
          id: null,
          name: "Root",
          parentId: null,
        },
      ];
    }

    // 使用递归 CTE 一次性获取所有父级文件夹
    const result = await this.db
      .select({
        id: schema.userFiles.id,
        name: schema.userFiles.name,
        parentId: schema.userFiles.parentId,
      })
      .from(schema.userFiles)
      .where(
        and(
          eq(schema.userFiles.userId, userId),
          eq(schema.userFiles.isDir, true),
          sql`EXISTS (
            WITH RECURSIVE folder_tree AS (
              SELECT id, parentId
              FROM ${schema.userFiles}
              WHERE id = ${currentId}
              UNION ALL
              SELECT f.id, f.parentId
              FROM ${schema.userFiles} f
              INNER JOIN folder_tree ft ON f.id = ft.parentId
            )
            SELECT 1
            FROM folder_tree
            WHERE folder_tree.id = ${schema.userFiles.id}
          )`,
        ),
      )
      .orderBy(asc(schema.userFiles.parentId));

    // 构建面包屑数组
    const folderMap = new Map(result.map((folder) => [folder.id, folder]));
    let currentFolder = folderMap.get(currentId);

    while (currentFolder) {
      breadcrumbs.unshift({
        id: currentFolder.id,
        name: currentFolder.name,
        parentId: currentFolder.parentId,
      });
      currentFolder = currentFolder.parentId
        ? folderMap.get(currentFolder.parentId)
        : null;
    }

    // 添加根目录
    breadcrumbs.unshift({
      id: null,
      name: "Root",
      parentId: null,
    });

    return breadcrumbs;
  }

  async getFolderHierarchy(folderId: string, userId: string) {
    return this.db
      .select({
        id: schema.userFiles.id,
        name: schema.userFiles.name,
        parentId: schema.userFiles.parentId,
      })
      .from(schema.userFiles)
      .where(
        and(
          eq(schema.userFiles.userId, userId),
          eq(schema.userFiles.isDir, true),
          sql`EXISTS (
            WITH RECURSIVE folder_tree AS (
              SELECT id, parentId
              FROM ${schema.userFiles}
              WHERE id = ${folderId}
              UNION ALL
              SELECT f.id, f.parentId
              FROM ${schema.userFiles} f
              INNER JOIN folder_tree ft ON f.id = ft.parentId
            )
            SELECT 1
            FROM folder_tree
            WHERE folder_tree.id = ${schema.userFiles.id}
          )`,
        ),
      )
      .orderBy(asc(schema.userFiles.parentId));
  }
}
