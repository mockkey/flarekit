import { Button } from "@flarekit/ui/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@flarekit/ui/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@flarekit/ui/components/ui/drawer";
import {
  RiCloseLine,
  RiDownloadLine,
  RiFileCopyLine,
  RiLoader4Line,
  RiRestartLine,
  RiZoomInLine,
  RiZoomOutLine,
} from "@remixicon/react";
import { useCallback, useEffect, useRef, useState } from "react";

// Hook to detect mobile
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
};

interface ImageViewerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  fileName?: string;
}

// Image viewer content component
const ImageViewerContent: React.FC<{
  imageUrl: string;
  fileName?: string;
  onClose: () => void;
  isMobile?: boolean;
}> = ({ imageUrl, fileName, onClose, isMobile = false }) => {
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Actions
  const handleCopy = async () => {
    await navigator.clipboard.writeText(decodeURIComponent(imageUrl));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    if (downloading) return;

    setDownloading(true);
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const extension = blob.type.split("/")[1] || "jpg";
      const downloadFileName = fileName
        ? fileName.includes(".")
          ? fileName
          : `${fileName}.${extension}`
        : `image.${extension}`;

      const link = document.createElement("a");
      link.href = url;
      link.download = downloadFileName;
      link.style.display = "none";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
      const link = document.createElement("a");
      link.href = imageUrl;
      link.download = fileName || "image";
      link.target = "_blank";
      link.click();
    } finally {
      setDownloading(false);
    }
  };

  // Zoom controls
  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 300));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 25));
  const handleZoomReset = () => {
    setZoom(100);
    setPosition({ x: 0, y: 0 });
  };

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -10 : 10;
    setZoom((prev) => Math.max(25, Math.min(300, prev + delta)));
  }, []);

  // Drag controls
  const getPointer = (e: React.MouseEvent | React.TouchEvent) =>
    "touches" in e && e.touches.length > 0
      ? { x: e.touches[0].clientX, y: e.touches[0].clientY }
      : {
          x: (e as React.MouseEvent).clientX,
          y: (e as React.MouseEvent).clientY,
        };

  const handlePointerDown = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      const startPointer = getPointer(e);
      setIsDragging(true);

      const handleGlobalMove = (globalE: MouseEvent | TouchEvent) => {
        // Only call preventDefault for non-passive events
        try {
          globalE.preventDefault();
          globalE.stopPropagation();
        } catch {
          // Ignore passive event listener errors
        }

        const currentPointer =
          "touches" in globalE && globalE.touches.length > 0
            ? { x: globalE.touches[0].clientX, y: globalE.touches[0].clientY }
            : {
                x: (globalE as MouseEvent).clientX,
                y: (globalE as MouseEvent).clientY,
              };

        const deltaX = currentPointer.x - startPointer.x;
        const deltaY = currentPointer.y - startPointer.y;

        // Simple position update, let overflow: hidden handle boundaries
        setPosition((prev) => ({
          x: prev.x + deltaX,
          y: prev.y + deltaY,
        }));

        startPointer.x = currentPointer.x;
        startPointer.y = currentPointer.y;
      };

      const handleGlobalUp = (globalE?: MouseEvent | TouchEvent) => {
        if (globalE) {
          try {
            globalE.preventDefault();
            globalE.stopPropagation();
          } catch {
            // Ignore errors
          }
        }
        setIsDragging(false);
        document.removeEventListener("mousemove", handleGlobalMove);
        document.removeEventListener("mouseup", handleGlobalUp);
        document.removeEventListener("touchmove", handleGlobalMove);
        document.removeEventListener("touchend", handleGlobalUp);
      };

      document.addEventListener("mousemove", handleGlobalMove, {
        passive: false,
      });
      document.addEventListener("mouseup", handleGlobalUp);
      document.addEventListener("touchmove", handleGlobalMove, {
        passive: false,
      });
      document.addEventListener("touchend", handleGlobalUp);
    },
    [],
  );

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Double click to reset
  const handleDoubleClick = useCallback(() => {
    handleZoomReset();
  }, []);

  // Ensure image is centered when zoom is 100%
  useEffect(() => {
    if (zoom === 100) {
      setPosition({ x: 0, y: 0 });
    }
  }, [zoom]);

  // Add native wheel event listener
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, [handleWheel]);

  // Add native touch event listeners to handle dragging
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let startPointer: { x: number; y: number } | null = null;
    let isDraggingLocal = false;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation(); // Prevent other listeners
        startPointer = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        isDraggingLocal = true;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDraggingLocal || !startPointer || e.touches.length !== 1) return;

      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation(); // Prevent other listeners

      const currentPointer = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
      const deltaX = currentPointer.x - startPointer.x;
      const deltaY = currentPointer.y - startPointer.y;

      setPosition((prev) => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY,
      }));

      startPointer = currentPointer;
    };

    const handleTouchEnd = () => {
      isDraggingLocal = false;
      startPointer = null;
    };

    container.addEventListener("touchstart", handleTouchStart, {
      passive: false,
      capture: true,
    });
    container.addEventListener("touchmove", handleTouchMove, {
      passive: false,
      capture: true,
    });
    container.addEventListener("touchend", handleTouchEnd, { capture: true });
    container.addEventListener("touchcancel", handleTouchEnd, {
      capture: true,
    });

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
      container.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, []);

  if (isMobile) {
    // Mobile layout - vertical layout
    return (
      <div className="flex flex-col h-full">
        {/* Mobile header */}
        <div className="flex items-center justify-between p-4 border-b">
          <DialogTitle className="text-lg font-medium truncate flex-1">
            {fileName || "Image Preview"}
          </DialogTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <RiCloseLine className="size-4" />
          </Button>
        </div>

        {/* Mobile image area */}
        <div className="flex-1 relative overflow-hidden">
          <div
            ref={containerRef}
            className="w-full h-full flex items-center justify-center select-none"
            style={{
              cursor: isDragging ? "grabbing" : "grab",
              userSelect: "none",
              WebkitUserSelect: "none",
              WebkitTouchCallout: "none",
              WebkitTapHighlightColor: "transparent",
              touchAction: "none",
            }}
            onMouseDown={handlePointerDown}
            onMouseUp={handlePointerUp}
            onMouseLeave={handlePointerUp}
            onDoubleClick={handleDoubleClick}
          >
            {loading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/50">
                <RiLoader4Line className="size-12 animate-spin text-muted-foreground mb-4" />
                <span className="text-muted-foreground text-sm">
                  Loading image...
                </span>
              </div>
            )}
            <img
              ref={imageRef}
              src={imageUrl}
              alt={fileName || "Image"}
              className={`select-none ${loading ? "opacity-0" : "opacity-100"}`}
              style={{
                transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${zoom / 100})`,
                transformOrigin: "center center",
                maxHeight: zoom === 100 ? "70vh" : "none",
                maxWidth: zoom === 100 ? "90vw" : "none",
                width: zoom === 100 ? "auto" : "none",
                height: zoom === 100 ? "auto" : "none",
                objectFit: "contain",
                pointerEvents: "none",
                willChange: isDragging ? "transform" : "auto",
                transition: isDragging ? "none" : "opacity 0.2s ease",
              }}
              onLoad={() => setLoading(false)}
              onError={() => setLoading(false)}
              draggable={false}
            />
          </div>
        </div>

        {/* Mobile bottom control bar */}
        <div className="p-4 border-t">
          <div className="flex items-center justify-between gap-4">
            {/* Zoom controls */}
            <div className="flex items-center gap-1 bg-muted/30 rounded-lg p-1 border">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomOut}
                disabled={zoom <= 25}
                className="h-9 w-9 p-0 hover:bg-background"
              >
                <RiZoomOutLine className="size-4" />
              </Button>
              <div className="flex items-center justify-center min-w-[50px] px-2 py-1 text-xs font-medium text-muted-foreground">
                {zoom}%
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomIn}
                disabled={zoom >= 300}
                className="h-9 w-9 p-0 hover:bg-background"
              >
                <RiZoomInLine className="size-4" />
              </Button>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                disabled={copied}
                className="h-9 w-9 p-0"
              >
                <RiFileCopyLine className="size-4" />
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleDownload}
                disabled={downloading}
                className="h-9 w-9 p-0 bg-primary hover:bg-primary/90"
              >
                {downloading ? (
                  <RiLoader4Line className="size-4 animate-spin" />
                ) : (
                  <RiDownloadLine className="size-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-9 w-9 p-0 hover:bg-muted"
              >
                <RiCloseLine className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Desktop layout - vertical layout with controls at bottom
  return (
    <div className="flex flex-col h-full w-full max-w-full max-h-full overflow-hidden">
      {/* Top title bar */}
      <div className="flex items-center justify-between p-4 border-b">
        <DialogTitle className="text-lg font-medium">
          {fileName || "Image Preview"}
        </DialogTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <RiCloseLine className="size-4" />
        </Button>
      </div>

      {/* Main image area */}
      <div className="flex-1 relative overflow-hidden bg-muted/5">
        <div
          ref={containerRef}
          className="w-full h-full flex items-center justify-center select-none absolute inset-0"
          style={{
            cursor: isDragging ? "grabbing" : "grab",
            userSelect: "none",
            width: "100%",
            height: "100%",
          }}
          onMouseDown={handlePointerDown}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
          onDoubleClick={handleDoubleClick}
        >
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <RiLoader4Line className="size-12 animate-spin text-muted-foreground mb-4" />
              <span className="text-muted-foreground text-sm">
                Loading image...
              </span>
            </div>
          )}
          <img
            ref={imageRef}
            src={imageUrl}
            alt={fileName || "Image"}
            className={`select-none shadow-lg rounded ${loading ? "opacity-0" : "opacity-100"}`}
            style={{
              transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${zoom / 100})`,
              transformOrigin: "center center",
              maxHeight: "400px",
              maxWidth: "700px",
              width: "auto",
              height: "auto",
              objectFit: "contain",
              pointerEvents: "none",
              willChange: isDragging ? "transform" : "auto",
              transition: isDragging ? "none" : "opacity 0.2s ease",
              position: "relative",
            }}
            onLoad={() => setLoading(false)}
            onError={() => setLoading(false)}
            draggable={false}
          />
        </div>
      </div>

      {/* Bottom control bar */}
      <div className="p-4 border-t">
        <div className="flex items-center justify-center gap-6">
          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-muted/30 rounded-lg p-1 border">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomOut}
              disabled={zoom <= 25}
              className="h-8 w-8 p-0 hover:bg-background"
            >
              <RiZoomOutLine className="size-4" />
            </Button>
            <div className="flex items-center justify-center min-w-[60px] px-2 py-1 text-sm font-medium text-muted-foreground">
              {zoom}%
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomIn}
              disabled={zoom >= 300}
              className="h-8 w-8 p-0 hover:bg-background"
            >
              <RiZoomInLine className="size-4" />
            </Button>
            <div className="w-px h-5 bg-border mx-1" />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomReset}
              title="Reset to 100%"
              className="h-8 w-8 p-0 hover:bg-background"
            >
              <RiRestartLine className="size-4" />
            </Button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              disabled={copied}
              className="gap-2"
            >
              <RiFileCopyLine className="size-4" />
              {copied ? "Copied!" : "Copy URL"}
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleDownload}
              disabled={downloading}
              className="gap-2 bg-primary hover:bg-primary/90"
            >
              {downloading ? (
                <RiLoader4Line className="size-4 animate-spin" />
              ) : (
                <RiDownloadLine className="size-4" />
              )}
              {downloading ? "Downloading..." : "Download"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ImageViewerDialog: React.FC<ImageViewerDialogProps> = ({
  open,
  onOpenChange,
  imageUrl,
  fileName,
}) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent
          className="h-[90vh]"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DrawerHeader className="sr-only">
            <DrawerTitle>Image Viewer</DrawerTitle>
            <DrawerDescription>
              View and interact with the image
            </DrawerDescription>
          </DrawerHeader>
          <div className="h-full overflow-hidden">
            <ImageViewerContent
              imageUrl={imageUrl}
              fileName={fileName}
              onClose={() => onOpenChange(false)}
              isMobile={true}
            />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[800px] h-[600px] max-w-[90vw] max-h-[90vh] p-0 [&>button]:hidden">
        <DialogDescription className="sr-only">
          Image viewer with zoom and pan controls
        </DialogDescription>
        <ImageViewerContent
          imageUrl={imageUrl}
          fileName={fileName}
          onClose={() => onOpenChange(false)}
          isMobile={false}
        />
      </DialogContent>
    </Dialog>
  );
};
