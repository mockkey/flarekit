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
  onImagePreview?: (url: string) => void;
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
  onImagePreview,
  isSelected = false,
  onSelectChange,
}: FileGridItemProps) {
  let clickTimeout: NodeJS.Timeout | null = null;
  let lastTap = 0;

  const handleClick = () => {
    if (clickTimeout) {
      clearTimeout(clickTimeout);
      clickTimeout = null;
      return; // This is the second click of a double-click, ignore it
    }

    clickTimeout = setTimeout(() => {
      // Single click to select file
      onSelectChange?.(file.id, !isSelected);
      clickTimeout = null;
    }, 250); // Increased to 250ms for better mobile experience
  };

  const handleDoubleClick = () => {
    if (clickTimeout) {
      clearTimeout(clickTimeout);
      clickTimeout = null;
    }

    // Double click to open folder or view image
    if (file.type === "folder") {
      onFolderOpen?.(file.id);
    } else if (
      file.type === "file" &&
      String(file.mime).indexOf("image") >= 0 &&
      onImagePreview &&
      file.url
    ) {
      onImagePreview(file.url);
    }
  };

  // Mobile double-tap handling
  const handleTouchEnd = () => {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTap;
    if (tapLength < 500 && tapLength > 0) {
      // Double tap
      handleDoubleClick();
    } else {
      // Single tap
      handleClick();
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
      <div className="group relative flex flex-col items-center p-1.5 md:p-4 rounded-lg hover:bg-muted/50 transition-colors min-h-[120px] md:min-h-[160px]">
        {/* Checkbox - Only show when selected */}
        {isSelected && (
          <div className="absolute top-0.5 left-0.5 md:top-2 md:left-2 z-10">
            <div className="w-5 h-5 md:w-6 md:h-6 flex items-center justify-center bg-primary rounded-full">
              <input
                type="checkbox"
                className="rounded w-3.5 h-3.5 md:w-4 md:h-4 border-2 border-white"
                checked={isSelected}
                onChange={(e) => {
                  e.stopPropagation();
                  onSelectChange?.(file.id, e.target.checked);
                }}
              />
            </div>
          </div>
        )}

        {/* File Icon - Smaller and more refined on mobile */}
        <div
          className="mb-1 md:mb-3 cursor-pointer flex-1 flex items-center justify-center"
          onClick={handleClick}
          onDoubleClick={handleDoubleClick}
          onTouchEnd={handleTouchEnd}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleDoubleClick();
            }
          }}
          tabIndex={0}
          role="button"
          aria-label={`${file.type === "folder" ? "Open folder" : "View file"} ${file.name}`}
        >
          <div className="text-4xl md:text-8xl text-muted-foreground">
            {getFileIcon(file)}
          </div>
        </div>

        {/* File Name */}
        <div className="w-full text-center">
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
                className="text-center text-sm"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRename(file.id)}
              >
                <RiCheckLine className="size-4" />
              </Button>
            </div>
          ) : (
            <span
              className={`text-xs md:text-sm text-center block truncate max-w-[75px] md:max-w-[120px] leading-tight px-1 ${
                file.type === "folder" && onFolderOpen !== undefined
                  ? "cursor-pointer hover:text-blue-500"
                  : file.type === "file" &&
                      String(file.mime).indexOf("image") >= 0
                    ? "cursor-pointer hover:text-blue-500"
                    : ""
              }`}
              title={file.name}
              onClick={handleClick}
              onDoubleClick={handleDoubleClick}
              onTouchEnd={handleTouchEnd}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleDoubleClick();
                }
              }}
              tabIndex={0}
              role="button"
            >
              {file.name}
            </span>
          )}
        </div>

        {/* Actions Menu - Always visible on mobile, show on hover on desktop */}
        <div className="absolute top-0.5 right-0.5 md:top-2 md:right-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 md:h-6 md:w-6 bg-background/80 md:bg-transparent hover:bg-muted"
              >
                <RiMore2Fill className="size-2.5 md:size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" forceMount>
              {actions.map((action) => (
                <div key={action.label}>
                  {action.separator && <DropdownMenuSeparator />}
                  <DropdownMenuItem
                    onClick={action.onClick}
                    variant={action.variant}
                  >
                    {action.label}
                  </DropdownMenuItem>
                </div>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </FileContextMenu>
  );
}
