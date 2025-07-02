import { Button } from "@flarekit/ui/components/ui/button";
import { Card } from "@flarekit/ui/components/ui/card";
import {
  RiDeleteBinLine,
  RiGridLine,
  RiListCheck,
  RiRefreshLine,
  RiRestartLine,
} from "@remixicon/react";

import { memo, useState } from "react";
import { toast } from "sonner";
import { TrashList } from "./components/trash-list";
import {
  useDeleteTrashBatchFiles,
  useRestoreBatchFiles,
  useTrashList,
} from "./hooks/use-trash";
import { useConfirmDialog } from "./lib/use-confirm-dialog";
import { type Sort, useFileTrashStore } from "./store/use-file-trash-store";

const RecycleBinDashboard = () => {
  const { search, setSort, pagination, sort, order, setOrder } =
    useFileTrashStore();

  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const { data, isLoading, error, fetchNextPage, hasNextPage, refetch } =
    useTrashList({
      page: pagination.currentPage,
      search,
      sort,
      order,
    });
  const files = data?.pages.flatMap((p) => p.items) ?? [];

  // Hooks for batch operations
  const useDeleteTrashFilesHandle = useDeleteTrashBatchFiles();
  const restoreFileBatchHandle = useRestoreBatchFiles();
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Batch restore
  const handleBatchRestore = async () => {
    if (selectedFiles.size === 0) return;
    try {
      await confirm({
        title: "Confirm Batch Restore",
        description: `Are you sure you want to restore ${selectedFiles.size} selected file(s) from the recycle bin?`,
        confirmText: "Restore",
        cancelText: "Cancel",
      });
      // Restore files one by one
      restoreFileBatchHandle.mutate(
        { ids: Array.from(selectedFiles) },
        {
          onSuccess: () => {
            toast.success(
              `Successfully restored ${selectedFiles.size} file(s)`,
            );
            setSelectedFiles(new Set());
          },
          onError: (error) => {
            toast.error(error.message || "Failed to restore files");
          },
        },
      );
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message || "Failed to restore files");
      }
      // User cancelled, no action needed
    }
  };

  // Batch permanent delete
  const handleBatchDelete = async () => {
    if (selectedFiles.size === 0) return;

    try {
      await confirm({
        title: "Confirm Batch Permanent Delete",
        description: `Are you sure you want to permanently delete ${selectedFiles.size} selected file(s)? This action cannot be undone.`,
        confirmText: "Delete",
        cancelText: "Cancel",
        confirmVariant: "destructive",
      });

      // Delete files one by one
      useDeleteTrashFilesHandle.mutate(
        { ids: Array.from(selectedFiles) },
        {
          onSuccess: () => {
            toast.success(
              `Successfully deleted ${selectedFiles.size} file(s) permanently`,
            );
            setSelectedFiles(new Set());
          },
          onError: (error) => {
            toast.error(error.message || "Failed to delete files");
          },
        },
      );
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message || "Failed to delete files");
      }
      // User cancelled, no action needed
    }
  };

  return (
    <div className="p-1 md:p-1 bg-muted/30 min-h-screen">
      <Card className="w-full max-w-none h-[calc(100vh-0.5rem)] md:h-[calc(100vh-0.5rem)] flex flex-col gap-0 rounded-lg md:rounded-lg shadow-sm">
        {/* Top Navigation Bar */}
        <div className="flex items-center gap-2 px-3 md:px-6 py-2 md:py-3 border-b bg-card">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 md:h-8 md:w-8"
              onClick={() => refetch()}
              disabled={isLoading}
              title="Refresh"
            >
              <RiRefreshLine
                className={`size-4 md:size-5 ${isLoading ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
          <div className="flex-1 flex items-center gap-2 min-w-0">
            <div className="flex-1 flex items-center gap-1 px-2 md:px-3 py-1.5 bg-muted/30 rounded-md border text-xs md:text-sm min-w-0 overflow-hidden">
              <span className="text-muted-foreground">Recycle Bin</span>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between px-3 md:px-6 py-2 md:py-3 border-b bg-card">
          <div className="flex items-center gap-1 md:gap-1.5 overflow-x-auto">
            <Button
              variant="outline"
              size="sm"
              className="h-8 md:h-8 text-xs flex-shrink-0 hidden sm:flex"
              disabled={selectedFiles.size === 0}
              onClick={handleBatchRestore}
            >
              <RiRestartLine className="size-4 mr-1" />
              Restore ({selectedFiles.size})
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 md:h-8 text-xs flex-shrink-0 hidden sm:flex"
              disabled={selectedFiles.size === 0}
              onClick={handleBatchDelete}
            >
              <RiDeleteBinLine className="size-4 mr-1" />
              Delete ({selectedFiles.size})
            </Button>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="flex items-center border rounded-md">
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                className="rounded-r-none h-7 md:h-8 w-7 md:w-auto px-1 md:px-3"
                onClick={() => setViewMode("list")}
              >
                <RiListCheck className="size-4" />
              </Button>
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                className="rounded-l-none h-7 md:h-8 w-7 md:w-auto px-1 md:px-3"
                onClick={() => setViewMode("grid")}
              >
                <RiGridLine className="size-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* File List Content */}
        <div className="flex-1 overflow-hidden p-0">
          <TrashList
            files={files}
            isLoading={isLoading}
            error={error}
            fetchNextPage={fetchNextPage}
            hasNextPage={hasNextPage}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            selectedFiles={selectedFiles}
            onSelectionChange={setSelectedFiles}
            onSortChange={(field, order) => {
              setOrder(order);
              setSort(field as Sort);
            }}
          />
        </div>
      </Card>
      {ConfirmDialog}
    </div>
  );
};

export default memo(RecycleBinDashboard);
