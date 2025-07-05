import { Button } from "@flarekit/ui/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@flarekit/ui/components/ui/dropdown-menu";
import { Input } from "@flarekit/ui/components/ui/input";
import { RiCheckLine, RiMore2Fill } from "@remixicon/react";

import type { FileItem } from "@/types";
import { formatBytes } from "@flarekit/common/utils";
import { type ContextMenuAction, FileContextMenu } from "./context-menu";
import { getFileIcon } from "./file-icon";

interface FileAction {
  label: string;
  onClick: () => void;
  separator?: boolean;
  variant?: "default" | "destructive" | undefined;
}

interface FileGridItemProps {
  file: FileItem;
  actions: FileAction[];
  renamingFileId: string | null;
  newFileName: string;
  setRenamingFileId: (id: string | null) => void;
  setNewFileName: (name: string) => void;
  onRename: (id: string) => Promise<void>;
  onFolderOpen?: (id: string) => void;
  onFileOpen?: (file: FileItem) => void;
  isSelected?: boolean;
  onSelectChange?: (fileId: string, checked: boolean) => void;
}

export function FileGridItem({
  file,
  actions,
  renamingFileId,
  newFileName,
  setRenamingFileId,
  setNewFileName,
  onRename,
  onFolderOpen,
  onFileOpen,
  isSelected = false,
  onSelectChange,
}: FileGridItemProps) {
  let clickTimeout: NodeJS.Timeout | null = null;
  let lastTap = 0;

  const handleDoubleClick = () => {
    // Clear any pending single click
    if (clickTimeout) {
      clearTimeout(clickTimeout);
      clickTimeout = null;
    }

    // Double click to open folder or file
    if (file.type === "folder") {
      onFolderOpen?.(file.id);
    } else if (file.type === "file" && onFileOpen && file.url) {
      onFileOpen(file);
    }
  };

  const handleNameDoubleClick = () => {
    // Double click on name to enter edit mode
    setRenamingFileId?.(file.id);
    setNewFileName?.(file.name);
  };

  // Mobile double-tap handling
  const handleTouchEnd = () => {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTap;
    if (tapLength < 500 && tapLength > 0) {
      // Double tap
      handleDoubleClick();
    }
    lastTap = currentTime;
  };

  // Convert actions to ContextMenuAction format
  const contextMenuActions: ContextMenuAction[] = actions.map((action) => ({
    label: action.label,
    onClick: action.onClick,
    variant: action.variant,
    separator: action.separator,
  }));

  return (
    <FileContextMenu actions={contextMenuActions}>
      <div className="group">
        {/* Square Card Container */}
        <div className="relative rounded-lg border bg-card hover:bg-accent/50 transition-colors aspect-square overflow-hidden">
          {/* Checkbox - Always visible on mobile for easy selection */}
          <div className="absolute top-2 left-2 md:top-3 md:left-3 z-10">
            <input
              type="checkbox"
              className={`rounded cursor-pointer transition-opacity size-4 md:size-5 ${
                isSelected
                  ? "opacity-100"
                  : "md:opacity-0 md:group-hover:opacity-100 opacity-100"
              }`}
              checked={isSelected}
              onChange={(e) => {
                e.stopPropagation();
                onSelectChange?.(file.id, e.target.checked);
              }}
              onTouchEnd={(e) => {
                e.stopPropagation();
              }}
              style={{
                WebkitTapHighlightColor: "transparent",
                touchAction: "manipulation",
              }}
              aria-label={`Select ${file.name}`}
            />
          </div>

          {/* Actions Menu - Always visible on mobile, show on hover on desktop */}
          <div className="absolute top-2 right-2 md:top-3 md:right-3 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-10">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 md:h-8 md:w-8 bg-background/80 hover:bg-muted pointer-events-auto"
                  onClick={(e) => e.stopPropagation()}
                  onTouchEnd={(e) => e.stopPropagation()}
                >
                  <RiMore2Fill className="size-4 md:size-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {actions.map((action) => (
                  <div key={action.label}>
                    {action.separator && <DropdownMenuSeparator />}
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        action.onClick();
                      }}
                      variant={action.variant}
                    >
                      {action.label}
                    </DropdownMenuItem>
                  </div>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Main Content Area */}
          <div
            className="flex flex-col h-full cursor-pointer"
            onDoubleClick={handleDoubleClick}
            onTouchEnd={handleTouchEnd}
          >
            {/* File Icon/Preview - Full card content */}
            <div className="h-full flex items-center justify-center p-4">
              {file.type === "file" &&
              file.mime?.startsWith("image/") &&
              file.url ? (
                <div className="w-full h-full overflow-hidden rounded-md">
                  <img
                    src={file.thumbnail || file.url}
                    alt={file.name}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      // Fallback to icon if image fails to load
                      e.currentTarget.style.display = "none";
                      e.currentTarget.nextElementSibling?.classList.remove(
                        "hidden",
                      );
                    }}
                  />
                </div>
              ) : null}
              <div
                className={`text-9xl md:text-[8rem] text-muted-foreground ${file.type === "file" && file.mime?.startsWith("image/") && file.url ? "hidden" : ""}`}
              >
                {getFileIcon(file, "size-24 md:size-32")}
              </div>
            </div>
          </div>
        </div>

        {/* File Info - Outside the card */}
        <div className="mt-2 px-1">
          {renamingFileId === file.id ? (
            <div className="flex items-center gap-2">
              <Input
                type="text"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onRename(file.id);
                  if (e.key === "Escape") {
                    setRenamingFileId(null);
                    setNewFileName("");
                  }
                }}
                className="text-sm flex-1"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRename(file.id)}
                className="h-6 w-6"
              >
                <RiCheckLine className="size-3" />
              </Button>
            </div>
          ) : (
            <>
              <div
                className="font-medium text-sm leading-tight cursor-pointer mb-1 truncate"
                title={file.name}
                onDoubleClick={handleNameDoubleClick}
                onTouchEnd={handleTouchEnd}
              >
                {file.name}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-muted-foreground/40" />
                  <span>
                    {file.type === "file"
                      ? file.mime?.startsWith("image/")
                        ? "Image"
                        : file.mime || "File"
                      : "Folder"}
                  </span>
                </div>
                {file.type === "file" && file.size && (
                  <div className="flex items-center gap-1">
                    <span>•</span>
                    <span>{formatBytes(file.size)}</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </FileContextMenu>
  );
}
