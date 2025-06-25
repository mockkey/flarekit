import { Button } from "@flarekit/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@flarekit/ui/components/ui/card";
import { Input } from "@flarekit/ui/components/ui/input";
import {
  RiFileUploadLine,
  RiFolderAddLine,
  RiRefreshLine,
  RiSearchLine,
} from "@remixicon/react";
import { memo, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Breadcrumbs } from "./components/breadcrumbs";
import { CreateFolderDialog } from "./components/create-folder-dialog";
import { FileList } from "./components/file-list";
import { FileUploadDialog } from "./components/file-upload-dialog";
import { useBreadcrumbs } from "./hooks/use-breadcrumbs";
import { useDebounce } from "./hooks/use-debounce";
import { useFiles } from "./hooks/use-file-manager";
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

  const { data, isLoading, error, refetch, fetchNextPage, hasNextPage } =
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
  return (
    <div className="space-y-6">
      <Card className="flex flex-col">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Resources</CardTitle>
              <CardDescription>Manage your files and folders</CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                disabled={isLoading}
                size="sm"
                onClick={() => setShowCreateFolderDialog(true)}
              >
                <RiFolderAddLine className="mr-2 size-4" />
                New Folder
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={isLoading}
                onClick={() => setShowUploadDialog(true)}
              >
                <RiFileUploadLine className="mr-2 size-4" />
                Upload
              </Button>
              <Button
                variant="ghost"
                size="icon"
                disabled={isLoading}
                onClick={() => refetch()}
              >
                <RiRefreshLine className="size-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 min-h-0">
          <div className="mb-4 space-y-4">
            <div className="bg-muted/30  py-2 rounded-lg">
              <Breadcrumbs
                items={breadcrumbs || [{ id: null, name: "Root" }]}
                onNavigate={(id) => {
                  if (id) {
                    navigate(`/resources/folder/${id}`);
                  } else {
                    navigate(rootPath);
                  }
                }}
              />
            </div>
            <div className="relative max-w-md group/search">
              <Input
                type="search"
                placeholder="Search files..."
                onChange={handleSearchChange}
                onCompositionStart={handleCompositionStart}
                onCompositionEnd={handleCompositionEnd}
                className="pl-10   transition-all duration-200 border-input hover:border-primary/50 focus:ring-2 focus:ring-primary/20"
              />
              <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground group-focus-within/search:text-primary transition-colors duration-200" />
            </div>
          </div>
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
    </div>
  );
};

export default memo(Dashboard);
