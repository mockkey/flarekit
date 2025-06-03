import { calculateFileHash } from "@/lib/calculate-hash";
import {
  checkFileExists,
  createMultipartSigned,
  linkS3,
} from "@/services/upload";
import AwsS3 from "@uppy/aws-s3";
import { Uppy, type UppyFile } from "@uppy/core";
import { toast } from "sonner";
import { create } from "zustand";
import { useFileStore } from "./use-file-store";

type UppyState = {
  uppyInstance: Uppy | null;
  progress: number;
  files: UppyFile<Record<string, unknown>, Record<string, unknown>>[];
  hideUploadButton: boolean;
  setUppy: () => void;
  reset: () => void;
};

export const useUppyStore = create<UppyState>((set, get) => ({
  uppyInstance: null,
  progress: 0,
  files: [],
  hideUploadButton: false,
  setUppy: () => {
    if (get().uppyInstance) return;
    const newUppy = new Uppy({
      debug: false,
      autoProceed: false,
      restrictions: {
        maxNumberOfFiles: 10,
        minNumberOfFiles: 1,
        maxFileSize: 100 * 2 ** 20,
        //   allowedFileTypes: ["image/*", "video/*", "application/pdf"],
      },
    });

    newUppy.use(AwsS3, {
      shouldUseMultipart: true,
      endpoint: `${window.location.origin}/rpc`,
      createMultipartUpload: async (fileObject) => {
        const currentFolderId = useFileStore.getState().currentFolderId;
        const currentFileObject = newUppy.getFile(fileObject.id);
        const file = currentFileObject.data as File;
        const fileHash = await calculateFileHash(file);
        const checkFilRes = await checkFileExists({
          hash: fileHash,
          size: file.size,
          type: file.type,
          name: file.name,
          parentId: currentFolderId,
        });

        if (checkFilRes.error) {
          newUppy.setFileState(fileObject.id, {
            error: checkFilRes.error,
            isPaused: true,
          });
          toast.error(checkFilRes.error);
          return new Promise(() => {});
        }

        if (checkFilRes.exists) {
          await linkS3({
            location: checkFilRes.data?.location || "",
            "user-file-id": checkFilRes.data?.id || "",
          });

          newUppy.setFileState(fileObject.id, {
            progress: {
              uploadStarted: 1,
              uploadComplete: true,
              percentage: 100,
              bytesTotal: fileObject.size ?? 0,
              bytesUploaded: fileObject.size ?? 0,
            },
            isPaused: false,
            response: {
              status: 200,
              uploadURL: checkFilRes.data?.location,
              bytesUploaded: fileObject.size ?? 0,
            },
          });

          newUppy.emit("upload-success", currentFileObject, {
            status: 200,
            uploadURL: checkFilRes.data?.location,
            bytesUploaded: currentFileObject.data.size,
          });

          newUppy.emit("complete", {
            successful: [currentFileObject],
            failed: [],
          });
          return new Promise(() => {});
        }
        // create presign
        const PreSigned = await createMultipartSigned({
          name: file.name,
          size: file.size,
          type: file.type,
          hash: fileHash,
          parentId: currentFolderId,
        });
        return {
          ...PreSigned,
          partSize: 1 * 1024 * 1024,
        };
      },
    });

    newUppy.on("upload-progress", (_file, progress) => {
      set({ progress: progress.bytesUploaded / (progress.bytesTotal ?? 1) });
    });

    set({ uppyInstance: newUppy });
  },
  reset: () => {
    const uppy = get().uppyInstance;
    if (uppy) {
      uppy.destroy();
      set({ uppyInstance: null });
    }
  },
}));
