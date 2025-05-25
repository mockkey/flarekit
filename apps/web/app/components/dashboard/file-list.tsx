import { Button } from "@flarekit/ui/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@flarekit/ui/components/ui/dropdown-menu";
import { Input } from "@flarekit/ui/components/ui/input";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@flarekit/ui/components/ui/table";
import {
  RiArrowDownSLine,
  RiArrowUpSLine,
  RiFileFill,
  RiImage2Fill,
  RiMore2Fill,
} from "@remixicon/react";
import { useState } from "react";
import { toast } from "sonner";

interface FileItem {
  id: string;
  name: string;
  type: "file" | "image";
  size: number;
  mimeType: string;
  extension: string;
  url: string;
  createdAt: number;
}

interface FileListProps {
  files: FileItem[];
  isLoading: boolean;
  error: Error | null;
  deleteFile: (id: string) => Promise<boolean>;
  renameFile: (id: string, newName: string) => Promise<boolean>;
}

export function FileList({
  files,
  isLoading,
  error,
  deleteFile,
  renameFile,
}: FileListProps) {
  const [renamingFileId, setRenamingFileId] = useState<string | null>(null);
  const [newFileName, setNewFileName] = useState("");
  const [sortColumn, setSortColumn] = useState<"size" | "createdAt">("size");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleRename = async (id: string) => {
    if (!newFileName.trim()) return;
    if (await renameFile(id, newFileName.trim())) {
      toast.success("File renamed successfully");
      setRenamingFileId(null);
      setNewFileName("");
    } else {
      toast.error("Failed to rename file");
    }
  };

  const handleSort = (column: "size" | "createdAt") => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const sortedFiles = [...files].sort((a, b) => {
    const direction = sortDirection === "asc" ? 1 : -1;
    switch (sortColumn) {
      case "size":
        return (a.size - b.size) * direction;
      case "createdAt":
        return (a.createdAt - b.createdAt) * direction;
      default:
        return 0;
    }
  });

  if (isLoading) return <div>Loading files...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <Table>
      <TableCaption>A list of your files.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[50px]">Type</TableHead>
          <TableHead>Name</TableHead>
          <TableHead
            onClick={() => handleSort("size")}
            className="cursor-pointer"
          >
            Size
            {sortColumn === "size" && sortDirection === "asc" ? (
              <RiArrowUpSLine className="inline-block size-4 ml-1" />
            ) : (
              <RiArrowDownSLine className="inline-block size-4 ml-1" />
            )}
          </TableHead>
          <TableHead
            onClick={() => handleSort("createdAt")}
            className="cursor-pointer"
          >
            Created At
            {sortColumn === "createdAt" && sortDirection === "asc" ? (
              <RiArrowUpSLine className="inline-block size-4 ml-1" />
            ) : (
              <RiArrowDownSLine className="inline-block size-4 ml-1" />
            )}
          </TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedFiles.map((file) => (
          <TableRow key={file.id}>
            <TableCell className="font-medium">
              {file.type === "file" ? (
                <RiFileFill className="size-5 text-blue-500" />
              ) : (
                <RiImage2Fill className="size-5 text-green-500" />
              )}
            </TableCell>
            <TableCell>
              {renamingFileId === file.id ? (
                <Input
                  type="text"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  onBlur={() => handleRename(file.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRename(file.id);
                  }}
                  className="w-32"
                />
              ) : (
                <span>{file.name}</span>
              )}
            </TableCell>
            <TableCell>
              {file.type === "file"
                ? `${(file.size / 1024).toFixed(2)} KB`
                : `${(file.size / 1024).toFixed(2)} KB`}
            </TableCell>
            <TableCell>{file.createdAt}</TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <RiMore2Fill className="size-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" forceMount>
                  <DropdownMenuItem onClick={() => setRenamingFileId(file.id)}>
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={async () => {
                      if (await deleteFile(file.id)) {
                        toast.success("File deleted successfully");
                      } else {
                        toast.error("Failed to delete file");
                      }
                    }}
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
