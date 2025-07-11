import {
  useChangeFileName,
  useDeleteFile,
  useGetDownloadUrl,
  usePermanentDeleteFile,
} from "@/hooks/use-file-manager";
import { useDeleteConfirmDialog } from "@/lib/use-confirm-dialog";
import type { FileItem } from "@/types";
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
  RiInboxLine,
} from "@remixicon/react";
import type { MediaViewType } from "@vidstack/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FileGridItem } from "./file-grid-item";
import { FileListItem } from "./file-list-item";
import { FileListSkeleton } from "./file-list-skeleton";
import { LoadMore } from "./load-more";
import { ImageViewerDialog } from "./viewer/image-viewer-dialog";
import { MediaViewerDialog } from "./viewer/media-viewer-dialog";

interface FileListProps {
  files: FileItem[];
  isLoading: boolean;
  error: Error | null;
  onSortChange: (sort: string, order: "asc" | "desc") => void;
  onFolderOpen: (folderId: string) => void;
  fetchNextPage: () => void;
  hasNextPage?: boolean;
  viewMode?: "list" | "grid";
  onSelectionChange?: (selectedFiles: Set<string>) => void;
  selectedFiles?: Set<string>;
}

export function FileList({
  files,
  isLoading,
  error,
  onSortChange,
  onFolderOpen,
  fetchNextPage,
  hasNextPage = false,
  viewMode = "list",
  onSelectionChange,
  selectedFiles: externalSelectedFiles,
}: FileListProps) {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [mediaViewerOpen, setMediaViewerOpen] = useState(false);
  const [currentMedia, setCurrentMedia] = useState<{
    url: string;
    name: string;
    type: MediaViewType;
  } | null>(null);
  const [renamingFileId, setRenamingFileId] = useState<string | null>(null);
  const [newFileName, setNewFileName] = useState("");
  const [sortColumn, setSortColumn] = useState<"name" | "size" | "createdAt">(
    "createdAt",
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  // Use external selection state if provided, otherwise use internal state
  const [internalSelectedFiles, setInternalSelectedFiles] = useState<
    Set<string>
  >(new Set());
  const selectedFiles = externalSelectedFiles || internalSelectedFiles;
  const setSelectedFiles = onSelectionChange || setInternalSelectedFiles;
  const [isAllSelected, setIsAllSelected] = useState(false);

  // Sync isAllSelected state when selectedFiles or files change
  useEffect(() => {
    setIsAllSelected(selectedFiles.size === files.length && files.length > 0);
  }, [selectedFiles.size, files.length]);

  const changeFileNameHandle = useChangeFileName();
  const deleteFileHandle = useDeleteFile();
  const permanentDeleteFileHandle = usePermanentDeleteFile();

  const getDownloadUrl = useGetDownloadUrl();
  const { confirm: confirmDelete, DeleteConfirmDialog } =
    useDeleteConfirmDialog();

  const handleRename = async (id: string) => {
    if (!newFileName.trim()) return;
    setRenamingFileId(null);
    setNewFileName("");
    changeFileNameHandle.mutate(
      {
        id: id,
        name: newFileName.trim(),
      },
      {
        onSuccess: () => {
          toast.success("File renamed successfully");
        },
        onError: (error) => {
          toast.error(error.message || "Failed to rename file");
        },
      },
    );
  };

  const handleDelete = async (id: string) => {
    try {
      const action = await confirmDelete({
        title: "Delete File",
        description: "What would you like to do with this file?",
        fileCount: 1,
      });

      if (action === "delete") {
        // Move to recycle bin
        deleteFileHandle.mutate(
          { id },
          {
            onSuccess: () => {
              toast.success("File moved to recycle bin");
            },
            onError: (error) => {
              toast.error(error.message || "Failed to delete file");
            },
          },
        );
      } else if (action === "permanent") {
        // Permanent delete
        permanentDeleteFileHandle.mutate(
          { ids: [id] },
          {
            onSuccess: () => {
              toast.success("File permanently deleted");
            },
            onError: (error) => {
              toast.error(error.message || "Failed to permanently delete file");
            },
          },
        );
      }
    } catch (_error) {
      // User cancelled, no action needed
    }
  };

  const handleDownload = async (fileId: string) => {
    try {
      const url = await getDownloadUrl.mutateAsync(fileId);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileId;
      a.click();
    } catch (_error) {
      toast.error("Failed to generate download link");
    }
  };

  const handleSort = (column: "name" | "size" | "createdAt") => {
    const newDirection =
      sortColumn === column && sortDirection === "asc" ? "desc" : "asc";
    setSortColumn(column);
    setSortDirection(newDirection);
    onSortChange(column, newDirection);
  };

  // Selection functionality handling
  const handleSelectAll = (checked: boolean) => {
    setIsAllSelected(checked);
    const newSelected = checked
      ? new Set(files.map((file) => file.id))
      : new Set<string>();
    if (onSelectionChange) {
      onSelectionChange(newSelected);
    } else {
      setSelectedFiles(newSelected);
    }
  };

  const handleSelectFile = (fileId: string, checked: boolean) => {
    const newSelected = new Set(selectedFiles);
    if (checked) {
      newSelected.add(fileId);
    } else {
      newSelected.delete(fileId);
    }
    setIsAllSelected(newSelected.size === files.length && files.length > 0);
    if (onSelectionChange) {
      onSelectionChange(newSelected);
    } else {
      setSelectedFiles(newSelected);
    }
  };

  if (isLoading) {
    if (viewMode === "grid") {
      return (
        <div className="h-full flex flex-col">
          <div className="flex-1 overflow-auto p-4">
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
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
              ))}
            </div>
          </div>
        </div>
      );
    }
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
    const emptyContent = (
      <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
        <RiInboxLine className="size-12 mb-4 text-muted-foreground/50" />
        <div className="text-lg font-medium mb-2">No files found</div>
        <div className="text-sm">Upload files to get started.</div>
      </div>
    );

    if (viewMode === "grid") {
      return (
        <div className="h-full flex flex-col">
          <div className="flex-1 overflow-auto p-4">{emptyContent}</div>
        </div>
      );
    }

    return emptyContent;
  }

  // Render grid view
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

        <div className="flex-1 overflow-auto -webkit-overflow-scrolling-touch">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 p-4 md:p-6">
            {files.map((file) => (
              <FileGridItem
                key={file.id}
                file={file}
                actions={[
                  {
                    label: "Rename",
                    onClick: () => {
                      setRenamingFileId(file.id);
                      setNewFileName(file.name);
                    },
                  },
                  ...(file.type === "file"
                    ? [
                        {
                          label: "Download",
                          onClick: () => handleDownload(file.id),
                        },
                      ]
                    : []),
                  ...(file.type === "file" &&
                  String(file.mime).indexOf("image") >= 0
                    ? [
                        {
                          label: "Preview",
                          onClick: () => {
                            setCurrentImage(file.url!);
                            setViewerOpen(true);
                          },
                        },
                      ]
                    : []),
                  ...((file.type === "file" &&
                    String(file.mime).indexOf("video") >= 0) ||
                  String(file.mime).indexOf("audio") >= 0
                    ? [
                        {
                          label: `Play ${String(file.mime).split("/")[0]}`,
                          onClick: () => {
                            setCurrentMedia({
                              url: file.url!,
                              name: file.name,
                              type: `${String(file.mime).split("/")[0]}` as MediaViewType,
                            });
                            setMediaViewerOpen(true);
                          },
                        },
                      ]
                    : []),

                  {
                    label: "Delete",
                    variant: "destructive" as const,
                    onClick: () => handleDelete(file.id),
                    separator: true,
                  },
                ]}
                renamingFileId={renamingFileId}
                newFileName={newFileName}
                setRenamingFileId={setRenamingFileId}
                setNewFileName={setNewFileName}
                onRename={handleRename}
                onFolderOpen={onFolderOpen}
                onFileOpen={(file) => {
                  if (String(file.mime).indexOf("image") >= 0) {
                    setCurrentImage(file.url!);
                    setViewerOpen(true);
                  } else if (String(file.mime).indexOf("video") >= 0) {
                    setCurrentMedia({
                      url: file.url!,
                      name: file.name,
                      type: "video",
                    });
                    setMediaViewerOpen(true);
                  } else if (String(file.mime).indexOf("audio") >= 0) {
                    setCurrentMedia({
                      url: file.url!,
                      name: file.name,
                      type: "audio",
                    });
                    setMediaViewerOpen(true);
                  }
                }}
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
        <ImageViewerDialog
          open={viewerOpen}
          onOpenChange={setViewerOpen}
          imageUrl={currentImage || ""}
        />
        <MediaViewerDialog
          open={mediaViewerOpen}
          onOpenChange={setMediaViewerOpen}
          mediaUrl={currentMedia?.url || ""}
          fileName={currentMedia?.name}
          type={currentMedia?.type}
        />
        {DeleteConfirmDialog}
      </div>
    );
  }

  // Render list view
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
                onClick={() => handleSort("createdAt")}
                className="cursor-pointer w-1/6 hidden md:table-cell"
              >
                Created Time
                {sortColumn === "createdAt" &&
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
      <div className="flex-1 overflow-auto touch-scroll">
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
                      label: "Rename",
                      onClick: () => {
                        setRenamingFileId(file.id);
                        setNewFileName(file.name);
                      },
                    },
                    ...(file.type === "file"
                      ? [
                          {
                            label: "Download",
                            onClick: () => handleDownload(file.id),
                          },
                        ]
                      : []),
                    ...(file.type === "file" &&
                    String(file.mime).indexOf("image") >= 0
                      ? [
                          {
                            label: "Preview",
                            onClick: () => {
                              setCurrentImage(file.url!);
                              setViewerOpen(true);
                            },
                          },
                        ]
                      : []),
                    ...((file.type === "file" &&
                      String(file.mime).indexOf("video") >= 0) ||
                    String(file.mime).indexOf("audio") >= 0
                      ? [
                          {
                            label: `Play ${String(file.mime).split("/")[0]}`,
                            onClick: () => {
                              setCurrentMedia({
                                url: file.url!,
                                name: file.name,
                                type: `${String(file.mime).split("/")[0]}` as MediaViewType,
                              });
                              setMediaViewerOpen(true);
                            },
                          },
                        ]
                      : []),

                    {
                      label: "Delete",
                      variant: "destructive",
                      onClick: () => handleDelete(file.id),
                      separator: true,
                    },
                  ]}
                  renamingFileId={renamingFileId}
                  newFileName={newFileName}
                  setRenamingFileId={setRenamingFileId}
                  setNewFileName={setNewFileName}
                  onRename={handleRename}
                  onFolderOpen={onFolderOpen}
                  onFileOpen={(file) => {
                    if (String(file.mime).indexOf("image") >= 0) {
                      setCurrentImage(file.url!);
                      setViewerOpen(true);
                    } else if (String(file.mime).indexOf("video") >= 0) {
                      setCurrentMedia({
                        url: file.url!,
                        name: file.name,
                        type: "video",
                      });
                      setMediaViewerOpen(true);
                    } else if (String(file.mime).indexOf("audio") >= 0) {
                      setCurrentMedia({
                        url: file.url!,
                        name: file.name,
                        type: "audio",
                      });
                      setMediaViewerOpen(true);
                    }
                  }}
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
      <ImageViewerDialog
        open={viewerOpen}
        onOpenChange={setViewerOpen}
        imageUrl={currentImage || ""}
      />
      <MediaViewerDialog
        open={mediaViewerOpen}
        onOpenChange={setMediaViewerOpen}
        mediaUrl={currentMedia?.url || ""}
        fileName={currentMedia?.name}
        type={currentMedia?.type}
      />
      {DeleteConfirmDialog}
    </div>
  );
}
