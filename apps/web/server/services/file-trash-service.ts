import { env } from "cloudflare:workers";
import { DbService } from "@flarekit/db";
import { getUrl } from "server/lib/aws";
import { ConflictError, NotFoundError } from "server/lib/error";
import { StorageService } from "./storage-service";

const dbService = DbService(env.DB);

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class FileTrashService {
  static async getList(
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
      {
        page: query.page,
        limit: query.limit,
        sort: query.sort,
        order: query.order,
        search: query.search,
      },
      userId,
    );

    const items =
      files?.files.map((files) => {
        const userFile = files.userFile;
        const file = files.file;
        const thumbnail = files.thumbnail;
        return userFile.isDir
          ? {
              id: userFile.id,
              name: userFile.name,
              type: "folder" as const,
              parentId: userFile.parentId,
              createdAt: userFile.createdAt,
              updatedAt: userFile.createdAt,
              deletedAt: userFile.deletedAt,
              itemCount: 0,
            }
          : {
              id: userFile.id,
              name: userFile.name,
              type: "file" as const,
              parentId: userFile.parentId,
              size: file?.size,
              mime: file?.mime,
              url: file?.mime?.startsWith("image/")
                ? file?.storagePath && getUrl(file.storagePath)
                : `/viewer/${userFile.fileId}`,
              thumbnail:
                file?.mime?.startsWith("image/") &&
                file?.mime !== "image/svg+xml"
                  ? thumbnail?.storagePath
                    ? `${env.IMAGE_URL}/${thumbnail?.storagePath}`
                    : null
                  : `/viewer/${userFile.fileId}`,
              createdAt: userFile.createdAt,
              updatedAt: userFile.createdAt,
              deletedAt: userFile.deletedAt,
            };
      }) || [];

    return {
      items,
      total: files?.total || 0,
      page: query.page || files?.page,
      limit: query.limit || files?.limit,
      totalPages: files?.totalPages,
    };
  }

  static async delete(fileUserId: string, userId: string) {
    // 1. Get item information
    const currentFile = await dbService?.files.getTrashFileById(
      fileUserId,
      userId,
    );
    if (!currentFile) {
      throw new NotFoundError(
        "File not found in Trash or you do not have permission to delete it.",
      );
    }

    return dbService?.files.forceDeleteUserFile(fileUserId, userId);
  }

  static async permanentDelete(fileUserId: string, userId: string) {
    // 1. Get item information
    const currentFile = await dbService?.files.getTrashFileById(
      fileUserId,
      userId,
    );
    if (!currentFile) {
      throw new NotFoundError(
        "File not found in Trash or you do not have permission to delete it.",
      );
    }

    // 2. If it's a folder, get all files in it
    if (currentFile.userFile.isDir) {
      const result = await dbService?.files.getTrashFolderSize(
        fileUserId,
        userId,
      );

      if (result) {
        const { fileIds, userFileIds } = result;

        // Delete all files in the folder
        for (const userFileId of userFileIds) {
          await dbService?.files.forceDeleteUserFile(userFileId, userId);
        }

        // Update storage log
        await StorageService.updateStorageWithLog({
          userId,
          fileId: fileIds.join(","),
          action: "permanent_delete",
          size: result.totalSize,
          metadata: {
            fileName: currentFile.userFile.name ?? "",
            deleteType: "permanent",
            isFolder: true,
          },
        });
      }
    } else {
      // 3. If it's a file, delete it directly
      await dbService?.files.forceDeleteUserFile(fileUserId, userId);

      // Update storage log
      await StorageService.updateStorageWithLog({
        userId,
        fileId: currentFile.file?.id ?? "",
        action: "permanent_delete",
        size: currentFile?.file?.size || 0,
        metadata: {
          fileName: currentFile.userFile.name ?? "",
          deleteType: "permanent",
        },
      });
    }

    return { success: true };
  }

  static async restore(fileUserId: string, userId: string) {
    // 1. Get item information
    const trashFile = await dbService?.files.getTrashFileById(
      fileUserId,
      userId,
    );
    if (!trashFile) {
      throw new NotFoundError(
        "File not found in Trash or you do not have permission to restore it.",
      );
    }

    if (trashFile.userFile.isDir) {
      return this.restoreFolder(fileUserId, userId);
    }
    return this.restoreFile(fileUserId, userId);
  }

  private static async restoreFile(fileUserId: string, userId: string) {
    // 1. Get file information
    const trashFile = await dbService?.files.getTrashFileById(
      fileUserId,
      userId,
    );
    if (!trashFile?.file || !trashFile.userFile.name) {
      throw new NotFoundError(
        "File not found in Trash or you do not have permission to restore it.",
      );
    }

    // 2. Check storage limit
    const canRestore = await StorageService.checkStorageLimit(
      userId,
      trashFile.file?.size ?? 0,
    );
    if (!canRestore) {
      throw new Error("Storage limit exceeded");
    }

    // 3. Check for duplicate names in target directory
    const existingItem = await dbService?.files.getUserFileByName(
      trashFile.userFile.name,
      userId,
      trashFile.userFile.parentId,
    );

    if (existingItem?.isDir) {
      throw new ConflictError(
        `An item named "${trashFile.userFile.name}" already exists in this location.`,
      );
    }

    // 4. Restore file
    const currentFile = await dbService?.files.updateUserFile(
      fileUserId,
      userId,
      {
        deletedAt: null,
      },
    );

    // 5. Update storage log
    await StorageService.updateStorageWithLog({
      userId,
      fileId: trashFile.file.id,
      action: "restore",
      size: trashFile.file.size ?? 0,
      metadata: {
        fileName: trashFile.userFile.name ?? "",
        restoreType: "user_request",
      },
    });

    return currentFile;
  }

  private static async restoreFolder(
    folderId: string,
    userId: string,
    name?: string,
  ) {
    // Get folder information
    const trashFolder = await dbService?.files.getTrashFileById(
      folderId,
      userId,
    );
    if (!trashFolder || !trashFolder.userFile.name) {
      throw new NotFoundError(
        "Folder not found in Trash or you do not have permission to restore it.",
      );
    }

    // Check folder  exists
    const existingItem = await dbService?.files.getUserFileByName(
      trashFolder.userFile.name,
      userId,
      trashFolder.userFile.parentId,
    );
    if (existingItem) {
      throw new ConflictError(
        `An item named "${name || trashFolder.userFile.name}" already exists in this location.`,
      );
    }

    //  Calculate total size and get all file IDs
    const result = await dbService?.files.getTrashFolderSize(folderId, userId);
    if (!result) {
      throw new Error("Failed to calculate folder size");
    }

    const { totalSize, fileIds, userFileIds } = result;

    //  Check storage limit
    const canRestore = await StorageService.checkStorageLimit(
      userId,
      totalSize,
    );
    if (!canRestore) {
      throw new Error("Storage limit exceeded");
    }

    // Restore all files in batch
    await dbService?.files.batchUpdateUserFiles(userFileIds, userId, {
      deletedAt: null,
    });

    //  Update storage log
    await StorageService.updateStorageWithLog({
      userId,
      fileId: fileIds.join(","),
      action: "restore",
      size: totalSize,
      metadata: {
        fileName: trashFolder.userFile.name ?? "",
        restoreType: "user_request",
        isFolder: true,
      },
    });

    return trashFolder;
  }
}
