import { Button } from "@flarekit/ui/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@flarekit/ui/components/ui/dialog";
import {
  RiCloseCircleFill,
  RiFileCopyLine,
  RiLoader4Line,
} from "@remixicon/react";
import { useState } from "react";

interface ImageViewerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  fileName?: string;
}

export const ImageViewerDialog: React.FC<ImageViewerDialogProps> = ({
  open,
  onOpenChange,
  imageUrl,
  fileName,
}) => {
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(decodeURIComponent(imageUrl));
    setCopied(true);
    setTimeout(() => setCopied(false), 300);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogClose asChild className="absolute top-2 right-2 size-6">
        <RiCloseCircleFill />
      </DialogClose>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Preview</DialogTitle>
          <DialogDescription className="hidden">Preview</DialogDescription>
        </DialogHeader>
        <div className="relative flex flex-col items-center justify-center  min-h-[300px]">
          <div className="flex flex-col items-center justify-center w-full h-full">
            {loading && (
              <div className="flex flex-col items-center justify-center min-h-[300px]">
                <RiLoader4Line className="size-10 animate-spin text-white/60 mb-2" />
                <span className="text-white/60 text-xs">Loading…</span>
              </div>
            )}
            <img
              src={imageUrl}
              alt={fileName || "Images"}
              className={`max-h-[50vh] max-w-full rounded shadow-lg transition-opacity duration-300 ${loading ? "opacity-0" : "opacity-100"}`}
              onLoad={() => setLoading(false)}
              style={{ display: loading ? "none" : "block" }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button size="sm" onClick={handleCopy} disabled={copied}>
            <RiFileCopyLine className="mr-1 size-4" />
            {copied ? "Copied!" : "Copy URL"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
