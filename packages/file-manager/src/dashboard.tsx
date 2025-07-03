import { Button } from "@flarekit/ui/components/ui/button";
import { Card, CardContent } from "@flarekit/ui/components/ui/card";
import { Input } from "@flarekit/ui/components/ui/input";
import {
  RiDeleteBinLine,
  RiFileUploadLine,
  RiFolderAddLine,
  RiGridLine,
  RiListCheck,
  RiRefreshLine,
  RiSearchLine,
} from "@remixicon/react";
import { memo, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { CreateFolderDialog } from "./components/create-folder-dialog";
import { FileList } from "./components/file-list";
import { FileUploadDialog } from "./components/file-upload-dialog";
import { useBreadcrumbs } from "./hooks/use-breadcrumbs";
import { useDebounce } from "./hooks/use-debounce";
import {
  useDeleteBatchFile,
  useFiles,
  usePermanentDeleteFile,
} from "./hooks/use-file-manager";
import { useDeleteConfirmDialog } from "./lib/use-confirm-dialog";
import { type Sort, type Theme, useFileStore } from "./store/use-file-store";
import { useUppyStore } from "./store/use-uppy-store";
interface DashboardProps {
  folderID?: string;
  rootPath?: string;
  theme?: Theme;
}

const Dashboard = ({
  folderID,
  rootPath = "/dashboard",
  theme = "auto",
}: DashboardProps) => {
  const navigate = useNavigate();
  const { setUppy, reset } = useUppyStore();

  useEffect(() => {
    setUppy();
    return () => reset();
  }, [setUppy, reset]);

  const {
    currentFolderId,
    search,
    setSearch,
    setCurrentFolder,
    setSort,
    pagination,
    sort,
    order,
    setOrder,
    setTheme,
  } = useFileStore();

  useEffect(() => {
    setTheme(theme);
  }, [theme]);

  const { data, isLoading, error, fetchNextPage, hasNextPage, refetch } =
    useFiles({
      page: pagination.currentPage,
      search,
      parentId: folderID,
      sort,
      order,
    });
  const files = data?.pages.flatMap((p) => p.items) ?? [];
  const [localSearch, setLocalSearch] = useState("");
  const debouncedSearch = useDebounce(localSearch, 360);
  const [isComposing, setIsComposing] = useState(false);

  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showCreateFolderDialog, setShowCreateFolderDialog] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  useEffect(() => {
    setCurrentFolder(folderID || null);
  }, [folderID, rootPath]);

  useEffect(() => {
    if (!isComposing) {
      setSearch(debouncedSearch);
    }
  }, [debouncedSearch, setSearch, isComposing]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const target = e.target as HTMLInputElement;
      setLocalSearch(target.value);
    },
    [],
  );

  const handleCompositionStart = useCallback(() => {
    setIsComposing(true);
  }, []);

  const handleCompositionEnd = useCallback(
    (e: React.CompositionEvent<HTMLInputElement>) => {
      setIsComposing(false);
      const target = e.target as HTMLInputElement;
      setLocalSearch(target.value);
    },
    [],
  );

  const { data: breadcrumbs } = useBreadcrumbs(currentFolderId);

  // Hooks for batch operations
  const permanentDeleteFileHandle = usePermanentDeleteFile();
  const deleteBatchFileHandle = useDeleteBatchFile();
  const { confirm: confirmDelete, DeleteConfirmDialog } =
    useDeleteConfirmDialog();

  // Batch delete functionality
  const handleBatchDelete = async () => {
    if (selectedFiles.size === 0) return;

    try {
      const action = await confirmDelete({
        title: "Delete Files",
        description: `What would you like to do with the ${selectedFiles.size} selected file(s)?`,
        fileCount: selectedFiles.size,
      });

      if (action === "delete") {
        const fileCount = selectedFiles.size;
        deleteBatchFileHandle.mutate(
          { ids: Array.from(selectedFiles) },
          {
            onSuccess: () => {
              setSelectedFiles(new Set());
              toast.success(
                `Successfully moved ${fileCount} file(s) to recycle bin`,
              );
            },
            onError: (error) => {
              toast.error(error.message || "Failed to delete files");
            },
          },
        );
      } else if (action === "permanent") {
        // Permanent delete
        const fileCount = selectedFiles.size;
        permanentDeleteFileHandle.mutate(
          { ids: Array.from(selectedFiles) },
          {
            onSuccess: () => {
              setSelectedFiles(new Set());
              toast.success(
                `Successfully deleted ${fileCount} file(s) permanently`,
              );
            },
            onError: (error) => {
              toast.error(error.message || "Failed to delete files");
            },
          },
        );
      }
    } catch (error) {
      if (error instanceof Error) {
        setSelectedFiles(new Set());
        toast.error(error.message || "Failed to delete files");
      }
    }
  };

  return (
    <div className="p-1 md:p-1 bg-muted/30 min-h-screen">
      <Card className="w-full max-w-none h-[calc(100vh-0.5rem)] md:h-[calc(100vh-0.5rem)] flex flex-col gap-0 rounded-lg md:rounded-lg shadow-sm">
        {/* Top Navigation Bar */}
        <div className="border-b bg-card">
          {/* Mobile: Separate display */}
          <div className="md:hidden">
            {/* Breadcrumb row */}
            <div className="flex items-center gap-2 px-3 py-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => refetch()}
                disabled={isLoading}
                title="Refresh"
              >
                <RiRefreshLine
                  className={`size-4 ${isLoading ? "animate-spin" : ""}`}
                />
              </Button>
              <div className="flex-1 flex items-center gap-1 px-2 py-1.5 bg-muted/30 rounded-md border text-xs min-w-0 overflow-hidden">
                <span
                  className="cursor-pointer hover:text-blue-500 truncate"
                  onClick={() => navigate("/resources")}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      navigate("/resources");
                    }
                  }}
                  tabIndex={0}
                  role="button"
                >
                  Files
                </span>
                {breadcrumbs?.map((crumb) => (
                  <div
                    key={crumb.id}
                    className="flex items-center gap-1 min-w-0"
                  >
                    <span className="text-muted-foreground flex-shrink-0">
                      ›
                    </span>
                    <span
                      className="cursor-pointer hover:text-blue-500 truncate"
                      onClick={() => {
                        if (crumb.id) {
                          navigate(`/resources/folder/${crumb.id}`);
                        } else {
                          navigate("/resources");
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          if (crumb.id) {
                            navigate(`/resources/folder/${crumb.id}`);
                          } else {
                            navigate("/resources");
                          }
                        }
                      }}
                      tabIndex={0}
                      role="button"
                      title={crumb.name}
                    >
                      {crumb.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Search row */}
            <div className="flex items-center gap-2 px-3 py-2 border-t">
              <div className="flex-1 relative">
                <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
                <Input placeholder="Search files..." className="pl-10 h-8" />
              </div>
            </div>
          </div>

          {/* Desktop: Single row display */}
          <div className="hidden md:flex items-center gap-2 px-6 py-3">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => refetch()}
                disabled={isLoading}
                title="Refresh"
              >
                <RiRefreshLine
                  className={`size-5 ${isLoading ? "animate-spin" : ""}`}
                />
              </Button>
            </div>

            <div className="flex-1 flex items-center gap-2 min-w-0">
              {/* Breadcrumb Navigation */}
              <div className="flex-1 flex items-center gap-1 px-2 md:px-3 py-1.5 bg-muted/30 rounded-md border text-xs md:text-sm min-w-0 overflow-hidden">
                <span
                  className="cursor-pointer hover:text-blue-500 truncate"
                  onClick={() => navigate("/resources")}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      navigate("/resources");
                    }
                  }}
                  tabIndex={0}
                  role="button"
                >
                  <span className="hidden md:inline">My Files</span>
                  <span className="md:hidden">Files</span>
                </span>
                {breadcrumbs?.map((crumb) => (
                  <div
                    key={crumb.id}
                    className="flex items-center gap-1 min-w-0"
                  >
                    <span className="text-muted-foreground flex-shrink-0">
                      ›
                    </span>
                    <span
                      className="cursor-pointer hover:text-blue-500 truncate"
                      onClick={() => {
                        if (crumb.id) {
                          navigate(`/resources/folder/${crumb.id}`);
                        } else {
                          navigate("/resources");
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          if (crumb.id) {
                            navigate(`/resources/folder/${crumb.id}`);
                          } else {
                            navigate("/resources");
                          }
                        }
                      }}
                      tabIndex={0}
                      role="button"
                      title={crumb.name}
                    >
                      {crumb.name}
                    </span>
                  </div>
                ))}
              </div>

              {/* Search Box */}
              <div className="relative">
                <RiSearchLine className="absolute left-2 top-1/2 transform -translate-y-1/2 size-3 text-muted-foreground" />
                <Input
                  placeholder="Search"
                  value={localSearch}
                  onChange={handleSearchChange}
                  onCompositionStart={handleCompositionStart}
                  onCompositionEnd={handleCompositionEnd}
                  className="pl-8 w-48 h-8 text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between px-3 md:px-6 py-2 md:py-3 border-b bg-card">
          <div className="flex items-center gap-1 md:gap-1.5 overflow-x-auto">
            <Button
              variant="outline"
              size="sm"
              className="h-8 md:h-8 text-xs flex-shrink-0"
              onClick={() => setShowUploadDialog(true)}
            >
              <RiFileUploadLine className="size-4 mr-1" />
              <span className="hidden sm:inline">Upload</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 md:h-8 text-xs flex-shrink-0 sm:flex"
              onClick={() => setShowCreateFolderDialog(true)}
            >
              <RiFolderAddLine className="size-4 mr-1" />
              <span className="hidden sm:inline"> New Folder</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 md:h-8 text-xs flex-shrink-0"
              disabled={selectedFiles.size === 0}
              onClick={handleBatchDelete}
            >
              <RiDeleteBinLine className="size-4 mr-1" />
              <span className="hidden sm:inline">
                Delete ({selectedFiles.size})
              </span>
              {/* <span className="sm:hidden">Del</span> */}
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
        <CardContent className="flex-1 overflow-hidden p-0">
          <FileList
            files={files || []}
            isLoading={isLoading}
            error={error}
            fetchNextPage={fetchNextPage}
            hasNextPage={hasNextPage}
            onSortChange={(field, order) => {
              setOrder(order);
              setSort(field as Sort);
            }}
            onFolderOpen={(id) => navigate(`/resources/folder/${id}`)}
            viewMode={viewMode}
            onSelectionChange={setSelectedFiles}
            selectedFiles={selectedFiles}
          />
        </CardContent>
      </Card>

      <FileUploadDialog
        open={showUploadDialog}
        onOpenChange={setShowUploadDialog}
      />
      <CreateFolderDialog
        open={showCreateFolderDialog}
        onOpenChange={setShowCreateFolderDialog}
      />
      {DeleteConfirmDialog}
    </div>
  );
};

export default memo(Dashboard);
