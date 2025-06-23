import type { FileItem } from "@/hooks/use-file-manager";
import { useDeleteTrashFile, useRestoreFile } from "@/hooks/use-trash";
import { useConfirmDialog } from "@/lib/use-confirm-dialog";
import {
  Table,
  TableBody,
  TableCaption,
  TableHead,
  TableHeader,
  TableRow,
} from "@flarekit/ui/components/ui/table";
import {
  RiArrowDownSLine,
  RiArrowUpSLine,
  RiDeleteBin2Fill,
  RiInboxLine,
} from "@remixicon/react";
import { useState } from "react";
import { toast } from "sonner";
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
}

export function TrashList({
  files,
  isLoading,
  error,
  onSortChange,
  fetchNextPage,
  hasNextPage = false,
}: FileListProps) {
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [renamingFileId, setRenamingFileId] = useState<string | null>(null);
  const [newFileName, setNewFileName] = useState("");
  const [sortColumn, setSortColumn] = useState<"name" | "size" | "deletedAt">(
    "deletedAt",
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
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
      // 用户取消，无需处理
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

  return (
    <>
      <div className="space-y-4">
        <div className="relative h-[calc(100vh-246px)] overflow-auto">
          <Table>
            <TableCaption className="h-auto sticky top-0  z-10">
              <div className="pb-4 flex items-center justify-between">
                <div className="w-full">
                  {files.length === 0 ? (
                    <div className="w-full py-8 flex flex-col items-center justify-center text-muted-foreground">
                      <RiInboxLine className="size-12 mb-4 text-muted-foreground/50" />
                      <p className="text-sm font-medium">No files found</p>
                      <p className="text-xs mt-1 text-muted-foreground/80">
                        Upload some files to get started
                      </p>
                    </div>
                  ) : (
                    `Found ${files.length} items`
                  )}
                </div>
              </div>
            </TableCaption>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead className="w-[50px]">Type</TableHead>
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
                <TableHead
                  onClick={() => handleSort("size")}
                  className="cursor-pointer"
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
                  className="cursor-pointer"
                >
                  Deleted At
                  {sortColumn === "deletedAt" &&
                    (sortDirection === "asc" ? (
                      <RiArrowUpSLine className="inline-block size-4 ml-1" />
                    ) : (
                      <RiArrowDownSLine className="inline-block size-4 ml-1" />
                    ))}
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
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
      </div>
      {ConfirmDialog}
    </>
  );
}
