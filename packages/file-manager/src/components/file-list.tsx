import {
  type FileItem,
  useChangeFileName,
  useDeleteFile,
} from "@/hooks/use-file-manager";
import { Button } from "@flarekit/ui/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableHead,
  TableHeader,
  TableRow,
} from "@flarekit/ui/components/ui/table";
import { RiArrowDownSLine, RiArrowUpSLine } from "@remixicon/react";
import { useState } from "react";
import { toast } from "sonner";
import { FileListItem } from "./file-list-item";

interface FileListProps {
  files: FileItem[];
  isLoading: boolean;
  error: Error | null;
  onSortChange: (sort: string, order: "asc" | "desc") => void;
  onFolderOpen: (folderId: string) => void;
  fetchNextPage: () => void;
}

export function FileList({
  files,
  isLoading,
  error,
  onSortChange,
  onFolderOpen,
  fetchNextPage,
}: FileListProps) {
  const [renamingFileId, setRenamingFileId] = useState<string | null>(null);
  const [newFileName, setNewFileName] = useState("");
  const [sortColumn, setSortColumn] = useState<"name" | "size" | "createdAt">(
    "createdAt",
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const changeFileNameHandle = useChangeFileName();
  const deleteFileHandle = useDeleteFile();
  const handleRename = async (id: string) => {
    if (!newFileName.trim()) return;
    changeFileNameHandle.mutate(
      {
        id: id,
        name: newFileName.trim(),
      },
      {
        onSuccess: () => {
          toast.success("File renamed successfully");
          setRenamingFileId(null);
          setNewFileName("");
        },
        onError: (error) => {
          toast.error(error.message || "Failed to rename file");
        },
      },
    );
  };

  const handleDelete = async (id: string) => {
    deleteFileHandle.mutate(
      {
        id,
      },
      {
        onSuccess: () => {
          toast.success("File deleted successfully");
        },
        onError: (error) => {
          toast.error(error.message || "Failed to delete file");
        },
      },
    );
  };

  const handleSort = (column: "name" | "size" | "createdAt") => {
    const newDirection =
      sortColumn === column && sortDirection === "asc" ? "desc" : "asc";
    setSortColumn(column);
    setSortDirection(newDirection);
    onSortChange(column, newDirection);
  };

  if (isLoading) return <div>Loading files...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="space-y-4">
      <Table>
        <TableCaption>
          <div className="pb-4 flex items-center justify-between">
            <div>
              {files.length === 0
                ? isLoading
                  ? "Loading files..."
                  : "No files found."
                : `Found ${files.length} items`}
            </div>
            {files.length >= 10 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchNextPage}
                disabled={isLoading}
                className="h-7 px-3 text-xs"
              >
                {isLoading ? (
                  <>
                    <div className="size-3 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                    loading...
                  </>
                ) : (
                  "Load More"
                )}
              </Button>
            )}
          </div>
        </TableCaption>
        <TableHeader>
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
              onClick={() => handleSort("createdAt")}
              className="cursor-pointer"
            >
              Created At
              {sortColumn === "createdAt" &&
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
          {files?.map((file) => (
            <FileListItem
              key={file.id}
              file={file}
              renamingFileId={renamingFileId}
              newFileName={newFileName}
              setRenamingFileId={setRenamingFileId}
              setNewFileName={setNewFileName}
              onRename={handleRename}
              onDelete={async () => {
                handleDelete(file.id);
              }}
              onFolderOpen={onFolderOpen}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
