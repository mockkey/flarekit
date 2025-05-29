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
import { memo, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Breadcrumbs } from "./components/breadcrumbs";
import { CreateFolderDialog } from "./components/create-folder-dialog";
import { FileList } from "./components/file-list";
import { FileUploadDialog } from "./components/file-upload-dialog";
import { useBreadcrumbs } from "./hooks/use-breadcrumbs";
import { useFiles } from "./hooks/use-file-manager";
import { type Sort, useFileStore } from "./store/use-file-store";

interface DashboardProps {
  folderID?: string;
  rootPath?: string;
}

const Dashboard = ({ folderID, rootPath = "/dashboard" }: DashboardProps) => {
  const navigate = useNavigate();

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
  } = useFileStore();

  const { data, isLoading, error, refetch, fetchNextPage } = useFiles({
    page: pagination.currentPage,
    search,
    parentId: currentFolderId,
    sort,
    order,
  });
  const files = data?.pages.flatMap((p) => p.items) ?? [];

  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showCreateFolderDialog, setShowCreateFolderDialog] = useState(false);
  useEffect(() => {
    setCurrentFolder(folderID || null);
  }, [folderID, rootPath]);

  const { data: breadcrumbs } = useBreadcrumbs(currentFolderId);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Files</CardTitle>
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
                className="hidden"
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
        <CardContent>
          <div className="mb-4 space-y-4">
            <div className="bg-muted/30  py-2 rounded-lg">
              <Breadcrumbs
                items={breadcrumbs || []}
                onNavigate={(id) => {
                  if (id) {
                    navigate(`/resources/floder/${id}`);
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
                value={search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setSearch(e.target.value);
                }}
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
            onSortChange={(field, order) => {
              setOrder(order);
              setSort(field as Sort);
            }}
            onFolderOpen={(id) => navigate(`/resources/floder/${id}`)}
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
