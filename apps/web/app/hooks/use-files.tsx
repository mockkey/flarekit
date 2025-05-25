import { useEffect, useState } from "react";

interface FileItem {
  id: string;
  name: string;
  type: "file" | "folder";
  size: number;
  mimeType: string;
  extension: string;
  url: string;
  createdAt: number;
  parentId: string | null;
}

export function useFiles(
  searchQuery: string,
  currentDirectoryId: string | null,
) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchFiles = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const mockFiles: FileItem[] = [
          {
            id: "1",
            name: "Document.pdf",
            type: "file",
            size: 1024,
            mimeType: "application/pdf",
            extension: "pdf",
            url: "/files/document.pdf",
            createdAt: Date.now(),
            parentId: "root",
          },
          {
            id: "2",
            name: "Images",
            type: "folder",
            size: 0,
            mimeType: "",
            extension: "",
            url: "/files/images",
            createdAt: Date.now(),
            parentId: "root",
          },
          {
            id: "3",
            name: "Work",
            type: "folder",
            size: 0,
            mimeType: "",
            extension: "",
            url: "/files/work",
            createdAt: Date.now(),
            parentId: "2",
          },
          {
            id: "4",
            name: "Presentation.pptx",
            type: "file",
            size: 2048,
            mimeType: "application/vnd.ms-powerpoint",
            extension: "pptx",
            url: "/files/presentation.pptx",
            createdAt: Date.now(),
            parentId: "3",
          },
        ];

        const filteredFiles = mockFiles.filter(
          (file) =>
            file.parentId === currentDirectoryId &&
            file.name.toLowerCase().includes(searchQuery.toLowerCase()),
        );
        setFiles(filteredFiles);
      } catch (_err) {
        //  setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFiles();
  }, [searchQuery, currentDirectoryId]);

  const deleteFile = async (id: string): Promise<boolean> => {
    console.log("Deleting file:", id);
    return true;
  };

  const renameFile = async (id: string, newName: string): Promise<boolean> => {
    console.log("Renaming file:", id, newName);
    return true;
  };

  return { files, isLoading, error, deleteFile, renameFile };
}
