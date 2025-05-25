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
  RiArrowRightSLine,
  RiFileUploadLine,
  RiFolderAddLine,
  RiRefreshLine,
  RiSearchLine,
} from "@remixicon/react";
import { useState } from "react";
import { CreateFolderDialog } from "~/components/dashboard/create-folder-dialog";
import { type FileItem, FileList } from "~/components/dashboard/file-list";
import { FileUploadDialog } from "~/components/dashboard/file-upload-dialog";
import { useFiles } from "~/hooks/use-files";

// Helper for breadcrumbs
function Breadcrumbs({
  currentDirectoryId,
  allFiles,
  onNavigate,
}: {
  currentDirectoryId: string | null;
  allFiles: FileItem[];
  onNavigate: (id: string | null) => void;
}) {
  // Build path from root to current
  const path: { id: string | null; name: string }[] = [];
  let dir = allFiles.find((f) => f.id === currentDirectoryId);
  while (dir) {
    path.unshift({ id: dir.id, name: dir.name });
    dir = allFiles.find((f) => f.id === dir.parentId && f.type === "folder");
  }
  path.unshift({ id: null, name: "Root" });

  return (
    <div className="flex items-center gap-1 text-sm mb-2">
      {path.map((item, idx) => (
        <span key={item.id ?? "root"} className="flex items-center">
          <Button
            className="hover:underline text-primary"
            onClick={() => onNavigate(item.id)}
            disabled={idx === path.length - 1}
          >
            {item.name}
          </Button>
          {idx < path.length - 1 && (
            <RiArrowRightSLine className="mx-1 text-muted-foreground" />
          )}
        </span>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showCreateFolderDialog, setShowCreateFolderDialog] = useState(false);
  const [currentDirectoryId, setCurrentDirectoryId] = useState<string | null>(
    "root",
  );

  // Fetch all files for navigation and current directory
  const { files, isLoading, error, deleteFile, renameFile } = useFiles(
    searchQuery,
    currentDirectoryId,
  );

  // For breadcrumbs, we need all folders (simulate by fetching with empty search and null dir)
  const { files: allFiles } = useFiles("", null);

  // Handle folder navigation
  const handleNavigate = (dirId: string | null) => setCurrentDirectoryId(dirId);

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
                size="sm"
                onClick={() => setShowCreateFolderDialog(true)}
              >
                <RiFolderAddLine className="mr-2 size-4" />
                New Folder
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowUploadDialog(true)}
              >
                <RiFileUploadLine className="mr-2 size-4" />
                Upload
              </Button>
              <Button variant="ghost" size="icon">
                <RiRefreshLine className="size-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Breadcrumbs
            currentDirectoryId={currentDirectoryId}
            allFiles={allFiles}
            onNavigate={handleNavigate}
          />
          <div className="relative mb-4 max-w-md">
            <Input
              type="search"
              placeholder="Search files…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/30 transition-all"
            />
            <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground pointer-events-none" />
          </div>
          <FileList
            files={files}
            isLoading={isLoading}
            error={error}
            deleteFile={deleteFile}
            renameFile={renameFile}
            onNavigateFolder={handleNavigate}
          />
        </CardContent>
      </Card>

      <FileUploadDialog
        open={showUploadDialog}
        onOpenChange={setShowUploadDialog}
        currentDirectoryId={currentDirectoryId}
      />
      <CreateFolderDialog
        open={showCreateFolderDialog}
        onOpenChange={setShowCreateFolderDialog}
        currentDirectoryId={currentDirectoryId}
      />
    </div>
  );
}
