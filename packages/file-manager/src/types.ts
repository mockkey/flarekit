export interface FileItem {
  id: string;
  name: string;
  type: "file" | "folder";
  size: number;
  mime: string | null;
  createdAt: number;
  parentId: string | null;
  storagePath: string | null;
  url: string | null;
}
