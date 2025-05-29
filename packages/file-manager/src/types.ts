export interface FileItem {
  id: string;
  name: string;
  type: "file" | "folder";
  size: number;
  mimeType: string | null;
  createdAt: number;
  parentId: string | null;
  storagePath: string | null;
}
