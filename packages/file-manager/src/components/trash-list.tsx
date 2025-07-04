import type { FileItem } from "@/hooks/use-file-manager";
import { useDeleteTrashFile, useRestoreFile } from "@/hooks/use-trash";
import { useConfirmDialog } from "@/lib/use-confirm-dialog";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@flarekit/ui/components/ui/table";
import {
  RiArrowDownSLine,
  RiArrowUpSLine,
  RiDeleteBin2Fill,
} from "@remixicon/react";
import { useState } from "react";
import { toast } from "sonner";
import { FileGridItem } from "./file-grid-item";
import { FileListItem } from "./file-list-item";
import { FileListSkeleton } from "./file-list-skeleton";
import { LoadMore } from "./load-more";

interface FileListProps {
  files: FileItem[];
  isLoading: boolean;
  error: Error | null;
  onSortChange: (sort: string, order: "asc" | "desc") => void;
  fetchNextPage: () => void;
  hasNextPage?: boolean;
  viewMode?: "list" | "grid";
  onViewModeChange?: (mode: "list" | "grid") => void;
  selectedFiles?: Set<string>;
  onSelectionChange?: (selectedFiles: Set<string>) => void;
}

export function TrashList({
  files,
  isLoading,
  error,
  onSortChange,
  fetchNextPage,
  hasNextPage = false,
  viewMode = "list",
  selectedFiles: externalSelectedFiles,
  onSelectionChange,
}: FileListProps) {
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [renamingFileId, setRenamingFileId] = useState<string | null>(null);
  const [newFileName, setNewFileName] = useState("");
  const [sortColumn, setSortColumn] = useState<"name" | "size" | "deletedAt">(
    "deletedAt",
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Use external selection state if provided, otherwise use internal state
  const [internalSelectedFiles, setInternalSelectedFiles] = useState<
    Set<string>
  >(new Set());
  const selectedFiles = externalSelectedFiles || internalSelectedFiles;
  const setSelectedFiles = onSelectionChange || setInternalSelectedFiles;
  const [isAllSelected, setIsAllSelected] = useState(false);

  const deleteFileHandle = useDeleteTrashFile();
  const restoreHandle = useRestoreFile();

  const heandlePermanentDelete = async (id: string) => {
    deleteFileHandle.mutate(
      {
        id,
      },
      {
        onSuccess: () => {
          toast.success("File permanently deleted");
        },
        onError: (error) => {
          toast.error(error.message || "Failed to permanently delete file");
        },
      },
    );
  };

  const handleRestore = async (id: string) => {
    try {
      await confirm({
        title: "Confirm Restore",
        description:
          "Are you sure you want to restore this file from the recycle bin?",
        confirmText: "Restore",
        cancelText: "Cancel",
      });
      restoreHandle.mutate(
        {
          id: id,
        },
        {
          onSuccess: () => {
            toast.success("File restored successfully");
          },
          onError: (error) => {
            toast.error(error.message || "Failed to restore file");
          },
        },
      );
    } catch {
      // User cancelled, no action needed
    }
  };

  const handlePermanentDelete = async (id: string) => {
    await confirm({
      title: "Confirm Permanent Deletion",
      description:
        "Are you sure you want to permanently delete this file? This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      confirmVariant: "destructive",
    });
    heandlePermanentDelete(id);
  };

  const handleSort = (column: "name" | "size" | "deletedAt") => {
    const newDirection =
      sortColumn === column && sortDirection === "asc" ? "desc" : "asc";
    setSortColumn(column);
    setSortDirection(newDirection);
    onSortChange(column, newDirection);
  };

  // Files in trash do not support renaming
  const handleRename = async (_id: string) => {
    // Renaming is not allowed in trash
    toast.error("Files in trash cannot be renamed");
  };

  // Selection functionality handling
  const handleSelectAll = (checked: boolean) => {
    setIsAllSelected(checked);
    const newSelected = checked
      ? new Set(files.map((file) => file.id))
      : new Set<string>();
    setSelectedFiles(newSelected);
  };

  const handleSelectFile = (fileId: string, checked: boolean) => {
    const newSelected = new Set(selectedFiles);
    if (checked) {
      newSelected.add(fileId);
    } else {
      newSelected.delete(fileId);
    }
    setSelectedFiles(newSelected);
    setIsAllSelected(newSelected.size === files.length && files.length > 0);
  };

  if (isLoading) {
    return (
      <div className="py-16 text-center text-muted-foreground">Loading...</div>
    );
  }
  if (error) {
    return (
      <div className="py-16 text-center text-destructive">
        Failed to load files.
      </div>
    );
  }
  if (!files || files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
        <RiDeleteBin2Fill />
        <div className="text-lg font-medium mb-2">Recycle Bin is empty</div>
        <div className="text-sm">
          Deleted files and folders will appear here.
          <br />
          You can restore or permanently delete them.
        </div>
      </div>
    );
  }

  if (viewMode === "grid") {
    return (
      <div className="h-full flex flex-col px-3 md:px-6 py-2 md:py-3">
        {/* Fixed Grid Header with All Checkbox */}
        <div className="border-b pb-2 mb-2">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              className="rounded size-4 md:size-5"
              checked={isAllSelected}
              onChange={(e) => handleSelectAll(e.target.checked)}
            />
            <span className="text-sm text-muted-foreground">All</span>
            <span className="text-xs text-muted-foreground ml-auto">
              {selectedFiles.size > 0
                ? `${selectedFiles.size} selected`
                : `${files.length} items`}
            </span>
          </div>
        </div>

        {/* Grid Content */}
        <div className="flex-1 overflow-auto -webkit-overflow-scrolling-touch">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 p-4 md:p-6">
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={`skeleton-${String(i)}`}
                    className="aspect-square rounded-lg border bg-card animate-pulse"
                  >
                    <div className="h-full flex flex-col">
                      <div className="flex-1 p-4 flex items-center justify-center">
                        <div className="w-16 h-16 bg-muted rounded" />
                      </div>
                      <div className="p-3 border-t">
                        <div className="h-4 w-20 bg-muted rounded mb-2" />
                        <div className="h-3 w-16 bg-muted rounded" />
                      </div>
                    </div>
                  </div>
                ))
              : files.map((file) => (
                  <FileGridItem
                    key={file.id}
                    file={file}
                    actions={[
                      {
                        label: "Restore",
                        onClick: () => handleRestore(file.id),
                      },
                      {
                        label: "Permanent Delete",
                        variant: "destructive",
                        separator: true,
                        onClick: () => handlePermanentDelete(file.id),
                      },
                    ]}
                    renamingFileId={renamingFileId}
                    newFileName={newFileName}
                    setRenamingFileId={setRenamingFileId}
                    setNewFileName={setNewFileName}
                    onFolderOpen={(id) => {
                      handleRestore(id);
                    }}
                    onRename={handleRename}
                    isSelected={selectedFiles.has(file.id)}
                    onSelectChange={handleSelectFile}
                  />
                ))}
          </div>
          <LoadMore
            onLoadMore={fetchNextPage}
            isLoading={isLoading}
            hasMore={hasNextPage}
          />
        </div>
        {ConfirmDialog}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col px-3 md:px-6 py-2 md:py-3">
      {/* Fixed Table Header */}
      <div className="border-b">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <input
                  type="checkbox"
                  className="rounded"
                  checked={isAllSelected}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </TableHead>
              <TableHead
                onClick={() => handleSort("name")}
                className="cursor-pointer"
              >
                Name
                {sortColumn === "name" &&
                  (sortDirection === "asc" ? (
                    <RiArrowUpSLine className="inline-block size-4 ml-1" />
                  ) : (
                    <RiArrowDownSLine className="inline-block size-4 ml-1" />
                  ))}
              </TableHead>
              <TableHead className="w-1/12 hidden md:table-cell">
                Type
              </TableHead>
              <TableHead
                onClick={() => handleSort("size")}
                className="cursor-pointer w-1/12 hidden md:table-cell"
              >
                Size
                {sortColumn === "size" &&
                  (sortDirection === "asc" ? (
                    <RiArrowUpSLine className="inline-block size-4 ml-1" />
                  ) : (
                    <RiArrowDownSLine className="inline-block size-4 ml-1" />
                  ))}
              </TableHead>
              <TableHead
                onClick={() => handleSort("deletedAt")}
                className="cursor-pointer w-1/6 hidden md:table-cell"
              >
                Deleted At
                {sortColumn === "deletedAt" &&
                  (sortDirection === "asc" ? (
                    <RiArrowUpSLine className="inline-block size-4 ml-1" />
                  ) : (
                    <RiArrowDownSLine className="inline-block size-4 ml-1" />
                  ))}
              </TableHead>
              <TableHead className="text-right w-[80px] md:w-1/12">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
        </Table>
      </div>

      {/* Scrollable Table Body */}
      <div className="flex-1 overflow-auto -webkit-overflow-scrolling-touch">
        <Table>
          <TableBody>
            {isLoading ? (
              <FileListSkeleton />
            ) : (
              files?.map((file) => (
                <FileListItem
                  key={file.id}
                  file={file}
                  actions={[
                    {
                      label: "Restore",
                      onClick: () => handleRestore(file.id),
                    },
                    {
                      label: "Permanent Delete",
                      variant: "destructive",
                      separator: true,
                      onClick: () => handlePermanentDelete(file.id),
                    },
                  ]}
                  renamingFileId={renamingFileId}
                  newFileName={newFileName}
                  setRenamingFileId={setRenamingFileId}
                  setNewFileName={setNewFileName}
                  onFolderOpen={(id) => {
                    handleRestore(id);
                  }}
                  onRename={handleRename}
                  showCheckbox={true}
                  columns={["name", "type", "size", "deletedAt"]}
                  isSelected={selectedFiles.has(file.id)}
                  onSelectChange={handleSelectFile}
                />
              ))
            )}
          </TableBody>
        </Table>
        <LoadMore
          onLoadMore={fetchNextPage}
          isLoading={isLoading}
          hasMore={hasNextPage}
        />
      </div>
      {ConfirmDialog}
    </div>
  );
}
