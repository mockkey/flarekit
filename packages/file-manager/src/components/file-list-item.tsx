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
import {
  RiCheckLine,
  RiFileFill,
  RiFolderFill,
  RiMore2Fill,
} from "@remixicon/react";

import type { FileItem } from "@/types";
import { formatDateToLong } from "@flarekit/common/utils";

interface FileListItemProps {
  file: FileItem;
  renamingFileId: string | null;
  newFileName: string;
  setRenamingFileId: (id: string | null) => void;
  setNewFileName: (name: string) => void;
  onRename: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onFolderOpen: (id: string) => void;
}

export function FileListItem({
  file,
  renamingFileId,
  newFileName,
  setRenamingFileId,
  setNewFileName,
  onRename,
  onDelete,
  onFolderOpen,
}: FileListItemProps) {
  return (
    <TableRow>
      <TableCell className="font-medium">
        {file.type === "file" ? (
          <RiFileFill className="size-5 text-blue-500" />
        ) : (
          <RiFolderFill className="size-5 text-amber-500" />
        )}
      </TableCell>
      <TableCell>
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
            className={
              file.type === "folder" ? "cursor-pointer hover:text-blue-500" : ""
            }
            onDoubleClick={() => {
              if (file.type === "folder") {
                onFolderOpen(file.id);
              }
            }}
          >
            {file.name}
          </span>
        )}
      </TableCell>
      <TableCell>
        {file.type === "file" && file.size
          ? `${(file.size / 1024).toFixed(2)} KB`
          : "-"}
      </TableCell>
      <TableCell>{formatDateToLong(file.createdAt)}</TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <RiMore2Fill className="size-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" forceMount>
            <DropdownMenuItem
              onClick={() => {
                setRenamingFileId(file.id);
                setNewFileName(file.name);
              }}
            >
              Rename
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDelete(file.id)}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
