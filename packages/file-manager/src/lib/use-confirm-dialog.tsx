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
