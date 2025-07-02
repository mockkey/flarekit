import { Button } from "@flarekit/ui/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@flarekit/ui/components/ui/dropdown-menu";
import { Input } from "@flarekit/ui/components/ui/input";
import { TableCell, TableRow } from "@flarekit/ui/components/ui/table";
import { RiCheckLine, RiMore2Fill } from "@remixicon/react";

import type { FileItem } from "@/types";
import { formatBytes, formatDateToLong } from "@flarekit/common/utils";
import { type ContextMenuAction, FileContextMenu } from "./context-menu";
import { getFileIcon } from "./file-icon";

interface FileAction {
  label: string;
  onClick: () => void;
  separator?: boolean;
  variant?: "default" | "destructive" | undefined;
}

interface FileListItemProps {
  file: FileItem;
  actions: FileAction[];
  renamingFileId: string | null;
  newFileName: string;
  setRenamingFileId: (id: string | null) => void;
  setNewFileName: (name: string) => void;
  onRename: (id: string) => Promise<void>;
  onFolderOpen?: (id: string) => void;
  onImagePreview?: (url: string) => void;
  showCheckbox?: boolean;
  isSelected?: boolean;
  onSelectChange?: (fileId: string, checked: boolean) => void;
  columns?: (
    | "name"
    | "modifiedTime"
    | "type"
    | "size"
    | "createdTime"
    | "deletedAt"
  )[];
}

export function FileListItem({
  file,
  actions,
  renamingFileId,
  newFileName,
  setRenamingFileId,
  setNewFileName,
  onRename,
  onFolderOpen,
  onImagePreview,
  showCheckbox = true,
  isSelected = false,
  onSelectChange,
  columns = ["name", "modifiedTime", "type", "size", "createdTime"],
}: FileListItemProps) {
  let clickTimeout: NodeJS.Timeout | null = null;

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
    if (file.type === "folder" && onFolderOpen) {
      onFolderOpen(file.id);
    } else if (
      file.type === "file" &&
      String(file.mime).indexOf("image") >= 0 &&
      onImagePreview &&
      file.url
    ) {
      onImagePreview(file.url);
    }
  };

  const renderColumn = (column: string) => {
    switch (column) {
      case "name":
        return (
          <TableCell className="max-w-[200px] md:max-w-none" key="name">
            <div className="flex items-center gap-3">
              {getFileIcon(file)}
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
                    className="w-32"
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
                  className={`truncate ${
                    file.type === "folder" && onFolderOpen !== undefined
                      ? "cursor-pointer hover:text-blue-500"
                      : file.type === "file" &&
                          String(file.mime).indexOf("image") >= 0
                        ? "cursor-pointer hover:text-blue-500"
                        : ""
                  }`}
                  onClick={handleClick}
                  onDoubleClick={handleDoubleClick}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleDoubleClick();
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  title={file.name}
                >
                  {file.name}
                </span>
              )}
            </div>
          </TableCell>
        );
      case "type":
        return (
          <TableCell
            className="text-muted-foreground w-1/12 hidden md:table-cell"
            key="type"
          >
            {file.type === "file" ? file.mime || "File" : "Folder"}
          </TableCell>
        );
      case "size":
        return (
          <TableCell
            className="text-muted-foreground w-1/12 hidden md:table-cell"
            key="size"
          >
            {file.type === "file" && file.size
              ? `${formatBytes(file.size)}`
              : "-"}
          </TableCell>
        );
      case "createdTime":
        return (
          <TableCell
            className="text-muted-foreground w-1/6 hidden md:table-cell"
            key="createdTime"
          >
            {formatDateToLong(file.createdAt)}
          </TableCell>
        );
      case "deletedAt":
        return (
          <TableCell
            className="text-muted-foreground w-1/6 hidden md:table-cell"
            key="deletedAt"
          >
            {formatDateToLong(file.createdAt)}
          </TableCell>
        );
      default:
        return null;
    }
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
      <TableRow className="hover:bg-muted/50">
        {/* Checkbox */}
        {showCheckbox && (
          <TableCell className="w-[50px]">
            <input
              type="checkbox"
              className="rounded"
              checked={isSelected}
              onChange={(e) => {
                e.stopPropagation();
                onSelectChange?.(file.id, e.target.checked);
              }}
            />
          </TableCell>
        )}

        {/* Dynamic Columns */}
        {columns.map(renderColumn)}

        {/* Actions */}
        <TableCell className="text-right w-[80px] md:w-1/12">
          {actions.length === 1 ? (
            <Button
              variant="secondary"
              size={"sm"}
              onClick={actions[0].onClick}
            >
              {actions[0].label}
            </Button>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <RiMore2Fill className="size-5" />
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
          )}
        </TableCell>
      </TableRow>
    </FileContextMenu>
  );
}
