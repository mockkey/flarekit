import { and, eq, inArray, isNull } from "drizzle-orm";
import { db } from "~/db/db.server";
import { file, userFiles } from "~/db/schema";
import { StorageService } from "./storage-service";

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class FileService {
  // get file by id
  static async getFileById(userId: string, fileId: string) {
    return await db
      .select({
        user_files: userFiles,
        file: file,
      })
      .from(userFiles)
      .leftJoin(file, eq(userFiles.fileId, file.id))
      .where(and(eq(userFiles.id, fileId), eq(userFiles.userId, userId)))
      .get();
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
  static async deleteFolder(userId: string, folderId: string) {
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
    const descendants = await this.getAllDescendants(userId, folderId);

    // 3. Get all file IDs and calculate total size
    const fileDescendants = descendants.filter((d) => !d.isDir);
    const fileIds = fileDescendants.map((f) => f.fileId);

    const files = await db.select().from(file).where(inArray(file.id, fileIds));

    const totalSize = files.reduce((sum, file) => sum + (file.size ?? 0), 0);

    // 4. Soft delete folder and all descendants
    const allItemIds = [folderId, ...descendants.map((d) => d.id)];
    await db
      .update(userFiles)
      .set({
        deletedAt: new Date(),
        isLatestVersion: false,
      })
      .where(inArray(userFiles.id, allItemIds));

    // 5. Update storage usage and log
    await StorageService.updateStorageWithLog({
      userId,
      fileId: folderId,
      action: "delete",
      size: totalSize,
      metadata: {
        folderName: !folder.name,
        deleteType: "folder_delete",
        fileCount: fileDescendants.length,
        totalFolders: descendants.filter((d) => d.isDir).length,
        fileIds: fileIds.join(","),
      },
    });

    return {
      folder,
      descendants,
      totalSize,
      fileCount: fileDescendants.length,
    };
  }

  // Common delete method that handles both files and folders
  static async delete(userId: string, itemId: string) {
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
      .where(and(eq(userFiles.id, itemId), eq(userFiles.userId, userId)))
      .get();

    if (!item) {
      throw new Error("Item not found");
    }

    if (item.isDir) {
      return this.deleteFolder(userId, itemId);
    }
    return this.deleteFile(userId, itemId);
  }

  // Delete single file
  static async deleteFile(userId: string, userFileId: string) {
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

    // 2. Soft delete user-file association
    await db
      .update(userFiles)
      .set({
        deletedAt: new Date(),
        isLatestVersion: false,
      })
      .where(eq(userFiles.id, userFileId));

    // 3. Update storage usage and log
    await StorageService.updateStorageWithLog({
      userId,
      fileId: userFile.file?.id || "",
      action: "delete",
      size: userFile?.file?.size || 0,
      metadata: {
        fileName: !userFile.userFile.name,
        deleteType: "user_request",
      },
    });

    return userFile;
  }

  // Batch delete files
  static async batchDeleteFiles(userId: string, userFileIds: string[]) {
    // 1. Get all file information
    const userFileRecords = await db
      .select({
        file: file,
        userFile: userFiles,
      })
      .from(userFiles)
      .leftJoin(file, eq(file.id, userFiles.fileId))
      .where(
        and(inArray(userFiles.id, userFileIds), eq(userFiles.userId, userId)),
      );

    if (!userFileRecords.length) return;

    // 2. Batch soft delete user-file associations
    await db
      .update(userFiles)
      .set({
        deletedAt: new Date(),
        isLatestVersion: false,
      })
      .where(
        and(inArray(userFiles.id, userFileIds), eq(userFiles.userId, userId)),
      );

    // 3. Calculate total size and update storage usage
    const totalSize = userFileRecords.reduce(
      (sum, item) => sum + (item.file?.size ?? 0),
      0,
    );
    await StorageService.updateStorageWithLog({
      userId,
      fileId: "",
      action: "delete",
      size: totalSize,
      metadata: {
        fileCount: userFileRecords.length,
        deleteType: "batch_delete",
        fileIds: userFileIds.join(","),
      },
    });

    return userFiles;
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

  // Rename file
  static async renameFile(userId: string, userFileId: string, newName: string) {
    await db
      .update(userFiles)
      .set({
        name: newName,
      })
      .where(and(eq(userFiles.id, userFileId), eq(userFiles.userId, userId)));
  }
}
