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
import { getFileIcon } from "./file-icon";

interface FileAction {
  label: string;
  onClick: () => void;
  separator?: boolean;
}

interface FileListItemProps {
  file: FileItem;
  actions: FileAction[];
  renamingFileId: string | null;
  newFileName: string;
  setRenamingFileId: (id: string | null) => void;
  setNewFileName: (name: string) => void;
  onRename: (id: string) => Promise<void>;
  onFolderOpen: (id: string) => void;
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
}: FileListItemProps) {
  return (
    <TableRow>
      <TableCell className="font-medium">{getFileIcon(file)}</TableCell>
      <TableCell className="w-2/5">
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
        {file.type === "file" && file.size ? `${formatBytes(file.size)}` : "-"}
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
            {actions.map((action) => (
              <div key={action.label}>
                {action.separator && <DropdownMenuSeparator />}
                <DropdownMenuItem onClick={action.onClick}>
                  {action.label}
                </DropdownMenuItem>
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
