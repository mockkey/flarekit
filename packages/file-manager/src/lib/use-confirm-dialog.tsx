import { Button } from "@flarekit/ui/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@flarekit/ui/components/ui/dialog";
import { useCallback, useState } from "react";
import type { ReactNode } from "react";

interface ConfirmOptions {
  title?: string;
  description?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: "default" | "destructive";
}

export function useConfirmDialog() {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({});
  const [promise, setPromise] = useState<{
    resolve: () => void;
    reject: () => void;
  } | null>(null);

  const confirm = useCallback((opts: ConfirmOptions = {}) => {
    setOptions(opts);
    setOpen(true);
    return new Promise<void>((resolve, reject) => {
      setPromise({ resolve, reject });
    });
  }, []);

  const handleConfirm = () => {
    setOpen(false);
    promise?.resolve();
    setPromise(null);
  };

  const handleCancel = () => {
    setOpen(false);
    promise?.reject();
    setPromise(null);
  };

  const ConfirmDialog = (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{options.title || "Are you sure?"}</DialogTitle>
          <DialogDescription>
            {options.description || "This action cannot be undone."}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            {options.cancelText || "Cancel"}
          </Button>
          <Button
            variant={options.confirmVariant || "default"}
            onClick={handleConfirm}
          >
            {options.confirmText || "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return { confirm, ConfirmDialog };
}

interface DeleteConfirmOptions {
  title?: string;
  description?: ReactNode;
  fileCount: number;
}

export function useDeleteConfirmDialog() {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<DeleteConfirmOptions>({
    fileCount: 0,
  });
  const [promise, setPromise] = useState<{
    resolve: (action: "delete" | "permanent") => void;
    reject: () => void;
  } | null>(null);

  const confirm = useCallback((opts: DeleteConfirmOptions) => {
    setOptions(opts);
    setOpen(true);
    return new Promise<"delete" | "permanent">((resolve, reject) => {
      setPromise({ resolve, reject });
    });
  }, []);

  const handleDelete = () => {
    setOpen(false);
    promise?.resolve("delete");
    setPromise(null);
  };

  const handlePermanentDelete = () => {
    setOpen(false);
    promise?.resolve("permanent");
    setPromise(null);
  };

  const handleCancel = () => {
    setOpen(false);
    promise?.reject();
    setPromise(null);
  };

  const DeleteConfirmDialog = (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{options.title || "Delete Files"}</DialogTitle>
          <DialogDescription>
            {options.description ||
              `What would you like to do with the ${options.fileCount} selected file(s)?`}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            variant="secondary"
            onClick={handleDelete}
            className="w-full sm:w-auto"
          >
            Move to Recycle Bin
          </Button>
          <Button
            variant="destructive"
            onClick={handlePermanentDelete}
            className="w-full sm:w-auto"
          >
            Delete Permanently
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return { confirm, DeleteConfirmDialog };
}
