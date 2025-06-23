import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@flarekit/ui/components/ui/alert-dialog";
import Dashboard from "@uppy/react/lib/Dashboard";
import "@uppy/core/dist/style.min.css";
import "@uppy/dashboard/dist/style.min.css";
import { queryKey } from "@/hooks/use-file-manager";
import { useFileStore } from "@/store/use-file-store";
import { useUppyStore } from "@/store/use-uppy-store";
import { Button } from "@flarekit/ui/components/ui/button";
import { RiCloseLine } from "@remixicon/react";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

interface FileUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
export function FileUploadDialog({
  open,
  onOpenChange,
}: FileUploadDialogProps) {
  const { uppyInstance, hideUploadButton } = useUppyStore();
  const { theme } = useFileStore();
  const queryClient = useQueryClient();
  useEffect(() => {
    uppyInstance?.on("complete", async (result) => {
      const successful = result.successful;
      if (!successful?.length) return;
      queryClient.invalidateQueries({ queryKey: ["file-list", ...queryKey] });
      queryClient.invalidateQueries({
        queryKey: [...queryKey],
      });
    });
  }, [uppyInstance]);

  useEffect(() => {
    uppyInstance?.clear();
  }, [open]);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Upload File</AlertDialogTitle>
          <AlertDialogCancel asChild>
            <Button
              variant="ghost"
              className="absolute right-4 top-4 p-2"
              size="icon"
            >
              <RiCloseLine />
            </Button>
          </AlertDialogCancel>
        </AlertDialogHeader>
        <div className="">
          {!uppyInstance ? (
            <>loading</>
          ) : (
            <Dashboard
              hideUploadButton={hideUploadButton}
              width={"100%"}
              height={"300px"}
              theme={theme}
              uppy={uppyInstance}
            />
          )}
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
