import { and, eq } from "drizzle-orm";
import { getS3Resource } from "server/lib/aws";
import { db } from "~/db/db.server";
import { file, userFiles } from "~/db/schema";
import { StorageService } from "./storage-service";

export async function getS3LinkEtag({
  userId,
  userFileId,
  location,
}: {
  userId: string;
  userFileId: string;
  location: string;
}) {
  const currentFile = await db
    .select({
      fid: userFiles.id,
      hash: file.hash,
      location: file.storagePath,
      size: file.size,
    })
    .from(userFiles)
    .leftJoin(file, eq(userFiles.fileId, file.id))
    .where(and(eq(userFiles.id, userFileId), eq(userFiles.userId, userId)))
    .limit(1)
    .get();

  if (currentFile) {
    const s3res = await getS3Resource(location);
    await db
      .update(userFiles)
      .set({
        deletedAt: null,
      })
      .where(eq(userFiles.id, userFileId));

    if (s3res?.etag) {
      await StorageService.updateStorageWithLog({
        userId,
        fileId: currentFile.fid,
        action: "upload",
        size: currentFile.size || 0,
        metadata: {
          location: currentFile.location,
          hash: currentFile.hash,
          etag: s3res?.etag,
        },
      });
      return s3res.etag;
    }

    return false;
  }
}
