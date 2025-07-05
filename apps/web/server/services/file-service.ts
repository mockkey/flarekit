import { env } from "cloudflare:workers";
import { DbService } from "@flarekit/db";
import { and, eq, inArray, isNull, ne, sql } from "drizzle-orm";
import { getDownloadPresignedUrl, getUrl } from "server/lib/aws";
import { ConflictError, NotFoundError } from "server/lib/error";
import { db } from "~/db/db.server";
import { file, userFiles } from "~/db/schema";
import { StorageService } from "./storage-service";

const dbService = DbService(env.DB);

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class FileService {
  static async createFolder(
    userId: string,
    name: string,
    parentId?: string | null,
  ) {
    const existingFolder = await db
      .select()
      .from(userFiles)
      .where(
        and(
          eq(userFiles.name, name),
          eq(userFiles.userId, userId),
          eq(userFiles.isDir, true),
          eq(userFiles.isLatestVersion, true),
          isNull(userFiles.deletedAt),
          parentId
            ? eq(userFiles.parentId, parentId)
            : isNull(userFiles.parentId),
        ),
      )
      .get();

    if (existingFolder) {
      throw new ConflictError("Folder already exists");
    }

    const newFolder = await dbService?.files.createFolder({
      name,
      parentId: parentId || null,
      userId,
    });

    return {
      id: newFolder?.id,
      name: newFolder?.name,
      isDir: true,
      parentId: newFolder?.parentId,
      createdAt: newFolder?.createdAt,
    };
  }

  static async getList(
    query: {
      page?: number;
      limit?: number;
      sort?: "name" | "size" | "createdAt";
      order?: "asc" | "desc";
      search?: string;
      parentId?: string | null;
    },
    userId: string,
  ) {
    const files = await dbService?.files.searchUserFilesWithPagination(
      query,
      userId,
    );

    return {
      items: files?.files.map((files) => {
        const userFile = files.userFile;
        const file = files.file;
        const thumbnail = files.thumbnail;
        if (userFile.isDir) {
          return {
            id: userFile.id,
            name: userFile.name,
            type: "folder",
            parentId: userFile.parentId,
            createdAt: userFile.createdAt,
            updatedAt: userFile.createdAt,
          };
        }

        return {
          id: userFile.id,
          name: userFile.name,
          type: "file",
          parentId: userFile.parentId,
          size: file?.size,
          mime: file?.mime,
          downloadUrl: `/files/${userFile.id}/download`,
          url:
            file?.mime?.startsWith("image/") || file?.mime?.startsWith("video/")
              ? file?.storagePath && getUrl(file.storagePath)
              : `/viewer/${userFile.fileId}`,
          thumbnail:
            file?.mime?.startsWith("image/") && file?.mime !== "image/svg+xml"
              ? thumbnail?.storagePath
                ? `${env.IMAGE_URL}/${thumbnail?.storagePath}`
                : null
              : null,
          createdAt: userFile.createdAt,
          updatedAt: userFile.createdAt,
        };
      }),
      ...files?.pagination,
    };
  }

  static async getFolderList(
    query: {
      page?: number;
      limit?: number;
      sort?: "name" | "size" | "createdAt";
      order?: "asc" | "desc";
      search?: string;
      parentId?: string | null;
    },
    userId: string,
  ) {
    const folderList = await dbService?.files.searchUserFoldersWithPagination(
      query,
      userId,
    );
    if (!folderList) {
      return {
        items: [],
        page: 1,
        limit: 10,
        total: 0,
      };
    }

    return {
      items: folderList?.folders?.map((file) => {
        const userFile = file.userFile;
        if (userFile.isDir) {
          return {
            id: userFile.id,
            name: userFile.name,
            type: "folder",
            parentId: userFile.parentId,
            createdAt: userFile.createdAt,
            updatedAt: userFile.createdAt,
          };
        }
      }),
      ...folderList?.pagination,
    };
  }

  static async getTrashList(
    query: {
      page?: number;
      limit?: number;
      sort?: "name" | "size" | "deletedAt";
      order?: "asc" | "desc";
      search?: string;
    },
    userId: string,
  ) {
    const files = await dbService?.files.searchTrashFilesWithPagination(
      query,
      userId,
    );

    return {
      items: files?.files.map((files) => {
        const userFile = files.userFile;
        const file = files.file;
        const thumbnail = files.thumbnail;
        if (userFile.isDir) {
          return {
            id: userFile.id,
            name: userFile.name,
            type: "folder",
            parentId: userFile.parentId,
            createdAt: userFile.createdAt,
            updatedAt: userFile.createdAt,
          };
        }

        return {
          id: userFile.id,
          name: userFile.name,
          type: "file",
          parentId: userFile.parentId,
          size: file?.size,
          mime: file?.mime,
          thumbnail:
            file?.mime?.startsWith("image/") && file?.mime !== "image/svg+xml"
              ? thumbnail?.storagePath
                ? `${env.IMAGE_URL}/${thumbnail?.storagePath}`
                : null
              : `/viewer/${userFile.fileId}`,
          url:
            file?.mime?.startsWith("image/") && file?.mime !== "image/svg+xml"
              ? file?.storagePath
                ? `${env.IMAGE_URL}/${file?.storagePath}`
                : null
              : `/viewer/${userFile.fileId}`,
          createdAt: userFile.createdAt,
          updatedAt: userFile.createdAt,
        };
      }),
      ...files,
    };
  }

  static async getFileById(id: string, userId: string) {
    const file = await dbService?.files.getUserFileById(id, userId);
    if (!file) {
      throw new NotFoundError("Current files not found or not owned by user");
    }
    return {
      id: file.userFile.id,
      name: file.userFile.name,
      type: file.userFile.isDir ? "folder" : "file",
      parentId: file.userFile.parentId,
      size: file?.file?.size,
      mime: file?.file?.mime,
      downloadUrl: `/files/${file.userFile.id}/download`,
      thumbnail: file.thumbnail?.storagePath,
      createdAt: file.userFile.createdAt,
      updatedAt: file.userFile.createdAt,
    };
  }

  static async downloadUserFile(userId: string, id: string) {
    const currentFile = await dbService?.files.getUserFileById(id, userId);
    if (!currentFile || currentFile.userFile.isDir === true) {
      throw new NotFoundError("File not found or is a folder");
    }
    const storagePath = currentFile.file?.storagePath;
    if (!storagePath) {
      throw new NotFoundError(
        "File content path is missing. The file might be corrupted or improperly stored.",
      );
    }
    const presignedUrl = await getDownloadPresignedUrl(
      storagePath,
      currentFile.userFile.name || "unknown",
    );
    return presignedUrl;
  }

  // Rename file
  static async renameFile(userFileId: string, userId: string, newName: string) {
    const currentFIles = await dbService?.files.getUserFileById(
      userFileId,
      userId,
    );

    if (!currentFIles) {
      throw new NotFoundError("Current files not found or not owned by user");
    }

    if (currentFIles.userFile.isDir) {
      const existingFolder = await db
        .select()
        .from(userFiles)
        .where(
          and(
            eq(userFiles.name, newName),
            eq(userFiles.userId, userId),
            eq(userFiles.isDir, true),
            isNull(userFiles.deletedAt),
            ne(userFiles.id, userFileId), // Exclude current folder
            currentFIles.userFile.parentId
              ? eq(userFiles.parentId, currentFIles.userFile.parentId)
              : isNull(userFiles.parentId),
          ),
        )
        .get();
      if (existingFolder) {
        throw new ConflictError(
          `An item named "${newName}" already exists in this location.`,
        );
      }
    }

    return await dbService?.files.updateUserFile(userFileId, userId, {
      name: newName,
    });
  }

  // Add new file
  static async addFile(params: {
    userId: string;
    name: string;
    size: number;
    mime: string;
    hash: string;
    storagePath: string;
    parentId?: string | null;
  }) {
    //  Check storage limit
    const canUpload = await StorageService.checkStorageLimit(
      params.userId,
      params.size,
    );
    if (!canUpload) {
      throw new Error("Storage limit exceeded");
    }

    //  Create file record
    const fileRecord = await db
      .insert(file)
      .values({
        name: params.name,
        size: params.size,
        mime: params.mime,
        hash: params.hash,
        storagePath: params.storagePath,
        createdAt: new Date(),
      })
      .returning()
      .get();

    //  Create user-file association
    await db.insert(userFiles).values({
      userId: params.userId,
      fileId: fileRecord.id,
      parentId: params.parentId,
      name: params.name,
      isDir: false,
      createdAt: new Date(),
    });

    // Update storage usage and log
    await StorageService.updateStorageWithLog({
      userId: params.userId,
      fileId: fileRecord.id,
      action: "upload",
      size: params.size,
      metadata: {
        fileName: params.name,
        mimeType: params.mime,
      },
    });

    // Update parent folder if exists
    if (params.parentId) {
    }
    return fileRecord;
  }

  // Get all files and folders under a folder recursively
  private static async getAllDescendants(userId: string, folderId: string) {
    const children = await db
      .select()
      .from(userFiles)
      .where(
        and(
          eq(userFiles.userId, userId),
          eq(userFiles.parentId, folderId),
          isNull(userFiles.deletedAt),
        ),
      );

    let allDescendants = [...children];

    for (const child of children) {
      if (child.isDir) {
        const descendants = await this.getAllDescendants(userId, child.id);
        allDescendants = [...allDescendants, ...descendants];
      }
    }
    return allDescendants;
  }

  // Delete folder with all its contents
  static async deleteFolder(
    folderId: string,
    userId: string,
    ispermanent = false,
    skipStorageLog = false,
  ) {
    // 1. Get folder information
    const folder = await db
      .select()
      .from(userFiles)
      .where(
        and(
          eq(userFiles.id, folderId),
          eq(userFiles.userId, userId),
          eq(userFiles.isDir, true),
        ),
      )
      .get();

    if (!folder) throw new Error("Folder not found");

    // 2. Get all descendants (files and subfolders)
    const result = await db
      .select({
        totalSize: sql<number>`COALESCE(SUM(${file.size}), 0)`,
        fileIds: sql<string>`GROUP_CONCAT(DISTINCT ${file.id})`,
        userFileIds: sql<string>`GROUP_CONCAT(DISTINCT ${userFiles.id})`,
      })
      .from(file)
      .innerJoin(userFiles, eq(file.id, userFiles.fileId))
      .where(
        sql`${userFiles.id} IN (
        WITH RECURSIVE folder_tree AS (
          SELECT ${userFiles.id}, ${userFiles.parentId}, ${userFiles.fileId}, ${userFiles.isDir}
          FROM ${userFiles}
          WHERE ${userFiles.id} = ${folderId}
          AND ${userFiles.deletedAt} IS NULL
          UNION ALL
          SELECT uf.id, uf.parentId, uf.fileId, uf.isDir
          FROM ${userFiles} uf
          INNER JOIN folder_tree ft ON uf.parentId = ft.id
          WHERE uf.userId = ${userId}
          AND uf.deletedAt IS NULL
        )
        SELECT id FROM folder_tree 
      )`,
      )
      .execute();

    const { totalSize, fileIds, userFileIds } = result[0] || {
      totalSize: 0,
      fileIds: "",
      userFileIds: "",
    };

    // 4. Soft delete folder and all descendants
    const allItemIds = userFileIds.split(",");
    if (ispermanent) {
      await db.delete(userFiles).where(inArray(userFiles.id, allItemIds));
    } else {
      await db
        .update(userFiles)
        .set({
          deletedAt: new Date(),
          isLatestVersion: false,
        })
        .where(inArray(userFiles.id, allItemIds));
    }
    if (!skipStorageLog) {
      await StorageService.updateStorageWithLog({
        userId,
        fileId: folderId,
        action: ispermanent ? "permanent_delete" : "delete",
        size: totalSize,
        metadata: {
          folderName: !folder.name,
          deleteType: "folder_delete",
          fileCount: allItemIds.length,
          totalFolders: allItemIds.length,
          fileIds: fileIds,
        },
      });
    }
    return {
      folder,
      userFileIds,
      fileIds,
      totalSize,
      fileCount: allItemIds.length,
    };
  }

  // Common delete method that handles both files and folders
  static async delete(
    itemId: string,
    userId: string,
    ispermanent = false,
    skipStorageLog = false,
  ) {
    // 1. Get item information
    const item = await db
      .select({
        id: userFiles.id,
        isDir: userFiles.isDir,
        name: userFiles.name,
        fileId: userFiles.fileId,
        file: file,
      })
      .from(userFiles)
      .leftJoin(file, eq(userFiles.fileId, file.id))
      .where(
        and(
          eq(userFiles.id, itemId),
          eq(userFiles.userId, userId),
          isNull(userFiles.deletedAt),
        ),
      )
      .get();
    if (!item) {
      throw new NotFoundError("File missing or deleted from storage");
    }

    if (item.isDir) {
      return this.deleteFolder(itemId, userId, ispermanent, skipStorageLog);
    }
    return this.deleteFile(itemId, userId, ispermanent, skipStorageLog);
  }

  // Delete single file
  static async deleteFile(
    userFileId: string,
    userId: string,
    ispermanent = false,
    skipStorageLog = false,
  ) {
    // 1. Get file information
    const userFile = await db
      .select({
        file: file,
        userFile: userFiles,
      })
      .from(userFiles)
      .leftJoin(file, eq(file.id, userFiles.fileId))
      .where(and(eq(userFiles.id, userFileId), eq(userFiles.userId, userId)))
      .get();

    if (!userFile) throw new Error("File not found");
    if (ispermanent) {
      await db.delete(userFiles).where(eq(userFiles.id, userFileId));
    } else {
      await db
        .update(userFiles)
        .set({
          deletedAt: new Date(),
          isLatestVersion: false,
        })
        .where(eq(userFiles.id, userFileId));
    }

    // 3. Update storage usage and log (skip if this is part of a batch operation)
    if (!skipStorageLog) {
      await StorageService.updateStorageWithLog({
        userId,
        fileId: userFile.file?.id || "",
        action: ispermanent ? "permanent_delete" : "delete",
        size: userFile?.file?.size || 0,
        metadata: {
          fileName: !userFile.userFile.name,
          deleteType: "user_request",
        },
      });
    }
    return userFile;
  }

  // Batch delete files
  static async batchDeleteFiles(
    userFileIds: string[],
    userId: string,
    ispermanent = false,
  ) {
    if (!userFileIds.length) return [];

    const results = [];
    let totalSize = 0;
    let totalFileCount = 0;
    const allFileIds: string[] = [];
    const deletedItems: Array<{
      name: string;
      size: number;
      isFolder: boolean;
    }> = [];

    // Process each item individually to handle folders properly
    for (const userFileId of userFileIds) {
      try {
        const result = await this.delete(userFileId, userId, ispermanent, true);
        results.push(result);

        if (result && "totalSize" in result) {
          // This is a folder result
          totalSize += result.totalSize;
          totalFileCount += result.fileCount;
          if (result.fileIds) {
            // For folders, we use fileIds for storage logging
            allFileIds.push(
              ...result.fileIds.split(",").filter((id: string) => id),
            );
          }
          deletedItems.push({
            name: result.folder.name || "",
            size: result.totalSize,
            isFolder: true,
          });
        } else if (result && "file" in result) {
          // This is a single file result
          const fileSize = result.file?.size || 0;
          totalSize += fileSize;
          totalFileCount += 1;
          if (result.file?.id) {
            allFileIds.push(result.file.id);
          }
          deletedItems.push({
            name: result.userFile.name || "",
            size: fileSize,
            isFolder: false,
          });
        }
      } catch (error) {
        console.error(`Failed to delete item ${userFileId}:`, error);
        // Continue with other items even if one fails
      }
    }

    // Single storage log entry for the entire batch operation
    await StorageService.updateStorageWithLog({
      userId,
      fileId: allFileIds.join(","),
      action: ispermanent ? "permanent_delete" : "delete",
      size: totalSize,
      metadata: {
        deleteType: "batch_delete",
        fileCount: totalFileCount,
        itemCount: userFileIds.length,
        itemsDetails: JSON.stringify(deletedItems),
      },
    });

    return results;
  }

  // Restore deleted file
  static async restoreFile(userId: string, userFileId: string) {
    const userFile = await db
      .select({
        file: file,
        userFile: userFiles,
      })
      .from(userFiles)
      .leftJoin(file, eq(file.id, userFiles.fileId))
      .where(
        and(
          eq(userFiles.id, userFileId),
          eq(userFiles.userId, userId),
          eq(userFiles.isLatestVersion, true),
        ),
      )
      .get();

    if (!userFile) throw new Error("File not found");

    // 1. Check storage limit
    const canRestore = await StorageService.checkStorageLimit(
      userId,
      userFile.file?.size ?? 0,
    );
    if (!canRestore) {
      throw new Error("Storage limit exceeded");
    }

    // 2. Restore file
    await db
      .update(userFiles)
      .set({
        deletedAt: null,
        isLatestVersion: true,
      })
      .where(eq(userFiles.id, userFileId));

    // 3. Update storage usage and log
    if (!userFile.file) throw new Error("File record not found");
    await StorageService.updateStorageWithLog({
      userId,
      fileId: userFile.file.id,
      action: "restore",
      size: userFile.file.size ?? 0,
      metadata: {
        fileName: userFile.userFile.name ?? "",
        restoreType: "user_request",
      },
    });

    return userFile;
  }

  static async getBreadcrumbs(folderId: string | null, userId: string) {
    // 如果当前是根目录，直接返回根目录信息
    if (!folderId) {
      return [
        {
          id: null,
          name: "Root",
          parentId: null,
        },
      ];
    }

    // 获取文件夹层级
    const folders = await dbService?.files.getFolderHierarchy(folderId, userId);
    if (!folders) return [];

    // 构建面包屑数组
    const folderMap = new Map(folders.map((folder) => [folder.id, folder]));
    const breadcrumbs = [];
    let currentFolder = folderMap.get(folderId);

    while (currentFolder) {
      breadcrumbs.unshift({
        id: currentFolder.id,
        name: currentFolder.name,
        parentId: currentFolder.parentId,
      });
      currentFolder = currentFolder.parentId
        ? folderMap.get(currentFolder.parentId)
        : undefined;
    }

    // 添加根目录
    breadcrumbs.unshift({
      id: null,
      name: "Root",
      parentId: null,
    });

    return breadcrumbs;
  }
}
